import { Trash2Icon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useDeleteFarmerContract } from '@/features/farmers/api/use-delete-farmer-contract';
import type { FarmerContractRow } from '@/features/farmers/types';

interface DeleteContractDialogProps {
  contract: FarmerContractRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteContractDialog({ contract, open, onOpenChange }: DeleteContractDialogProps) {
  const { mutateAsync: deleteContract, isPending } = useDeleteFarmerContract();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return;
    onOpenChange(nextOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this contract?</AlertDialogTitle>
          <AlertDialogDescription>
            {contract
              ? `This will permanently delete the ${contract.variety} contract for ${contract.farmerName}. This cannot be undone.`
              : 'This will permanently delete this contract. This cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !contract}
            onClick={() => {
              if (!contract) return;
              void deleteContract({ farmerId: contract.farmerId, contractId: contract.id })
                .then(() => {
                  onOpenChange(false);
                })
                .catch(() => undefined);
            }}
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
