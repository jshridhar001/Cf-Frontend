import { pdf } from '@react-pdf/renderer';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { useFarmer } from '@/features/farmers/api/use-farmer';
import { useFarmerContract } from '@/features/farmers/api/use-farmer-contract';
import { FarmerContractDocument } from '@/features/farmers/contract/components/farmer-contract-pdf';
import { FarmerContractPreview } from '@/features/farmers/contract/components/farmer-contract-preview';
import { buildAgreementContext } from '@/features/farmers/lib/farmer-contract';
import { formatContractAcres, formatContractDate } from '@/features/farmers/types';
import { getApiErrorMessage } from '@/lib/api-client';

function useGoBack(farmerId: string) {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  return () => {
    if (canGoBack) {
      router.history.back();
      return;
    }
    void router.navigate({ to: '/farmers/$id', params: { id: farmerId } });
  };
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="h-auto min-h-11 w-fit gap-2 px-2 text-muted-foreground md:min-h-8"
      onClick={onClick}
    >
      <ArrowLeft />
      Back
    </Button>
  );
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold wrap-break-word">{value}</dd>
    </div>
  );
}

function ContractUrlLink({ href }: { href: string }) {
  if (!href) return <span className="text-muted-foreground">—</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-semibold break-all text-primary underline underline-offset-4"
    >
      {href}
    </a>
  );
}

function ContractDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <Skeleton className="h-11 w-24 rounded-4xl md:h-8" />
      <PageCard>
        <PageCardHeader>
          <Skeleton className="h-7 w-48 max-w-full" />
          <Skeleton className="h-4 w-40 max-w-full" />
        </PageCardHeader>
        <PageCardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </PageCardContent>
      </PageCard>
    </div>
  );
}

export default function FarmerContractDetailPage({
  farmerId,
  contractId,
}: {
  farmerId: string;
  contractId: string;
}) {
  const goBack = useGoBack(farmerId);
  const { data: farmer } = useFarmer(farmerId);
  const {
    data: contract,
    isPending,
    isError,
    isSuccess,
    error,
  } = useFarmerContract(farmerId, contractId);
  const notFound = isSuccess && contract === null;
  const [isGenerating, setIsGenerating] = useState(false);
  const generatedAt = useMemo(() => new Date(), []);
  const agreementContext = useMemo(() => {
    if (!farmer || !contract) return null;
    return buildAgreementContext(farmer, contract, generatedAt);
  }, [farmer, contract, generatedAt]);

  if (isPending) {
    return <ContractDetailSkeleton />;
  }

  if (notFound) {
    return (
      <div className="flex flex-col gap-4 sm:gap-6">
        <BackButton onClick={goBack} />
        <PageCard>
          <PageCardContent>
            <Empty className="border-0 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText />
                </EmptyMedia>
                <EmptyTitle>Contract not found</EmptyTitle>
                <EmptyDescription>No contract exists for this id.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button type="button" onClick={goBack}>
                  Back
                </Button>
              </EmptyContent>
            </Empty>
          </PageCardContent>
        </PageCard>
      </div>
    );
  }

  if (isError || !contract) {
    return (
      <div className="flex flex-col gap-4 sm:gap-6">
        <BackButton onClick={goBack} />
        <PageCard>
          <PageCardContent>
            <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
          </PageCardContent>
        </PageCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <BackButton onClick={goBack} />
      <PageCard>
        <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto]">
          <CardTitle className="scroll-m-20 text-2xl font-semibold tracking-tight">
            {contract.variety || 'Contract'}
          </CardTitle>
          <CardDescription className="hidden sm:block">
            {farmer?.name ?? 'Farmer contract'}
          </CardDescription>
          <CardAction>
            <Button
              type="button"
              className="min-h-11 md:min-h-9"
              disabled={isGenerating || !agreementContext}
              onClick={() => {
                if (!agreementContext) return;
                const previewWindow = window.open('about:blank', '_blank');
                if (!previewWindow) {
                  toast.error(
                    'Could not open the PDF preview. Please allow pop-ups for this site and try again.',
                  );
                  return;
                }

                previewWindow.document.write(
                  '<!doctype html><html><head><title>Generating contract…</title></head><body style="font-family:system-ui,sans-serif;padding:2rem;color:#333"><p>Generating contract PDF…</p></body></html>',
                );
                previewWindow.document.close();

                setIsGenerating(true);
                void pdf(<FarmerContractDocument context={agreementContext} />)
                  .toBlob()
                  .then((blob) => {
                    const url = URL.createObjectURL(blob);
                    previewWindow.location.href = url;
                    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
                  })
                  .catch(() => {
                    previewWindow.close();
                    toast.error('Could not generate the contract PDF. Please try again.');
                  })
                  .finally(() => {
                    setIsGenerating(false);
                  });
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden />
                  Generating…
                </>
              ) : (
                <>
                  <FileText data-icon="inline-start" />
                  Generate PDF
                </>
              )}
            </Button>
          </CardAction>
        </PageCardHeader>
        <PageCardContent className="flex flex-col gap-6">
          <dl className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <DetailField label="Farmer" value={farmer?.name ?? '—'} />
            <DetailField label="Variety" value={contract.variety || '—'} />
            <DetailField label="Date" value={formatContractDate(contract.date)} />
            <DetailField label="Acres" value={formatContractAcres(contract.acres)} />
            <DetailField
              label="Contract URL"
              value={<ContractUrlLink href={contract.contractUrl} />}
            />
          </dl>
          {agreementContext ? <FarmerContractPreview context={agreementContext} /> : null}
        </PageCardContent>
      </PageCard>
    </div>
  );
}
