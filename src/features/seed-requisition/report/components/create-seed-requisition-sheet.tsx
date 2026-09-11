import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCreateSeedRequisition } from '@/features/seed-requisition/report/api/use-create-seed-requisition';
import { SeedRequisitionForm } from '@/features/seed-requisition/report/components/seed-requisition-form';
import type { SeedRequisitionFormOptions } from '@/features/seed-requisition/report/lib/form-options';
import { dateOnlyToIsoDatetime } from '@/features/seed-requisition/report/lib/map-seed-requisition';
import type { CreateSeedRequisitionFormValues } from '@/features/seed-requisition/report/schemas/seed-requisition.schema';

type CreateSeedRequisitionSheetProps = {
  open: boolean;
  options: SeedRequisitionFormOptions;
  onOpenChange: (open: boolean) => void;
};

function CreateSeedRequisitionForm({
  options,
  onClose,
}: {
  options: SeedRequisitionFormOptions;
  onClose: () => void;
}) {
  const { mutateAsync: createSeedRequisition } = useCreateSeedRequisition();

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

export function CreateSeedRequisitionSheet({
  open,
  options,
  onOpenChange,
}: CreateSeedRequisitionSheetProps) {
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
          {open ? (
            <CreateSeedRequisitionForm options={options} onClose={() => onOpenChange(false)} />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
