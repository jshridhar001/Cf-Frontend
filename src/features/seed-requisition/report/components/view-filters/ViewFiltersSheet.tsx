import { CheckCircle2, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
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
import { getStoredSeedRequisitionColumnState } from '@/features/seed-requisition/report/lib/column-preferences';
import type { AdvancedSrGlobalFilter } from '@/features/seed-requisition/report/lib/filter-fns';
import type {
  ColumnFiltersState,
  ColumnOrderState,
  GroupingState,
  Table,
  VisibilityState,
} from '@/features/seed-requisition/report/lib/react-table';
import type { SeedRequisitionRow } from '@/features/seed-requisition/report/types';

import { AdvancedTab } from './AdvancedTab';
import { ColumnsTab } from './ColumnsTab';
import { FiltersTab } from './FiltersTab';
import { GroupingTab } from './GroupingTab';

interface ViewFiltersSheetProps {
  table: Table<SeedRequisitionRow>;
}

function getDefaultGlobalFilter(manualSearch = ''): AdvancedSrGlobalFilter {
  return { logic: 'AND', conditions: [], manualSearch };
}

function areVisibilityStatesEqual(a: VisibilityState, b: VisibilityState) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

function areColumnOrdersEqual(a: ColumnOrderState, b: ColumnOrderState) {
  return a.length === b.length && a.every((columnId, index) => columnId === b[index]);
}

export function ViewFiltersSheet({ table }: ViewFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [filtersSessionKey, setFiltersSessionKey] = useState(0);
  const [draftColumnFilters, setDraftColumnFilters] = useState<ColumnFiltersState>(
    () => table.getState().columnFilters,
  );
  const [draftColumnVisibility, setDraftColumnVisibility] = useState<VisibilityState>(
    () => table.getState().columnVisibility,
  );
  const [draftColumnOrder, setDraftColumnOrder] = useState<ColumnOrderState>(
    () => table.getState().columnOrder,
  );
  const [draftGrouping, setDraftGrouping] = useState<GroupingState>(
    () => table.getState().grouping,
  );
  const [draftGlobalFilter, setDraftGlobalFilter] = useState<AdvancedSrGlobalFilter>(() => ({
    logic: 'AND',
    conditions: [],
    ...table.getState().globalFilter,
  }));

  const activeFilterCount = table.getState().columnFilters.length;
  const activeGroupingCount = table.getState().grouping.length;
  const activeAdvancedCount =
    table
      .getState()
      .globalFilter?.conditions?.filter(
        (condition: { operator: string; value: string }) =>
          condition.operator === 'isEmpty' ||
          condition.operator === 'isNotEmpty' ||
          condition.value.trim().length > 0,
      ).length ?? 0;
  const hiddenColumnCount = table
    .getAllLeafColumns()
    .filter((column) => table.getState().columnVisibility[column.id] === false).length;
  const defaultColumnState = getStoredSeedRequisitionColumnState(
    table.getAllLeafColumns().map((column) => column.id),
  );
  const hasDraftViewChanges =
    draftColumnFilters.length > 0 ||
    !areVisibilityStatesEqual(draftColumnVisibility, defaultColumnState.columnVisibility) ||
    !areColumnOrdersEqual(draftColumnOrder, defaultColumnState.columnOrder) ||
    draftGrouping.length > 0 ||
    draftGlobalFilter.logic !== 'AND' ||
    draftGlobalFilter.conditions.length > 0;

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const tableState = table.getState();
      setDraftColumnFilters(tableState.columnFilters);
      setDraftColumnVisibility(tableState.columnVisibility);
      setDraftColumnOrder(tableState.columnOrder);
      setDraftGrouping(tableState.grouping);
      setDraftGlobalFilter({
        logic: 'AND',
        conditions: [],
        ...tableState.globalFilter,
      });
      setFiltersSessionKey((key) => key + 1);
    }
    setOpen(nextOpen);
  };

  const handleApplyChanges = () => {
    table.setColumnFilters(draftColumnFilters);
    table.setColumnVisibility(draftColumnVisibility);
    table.setColumnOrder(draftColumnOrder);
    table.setGrouping(draftGrouping);
    table.setExpanded(draftGrouping.length > 0 ? true : {});
    table.setGlobalFilter({
      ...draftGlobalFilter,
      manualSearch:
        table.getState().globalFilter?.manualSearch ?? draftGlobalFilter.manualSearch ?? '',
    });
    setOpen(false);
  };

  const handleResetChanges = () => {
    const manualSearch =
      table.getState().globalFilter?.manualSearch ?? draftGlobalFilter.manualSearch ?? '';
    const defaultGlobalFilter = getDefaultGlobalFilter(manualSearch);
    const nextColumnState = getStoredSeedRequisitionColumnState(
      table.getAllLeafColumns().map((column) => column.id),
    );

    setDraftColumnFilters([]);
    setDraftColumnVisibility(nextColumnState.columnVisibility);
    setDraftColumnOrder(nextColumnState.columnOrder);
    setDraftGrouping([]);
    setDraftGlobalFilter(defaultGlobalFilter);

    table.setColumnFilters([]);
    table.setColumnVisibility(nextColumnState.columnVisibility);
    table.setColumnOrder(nextColumnState.columnOrder);
    table.setGrouping([]);
    table.setExpanded({});
    table.setGlobalFilter(defaultGlobalFilter);
    table.setPageIndex(0);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="min-w-0 gap-1.5 border-primary text-primary hover:bg-primary/10"
        >
          <SlidersHorizontal className="size-4 shrink-0" aria-hidden />
          <span className="truncate">
            View filters
            {activeFilterCount > 0 ? ` (${activeFilterCount.toLocaleString('en-IN')})` : ''}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-3xl"
      >
        <SheetHeader className="border-b border-border/40 py-4 pr-14 pl-5">
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SlidersHorizontal className="size-4" />
            </span>
            <div className="min-w-0 space-y-0.5 text-left">
              <SheetTitle>View Settings</SheetTitle>
              <SheetDescription>
                Manage table filters, columns, and advanced display groupings.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="columns">
                Columns
                {hiddenColumnCount > 0 ? (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {hiddenColumnCount.toLocaleString('en-IN')} hidden
                  </span>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="grouping">
                Grouping
                {activeGroupingCount > 0 ? (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {activeGroupingCount.toLocaleString('en-IN')}
                  </span>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="advanced">
                Advanced
                {activeAdvancedCount > 0 ? (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {activeAdvancedCount.toLocaleString('en-IN')}
                  </span>
                ) : null}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="filters">
              <FiltersTab
                key={filtersSessionKey}
                table={table}
                draftColumnFilters={draftColumnFilters}
                onDraftColumnFiltersChange={setDraftColumnFilters}
              />
            </TabsContent>
            <TabsContent value="columns">
              <ColumnsTab
                table={table}
                draftColumnVisibility={draftColumnVisibility}
                draftColumnOrder={draftColumnOrder}
                onDraftColumnVisibilityChange={setDraftColumnVisibility}
                onDraftColumnOrderChange={setDraftColumnOrder}
              />
            </TabsContent>
            <TabsContent value="grouping">
              <GroupingTab
                table={table}
                draftGrouping={draftGrouping}
                onDraftGroupingChange={setDraftGrouping}
              />
            </TabsContent>
            <TabsContent value="advanced">
              <AdvancedTab
                table={table}
                draftGlobalFilter={draftGlobalFilter}
                onDraftGlobalFilterChange={setDraftGlobalFilter}
              />
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="mt-0 grid grid-cols-1 gap-2 border-t border-border/40 px-5 py-4 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-1.5"
            disabled={!hasDraftViewChanges}
            onClick={handleResetChanges}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <Button type="button" size="sm" className="w-full gap-1.5" onClick={handleApplyChanges}>
            <CheckCircle2 className="size-3.5" />
            Apply changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
