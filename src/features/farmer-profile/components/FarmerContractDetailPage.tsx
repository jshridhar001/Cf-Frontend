import { FileText, User } from 'lucide-react';
import { lazy, Suspense } from 'react';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { ContractPdfViewer } from '@/features/farmer-profile/components/contract-pdf-viewer';
import { useFarmer } from '@/features/farmers/api/use-farmer';
import { getApiErrorMessage, getHttpStatusFromError } from '@/lib/api-client';

const GeneratedContractPdf = lazy(() =>
  import('@/features/farmer-profile/components/generated-contract-pdf').then((mod) => ({
    default: mod.GeneratedContractPdf,
  })),
);

export default function FarmerContractDetailPage({
  id,
  contractId,
}: {
  id: string;
  contractId: string;
}) {
  const { data: farmer, isPending, isError, error } = useFarmer(id);
  const notFound = isError && getHttpStatusFromError(error) === 404;
  const contract = farmer?.contracts?.find((item) => String(item.id) === contractId);

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

  const contractUrl = contract.contractUrl?.trim() ?? '';

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Contract Page</h3>
      {contractUrl ? (
        <ContractPdfViewer url={contractUrl} />
      ) : (
        <Suspense
          fallback={
            <Skeleton className="h-[70vh] min-h-[24rem] w-full rounded-md sm:min-h-[36rem]" />
          }
        >
          <GeneratedContractPdf farmer={farmer} contract={contract} />
        </Suspense>
      )}
    </div>
  );
}
