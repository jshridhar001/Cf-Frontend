import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  quantityForView,
  type StockMatrix,
  type StockMatrixRow,
  type StockQuantity,
  sumQuantities,
} from '@/features/master/lib/facility-stock-summary';
import { cn } from '@/lib/utils';

type QuantityDetail = {
  title: string;
  viewLabel: string;
  quantity: StockQuantity;
};

function formatQuantity(value: number) {
  return value.toLocaleString('en-IN');
}

function hasQuantity(quantity: StockQuantity) {
  return quantity.currentQuantity !== 0 || quantity.initialQuantity !== 0;
}

function QuantityCell({
  quantity,
  emphasize = false,
  label,
  onOpen,
}: {
  quantity: StockQuantity;
  emphasize?: boolean;
  label: string;
  onOpen: () => void;
}) {
  const text = formatQuantity(quantity.currentQuantity);
  const className = cn(
    'tabular-nums',
    emphasize && 'font-medium text-emerald-700 dark:text-emerald-400',
    !emphasize && quantity.currentQuantity === 0 && 'text-muted-foreground',
  );

  if (!hasQuantity(quantity)) {
    return <span className={className}>{text}</span>;
  }

  return (
    <button
      type="button"
      className={cn(
        className,
        'rounded-md px-2 py-1 underline-offset-4 hover:bg-muted hover:underline',
      )}
      aria-label={`${label}, current quantity ${text}. View initial quantity.`}
      onClick={onOpen}
    >
      {text}
    </button>
  );
}

export function TotalStockTable({ matrix }: { matrix: StockMatrix }) {
  const [generationId, setGenerationId] = useState<'all' | string>('all');
  const [detail, setDetail] = useState<QuantityDetail | null>(null);
  const activeGenerationId =
    generationId !== 'all' &&
    matrix.generations.some((generation) => generation.id === generationId)
      ? generationId
      : 'all';
  const viewLabel =
    activeGenerationId === 'all'
      ? 'All generations'
      : (matrix.generations.find((generation) => generation.id === activeGenerationId)?.name ??
        'All generations');

  const openDetail = (row: StockMatrixRow, label: string, quantity: StockQuantity) => {
    setDetail({
      title: `${row.name} · ${label}`,
      viewLabel,
      quantity,
    });
  };

  const rowTotals = useMemo(
    () =>
      matrix.rows.map((row) =>
        sumQuantities(
          matrix.sizes.map((size) => quantityForView(row.cells[size.id], activeGenerationId)),
        ),
      ),
    [activeGenerationId, matrix.rows, matrix.sizes],
  );

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Generations" className="flex gap-1 overflow-x-auto">
        <GenerationTab
          label="All"
          selected={activeGenerationId === 'all'}
          onSelect={() => setGenerationId('all')}
        />
        {matrix.generations.map((generation) => (
          <GenerationTab
            key={generation.id}
            label={generation.name}
            selected={activeGenerationId === generation.id}
            onSelect={() => setGenerationId(generation.id)}
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Varieties</TableHead>
              {matrix.sizes.map((size) => (
                <TableHead key={size.id} className="text-center font-semibold">
                  {size.name}
                </TableHead>
              ))}
              <TableHead className="text-center font-semibold">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matrix.rows.length ? (
              matrix.rows.map((row, index) => {
                const total = rowTotals[index] ?? {
                  initialQuantity: 0,
                  currentQuantity: 0,
                };

                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    {matrix.sizes.map((size) => {
                      const quantity = quantityForView(row.cells[size.id], activeGenerationId);
                      return (
                        <TableCell key={size.id} className="text-center">
                          <QuantityCell
                            quantity={quantity}
                            label={`${row.name}, ${size.name}, ${viewLabel}`}
                            onOpen={() => openDetail(row, size.name, quantity)}
                          />
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center">
                      <QuantityCell
                        quantity={total}
                        emphasize
                        label={`${row.name}, total, ${viewLabel}`}
                        onOpen={() => openDetail(row, 'Total', total)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={matrix.sizes.length + 2} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={detail !== null}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <DialogContent>
          {detail ? (
            <>
              <DialogHeader>
                <DialogTitle>{detail.title}</DialogTitle>
                <DialogDescription>{detail.viewLabel}</DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <dt className="text-sm text-muted-foreground">Current quantity</dt>
                  <dd className="text-lg font-semibold tabular-nums">
                    {formatQuantity(detail.quantity.currentQuantity)}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-sm text-muted-foreground">Initial quantity</dt>
                  <dd className="text-lg font-semibold tabular-nums">
                    {formatQuantity(detail.quantity.initialQuantity)}
                  </dd>
                </div>
              </dl>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GenerationTab({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={cn(
        'shrink-0 rounded-md px-3 py-1.5 text-sm font-medium',
        selected
          ? 'text-emerald-700 dark:text-emerald-400'
          : 'text-muted-foreground hover:text-foreground',
      )}
      onClick={onSelect}
    >
      {label}
    </button>
  );
}
