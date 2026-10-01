import { Check, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { parseDateOnly } from '@/features/seed-dispatch/create/lib/dispatch.schema';
import {
  type DispatchRequisitionSelectionMap,
  type DispatchSizeLineDraft,
  getSelectionTotal,
  hasValidSelection,
} from '@/features/seed-dispatch/create/lib/dispatch-form-types';
import type { DispatchFormOptions } from '@/features/seed-dispatch/create/lib/form-options';
import { parseDecimal, sumAcresFromBagLines } from '@/features/seed-dispatch/create/lib/quantity';
import type { DispatchableRequisition } from '@/features/seed-dispatch/create/types';
import { formatDispatchDate } from '@/features/seed-dispatch/overview/types';
import { formatSeedSize } from '@/lib/format-seed-size';
import { cn } from '@/lib/utils';
import { DispatchRequisitionQuantityDrawer } from './dispatch-requisition-quantity-drawer';

type QuantityTypeFilter = 'all' | 'bags' | 'acres';
type SortOption = 'farmer' | 'remaining' | 'newest';

type DispatchRequisitionSelectionStepProps = {
  requisitions: DispatchableRequisition[];
  formOptions: DispatchFormOptions;
  selections: DispatchRequisitionSelectionMap;
  onSelectionsChange: (selections: DispatchRequisitionSelectionMap) => void;
  onNext: () => void;
};

function remainingNumeric(requisition: DispatchableRequisition) {
  const value = Number.parseFloat(requisition.remainingQuantity);
  return Number.isFinite(value) ? value : 0;
}

function remainingLabel(requisition: DispatchableRequisition) {
  return requisition.isAcresBased
    ? `${requisition.remainingQuantity} acres remaining`
    : `${requisition.remainingQuantity} seed bags remaining`;
}

function selectionBreakdown(sizeLines: DispatchSizeLineDraft[], formOptions: DispatchFormOptions) {
  const generationNameById = new Map(formOptions.generations.map((item) => [item.id, item.name]));
  const sizeNameById = new Map(formOptions.sizes.map((item) => [item.id, item.name]));

  return sizeLines
    .filter((line) => {
      const qty = Number.parseFloat(line.quantity);
      return Number.isFinite(qty) && qty > 0;
    })
    .map((line) => {
      const gen = generationNameById.get(line.generationId) ?? '—';
      const size = formatSeedSize(sizeNameById.get(line.sizeId) ?? '—');
      return `${gen} · ${size} · ${line.quantity}`;
    })
    .join(' · ');
}

function acresConsumedForSelection(
  sizeLines: DispatchSizeLineDraft[],
  formOptions: DispatchFormOptions,
) {
  const lines = sizeLines.flatMap((line) => {
    const qty = parseDecimal(line.quantity);
    if (qty <= 0) return [];
    const size = formOptions.sizes.find((item) => item.id === line.sizeId);
    if (size?.bagsPerAcre == null || size.bagsPerAcre <= 0) return [];
    return [{ quantity: qty, bagsPerAcre: size.bagsPerAcre }];
  });

  return lines.length > 0 ? sumAcresFromBagLines(lines) : null;
}

export function DispatchRequisitionSelectionStep({
  requisitions,
  formOptions,
  selections,
  onSelectionsChange,
  onNext,
}: DispatchRequisitionSelectionStepProps) {
  const sizes = formOptions.sizes;
  const generations = formOptions.generations;
  const facilities = formOptions.facilities;

  const [search, setSearch] = useState('');
  const [varietyFilter, setVarietyFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<QuantityTypeFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('farmer');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeRequisition, setActiveRequisition] = useState<DispatchableRequisition | null>(null);
  const [lastFacilityId, setLastFacilityId] = useState(
    facilities.length === 1 ? (facilities[0]?.id ?? '') : '',
  );

  const varietyOptions = useMemo(() => {
    const names = Array.from(new Set(requisitions.map((row) => row.variety.name))).sort((a, b) =>
      a.localeCompare(b),
    );
    return names;
  }, [requisitions]);

  const filteredRequisitions = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = requisitions.filter((row) => {
      if (varietyFilter !== 'all' && row.variety.name !== varietyFilter) {
        return false;
      }
      if (typeFilter === 'bags' && row.isAcresBased) return false;
      if (typeFilter === 'acres' && !row.isAcresBased) return false;

      if (!query) return true;

      const haystack = [row.farmer.name, row.farmer.accountNumber, row.variety.name, row.remarks]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortOption === 'remaining') {
        return remainingNumeric(b) - remainingNumeric(a);
      }
      if (sortOption === 'newest') {
        return (
          parseDateOnly(b.requisitionDate).getTime() - parseDateOnly(a.requisitionDate).getTime()
        );
      }
      return a.farmer.name.localeCompare(b.farmer.name);
    });

    return sorted;
  }, [requisitions, search, varietyFilter, typeFilter, sortOption]);

  const selectedEntries = useMemo(() => {
    return Array.from(selections.entries())
      .filter(([, lines]) => hasValidSelection(lines))
      .map(([requisitionId, lines]) => {
        const requisition = requisitions.find((row) => row.id === requisitionId);
        return {
          requisitionId,
          lines,
          requisition,
          total: getSelectionTotal(lines),
        };
      })
      .filter((entry) => entry.requisition != null);
  }, [selections, requisitions]);

  const selectedCount = selectedEntries.length;
  const totalBags = useMemo(
    () => selectedEntries.reduce((sum, entry) => sum + entry.total, 0),
    [selectedEntries],
  );

  const hasActiveFilters =
    search.trim().length > 0 || varietyFilter !== 'all' || typeFilter !== 'all';

  function openDrawer(requisition: DispatchableRequisition) {
    setActiveRequisition(requisition);
    setDrawerOpen(true);
  }

  function handleConfirm(sizeLines: DispatchSizeLineDraft[]) {
    if (!activeRequisition) return;

    const next = new Map(selections);
    next.set(activeRequisition.id, sizeLines);
    onSelectionsChange(next);

    const preferredFacility = sizeLines.find((line) => line.facilityId)?.facilityId;
    if (preferredFacility) {
      setLastFacilityId(preferredFacility);
    }
  }

  function handleRemove() {
    if (!activeRequisition) return;

    const next = new Map(selections);
    next.delete(activeRequisition.id);
    onSelectionsChange(next);
    setDrawerOpen(false);
  }

  function removeSelection(requisitionId: string) {
    const next = new Map(selections);
    next.delete(requisitionId);
    onSelectionsChange(next);
  }

  function clearFilters() {
    setSearch('');
    setVarietyFilter('all');
    setTypeFilter('all');
  }

  const varietyItems = [
    { value: 'all', label: 'All varieties' },
    ...varietyOptions.map((name) => ({ value: name, label: name })),
  ];
  const typeItems = [
    { value: 'all', label: 'All types' },
    { value: 'bags', label: 'Bags-based' },
    { value: 'acres', label: 'Acres-based' },
  ];
  const sortItems = [
    { value: 'farmer', label: 'Farmer A–Z' },
    { value: 'remaining', label: 'Remaining high → low' },
    { value: 'newest', label: 'Newest first' },
  ];

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-2xl">Choose what goes on this truck</CardTitle>
            <CardDescription className="text-base">
              Add graded bag counts per requisition, then continue.
            </CardDescription>
          </div>
          {selectedCount > 0 ? (
            <p className="text-muted-foreground text-sm tabular-nums">
              {selectedCount} selected · {totalBags} bags
            </p>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 pt-6 pb-28">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by farmer, account, or variety…"
            className="lg:max-w-sm"
          />

          <div className="flex flex-wrap gap-2">
            <Select
              value={varietyFilter}
              onValueChange={(value) => {
                if (value) setVarietyFilter(value);
              }}
            >
              <SelectTrigger size="sm" className="min-w-36">
                <SelectValue placeholder="Variety" />
              </SelectTrigger>
              <SelectContent>
                {varietyItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(value) => {
                if (value === 'all' || value === 'bags' || value === 'acres') {
                  setTypeFilter(value);
                }
              }}
            >
              <SelectTrigger size="sm" className="min-w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {typeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortOption}
              onValueChange={(value) => {
                if (value === 'farmer' || value === 'remaining' || value === 'newest') {
                  setSortOption(value);
                }
              }}
            >
              <SelectTrigger size="sm" className="min-w-40">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {sortItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {requisitions.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No approved requisitions awaiting dispatch.
          </p>
        ) : filteredRequisitions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-muted-foreground text-sm">
              No requisitions match your search or filters.
            </p>
            {hasActiveFilters ? (
              <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-md border md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-10" />
                    <TableHead>Farmer / Account</TableHead>
                    <TableHead>Variety</TableHead>
                    <TableHead>Req. date</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequisitions.map((requisition) => {
                    const sizeLines = selections.get(requisition.id) ?? [];
                    const isSelected = hasValidSelection(sizeLines);
                    const total = getSelectionTotal(sizeLines);
                    const breakdown = isSelected ? selectionBreakdown(sizeLines, formOptions) : '';
                    const acresConsumed =
                      isSelected && requisition.isAcresBased
                        ? acresConsumedForSelection(sizeLines, formOptions)
                        : null;

                    return (
                      <TableRow
                        key={requisition.id}
                        className={cn('cursor-pointer', isSelected && 'bg-primary/5')}
                        onClick={() => openDrawer(requisition)}
                      >
                        <TableCell>
                          <span
                            className={cn(
                              'flex size-5 items-center justify-center rounded-full border',
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted-foreground/40',
                            )}
                            aria-hidden
                          >
                            {isSelected ? <Check className="size-3" /> : null}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{requisition.farmer.name}</span>
                            <span className="text-muted-foreground text-xs">
                              Account #{requisition.farmer.accountNumber}
                            </span>
                            {isSelected && breakdown ? (
                              <span className="text-muted-foreground line-clamp-1 text-xs">
                                {breakdown}
                                {acresConsumed != null ? ` · ${acresConsumed} acres` : ''}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>{requisition.variety.name}</TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {formatDispatchDate(requisition.requisitionDate)}
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {remainingLabel(requisition)}
                        </TableCell>
                        <TableCell className="text-right">
                          {isSelected ? (
                            <div className="flex items-center justify-end gap-2">
                              <Badge>{total} bags</Badge>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openDrawer(requisition);
                                }}
                              >
                                Edit
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                openDrawer(requisition);
                              }}
                            >
                              Add quantities
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile dense list */}
            <div className="flex flex-col gap-2 md:hidden">
              {filteredRequisitions.map((requisition) => {
                const sizeLines = selections.get(requisition.id) ?? [];
                const isSelected = hasValidSelection(sizeLines);
                const total = getSelectionTotal(sizeLines);
                const breakdown = isSelected ? selectionBreakdown(sizeLines, formOptions) : '';
                const acresConsumed =
                  isSelected && requisition.isAcresBased
                    ? acresConsumedForSelection(sizeLines, formOptions)
                    : null;

                return (
                  <button
                    key={requisition.id}
                    type="button"
                    className={cn(
                      'flex w-full flex-col gap-2 rounded-md border px-3 py-3 text-left transition-colors',
                      isSelected ? 'border-primary/40 bg-primary/5' : 'hover:bg-muted/40',
                    )}
                    onClick={() => openDrawer(requisition)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-2">
                        <span
                          className={cn(
                            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/40',
                          )}
                          aria-hidden
                        >
                          {isSelected ? <Check className="size-3" /> : null}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{requisition.farmer.name}</p>
                          <p className="text-muted-foreground text-xs">
                            #{requisition.farmer.accountNumber}
                          </p>
                        </div>
                      </div>
                      {isSelected ? (
                        <Badge className="shrink-0">{total} bags</Badge>
                      ) : (
                        <span className="text-primary shrink-0 text-xs font-medium">
                          Add quantities
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5 pl-7 text-xs">
                      <span>{requisition.variety.name}</span>
                      <span aria-hidden>·</span>
                      <span>{remainingLabel(requisition)}</span>
                    </div>
                    {isSelected && breakdown ? (
                      <p className="text-muted-foreground line-clamp-2 pl-7 text-xs">
                        {breakdown}
                        {acresConsumed != null ? ` · ${acresConsumed} acres` : ''}
                      </p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </CardContent>

      <div className="sticky bottom-0 z-10 border-t bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            {selectedCount === 0 ? (
              <p className="text-muted-foreground text-sm">No requisitions added yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm tabular-nums">
                  <span className="font-medium">
                    {selectedCount} requisition
                    {selectedCount === 1 ? '' : 's'}
                  </span>
                  <span className="text-muted-foreground"> · {totalBags} seed bags</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedEntries.map((entry) => (
                    <Badge
                      key={entry.requisitionId}
                      variant="secondary"
                      className="max-w-full gap-1 pr-1"
                    >
                      <button
                        type="button"
                        className="truncate text-left"
                        onClick={() => {
                          if (entry.requisition) openDrawer(entry.requisition);
                        }}
                      >
                        {entry.requisition?.farmer.name} · {entry.total}
                      </button>
                      <button
                        type="button"
                        className="hover:bg-muted rounded-full p-0.5"
                        aria-label={`Remove ${entry.requisition?.farmer.name}`}
                        onClick={() => removeSelection(entry.requisitionId)}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button
            type="button"
            className="shrink-0 self-end sm:self-auto"
            onClick={onNext}
            disabled={selectedCount === 0}
          >
            Next
          </Button>
        </div>
      </div>

      <DispatchRequisitionQuantityDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        requisition={activeRequisition}
        facilities={facilities}
        sizes={sizes}
        generations={generations}
        initialSizeLines={activeRequisition ? (selections.get(activeRequisition.id) ?? []) : []}
        defaultFacilityId={lastFacilityId}
        onConfirm={handleConfirm}
        onRemove={handleRemove}
      />
    </Card>
  );
}
