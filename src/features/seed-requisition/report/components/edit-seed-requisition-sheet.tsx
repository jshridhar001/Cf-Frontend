import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useUpdateSeedRequisition } from '@/features/seed-requisition/report/api/use-update-seed-requisition';
import { SeedRequisitionForm } from '@/features/seed-requisition/report/components/seed-requisition-form';
import { useSeedRequisitionFormOptions } from '@/features/seed-requisition/report/lib/form-options';
import { dateOnlyToIsoDatetime } from '@/features/seed-requisition/report/lib/map-seed-requisition';
import type { CreateSeedRequisitionFormValues } from '@/features/seed-requisition/report/schemas/seed-requisition.schema';
import type { SeedRequisitionRow } from '@/features/seed-requisition/report/types';
import { getApiErrorMessage } from '@/lib/api-client';

type EditSeedRequisitionSheetProps = {
  requisition: SeedRequisitionRow | null;
  onOpenChange: (open: boolean) => void;
};

function toFormValues(requisition: SeedRequisitionRow): CreateSeedRequisitionFormValues {
  const hasAcres = requisition.acres > 0;
  return {
    farmerId: requisition.farmerId,
    varietyId: requisition.varietyId,
    quantityMode: hasAcres ? 'acres' : 'bags',
    acres: hasAcres ? requisition.acres : 0,
    seedBags: hasAcres ? 0 : requisition.seedBags,
    requisitionDate: requisition.requisitionDate,
    requestedDeliveryDate: requisition.requestedDeliveryDate,
    remarks: requisition.remarks,
  };
}

function EditSeedRequisitionForm({
  requisition,
  onClose,
}: {
  requisition: SeedRequisitionRow;
  onClose: () => void;
}) {
  const { mutateAsync: updateSeedRequisition } = useUpdateSeedRequisition();
  const seedOptions = useMemo(
    () => ({
      farmer: { value: requisition.farmerId, label: requisition.farmer },
      variety: { value: requisition.varietyId, label: requisition.variety },
    }),
    [requisition.farmer, requisition.farmerId, requisition.variety, requisition.varietyId],
  );
  const { options, isPending, isError, error } = useSeedRequisitionFormOptions(seedOptions);

  const handleSubmit = async (values: CreateSeedRequisitionFormValues) => {
    await updateSeedRequisition({
      requisitionId: requisition.id,
      requestedDeliveryDate: dateOnlyToIsoDatetime(values.requestedDeliveryDate),
      remarks: values.remarks.trim() || undefined,
      ...(values.quantityMode === 'bags'
        ? { requestedBags: values.seedBags, requestedAcres: null }
        : { requestedBags: null, requestedAcres: values.acres }),
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
      defaultValues={toFormValues(requisition)}
      isEdit
      submitLabel="Save changes"
      pendingLabel="Saving..."
      onSubmit={handleSubmit}
      onCancel={onClose}
    />
  );
}

export function EditSeedRequisitionSheet({
  requisition,
  onOpenChange,
}: EditSeedRequisitionSheetProps) {
  const open = requisition != null && requisition.status === 'pending';

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onOpenChange(false);
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg"
      >
        <SheetHeader className="border-b border-border/40 py-4 pr-14 pl-5">
          <SheetTitle>Edit Seed Requisition</SheetTitle>
          <SheetDescription>
            Update quantity, delivery date, or remarks. Farmer and variety cannot be changed.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {open && requisition ? (
            <EditSeedRequisitionForm
              requisition={requisition}
              onClose={() => onOpenChange(false)}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
