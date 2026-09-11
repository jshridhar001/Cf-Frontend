import { useIsMutating } from '@tanstack/react-query';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { createSeedRequisitionMutationKey } from '@/features/seed-requisition/overview/api/use-create-seed-requisition';
import { useSeedRequisition } from '@/features/seed-requisition/overview/api/use-seed-requisition';
import { updateSeedRequisitionMutationKey } from '@/features/seed-requisition/overview/api/use-update-seed-requisition';
import { RequisitionForm } from '@/features/seed-requisition/overview/components/requisition-form';
import type { SeedRequisition } from '@/features/seed-requisition/overview/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface RequisitionDrawerProps {
  requisition: SeedRequisition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequisitionDrawer({ requisition, open, onOpenChange }: RequisitionDrawerProps) {
  const isMobile = useIsMobile();
  const isEdit = requisition !== null;
  const { data: detailedRequisition } = useSeedRequisition(requisition?.id ?? '', open && isEdit);
  const formRequisition = detailedRequisition ?? requisition;
  const isSaving =
    useIsMutating({
      mutationKey: isEdit ? updateSeedRequisitionMutationKey : createSeedRequisitionMutationKey,
    }) > 0;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSaving) return;
    onOpenChange(nextOpen);
  };

  const title = isEdit ? 'Edit Seed Requisition' : 'Add Seed Requisition';
  const description = isEdit
    ? 'Update quantity, delivery date, or remarks. Farmer and variety cannot be changed.'
    : 'Create a new pending seed requisition.';

  const form = (
    <RequisitionForm
      key={isEdit ? (formRequisition?.id ?? 'edit') : 'create'}
      requisition={formRequisition}
      onSuccess={() => onOpenChange(false)}
      onCancel={() => onOpenChange(false)}
    />
  );

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={handleOpenChange}
        direction="bottom"
        shouldScaleBackground={false}
        dismissible={!isSaving}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{form}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg"
      >
        <SheetHeader className="border-b border-border/40 py-4 pr-14 pl-5">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-5">{form}</div>
      </SheetContent>
    </Sheet>
  );
}
