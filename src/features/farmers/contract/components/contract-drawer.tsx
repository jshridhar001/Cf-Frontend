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
import { createFarmerContractMutationKey } from '@/features/farmers/api/use-create-farmer-contract';
import { updateFarmerContractMutationKey } from '@/features/farmers/api/use-update-farmer-contract';
import { ContractForm } from '@/features/farmers/contract/components/contract-form';
import type { Farmer, FarmerContractRow } from '@/features/farmers/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface ContractDrawerProps {
  farmers: Farmer[];
  contract: FarmerContractRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultFarmerId?: string;
}

export function ContractDrawer({
  farmers,
  contract,
  open,
  onOpenChange,
  defaultFarmerId,
}: ContractDrawerProps) {
  const isMobile = useIsMobile();
  const isEdit = contract !== null;
  const isSaving =
    useIsMutating({
      mutationKey: isEdit ? updateFarmerContractMutationKey : createFarmerContractMutationKey,
    }) > 0;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSaving) return;
    onOpenChange(nextOpen);
  };

  const title = isEdit ? 'Edit contract' : 'Add contract';
  const description = isEdit
    ? 'Update variety, date, acres, and the contract file URL.'
    : 'Create a contract for a farmer. Variety names come from master data.';

  const form = (
    <ContractForm
      key={contract?.id ?? 'create'}
      farmers={farmers}
      contract={contract}
      defaultFarmerId={defaultFarmerId}
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
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-4">{form}</div>
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
