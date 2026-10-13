import { useMemo, useState } from 'react';
import { SearchableOptionCombobox } from '@/components/searchable-option-combobox';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Farmer } from '@/features/farmers/overview/types';
import {
  availableBags,
  type BagDrafts,
  draftExceedsBalance,
  selectedTransferLines,
  sortStockRows,
  totalSelectedBags,
} from '@/features/transfer-stock/create/lib/stock-lines';
import type { FarmerStockRow } from '@/features/transfer-stock/create/types';
import { formatFarmerLabel } from '@/features/transfer-stock/lib/format';
import { formatSeedSize } from '@/lib/format-seed-size';
import { cn } from '@/lib/utils';

type SourceStockStepProps = {
  farmers: Farmer[];
  fromFarmerId: string;
  toFarmerId: string;
  drafts: BagDrafts;
  stock: FarmerStockRow[] | undefined;
  isStockLoading: boolean;
  stockErrorMessage: string | null;
  onFromFarmerChange: (farmerId: string) => void;
  onToFarmerChange: (farmerId: string) => void;
  onDraftsChange: (drafts: BagDrafts) => void;
  onNext: () => void;
};

function sanitizeBagInput(raw: string, max: number) {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const quantity = Number.parseInt(digits, 10);
  if (!Number.isFinite(quantity) || quantity <= 0) return '';
  return String(Math.min(quantity, max));
}

export function SourceStockStep({
  farmers,
  fromFarmerId,
  toFarmerId,
  drafts,
  stock,
  isStockLoading,
  stockErrorMessage,
  onFromFarmerChange,
  onToFarmerChange,
  onDraftsChange,
  onNext,
}: SourceStockStepProps) {
  const [stockQuery, setStockQuery] = useState('');

  const farmerOptions = useMemo(
    () =>
      farmers
        .filter((farmer) => farmer.status === 'ACTIVE')
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((farmer) => ({
          id: farmer.id,
          label: formatFarmerLabel(farmer),
        })),
    [farmers],
  );

  const destinationOptions = useMemo(
    () => farmerOptions.filter((option) => option.id !== fromFarmerId),
    [farmerOptions, fromFarmerId],
  );

  const sortedStock = useMemo(() => sortStockRows(stock ?? []), [stock]);
  const visibleStock = useMemo(() => {
    const query = stockQuery.trim().toLowerCase();
    if (!query) return sortedStock;
    return sortedStock.filter((row) =>
      [row.variety.name, row.size.name, row.generation.name]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [sortedStock, stockQuery]);

  const selected = useMemo(() => selectedTransferLines(sortedStock, drafts), [sortedStock, drafts]);
  const totalBags = totalSelectedBags(selected);
  const hasOverdraw = sortedStock.some((row) =>
    draftExceedsBalance(drafts[row.id], availableBags(row.balance)),
  );
  const canContinue =
    Boolean(fromFarmerId) &&
    Boolean(toFarmerId) &&
    fromFarmerId !== toFarmerId &&
    selected.length > 0 &&
    !hasOverdraw &&
    !isStockLoading &&
    !stockErrorMessage;

  const continueHint = !fromFarmerId
    ? 'Select a source farmer.'
    : isStockLoading
      ? 'Loading stock…'
      : stockErrorMessage
        ? stockErrorMessage
        : sortedStock.length === 0
          ? 'This farmer has no stock to transfer.'
          : hasOverdraw
            ? 'Bag quantities cannot exceed the available balance.'
            : selected.length === 0
              ? 'Enter how many bags to transfer.'
              : !toFarmerId
                ? 'Select a destination farmer.'
                : null;

  function updateDraft(stockId: string, quantity: string) {
    const next = { ...drafts };
    if (!quantity) {
      delete next[stockId];
    } else {
      next[stockId] = quantity;
    }
    onDraftsChange(next);
  }

  return (
    <div className="flex flex-col gap-8">
      <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="transfer-from-farmer">Source farmer</FieldLabel>
          <SearchableOptionCombobox
            id="transfer-from-farmer"
            name="fromFarmerId"
            value={fromFarmerId}
            onValueChange={onFromFarmerChange}
            onBlur={() => {}}
            isInvalid={false}
            placeholder="Select source farmer"
            popupSearchPlaceholder="Search farmers"
            emptyMessage="No active farmers found."
            options={farmerOptions}
          />
          <FieldDescription>Stock on hand is listed after you choose a farmer.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="transfer-to-farmer">Destination farmer</FieldLabel>
          <SearchableOptionCombobox
            id="transfer-to-farmer"
            name="toFarmerId"
            value={toFarmerId}
            onValueChange={onToFarmerChange}
            onBlur={() => {}}
            isInvalid={false}
            placeholder="Select destination farmer"
            popupSearchPlaceholder="Search farmers"
            emptyMessage="No other farmer is available."
            options={destinationOptions}
            disabled={!fromFarmerId}
          />
          <FieldDescription>
            Bags are credited here after the transfer is confirmed.
          </FieldDescription>
        </Field>
      </FieldGroup>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium">Available stock</p>
            <p className="text-muted-foreground mt-1 hidden text-sm sm:block">
              Enter a whole number of bags. Empty rows stay with the source farmer.
            </p>
          </div>
          {fromFarmerId && sortedStock.length > 0 ? (
            <Input
              value={stockQuery}
              onChange={(event) => setStockQuery(event.target.value)}
              placeholder="Search variety, size, or generation"
              aria-label="Search stock"
              className="sm:max-w-xs"
            />
          ) : null}
        </div>

        {!fromFarmerId ? (
          <p className="text-muted-foreground rounded-xl border border-dashed px-4 py-10 text-center text-sm">
            Select a source farmer to see stock available to transfer.
          </p>
        ) : isStockLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : stockErrorMessage ? (
          <p className="text-destructive rounded-xl border border-dashed px-4 py-10 text-center text-sm">
            {stockErrorMessage}
          </p>
        ) : sortedStock.length === 0 ? (
          <p className="text-muted-foreground rounded-xl border border-dashed px-4 py-10 text-center text-sm">
            This farmer has no stock on hand.
          </p>
        ) : visibleStock.length === 0 ? (
          <p className="text-muted-foreground rounded-xl border border-dashed px-4 py-10 text-center text-sm">
            No stock matches this search.
          </p>
        ) : (
          <>
            <ItemGroup className="md:hidden">
              {visibleStock.map((row) => (
                <StockItem
                  key={row.id}
                  row={row}
                  quantity={drafts[row.id] ?? ''}
                  onQuantityChange={(quantity) => updateDraft(row.id, quantity)}
                />
              ))}
            </ItemGroup>

            <div className="hidden overflow-hidden rounded-md border md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Variety</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Generation</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead className="w-36 text-right">Bags to transfer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleStock.map((row) => {
                    const max = availableBags(row.balance);
                    const disabled = max === 0;
                    return (
                      <TableRow key={row.id} className={cn(disabled && 'text-muted-foreground')}>
                        <TableCell className="font-medium">{row.variety.name}</TableCell>
                        <TableCell>{formatSeedSize(row.size.name)}</TableCell>
                        <TableCell>{row.generation.name}</TableCell>
                        <TableCell className="text-right tabular-nums">{max}</TableCell>
                        <TableCell className="text-right">
                          <BagQuantityInput
                            id={`transfer-bags-${row.id}`}
                            label={`Bags of ${row.variety.name}, ${row.size.name}, ${row.generation.name}`}
                            max={max}
                            value={drafts[row.id] ?? ''}
                            disabled={disabled}
                            onChange={(quantity) => updateDraft(row.id, quantity)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </section>

      <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          {continueHint ??
            `${totalBags} ${totalBags === 1 ? 'bag' : 'bags'} selected across ${selected.length} ${selected.length === 1 ? 'line' : 'lines'}.`}
        </p>
        <Button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className="min-h-11 sm:min-h-9"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

function StockItem({
  row,
  quantity,
  onQuantityChange,
}: {
  row: FarmerStockRow;
  quantity: string;
  onQuantityChange: (quantity: string) => void;
}) {
  const max = availableBags(row.balance);
  const disabled = max === 0;

  return (
    <Item variant="outline" size="sm" className={cn(disabled && 'opacity-60')}>
      <ItemContent>
        <ItemTitle>{row.variety.name}</ItemTitle>
        <ItemDescription>
          {formatSeedSize(row.size.name)} · {row.generation.name} · {max} available
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <BagQuantityInput
          id={`transfer-bags-mobile-${row.id}`}
          label={`Bags of ${row.variety.name}, ${row.size.name}, ${row.generation.name}`}
          max={max}
          value={quantity}
          disabled={disabled}
          onChange={onQuantityChange}
        />
      </ItemActions>
    </Item>
  );
}

function BagQuantityInput({
  id,
  label,
  max,
  value,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  max: number;
  value: string;
  disabled: boolean;
  onChange: (quantity: string) => void;
}) {
  const overdrawn = draftExceedsBalance(value, max);

  return (
    <Input
      id={id}
      inputMode="numeric"
      aria-label={label}
      aria-invalid={overdrawn}
      disabled={disabled}
      value={value}
      placeholder="0"
      className="h-11 w-24 text-right tabular-nums md:h-9"
      onChange={(event) => onChange(sanitizeBagInput(event.target.value, max))}
    />
  );
}
