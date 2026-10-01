import { Ban, Eye, Loader2, MoreHorizontal, Truck } from 'lucide-react';
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
import type { SeedDispatch } from '@/features/seed-dispatch/types';

type SeedDispatchRowActionsProps = {
  dispatch: SeedDispatch;
  onView?: (dispatch: SeedDispatch) => void;
  onMarkAsNull?: (id: string) => void | Promise<void>;
  onMarkInTransit?: (id: string) => void | Promise<void>;
};

export function SeedDispatchRowActions({
  dispatch,
  onView,
  onMarkAsNull,
  onMarkInTransit,
}: SeedDispatchRowActionsProps) {
  const [isNullDialogOpen, setIsNullDialogOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const isNull = dispatch.status === 'null';
  const isDelivered = dispatch.status === 'delivered';

  const handleView = () => {
    onView?.(dispatch);
  };

  const runAction = async (action?: (id: string) => void | Promise<void>) => {
    if (!action) return;
    setIsPending(true);
    try {
      await action(dispatch.id);
    } finally {
      setIsPending(false);
    }
  };

  const handleMarkAsNull = async () => {
    setIsPending(true);
    try {
      await onMarkAsNull?.(dispatch.id);
      setIsNullDialogOpen(false);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="size-8 rounded-lg" disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <MoreHorizontal className="size-4" />
            )}
            <span className="sr-only">Open actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleView}>
            <Eye className="size-4" />
            View
          </DropdownMenuItem>
          {!isNull && isDelivered ? (
            <DropdownMenuItem onClick={() => void runAction(onMarkInTransit)}>
              <Truck className="size-4" />
              Mark in transit
            </DropdownMenuItem>
          ) : null}
          {!isNull ? (
            <DropdownMenuItem variant="destructive" onClick={() => setIsNullDialogOpen(true)}>
              <Ban className="size-4" />
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
              This will null truck {dispatch.truckNumber} and reverse its requisition fulfillment.
              The row stays visible but dulled. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleMarkAsNull();
              }}
            >
              {isPending ? (
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
