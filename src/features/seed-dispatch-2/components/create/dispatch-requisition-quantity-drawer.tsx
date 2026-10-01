import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  type DispatchSizeLineDraft,
  getSelectionTotal,
} from '@/features/seed-dispatch/lib/dispatch-form-types';
import type {
  DispatchFacilityOption,
  DispatchGenerationOption,
  DispatchSizeOption,
} from '@/features/seed-dispatch/lib/form-options';
import {
  type BagLineWithStandard,
  getAcresConsumedByOtherLines,
  getAvailableAcresForLine,
  getMaxBagsForAvailableAcres,
  getRemainingAcres,
  isAcresBasedRequisition,
  isAcresDispatchWithinTolerance,
  remainingAcresAfterConsume,
  roundBags,
  sumAcresFromBagLines,
} from '@/features/seed-dispatch/lib/quantity';
import type { DispatchableRequisition } from '@/features/seed-dispatch/types';
import { formatDate } from '@/lib/format-date';
import { formatSeedSize } from '@/lib/format-seed-size';

type DispatchRequisitionQuantityDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisition: DispatchableRequisition | null;
  facilities: DispatchFacilityOption[];
  sizes: DispatchSizeOption[];
  generations: DispatchGenerationOption[];
  initialSizeLines: DispatchSizeLineDraft[];
  /** Prefill facility from session (last used) or single-facility auto-fill. */
  defaultFacilityId?: string;
  onConfirm: (sizeLines: DispatchSizeLineDraft[]) => void;
  onRemove: () => void;
};

type SizeLineRow = {
  key: string;
  facilityId: string;
  sizeId: string;
  generationId: string;
  quantity: string;
};

type AcresRowLimit = {
  availableAcres: number;
  maxBags: number | null;
  missingStandard: boolean;
  isOverLimit: boolean;
  limitHint: string | null;
};

function createRow(overrides?: Partial<SizeLineRow>): SizeLineRow {
  return {
    key: crypto.randomUUID(),
    facilityId: '',
    sizeId: '',
    generationId: '',
    quantity: '',
    ...overrides,
  };
}

function toValidSizeLines(rows: SizeLineRow[]): DispatchSizeLineDraft[] {
  return rows
    .filter((row) => {
      const value = Number.parseFloat(row.quantity);
      return (
        row.facilityId && row.sizeId && row.generationId && Number.isFinite(value) && value > 0
      );
    })
    .map((row) => ({
      facilityId: row.facilityId,
      sizeId: row.sizeId,
      generationId: row.generationId,
      quantity: row.quantity,
    }));
}

function rowsFromInitial(initialSizeLines: DispatchSizeLineDraft[]): SizeLineRow[] {
  const valid = initialSizeLines.filter((line) => {
    const value = Number.parseFloat(line.quantity);
    return (
      line.facilityId && line.sizeId && line.generationId && Number.isFinite(value) && value > 0
    );
  });

  if (valid.length === 0) {
    return [createRow()];
  }

  return valid.map((line) =>
    createRow({
      facilityId: line.facilityId,
      sizeId: line.sizeId,
      generationId: line.generationId,
      quantity: line.quantity,
    }),
  );
}

function hasDuplicateFacilitySizeGeneration(rows: SizeLineRow[]) {
  const selected = rows
    .filter((row) => row.facilityId && row.sizeId && row.generationId)
    .map((row) => `${row.facilityId}:${row.sizeId}:${row.generationId}`);
  return new Set(selected).size !== selected.length;
}

function isRowComplete(row: SizeLineRow) {
  const value = Number.parseFloat(row.quantity);
  return (
    Boolean(row.facilityId) &&
    Boolean(row.sizeId) &&
    Boolean(row.generationId) &&
    Number.isFinite(value) &&
    value > 0
  );
}

function getBagLinesFromRows(
  rows: SizeLineRow[],
  sizes: DispatchSizeOption[],
): BagLineWithStandard[] {
  return rows.flatMap((row) => {
    if (!isRowComplete(row)) return [];
    const size = sizes.find((item) => item.id === row.sizeId);
    if (!size?.bagsPerAcre) return [];
    return [
      {
        quantity: Number.parseFloat(row.quantity),
        bagsPerAcre: size.bagsPerAcre,
      },
    ];
  });
}

function getAcresRowLimits(
  rows: SizeLineRow[],
  sizes: DispatchSizeOption[],
  remainingAcres: number,
): AcresRowLimit[] {
  const bagLines: BagLineWithStandard[] = [];

  return rows.map((row) => {
    const size = sizes.find((item) => item.id === row.sizeId);
    const otherAcres = getAcresConsumedByOtherLines(bagLines);
    const availableAcres = getAvailableAcresForLine(remainingAcres, otherAcres);
    const bagsPerAcre = size?.bagsPerAcre;
    const maxBags =
      bagsPerAcre != null && bagsPerAcre > 0
        ? getMaxBagsForAvailableAcres(availableAcres, bagsPerAcre)
        : null;
    const quantity = Number.parseFloat(row.quantity);
    const isComplete = isRowComplete(row);
    const missingStandard = Boolean(row.sizeId && bagsPerAcre == null);
    const isOverLimit =
      isComplete && maxBags !== null && Number.isFinite(quantity) && quantity > maxBags;

    if (isComplete && bagsPerAcre != null) {
      bagLines.push({ quantity, bagsPerAcre });
    }

    const limitHint =
      row.sizeId && bagsPerAcre != null && maxBags !== null
        ? `${availableAcres} acres × ${bagsPerAcre} seed bags/acre = ${maxBags} max`
        : null;

    return {
      availableAcres,
      maxBags,
      missingStandard,
      isOverLimit,
      limitHint,
    };
  });
}

function getSuggestedQuantityForRow(
  requisition: DispatchableRequisition,
  size: DispatchSizeOption | undefined,
  availableAcres: number,
) {
  if (!size || !isAcresBasedRequisition(requisition)) {
    return '';
  }

  if (size.bagsPerAcre == null || size.bagsPerAcre <= 0) {
    return '';
  }

  const maxBags = getMaxBagsForAvailableAcres(availableAcres, size.bagsPerAcre);
  return maxBags > 0 ? String(maxBags) : '';
}

function getAvailableAcresForRowKey(
  rows: SizeLineRow[],
  sizes: DispatchSizeOption[],
  remainingAcres: number,
  rowKey: string,
) {
  const rowIndex = rows.findIndex((row) => row.key === rowKey);
  if (rowIndex < 0) return remainingAcres;

  const bagLines = getBagLinesFromRows(rows.slice(0, rowIndex), sizes);
  return getAvailableAcresForLine(remainingAcres, getAcresConsumedByOtherLines(bagLines));
}

type SizeLineRowEditorProps = {
  row: SizeLineRow;
  facilities: DispatchFacilityOption[];
  sizes: DispatchSizeOption[];
  generations: DispatchGenerationOption[];
  usedCombinationKeys: Set<string>;
  isOverLimit: boolean;
  missingStandard: boolean;
  limitHint: string | null;
  canRemove: boolean;
  onFacilityChange: (facilityId: string) => void;
  onSizeChange: (sizeId: string) => void;
  onGenerationChange: (generationId: string) => void;
  onQuantityChange: (quantity: string) => void;
  onRemove: () => void;
};

function SizeLineRowEditor({
  row,
  facilities,
  sizes,
  generations,
  usedCombinationKeys,
  isOverLimit,
  missingStandard,
  limitHint,
  canRemove,
  onFacilityChange,
  onSizeChange,
  onGenerationChange,
  onQuantityChange,
  onRemove,
}: SizeLineRowEditorProps) {
  const combinationKey =
    row.facilityId && row.sizeId && row.generationId
      ? `${row.facilityId}:${row.sizeId}:${row.generationId}`
      : null;
  const isDuplicateCombination = combinationKey !== null && usedCombinationKeys.has(combinationKey);

  const facilityItems = facilities.map((facility) => ({
    value: facility.id,
    label: facility.name,
  }));
  const generationItems = generations.map((generation) => ({
    value: generation.id,
    label: generation.name,
  }));
  const sizeItems = sizes.map((size) => ({
    value: size.id,
    label:
      size.bagsPerAcre != null
        ? `${formatSeedSize(size.name)} (${size.bagsPerAcre} seed bags/acre)`
        : formatSeedSize(size.name),
  }));

  return (
    <div className="flex flex-col gap-3 rounded-md border p-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_5.5rem_auto] lg:items-end">
        <Field
          className="min-w-0 sm:col-span-2 lg:col-span-1"
          data-invalid={isDuplicateCombination}
        >
          <FieldLabel htmlFor={`dispatch-facility-${row.key}`}>From facility</FieldLabel>
          <Select
            value={row.facilityId || undefined}
            onValueChange={(value) => {
              if (value) onFacilityChange(value);
            }}
          >
            <SelectTrigger
              id={`dispatch-facility-${row.key}`}
              className="w-full"
              aria-invalid={isDuplicateCombination}
            >
              <SelectValue placeholder="Select facility" />
            </SelectTrigger>
            <SelectContent>
              {facilityItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isDuplicateCombination ? (
            <FieldError>
              This facility, size, and generation combination is already used.
            </FieldError>
          ) : null}
        </Field>

        <Field className="min-w-0" data-invalid={isDuplicateCombination}>
          <FieldLabel htmlFor={`dispatch-generation-${row.key}`}>Generation</FieldLabel>
          <Select
            value={row.generationId || undefined}
            onValueChange={(value) => {
              if (value) onGenerationChange(value);
            }}
          >
            <SelectTrigger
              id={`dispatch-generation-${row.key}`}
              className="w-full"
              aria-invalid={isDuplicateCombination}
            >
              <SelectValue placeholder="Select generation" />
            </SelectTrigger>
            <SelectContent>
              {generationItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          className="min-w-0"
          data-invalid={isOverLimit || missingStandard || isDuplicateCombination}
        >
          <FieldLabel htmlFor={`dispatch-size-${row.key}`}>Seed Size</FieldLabel>
          <Select
            value={row.sizeId || undefined}
            onValueChange={(value) => {
              if (value) onSizeChange(value);
            }}
          >
            <SelectTrigger
              id={`dispatch-size-${row.key}`}
              className="w-full"
              aria-invalid={isOverLimit || missingStandard || isDuplicateCombination}
            >
              <SelectValue placeholder="Select Seed Size" />
            </SelectTrigger>
            <SelectContent>
              {sizeItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {missingStandard ? (
            <FieldError>This Seed Size has no bags-per-acre standard.</FieldError>
          ) : null}
        </Field>

        <Field className="min-w-0" data-invalid={isOverLimit}>
          <FieldLabel htmlFor={`dispatch-qty-${row.key}`}>Seed Bags</FieldLabel>
          <Input
            id={`dispatch-qty-${row.key}`}
            inputMode="numeric"
            placeholder="0"
            value={row.quantity}
            onChange={(event) => onQuantityChange(event.target.value.replace(/\D/g, ''))}
            aria-invalid={isOverLimit}
          />
          {isOverLimit ? <FieldError>Exceeds remaining quantity.</FieldError> : null}
        </Field>

        {canRemove ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 self-end"
            onClick={onRemove}
            aria-label="Remove Seed Size line"
          >
            <Trash2 className="size-4" />
          </Button>
        ) : (
          <div className="hidden lg:block" />
        )}
      </div>
      {limitHint ? <p className="text-muted-foreground text-sm">{limitHint}</p> : null}
    </div>
  );
}

export function DispatchRequisitionQuantityDrawer({
  open,
  onOpenChange,
  requisition,
  facilities,
  sizes,
  generations,
  initialSizeLines,
  defaultFacilityId = '',
  onConfirm,
  onRemove,
}: DispatchRequisitionQuantityDrawerProps) {
  const resolvedDefaultFacilityId =
    facilities.length === 1
      ? (facilities[0]?.id ?? '')
      : defaultFacilityId && facilities.some((facility) => facility.id === defaultFacilityId)
        ? defaultFacilityId
        : '';
  const [rows, setRows] = useState<SizeLineRow[]>([
    createRow({ facilityId: resolvedDefaultFacilityId }),
  ]);
  const isAcresBased = requisition ? isAcresBasedRequisition(requisition) : false;

  useEffect(() => {
    if (!open || !requisition) return;
    const initial = rowsFromInitial(initialSizeLines);
    setRows(
      initial.map((row) =>
        row.facilityId ? row : { ...row, facilityId: resolvedDefaultFacilityId },
      ),
    );
  }, [open, initialSizeLines, requisition, resolvedDefaultFacilityId]);

  const confirmedLines = useMemo(() => toValidSizeLines(rows), [rows]);
  const total = useMemo(() => getSelectionTotal(confirmedLines), [confirmedLines]);

  const remainingAcres = useMemo(() => {
    if (!requisition || !isAcresBased) return null;
    return getRemainingAcres(requisition);
  }, [requisition, isAcresBased]);

  const acresRowLimits = useMemo(() => {
    if (!isAcresBased || remainingAcres === null) return [];
    return getAcresRowLimits(rows, sizes, remainingAcres);
  }, [rows, sizes, remainingAcres, isAcresBased]);

  const confirmedBagLines = useMemo(() => getBagLinesFromRows(rows, sizes), [rows, sizes]);

  const totalAcresConsumed = useMemo(() => {
    if (!isAcresBased) return null;
    return sumAcresFromBagLines(confirmedBagLines);
  }, [confirmedBagLines, isAcresBased]);

  const remainingBags = useMemo(() => {
    if (!requisition || isAcresBased) return null;
    const raw = requisition.remainingQuantity
      ? Number.parseFloat(requisition.remainingQuantity)
      : 0;
    return roundBags(raw);
  }, [requisition, isAcresBased]);

  const isOverLimit = isAcresBased
    ? acresRowLimits.some((limit) => limit.isOverLimit) ||
      (remainingAcres !== null &&
        totalAcresConsumed !== null &&
        !isAcresDispatchWithinTolerance(totalAcresConsumed, remainingAcres))
    : remainingBags !== null && Number.isFinite(remainingBags) && total > remainingBags;

  const acresLeftAfterDispatch =
    isAcresBased && remainingAcres !== null && totalAcresConsumed !== null
      ? remainingAcresAfterConsume(remainingAcres, totalAcresConsumed)
      : null;

  const hasDuplicate = hasDuplicateFacilitySizeGeneration(rows);
  const hasPositiveQuantity = confirmedLines.length > 0;
  const missingStandard = isAcresBased
    ? acresRowLimits.some((limit) => limit.missingStandard)
    : false;
  const hasIncompleteRows = rows.some(
    (row) =>
      (row.facilityId || row.sizeId || row.generationId || row.quantity) && !isRowComplete(row),
  );
  const isAlreadySelected = initialSizeLines.some((line) => {
    const value = Number.parseFloat(line.quantity);
    return (
      line.facilityId && line.sizeId && line.generationId && Number.isFinite(value) && value > 0
    );
  });

  const duplicateCombinationKeys = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of rows) {
      if (row.facilityId && row.sizeId && row.generationId) {
        const key = `${row.facilityId}:${row.sizeId}:${row.generationId}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }

    return new Set(
      Array.from(counts.entries())
        .filter(([, count]) => count > 1)
        .map(([key]) => key),
    );
  }, [rows]);

  const allRowsComplete = rows.every((row) => isRowComplete(row));
  const availableAcresAfterLines =
    remainingAcres !== null
      ? getAvailableAcresForLine(remainingAcres, sumAcresFromBagLines(confirmedBagLines))
      : 0;

  const canAddMore = allRowsComplete && (isAcresBased ? availableAcresAfterLines > 0 : true);

  const confirmDisabled =
    !hasPositiveQuantity || isOverLimit || hasDuplicate || missingStandard || hasIncompleteRows;

  const confirmBlockedReason = !hasPositiveQuantity
    ? 'Enter at least one complete line with seed bags.'
    : hasIncompleteRows
      ? 'Complete facility, generation, size, and bags for each line.'
      : hasDuplicate
        ? 'Each facility, size, and generation combination can only be used once.'
        : missingStandard
          ? 'Selected Seed Size is missing a bags-per-acre standard.'
          : isOverLimit
            ? 'Total exceeds remaining quantity.'
            : null;

  function updateRow(key: string, patch: Partial<SizeLineRow>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function handleSizeChange(key: string, sizeId: string) {
    if (!requisition) return;

    const size = sizes.find((item) => item.id === sizeId);
    let quantity = '';

    if (isAcresBased && remainingAcres !== null) {
      const availableAcres = getAvailableAcresForRowKey(rows, sizes, remainingAcres, key);
      quantity = getSuggestedQuantityForRow(requisition, size, availableAcres);
    }

    updateRow(key, { sizeId, quantity });
  }

  function addRow() {
    setRows((current) => [...current, createRow({ facilityId: resolvedDefaultFacilityId })]);
  }

  function removeRow(key: string) {
    setRows((current) => {
      const next = current.filter((row) => row.key !== key);
      return next.length > 0 ? next : [createRow({ facilityId: resolvedDefaultFacilityId })];
    });
  }

  function handleConfirm() {
    if (confirmDisabled) {
      return;
    }
    onConfirm(confirmedLines);
    onOpenChange(false);
  }

  if (!requisition) {
    return null;
  }

  const remainingValue = isAcresBased
    ? remainingAcres !== null
      ? String(remainingAcres)
      : '—'
    : requisition.remainingQuantity;
  const remainingUnit = isAcresBased ? 'acres remaining' : 'seed bags remaining';

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>{requisition.farmer.name}</DrawerTitle>
          <DrawerDescription>
            Account #{requisition.farmer.accountNumber} · {requisition.variety.name} · Req.{' '}
            {formatDate(requisition.requisitionDate)}
          </DrawerDescription>
          {requisition.remarks ? (
            <p className="text-muted-foreground mt-1 text-sm">{requisition.remarks}</p>
          ) : null}
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          <div className="bg-muted/40 mb-4 rounded-md border px-4 py-3">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Available to dispatch
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {remainingValue}{' '}
              <span className="text-muted-foreground text-sm font-normal">{remainingUnit}</span>
            </p>
          </div>

          <FieldSet>
            <FieldDescription>
              Choose facility, generation, size, and bags for each line.
              {isAcresBased
                ? ' Bags default to the max for available acres — lower for a partial dispatch.'
                : ' Add another line when the same grade comes from more than one store.'}
            </FieldDescription>
            <FieldGroup>
              {rows.map((row, index) => {
                const rowLimit = acresRowLimits[index];
                const rowOverLimit =
                  rowLimit?.isOverLimit ?? (!isAcresBased && isOverLimit && isRowComplete(row));
                return (
                  <SizeLineRowEditor
                    key={row.key}
                    row={row}
                    facilities={facilities}
                    sizes={sizes}
                    generations={generations}
                    usedCombinationKeys={duplicateCombinationKeys}
                    isOverLimit={rowOverLimit}
                    missingStandard={rowLimit?.missingStandard ?? false}
                    limitHint={rowLimit?.limitHint ?? null}
                    canRemove={rows.length > 1}
                    onFacilityChange={(facilityId) => updateRow(row.key, { facilityId })}
                    onSizeChange={(sizeId) => handleSizeChange(row.key, sizeId)}
                    onGenerationChange={(generationId) => updateRow(row.key, { generationId })}
                    onQuantityChange={(quantity) => updateRow(row.key, { quantity })}
                    onRemove={() => removeRow(row.key)}
                  />
                );
              })}
            </FieldGroup>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              disabled={!canAddMore}
            >
              <Plus className="size-4" />
              Add another grade / store line
            </Button>

            <div className="flex flex-col gap-1 text-sm">
              {!isAcresBased && requisition.initialQuantity ? (
                <span className="text-muted-foreground">
                  Total: {total} / {requisition.initialQuantity}
                </span>
              ) : null}
              {isAcresBased && remainingAcres !== null && totalAcresConsumed !== null ? (
                <span className="text-muted-foreground">
                  Dispatching: {total} seed bags · {totalAcresConsumed.toFixed(2)} /{' '}
                  {remainingAcres} acres
                  {acresLeftAfterDispatch != null
                    ? ` · ${acresLeftAfterDispatch.toFixed(2)} acres left`
                    : ''}
                </span>
              ) : null}
              {isOverLimit && !acresRowLimits.some((limit) => limit.isOverLimit) ? (
                <FieldError>Total exceeds remaining quantity.</FieldError>
              ) : null}
            </div>
          </FieldSet>
        </div>

        <DrawerFooter>
          {isAlreadySelected ? (
            <Button type="button" variant="outline" onClick={onRemove}>
              Remove from dispatch
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          <div className="flex flex-col gap-1.5 sm:items-end">
            {confirmDisabled && confirmBlockedReason ? (
              <p className="text-muted-foreground text-xs sm:text-right">{confirmBlockedReason}</p>
            ) : null}
            <Button type="button" onClick={handleConfirm} disabled={confirmDisabled}>
              Confirm quantities
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
