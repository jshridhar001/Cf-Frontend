import { Loader2 } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCreateSeedRequisition } from '@/features/seed-requisition/report/api/use-create-seed-requisition';
import { SeedRequisitionForm } from '@/features/seed-requisition/report/components/seed-requisition-form';
import { useSeedRequisitionFormOptions } from '@/features/seed-requisition/report/lib/form-options';
import { dateOnlyToIsoDatetime } from '@/features/seed-requisition/report/lib/map-seed-requisition';
import type { CreateSeedRequisitionFormValues } from '@/features/seed-requisition/report/schemas/seed-requisition.schema';
import { getApiErrorMessage } from '@/lib/api-client';

type CreateSeedRequisitionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function CreateSeedRequisitionForm({ onClose }: { onClose: () => void }) {
  const { mutateAsync: createSeedRequisition } = useCreateSeedRequisition();
  const { options, isPending, isError, error } = useSeedRequisitionFormOptions();

  const handleSubmit = async (values: CreateSeedRequisitionFormValues) => {
    await createSeedRequisition({
      farmerId: values.farmerId,
      varietyId: values.varietyId,
      requisitionDate: dateOnlyToIsoDatetime(values.requisitionDate),
      requestedDeliveryDate: dateOnlyToIsoDatetime(values.requestedDeliveryDate),
      remarks: values.remarks.trim() || undefined,
      ...(values.quantityMode === 'bags'
        ? { requestedBags: values.seedBags }
        : { requestedAcres: values.acres }),
    });
    onClose();
  };

  if (isPending) {
    return (
      <div className="text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Loading form…
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-destructive py-8 text-center text-sm">
        {getApiErrorMessage(error, 'Failed to load farmers and varieties.')}
      </p>
    );
  }

  return (
    <SeedRequisitionForm
      options={options}
      submitLabel="Create Requisition"
      pendingLabel="Creating..."
      onSubmit={handleSubmit}
      onCancel={onClose}
    />
  );
}

export function CreateSeedRequisitionSheet({ open, onOpenChange }: CreateSeedRequisitionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg"
      >
        <SheetHeader className="border-b border-border/40 py-4 pr-14 pl-5">
          <SheetTitle>Add Seed Requisition</SheetTitle>
          <SheetDescription>Create a new pending seed requisition.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {open ? <CreateSeedRequisitionForm onClose={() => onOpenChange(false)} /> : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
