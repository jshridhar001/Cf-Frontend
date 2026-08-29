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
import { createUserMutationKey } from '@/features/access-control/api/use-create-user';
import { useIsMobile } from '@/hooks/use-mobile';
import { CreateUserForm } from './create-user-form';

interface CreateUserDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDrawer({ open, onOpenChange }: CreateUserDrawerProps) {
  const isMobile = useIsMobile();
  const isCreating = useIsMutating({ mutationKey: createUserMutationKey }) > 0;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isCreating) return;
    onOpenChange(nextOpen);
  };

  const form = (
    <CreateUserForm onSuccess={() => onOpenChange(false)} onCancel={() => onOpenChange(false)} />
  );

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={handleOpenChange}
        direction="bottom"
        shouldScaleBackground={false}
        dismissible={!isCreating}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create user</DrawerTitle>
            <DrawerDescription>
              Add a new account and assign a role. They can sign in with the email and password you
              set.
            </DrawerDescription>
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
          <SheetTitle>Create user</SheetTitle>
          <SheetDescription>
            Add a new account and assign a role. They can sign in with the email and password you
            set.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{form}</div>
      </SheetContent>
    </Sheet>
  );
}
