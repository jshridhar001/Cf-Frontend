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
import { updateUserMutationKey } from '@/features/access-control/api/use-update-user';
import type { AccessControlUser } from '@/features/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { EditUserForm } from './edit-user-form';

interface EditUserDrawerProps {
  user: AccessControlUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDrawer({ user, open, onOpenChange }: EditUserDrawerProps) {
  const isMobile = useIsMobile();
  const isSaving = useIsMutating({ mutationKey: updateUserMutationKey }) > 0;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSaving) return;
    onOpenChange(nextOpen);
  };

  const form = user ? (
    <EditUserForm
      key={user.id}
      user={user}
      onSuccess={() => onOpenChange(false)}
      onCancel={() => onOpenChange(false)}
    />
  ) : null;

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
            <DrawerTitle>Edit user</DrawerTitle>
            <DrawerDescription>
              Update this user name, email, and role. Changes apply the next time they sign in.
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
          <SheetTitle>Edit user</SheetTitle>
          <SheetDescription>
            Update this user name, email, and role. Changes apply the next time they sign in.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{form}</div>
      </SheetContent>
    </Sheet>
  );
}
