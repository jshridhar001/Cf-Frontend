import type {
  ColumnFiltersState,
  ColumnOrderState,
  ColumnVisibilityState,
  GroupingState,
} from '@tanstack/react-table';
import { SlidersHorizontalIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DispatchesTable } from '@/features/seed-dispatch/overview/components/use-dispatches-table';
import { AdvancedTab } from '@/features/seed-dispatch/overview/components/view-filters/AdvancedTab';
import { ColumnsTab } from '@/features/seed-dispatch/overview/components/view-filters/ColumnsTab';
import { FiltersTab } from '@/features/seed-dispatch/overview/components/view-filters/FiltersTab';
import { GroupingTab } from '@/features/seed-dispatch/overview/components/view-filters/GroupingTab';
import {
  DEFAULT_COLUMN_PREFERENCES,
  loadColumnPreferences,
} from '@/features/seed-dispatch/overview/lib/column-preferences';
import {
  type AdvancedGlobalFilter,
  emptyGlobalFilter,
  isActiveCondition,
  isAdvancedGlobalFilter,
} from '@/features/seed-dispatch/overview/lib/filter-fns';
import {
  isSeedDispatchStatus,
  type SeedDispatchStatus,
} from '@/features/seed-dispatch/overview/types';

function snapshotGlobalFilter(value: unknown, manualSearch: string): AdvancedGlobalFilter {
  if (isAdvancedGlobalFilter(value)) {
    return { ...value, conditions: [...value.conditions], manualSearch };
  }
  return emptyGlobalFilter(manualSearch);
}

function statusFromFilters(columnFilters: ColumnFiltersState): SeedDispatchStatus | undefined {
  const values = columnFilters.find((filter) => filter.id === 'status')?.value;
  if (!Array.isArray(values) || values.length !== 1) return undefined;
  const [status] = values;
  return typeof status === 'string' && isSeedDispatchStatus(status) ? status : undefined;
}

function liveManualSearch(table: DispatchesTable) {
  const current = table.state.globalFilter;
  if (isAdvancedGlobalFilter(current)) return current.manualSearch ?? '';
  return '';
}

function isDefaultDraft({
  columnFilters,
  columnVisibility,
  columnOrder,
  grouping,
  globalFilter,
}: {
  columnFilters: ColumnFiltersState;
  columnVisibility: ColumnVisibilityState;
  columnOrder: ColumnOrderState;
  grouping: GroupingState;
  globalFilter: AdvancedGlobalFilter;
}) {
  const stored = loadColumnPreferences() ?? DEFAULT_COLUMN_PREFERENCES;
  const activeConditions = globalFilter.conditions.filter(isActiveCondition);
  return (
    columnFilters.length === 0 &&
    grouping.length === 0 &&
    activeConditions.length === 0 &&
    JSON.stringify(columnVisibility) === JSON.stringify(stored.columnVisibility) &&
    JSON.stringify(columnOrder) === JSON.stringify(stored.columnOrder)
  );
}

export function ViewFiltersSheet({
  table,
  onAppliedStatus,
}: {
  table: DispatchesTable;
  onAppliedStatus: (status: SeedDispatchStatus | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('filters');
  const [filtersSessionKey, setFiltersSessionKey] = useState(0);
  const [draftColumnFilters, setDraftColumnFilters] = useState<ColumnFiltersState>([]);
  const [draftColumnVisibility, setDraftColumnVisibility] = useState<ColumnVisibilityState>({});
  const [draftColumnOrder, setDraftColumnOrder] = useState<ColumnOrderState>([]);
  const [draftGrouping, setDraftGrouping] = useState<GroupingState>([]);
  const [draftGlobalFilter, setDraftGlobalFilter] = useState<AdvancedGlobalFilter>(() =>
    emptyGlobalFilter(),
  );

  const filterCount = table.state.columnFilters.length;
  const hiddenCount = Object.values(table.state.columnVisibility).filter(
    (visible) => visible === false,
  ).length;
  const groupingCount = table.state.grouping.length;
  const advancedCount = isAdvancedGlobalFilter(table.state.globalFilter)
    ? table.state.globalFilter.conditions.filter(isActiveCondition).length
    : 0;

  const resetDisabled = useMemo(
    () =>
      isDefaultDraft({
        columnFilters: draftColumnFilters,
        columnVisibility: draftColumnVisibility,
        columnOrder: draftColumnOrder,
        grouping: draftGrouping,
        globalFilter: draftGlobalFilter,
      }),
    [draftColumnFilters, draftColumnVisibility, draftColumnOrder, draftGrouping, draftGlobalFilter],
  );

  const copyFromTable = () => {
    const state = table.state;
    setDraftColumnFilters(state.columnFilters);
    setDraftColumnVisibility(state.columnVisibility);
    setDraftColumnOrder(state.columnOrder);
    setDraftGrouping(state.grouping);
    setDraftGlobalFilter(snapshotGlobalFilter(state.globalFilter, liveManualSearch(table)));
    setFiltersSessionKey((key) => key + 1);
  };

  const applyDraft = (next: {
    columnFilters: ColumnFiltersState;
    columnVisibility: ColumnVisibilityState;
    columnOrder: ColumnOrderState;
    grouping: GroupingState;
    globalFilter: AdvancedGlobalFilter;
  }) => {
    const manualSearch = liveManualSearch(table);
    table.setColumnFilters(next.columnFilters);
    table.setColumnVisibility(next.columnVisibility);
    table.setColumnOrder(next.columnOrder);
    table.setGrouping(next.grouping);
    table.setExpanded(next.grouping.length > 0 ? true : {});
    table.setGlobalFilter({ ...next.globalFilter, manualSearch });
    onAppliedStatus(statusFromFilters(next.columnFilters));
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) copyFromTable();
      }}
    >
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="border-primary">
          <SlidersHorizontalIcon data-icon="inline-start" />
          {filterCount > 0 ? `View filters (${filterCount})` : 'View filters'}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:w-1/3 data-[side=right]:sm:max-w-none"
      >
        <SheetHeader className="border-b">
          <SheetTitle>View Settings</SheetTitle>
          <SheetDescription className="hidden sm:block">
            Filters, columns, grouping, and advanced conditions apply when you confirm.
          </SheetDescription>
        </SheetHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col gap-0">
          <div className="px-6 pt-4">
            <TabsList className="h-auto w-full flex-wrap">
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="columns" className="gap-1.5">
                Columns
                {hiddenCount > 0 ? (
                  <span className="rounded-full bg-primary/10 px-1.5 text-[10px] text-primary">
                    {hiddenCount} hidden
                  </span>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="grouping" className="gap-1.5">
                Grouping
                {groupingCount > 0 ? (
                  <span className="rounded-full bg-primary/10 px-1.5 text-[10px] text-primary">
                    {groupingCount}
                  </span>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="advanced" className="gap-1.5">
                Advanced
                {advancedCount > 0 ? (
                  <span className="rounded-full bg-primary/10 px-1.5 text-[10px] text-primary">
                    {advancedCount}
                  </span>
                ) : null}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <TabsContent value="filters">
              <FiltersTab
                key={filtersSessionKey}
                table={table}
                columnFilters={draftColumnFilters}
                onColumnFiltersChange={setDraftColumnFilters}
              />
            </TabsContent>
            <TabsContent value="columns">
              <ColumnsTab
                table={table}
                columnVisibility={draftColumnVisibility}
                columnOrder={draftColumnOrder}
                onColumnVisibilityChange={setDraftColumnVisibility}
                onColumnOrderChange={setDraftColumnOrder}
              />
            </TabsContent>
            <TabsContent value="grouping">
              <GroupingTab
                table={table}
                grouping={draftGrouping}
                onGroupingChange={setDraftGrouping}
              />
            </TabsContent>
            <TabsContent value="advanced">
              <AdvancedTab
                table={table}
                globalFilter={draftGlobalFilter}
                onGlobalFilterChange={setDraftGlobalFilter}
              />
            </TabsContent>
          </div>
        </Tabs>

        <SheetFooter className="border-t sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            disabled={resetDisabled}
            onClick={() => {
              const stored = loadColumnPreferences() ?? DEFAULT_COLUMN_PREFERENCES;
              const manualSearch = liveManualSearch(table);
              const next = {
                columnFilters: [] as ColumnFiltersState,
                columnVisibility: stored.columnVisibility,
                columnOrder: stored.columnOrder,
                grouping: [] as GroupingState,
                globalFilter: emptyGlobalFilter(manualSearch),
              };
              setDraftColumnFilters(next.columnFilters);
              setDraftColumnVisibility(next.columnVisibility);
              setDraftColumnOrder(next.columnOrder);
              setDraftGrouping(next.grouping);
              setDraftGlobalFilter(next.globalFilter);
              setFiltersSessionKey((key) => key + 1);
              applyDraft(next);
              table.setPageIndex(0);
            }}
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={() => {
              applyDraft({
                columnFilters: draftColumnFilters,
                columnVisibility: draftColumnVisibility,
                columnOrder: draftColumnOrder,
                grouping: draftGrouping,
                globalFilter: draftGlobalFilter,
              });
              setOpen(false);
            }}
          >
            Apply changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
