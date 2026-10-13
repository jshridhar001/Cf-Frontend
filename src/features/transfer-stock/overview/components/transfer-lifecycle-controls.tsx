import { Link } from '@tanstack/react-router';
import { Ban, Check, EyeIcon, Loader2, MoreHorizontalIcon } from 'lucide-react';
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
import { formatFarmerLabel } from '@/features/transfer-stock/lib/format';
import { useConfirmStockTransfer } from '@/features/transfer-stock/overview/api/use-confirm-stock-transfer';
import { useNullifyStockTransfer } from '@/features/transfer-stock/overview/api/use-nullify-stock-transfer';
import type { StockTransfer } from '@/features/transfer-stock/overview/types';
import { totalTransferBags } from '@/features/transfer-stock/overview/types';

type TransferLifecycleControlsProps = {
  transfer: StockTransfer;
  variant: 'menu' | 'buttons';
};

export function TransferLifecycleControls({ transfer, variant }: TransferLifecycleControlsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [nullifyOpen, setNullifyOpen] = useState(false);
  const confirm = useConfirmStockTransfer();
  const nullify = useNullifyStockTransfer();
  const isPending = confirm.isPending || nullify.isPending;
  const canConfirm = transfer.status === 'PENDING';
  const canNullify = transfer.status === 'PENDING' || transfer.status === 'RECEIVED';
  const bags = totalTransferBags(transfer);
  const fromLabel = formatFarmerLabel(transfer.fromFarmer);
  const toLabel = formatFarmerLabel(transfer.toFarmer);

  async function handleConfirm() {
    try {
      await confirm.mutateAsync(transfer.id);
      setConfirmOpen(false);
    } catch {
      setConfirmOpen(false);
    }
  }

  async function handleNullify() {
    try {
      await nullify.mutateAsync(transfer.id);
      setNullifyOpen(false);
    } catch {
      setNullifyOpen(false);
    }
  }

  return (
    <>
      {variant === 'menu' ? (
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
            <DropdownMenuLabel className="text-muted-foreground font-semibold tracking-wide uppercase">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/transfer-stock/$id" params={{ id: transfer.id }}>
                <EyeIcon />
                View details
              </Link>
            </DropdownMenuItem>
            {canConfirm ? (
              <DropdownMenuItem disabled={isPending} onClick={() => setConfirmOpen(true)}>
                <Check />
                Confirm receipt
              </DropdownMenuItem>
            ) : null}
            {canNullify ? (
              <DropdownMenuItem
                variant="destructive"
                disabled={isPending}
                onClick={() => setNullifyOpen(true)}
              >
                <Ban />
                Nullify
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex flex-wrap gap-2">
          {canConfirm ? (
            <Button
              type="button"
              className="min-h-11 md:min-h-9"
              disabled={isPending}
              onClick={() => setConfirmOpen(true)}
            >
              <Check />
              Confirm receipt
            </Button>
          ) : null}
          {canNullify ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 md:min-h-9"
              disabled={isPending}
              onClick={() => setNullifyOpen(true)}
            >
              <Ban />
              Nullify
            </Button>
          ) : null}
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-primary/10 text-primary">
              <Check className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Confirm receipt?</AlertDialogTitle>
            <AlertDialogDescription>
              This credits {bags} {bags === 1 ? 'bag' : 'bags'} to {toLabel}. {fromLabel} was
              already debited when the transfer was created.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirm.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirm.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleConfirm();
              }}
            >
              {confirm.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm receipt'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={nullifyOpen} onOpenChange={setNullifyOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Ban className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Nullify transfer?</AlertDialogTitle>
            <AlertDialogDescription>
              {transfer.status === 'RECEIVED'
                ? `This moves the bags from ${toLabel} back to ${fromLabel}. The transfer stays on record as null.`
                : `This returns the bags to ${fromLabel}. ${toLabel} is not credited. The transfer stays on record as null.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={nullify.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={nullify.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleNullify();
              }}
            >
              {nullify.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Nullifying...
                </>
              ) : (
                'Nullify'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
