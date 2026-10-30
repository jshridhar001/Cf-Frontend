import { DragDropProvider } from '@dnd-kit/react';
import { isSortable, useSortable } from '@dnd-kit/react/sortable';
import type {
  ColumnFiltersState,
  ColumnOrderState,
  ColumnVisibilityState,
  GroupingState,
} from '@tanstack/react-table';
import { GripVerticalIcon, PlusIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ReportTable } from '@/features/farmers/report/components/contract-table';
import type { ReportColumnMeta } from '@/features/farmers/report/lib/table-features';
import {
  formatFacetLabel,
  getColumnFilterLabel,
  getSelectedFilterKeys,
  moveItem,
  orderedColumnIds,
  setColumnFilterValue,
} from '@/features/seed-requisition/overview/components/view-filters/helpers';
import { getFilterValueKey } from '@/features/seed-requisition/overview/lib/filter-fns';

const SORTABLE_TYPE = 'report-column';
const GROUPING_SORTABLE_TYPE = 'report-grouping';

type FacetColumn = {
  id: string;
  columnDef: { meta?: ReportColumnMeta };
  getFacetedUniqueValues: () => Map<unknown, number>;
};

function facetOptions(column: FacetColumn) {
  return [...column.getFacetedUniqueValues().entries()]
    .map(([value, count]) => {
      const key = getFilterValueKey(value);
      return {
        key,
        label: formatFacetLabel(column, value),
        count,
      };
    })
    .sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }),
    );
}

function selectionSummary(selected: string[] | null) {
  if (selected == null) return 'All';
  if (selected.length === 0) return 'None';
  return `${selected.length.toLocaleString('en-IN')} selected`;
}

function FilterSection({
  column,
  columnFilters,
  onColumnFiltersChange,
}: {
  column: FacetColumn;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: (next: ColumnFiltersState) => void;
}) {
  const [query, setQuery] = useState('');
  const options = useMemo(() => facetOptions(column), [column]);
  const selectedKeys = getSelectedFilterKeys(columnFilters, column.id);
  const allKeys = options.map((option) => option.key);
  const visibleOptions = options.filter((option) =>
    option.label.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const selectedCount = selectedKeys == null ? options.length : selectedKeys.length;

  const toggle = (key: string, checked: boolean) => {
    const current = new Set(selectedKeys ?? allKeys);
    if (checked) current.add(key);
    else current.delete(key);
    const next = [...current];
    onColumnFiltersChange(
      setColumnFilterValue(columnFilters, column.id, next.length === allKeys.length ? null : next),
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search values"
        className="h-11"
      />
      <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
        {visibleOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matching values.</p>
        ) : (
          visibleOptions.map((option) => {
            const checked = selectedKeys == null || selectedKeys.includes(option.key);
            return (
              <div
                key={option.key || 'blank'}
                className="flex min-h-11 items-center gap-3 rounded-xl border bg-card px-3"
              >
                <Checkbox
                  id={`${column.id}-${option.key || 'blank'}`}
                  checked={checked}
                  onCheckedChange={(value) => toggle(option.key, value === true)}
                />
                <label
                  htmlFor={`${column.id}-${option.key || 'blank'}`}
                  className="min-w-0 flex-1 truncate text-sm"
                >
                  {option.label}
                </label>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {option.count.toLocaleString('en-IN')}
                </span>
              </div>
            );
          })
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {selectedCount.toLocaleString('en-IN')} of {options.length.toLocaleString('en-IN')}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              onColumnFiltersChange(setColumnFilterValue(columnFilters, column.id, null))
            }
          >
            Select all
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              onColumnFiltersChange(setColumnFilterValue(columnFilters, column.id, []))
            }
          >
            Deselect all
          </Button>
        </div>
      </div>
    </div>
  );
}

function FiltersTab({
  table,
  columnFilters,
  onColumnFiltersChange,
}: {
  table: ReportTable;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: (next: ColumnFiltersState) => void;
}) {
  const columns = table.getAllLeafColumns().filter((column) => column.getCanFilter());

  return (
    <Accordion className="rounded-2xl" type="single" collapsible>
      {columns.map((column) => {
        const selected = getSelectedFilterKeys(columnFilters, column.id);
        return (
          <AccordionItem key={column.id} value={column.id}>
            <AccordionTrigger className="px-4 py-3">
              <span className="flex min-w-0 flex-1 items-center justify-between gap-3 pr-2">
                <span className="truncate">{getColumnFilterLabel(column)}</span>
                <span className="shrink-0 text-xs font-normal text-muted-foreground">
                  {selectionSummary(selected)}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <FilterSection
                column={column}
                columnFilters={columnFilters}
                onColumnFiltersChange={onColumnFiltersChange}
              />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

function SortableColumnRow({
  id,
  index,
  label,
  visible,
  canHide,
  onVisibleChange,
}: {
  id: string;
  index: number;
  label: string;
  visible: boolean;
  canHide: boolean;
  onVisibleChange: (visible: boolean) => void;
}) {
  const { ref, isDragging } = useSortable({
    id,
    index,
    type: SORTABLE_TYPE,
    accept: SORTABLE_TYPE,
  });

  return (
    <div
      ref={ref}
      className="flex min-h-11 items-center gap-3 rounded-xl border bg-card px-3"
      style={{ opacity: isDragging ? 0.6 : 1 }}
    >
      <GripVerticalIcon className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
      <Switch checked={visible} disabled={!canHide && visible} onCheckedChange={onVisibleChange} />
    </div>
  );
}

function ColumnsTab({
  table,
  columnVisibility,
  columnOrder,
  onColumnVisibilityChange,
  onColumnOrderChange,
}: {
  table: ReportTable;
  columnVisibility: ColumnVisibilityState;
  columnOrder: ColumnOrderState;
  onColumnVisibilityChange: (next: ColumnVisibilityState) => void;
  onColumnOrderChange: (next: ColumnOrderState) => void;
}) {
  const leafColumns = table.getAllLeafColumns();
  const leafIds = leafColumns.map((column) => column.id);
  const orderedIds = orderedColumnIds(columnOrder, leafIds);
  const visibleCount = orderedIds.filter((id) => columnVisibility[id] !== false).length;
  const hiddenCount = leafIds.length - visibleCount;

  const setVisible = (columnId: string, visible: boolean) => {
    const next = { ...columnVisibility };
    if (visible) delete next[columnId];
    else next[columnId] = false;
    onColumnVisibilityChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {hiddenCount > 0
            ? `${hiddenCount.toLocaleString('en-IN')} hidden`
            : 'All columns visible'}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onColumnVisibilityChange({})}
        >
          Show all
        </Button>
      </div>
      <DragDropProvider
        onDragEnd={(event) => {
          if (event.canceled) return;
          const { source } = event.operation;
          if (!isSortable(source)) return;
          if (source.initialIndex === source.index) return;
          onColumnOrderChange(moveItem(orderedIds, source.initialIndex, source.index));
        }}
      >
        <div className="flex flex-col gap-2">
          {orderedIds.map((id, index) => {
            const column = leafColumns.find((entry) => entry.id === id);
            if (!column) return null;
            const visible = columnVisibility[id] !== false;
            return (
              <SortableColumnRow
                key={id}
                id={id}
                index={index}
                label={getColumnFilterLabel(column)}
                visible={visible}
                canHide={column.getCanHide() && (visibleCount > 1 || !visible)}
                onVisibleChange={(nextVisible) => setVisible(id, nextVisible)}
              />
            );
          })}
        </div>
      </DragDropProvider>
    </div>
  );
}

function SortableGroupRow({
  id,
  index,
  label,
  onRemove,
}: {
  id: string;
  index: number;
  label: string;
  onRemove: () => void;
}) {
  const { ref, isDragging } = useSortable({
    id,
    index,
    type: GROUPING_SORTABLE_TYPE,
    accept: GROUPING_SORTABLE_TYPE,
  });

  return (
    <div
      ref={ref}
      className="flex min-h-11 items-center gap-3 rounded-xl border bg-card px-3"
      style={{ opacity: isDragging ? 0.6 : 1 }}
    >
      <GripVerticalIcon className="size-4 shrink-0 text-muted-foreground" />
      <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
        {index + 1}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Remove ${label}`}
        onClick={onRemove}
      >
        <XIcon />
      </Button>
    </div>
  );
}

function GroupingTab({
  table,
  grouping,
  onGroupingChange,
}: {
  table: ReportTable;
  grouping: GroupingState;
  onGroupingChange: (next: GroupingState) => void;
}) {
  const groupable = table.getAllLeafColumns().filter((column) => column.getCanGroup());
  const available = groupable.filter((column) => !grouping.includes(column.id));

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium">Active groups</h3>
          {grouping.length > 0 ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onGroupingChange([])}>
              Clear all
            </Button>
          ) : null}
        </div>
        {grouping.length === 0 ? (
          <p className="rounded-xl border border-dashed px-3 py-4 text-sm text-muted-foreground">
            Add columns from below. Drag to set priority.
          </p>
        ) : (
          <DragDropProvider
            onDragEnd={(event) => {
              if (event.canceled) return;
              const { source } = event.operation;
              if (!isSortable(source)) return;
              if (source.initialIndex === source.index) return;
              onGroupingChange(moveItem(grouping, source.initialIndex, source.index));
            }}
          >
            <div className="flex flex-col gap-2">
              {grouping.map((id, index) => {
                const column = groupable.find((entry) => entry.id === id);
                return (
                  <SortableGroupRow
                    key={id}
                    id={id}
                    index={index}
                    label={column ? getColumnFilterLabel(column) : id}
                    onRemove={() => onGroupingChange(grouping.filter((entry) => entry !== id))}
                  />
                );
              })}
            </div>
          </DragDropProvider>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Available columns</h3>
        {available.length === 0 ? (
          <p className="text-sm text-muted-foreground">All groupable columns are in use.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {available.map((column) => (
              <div
                key={column.id}
                className="flex min-h-11 items-center justify-between gap-3 rounded-xl border bg-card px-3"
              >
                <span className="truncate text-sm font-medium">{getColumnFilterLabel(column)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onGroupingChange([...grouping, column.id])}
                >
                  <PlusIcon data-icon="inline-start" />
                  Add
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

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
  return (
    columnFilters.length === 0 &&
    columnOrder.length === 0 &&
    grouping.length === 0 &&
    !Object.values(columnVisibility).some((visible) => visible === false)
  );
}

export function ReportViewFiltersSheet({ table }: { table: ReportTable }) {
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
            disabled={resetDisabled}
            onClick={() => {
              const next = {
                columnFilters: [] as ColumnFiltersState,
                columnVisibility: {} as ColumnVisibilityState,
                columnOrder: [] as ColumnOrderState,
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
