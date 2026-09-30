import { type DocumentProps } from '@react-pdf/renderer';
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import { type ReactElement, useMemo, useState } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { CardAction, CardDescription, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSeedRequisition } from '@/features/seed-requisition/overview/api/use-seed-requisition';
import { getApiErrorMessage } from '@/lib/api-client';
import { englishAgreement } from '../content/en';
import { hindiAgreement } from '../content/hi';
import type { AgreementLanguage } from '../content/types';
import { varietyTermsFor } from '../content/varieties';
import { PotatoMultiplicationAgreement } from '../document/PotatoMultiplicationAgreement';
import { agreementFileName, toAgreementFields } from '../lib/agreement-fields';
import {
  AgreementDownload,
  AgreementPreview,
  StoredContractDownload,
  StoredContractPreview,
} from './AgreementPreview';
import { ContractUploadActions } from './ContractDriveUploads';

function storedContractUrl(url: string | null | undefined) {
  const trimmed = url?.trim();
  return trimmed ? trimmed : null;
}

function ContractLanguagePreview({
  url,
  title,
  document,
  varietyName,
}: {
  url: string | null;
  title: string;
  document: ReactElement<DocumentProps> | null;
  varietyName: string;
}) {
  if (url) return <StoredContractPreview url={url} title={title} />;
  if (document) return <AgreementPreview document={document} />;
  return (
    <p className="text-sm text-muted-foreground">
      The agreement for {varietyName} is not available yet.
    </p>
  );
}

export function ContractPage({ id }: { id: string }) {
  const router = useRouter();
  const navigate = useNavigate();
  const canGoBack = useCanGoBack();
  const { data, isPending, isError, error } = useSeedRequisition(id);
  const [language, setLanguage] = useState<AgreementLanguage>('en');
  const terms = data ? varietyTermsFor(data.variety?.name) : null;
  const englishUrl = storedContractUrl(data?.engContractUrl);
  const hindiUrl = storedContractUrl(data?.hindiContractUrl);
  const activeUrl = language === 'hi' ? hindiUrl : englishUrl;
  const fields = useMemo(() => {
    if (!data || !terms || activeUrl) return null;
    return toAgreementFields(data, language);
  }, [activeUrl, data, language, terms]);
  const document = useMemo(() => {
    if (!fields || !terms || activeUrl) return null;
    const blocks =
      language === 'hi' ? hindiAgreement(fields, terms) : englishAgreement(fields, terms);
    return <PotatoMultiplicationAgreement language={language} blocks={blocks} />;
  }, [activeUrl, fields, language, terms]);
  const fileName = agreementFileName(fields?.growerName ?? '', language);
  const varietyName = data?.variety?.name?.trim() || 'this variety';
  const canPreview = Boolean(englishUrl || hindiUrl || terms);

  return (
    <PageCard>
      <PageCardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto]">
        <div className="flex min-w-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-ml-2 min-h-11 min-w-11 shrink-0 md:min-h-9 md:min-w-9"
            aria-label="Go back"
            onClick={() => {
              if (canGoBack) {
                router.history.back();
                return;
              }
              void navigate({ to: '/seed-requisition/overview' });
            }}
          >
            <ArrowLeftIcon />
          </Button>
          <div className="min-w-0">
            <CardTitle>Potato multiplication agreement</CardTitle>
            <CardDescription className="hidden sm:block">
              English and Hindi preview of the potato multiplication agreement for this requisition.
            </CardDescription>
          </div>
        </div>
        {data ? (
          <CardAction className="flex items-center gap-1">
            {activeUrl ? (
              <>
                <StoredContractDownload
                  url={activeUrl}
                  labeled={false}
                  className="min-h-11 min-w-11 md:hidden"
                />
                <StoredContractDownload url={activeUrl} labeled className="hidden md:inline-flex" />
              </>
            ) : document ? (
              <>
                <AgreementDownload
                  document={document}
                  fileName={fileName}
                  labeled={false}
                  className="min-h-11 min-w-11 md:hidden"
                />
                <AgreementDownload
                  document={document}
                  fileName={fileName}
                  labeled
                  className="hidden md:inline-flex"
                />
              </>
            ) : null}
            <ContractUploadActions
              requisitionId={data.id}
              engContractUrl={data.engContractUrl}
              hindiContractUrl={data.hindiContractUrl}
            />
          </CardAction>
        ) : null}
      </PageCardHeader>
      <PageCardContent>
        {isPending && !data ? <Skeleton className="h-96 w-full rounded-xl" /> : null}
        {isError && !data ? (
          <p className="text-sm text-destructive">
            {getApiErrorMessage(error, 'Failed to load requisition.')}
          </p>
        ) : null}
        {data && !canPreview ? (
          <p className="text-sm text-muted-foreground">
            The agreement for {varietyName} is not available yet.
          </p>
        ) : null}
        {data && canPreview ? (
          <Tabs
            value={language}
            onValueChange={(value) => setLanguage(value as AgreementLanguage)}
            className="gap-4"
          >
            <TabsList className="w-full sm:w-fit">
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="hi">हिन्दी</TabsTrigger>
            </TabsList>
            <TabsContent value="en">
              {language === 'en' ? (
                <ContractLanguagePreview
                  url={englishUrl}
                  title="English contract"
                  document={language === 'en' ? document : null}
                  varietyName={varietyName}
                />
              ) : null}
            </TabsContent>
            <TabsContent value="hi">
              {language === 'hi' ? (
                <ContractLanguagePreview
                  url={hindiUrl}
                  title="Hindi contract"
                  document={language === 'hi' ? document : null}
                  varietyName={varietyName}
                />
              ) : null}
            </TabsContent>
          </Tabs>
        ) : null}
      </PageCardContent>
    </PageCard>
  );
}
