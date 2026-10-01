import { Link } from '@tanstack/react-router';
import { Ban, EyeIcon, Loader2, MoreHorizontalIcon } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNullifySeedDispatch } from '@/features/seed-dispatch/overview/api/use-nullify-seed-dispatch';
import { useUpdateSeedDispatchStatus } from '@/features/seed-dispatch/overview/api/use-update-seed-dispatch-status';
import type { SeedDispatch } from '@/features/seed-dispatch/overview/types';

export function DispatchActions({ dispatch }: { dispatch: SeedDispatch }) {
  const [isNullDialogOpen, setIsNullDialogOpen] = useState(false);
  const nullify = useNullifySeedDispatch();
  const markDelivered = useUpdateSeedDispatchStatus();
  const isPending = nullify.isPending || markDelivered.isPending;
  const canDeliver = dispatch.status === 'IN_TRANSIT';
  const canNullify = dispatch.status !== 'NULL';

  async function handleMarkDelivered() {
    try {
      await markDelivered.mutateAsync({
        dispatchId: dispatch.id,
        truckNumber: dispatch.truckNumber,
      });
    } catch {
      // The mutation shows the error toast.
    }
  }

  async function handleMarkAsNull() {
    try {
      await nullify.mutateAsync({
        dispatchId: dispatch.id,
        truckNumber: dispatch.truckNumber,
      });
      setIsNullDialogOpen(false);
    } catch {
      setIsNullDialogOpen(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-8 min-h-11 min-w-11 md:min-h-8 md:min-w-8"
            disabled={isPending}
          >
            <span className="sr-only">Open menu</span>
            {isPending ? <Loader2 className="animate-spin" /> : <MoreHorizontalIcon />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuLabel className="font-semibold tracking-wide text-muted-foreground uppercase">
            Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/seed-dispatches/$id" params={{ id: dispatch.id }}>
              <EyeIcon />
              View details
            </Link>
          </DropdownMenuItem>
          {canDeliver ? (
            <DropdownMenuItem disabled={isPending} onClick={() => void handleMarkDelivered()}>
              Mark delivered
            </DropdownMenuItem>
          ) : null}
          {canNullify ? (
            <DropdownMenuItem
              variant="destructive"
              disabled={isPending}
              onClick={() => setIsNullDialogOpen(true)}
            >
              <Ban />
              Mark as null
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isNullDialogOpen} onOpenChange={setIsNullDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Ban className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Mark dispatch as null?</AlertDialogTitle>
            <AlertDialogDescription>
              This will null truck {dispatch.truckNumber?.trim() || 'this dispatch'} and reverse its
              requisition fulfillment. The row stays visible. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={nullify.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={nullify.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleMarkAsNull();
              }}
            >
              {nullify.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Marking...
                </>
              ) : (
                'Mark as null'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
