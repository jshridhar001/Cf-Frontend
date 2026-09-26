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
import type { Farmer } from '@/features/farmers/overview/types';
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

  const title = isEdit ? 'Edit farmer' : 'Add farmer';
  const description = isEdit
    ? 'Update this farmer’s contact and address.'
    : 'Create a contracted farmer. Address is chosen from the address lists.';

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
        onOpenChange={onOpenChange}
        direction="bottom"
        shouldScaleBackground={false}
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
    <Sheet open={open} onOpenChange={onOpenChange}>
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
