import { useNavigate } from '@tanstack/react-router';
import { FileText, User } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { PageTabsList, PageTabsTrigger } from '@/components/page-tabs';
import { Badge } from '@/components/ui/badge';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs } from '@/components/ui/tabs';
import { ContractPdfViewer } from '@/features/farmer-profile/components/contract-pdf-viewer';
import { useFarmer } from '@/features/farmers/api/use-farmer';
import {
  CONTRACT_LANGUAGES,
  type ContractLanguage,
} from '@/features/farmers/lib/contract-language';
import { getApiErrorMessage, getHttpStatusFromError } from '@/lib/api-client';

const GeneratedContractPdf = lazy(() =>
  import('@/features/farmer-profile/components/generated-contract-pdf').then((mod) => ({
    default: mod.GeneratedContractPdf,
  })),
);

const LANGUAGE_TABS: { value: ContractLanguage; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
];

function contractUrlForLanguage(
  contract: { contractUrl?: string | null; hindiContractUrl?: string | null },
  language: ContractLanguage,
) {
  const url = language === 'hindi' ? contract.hindiContractUrl : contract.contractUrl;
  return url?.trim() ?? '';
}

export default function FarmerContractDetailPage({
  id,
  contractId,
  lang,
}: {
  id: string;
  contractId: string;
  lang: ContractLanguage;
}) {
  const navigate = useNavigate();
  const { data: farmer, isPending, isError, error } = useFarmer(id);
  const notFound = isError && getHttpStatusFromError(error) === 404;
  const contract = farmer?.contracts?.find((item) => String(item.id) === contractId);

  const handleLangChange = (value: string) => {
    if (!CONTRACT_LANGUAGES.includes(value as ContractLanguage)) return;
    void navigate({
      to: '/farmers/$id/contract/$contractId',
      params: { id, contractId },
      search: { lang: value as ContractLanguage },
      replace: true,
    });
  };

  if (isPending && farmer === undefined) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Contract Page</h3>
        <Skeleton className="h-48 w-full rounded-md" />
      </div>
    );
  }

  if (notFound || (!isPending && !farmer && !isError)) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Contract Page</h3>
        <Empty className="border border-dashed p-6 sm:p-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <User />
            </EmptyMedia>
            <EmptyTitle>Farmer not found</EmptyTitle>
            <EmptyDescription>No farmer exists for this id.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  if (isError || !farmer) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Contract Page</h3>
        <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Contract Page</h3>
        <Empty className="border border-dashed p-6 sm:p-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>Contract not found</EmptyTitle>
            <EmptyDescription>No contract exists for this id on this farmer.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const selectedUrl = contractUrlForLanguage(contract, lang);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Contract Page</h3>
        <Badge variant={contract.isNotarized ? 'secondary' : 'outline'}>
          {contract.isNotarized ? 'Notarized' : 'Not notarized'}
        </Badge>
      </div>
      <Tabs value={lang} onValueChange={handleLangChange} className="w-full min-w-0">
        <PageTabsList className="min-h-11 w-full sm:w-fit md:min-h-9">
          {LANGUAGE_TABS.map((item) => (
            <PageTabsTrigger key={item.value} value={item.value} className="px-2.5 sm:px-3">
              {item.label}
            </PageTabsTrigger>
          ))}
        </PageTabsList>
      </Tabs>
      {selectedUrl ? (
        <ContractPdfViewer url={selectedUrl} />
      ) : (
        <Suspense
          fallback={
            <Skeleton className="h-[70vh] min-h-[24rem] w-full rounded-md sm:min-h-[36rem]" />
          }
        >
          <GeneratedContractPdf farmer={farmer} contract={contract} language={lang} />
        </Suspense>
      )}
    </div>
  );
}
