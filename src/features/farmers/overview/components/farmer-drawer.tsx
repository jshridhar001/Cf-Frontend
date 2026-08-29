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
import { createFarmerMutationKey } from '@/features/farmers/api/use-create-farmer';
import { updateFarmerMutationKey } from '@/features/farmers/api/use-update-farmer';
import type { Farmer } from '@/features/farmers/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { CreateFarmerForm } from './create-farmer-form';
import { EditFarmerForm } from './edit-farmer-form';

interface FarmerDrawerProps {
  farmer: Farmer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FarmerDrawer({ farmer, open, onOpenChange }: FarmerDrawerProps) {
  const isMobile = useIsMobile();
  const isEdit = farmer !== null;
  const isSaving =
    useIsMutating({
      mutationKey: isEdit ? updateFarmerMutationKey : createFarmerMutationKey,
    }) > 0;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSaving) return;
    onOpenChange(nextOpen);
  };

  const title = isEdit ? 'Edit farmer' : 'Add farmer';
  const description = isEdit
    ? 'Update this farmer contact, status, and bank details.'
    : 'Create a contracted farmer. Station and locality come from master data.';

  const form = isEdit ? (
    <EditFarmerForm
      key={farmer.id}
      farmer={farmer}
      onSuccess={() => onOpenChange(false)}
      onCancel={() => onOpenChange(false)}
    />
  ) : (
    <CreateFarmerForm
      key="create"
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
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{form}</div>
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
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{form}</div>
      </SheetContent>
    </Sheet>
  );
}
