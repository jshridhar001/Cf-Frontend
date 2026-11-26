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
import type { TasksTable } from '@/features/task-manager/components/use-tasks-table';
import { ColumnsTab } from '@/features/task-manager/components/view-filters/ColumnsTab';
import { FiltersTab } from '@/features/task-manager/components/view-filters/FiltersTab';
import { GroupingTab } from '@/features/task-manager/components/view-filters/GroupingTab';
import { getColumnPreferences } from '@/features/task-manager/lib/column-preferences';

function isDefaultDraft({
  columnFilters,
  columnVisibility,
  columnOrder,
  grouping,
}: {
  columnFilters: ColumnFiltersState;
  columnVisibility: ColumnVisibilityState;
  columnOrder: ColumnOrderState;
  grouping: GroupingState;
}) {
  const stored = getColumnPreferences();
  return (
    columnFilters.length === 0 &&
    grouping.length === 0 &&
    JSON.stringify(columnVisibility) === JSON.stringify(stored.columnVisibility) &&
    JSON.stringify(columnOrder) === JSON.stringify(stored.columnOrder)
  );
}

export function TaskViewFiltersSheet({ table }: { table: TasksTable }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('filters');
  const [filtersSessionKey, setFiltersSessionKey] = useState(0);
  const [draftColumnFilters, setDraftColumnFilters] = useState<ColumnFiltersState>([]);
  const [draftColumnVisibility, setDraftColumnVisibility] = useState<ColumnVisibilityState>({});
  const [draftColumnOrder, setDraftColumnOrder] = useState<ColumnOrderState>([]);
  const [draftGrouping, setDraftGrouping] = useState<GroupingState>([]);

  const filterCount = table.state.columnFilters.length;
  const hiddenCount = Object.values(table.state.columnVisibility).filter(
    (visible) => visible === false,
  ).length;
  const groupingCount = table.state.grouping.length;

  const resetDisabled = useMemo(
    () =>
      isDefaultDraft({
        columnFilters: draftColumnFilters,
        columnVisibility: draftColumnVisibility,
        columnOrder: draftColumnOrder,
        grouping: draftGrouping,
      }),
    [draftColumnFilters, draftColumnVisibility, draftColumnOrder, draftGrouping],
  );

  const copyFromTable = () => {
    const state = table.state;
    setDraftColumnFilters(state.columnFilters);
    setDraftColumnVisibility(state.columnVisibility);
    setDraftColumnOrder(state.columnOrder);
    setDraftGrouping(state.grouping);
    setFiltersSessionKey((key) => key + 1);
  };

  const applyDraft = (next: {
    columnFilters: ColumnFiltersState;
    columnVisibility: ColumnVisibilityState;
    columnOrder: ColumnOrderState;
    grouping: GroupingState;
  }) => {
    table.setColumnFilters(next.columnFilters);
    table.setColumnVisibility(next.columnVisibility);
    table.setColumnOrder(next.columnOrder);
    table.setGrouping(next.grouping);
    table.setExpanded(next.grouping.length > 0 ? true : {});
    table.setPageIndex(0);
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11 shrink-0 border-primary px-3 text-primary sm:min-h-8"
        >
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
            Filters, columns, and grouping apply when you confirm.
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
          </div>
        </Tabs>

        <SheetFooter className="border-t sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="min-h-11 sm:min-h-9"
            disabled={resetDisabled}
            onClick={() => {
              const stored = getColumnPreferences();
              const next = {
                columnFilters: [] as ColumnFiltersState,
                columnVisibility: stored.columnVisibility,
                columnOrder: stored.columnOrder,
                grouping: [] as GroupingState,
              };
              setDraftColumnFilters(next.columnFilters);
              setDraftColumnVisibility(next.columnVisibility);
              setDraftColumnOrder(next.columnOrder);
              setDraftGrouping(next.grouping);
              setFiltersSessionKey((key) => key + 1);
              applyDraft(next);
            }}
          >
            Reset
          </Button>
          <Button
            type="button"
            className="min-h-11 sm:min-h-9"
            onClick={() => {
              applyDraft({
                columnFilters: draftColumnFilters,
                columnVisibility: draftColumnVisibility,
                columnOrder: draftColumnOrder,
                grouping: draftGrouping,
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
