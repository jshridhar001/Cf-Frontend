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
import { RequisitionForm } from '@/features/seed-requisition/overview/components/requisition-form';
import { useRequisitionSampleStore } from '@/features/seed-requisition/overview/components/requisition-sample-store';
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
  const { isSaving } = useRequisitionSampleStore();
  const formRequisition = requisition;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSaving) return;
    onOpenChange(nextOpen);
  };

  const title = isEdit ? 'Edit requisition' : 'Add requisition';
  const description = isEdit
    ? 'Update quantity, delivery date, or remarks. Farmer and variety cannot be changed.'
    : 'Create a seed requisition. Provide either bags or acres, not both.';

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
          <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-4">
            {form}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-6 pb-6">
          {form}
        </div>
      </SheetContent>
    </Sheet>
  );
}
