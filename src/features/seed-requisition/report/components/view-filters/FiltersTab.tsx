import { ChevronDown, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  getSrFilterValueKey,
  type SelectedValuesFilterValue,
} from '@/features/seed-requisition/report/lib/filter-fns';
import type {
  Column,
  ColumnFiltersState,
  RowData,
  Table,
} from '@/features/seed-requisition/report/lib/react-table';
import type { ColumnMeta } from '@/features/seed-requisition/report/types';
import { cn } from '@/lib/utils';

type FilterOption = {
  key: string;
  label: string;
  count: number;
  isBlank: boolean;
};

interface FiltersTabProps<TData extends RowData> {
  table: Table<TData>;
  draftColumnFilters: ColumnFiltersState;
  onDraftColumnFiltersChange: (filters: ColumnFiltersState) => void;
}

function getColumnLabel<TData extends RowData>(column: Column<TData, unknown>): string {
  const meta = column.columnDef.meta as ColumnMeta | undefined;
  return meta?.filterLabel ?? column.id;
}

function getDraftSelectedKeys(
  columnId: string,
  draftColumnFilters: ColumnFiltersState,
): Set<string> | null {
  const filterValue = draftColumnFilters.find((filter) => filter.id === columnId)?.value;
  if (!Array.isArray(filterValue)) return null;
  return new Set(filterValue.map(String));
}

function setDraftFilterValue(
  draftColumnFilters: ColumnFiltersState,
  columnId: string,
  value: SelectedValuesFilterValue | null,
): ColumnFiltersState {
  const remainingFilters = draftColumnFilters.filter((filter) => filter.id !== columnId);
  if (value === null) return remainingFilters;
  return [...remainingFilters, { id: columnId, value }];
}

function getFilterSummary(selectedCount: number, totalCount: number): string {
  if (totalCount === 0) return 'No values';
  if (selectedCount === totalCount) return 'All';
  if (selectedCount === 0) return 'None';
  return `${selectedCount.toLocaleString('en-IN')} selected`;
}

function ColumnFilterSection<TData extends RowData>({
  column,
  isOpen,
  draftColumnFilters,
  searchQuery,
  onToggleOpen,
  onSearchChange,
  onDraftColumnFiltersChange,
}: {
  column: Column<TData, unknown>;
  isOpen: boolean;
  draftColumnFilters: ColumnFiltersState;
  searchQuery: string;
  onToggleOpen: () => void;
  onSearchChange: (value: string) => void;
  onDraftColumnFiltersChange: (filters: ColumnFiltersState) => void;
}) {
  const columnLabel = getColumnLabel(column);
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const selectedKeys = getDraftSelectedKeys(column.id, draftColumnFilters);
  const meta = column.columnDef.meta as ColumnMeta | undefined;
  const formatter = meta?.filterValueFormatter;

  const options: FilterOption[] = Array.from(column.getFacetedUniqueValues().entries())
    .map(([value, count]) => {
      const rawLabel = formatter?.(value) ?? String(value ?? '');
      const isBlank = value == null || value === '' || rawLabel === '';
      return {
        key: getSrFilterValueKey(value),
        label: isBlank ? 'Blank' : rawLabel,
        count,
        isBlank,
      };
    })
    .sort((a, b) =>
      a.label.localeCompare(b.label, 'en-IN', { numeric: true, sensitivity: 'base' }),
    );

  const optionKeys = options.map((option) => option.key);
  const selectedCount =
    selectedKeys == null
      ? options.length
      : options.filter((option) => selectedKeys.has(option.key)).length;
  const visibleOptions =
    normalizedSearch.length === 0
      ? options
      : options.filter((option) => option.label.toLowerCase().includes(normalizedSearch));
  const allVisibleValuesSelected = options.length > 0 && selectedCount === options.length;
  const summary = getFilterSummary(selectedCount, options.length);

  const commitSelection = (nextSelectedKeys: Set<string>) => {
    const nextValue = optionKeys.filter((key) => nextSelectedKeys.has(key));
    onDraftColumnFiltersChange(
      setDraftFilterValue(
        draftColumnFilters,
        column.id,
        nextValue.length === optionKeys.length ? null : nextValue,
      ),
    );
  };

  const handleOptionChange = (optionKey: string, checked: boolean) => {
    const nextSelectedKeys = new Set(selectedKeys ?? optionKeys);
    if (checked) nextSelectedKeys.add(optionKey);
    else nextSelectedKeys.delete(optionKey);
    commitSelection(nextSelectedKeys);
  };

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
        aria-expanded={isOpen}
        onClick={onToggleOpen}
      >
        <span className="block truncate text-sm font-semibold text-foreground">{columnLabel}</span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">{summary}</span>
          <ChevronDown
            className={cn(
              'size-4 text-muted-foreground transition-transform',
              isOpen && 'rotate-180',
            )}
            aria-hidden
          />
        </span>
      </button>

      {isOpen ? (
        <div className="border-t border-border">
          <div className="relative border-b border-border">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={`Search ${columnLabel.toLowerCase()}...`}
              className="h-11 rounded-none border-0 pr-10 pl-10 shadow-none focus-visible:ring-0"
            />
            {searchQuery ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute top-1/2 right-3 -translate-y-1/2"
                onClick={() => onSearchChange('')}
              >
                <X className="size-3.5" aria-hidden />
              </Button>
            ) : null}
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {visibleOptions.length > 0 ? (
              visibleOptions.map((option) => {
                const optionId = `${column.id}-filter-${option.key || 'blank'}`;
                const checked = selectedKeys == null || selectedKeys.has(option.key);
                return (
                  <label
                    key={optionId}
                    htmlFor={optionId}
                    className="flex min-h-11 cursor-pointer items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted/40"
                  >
                    <Checkbox
                      id={optionId}
                      checked={checked}
                      onCheckedChange={(value) => handleOptionChange(option.key, value === true)}
                    />
                    <span
                      className={cn(
                        'min-w-0 flex-1 truncate',
                        option.isBlank && 'text-muted-foreground',
                      )}
                      title={option.label}
                    >
                      {option.label}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {option.count.toLocaleString('en-IN')}
                    </span>
                  </label>
                );
              })
            ) : (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No values match this search.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/20 px-4 py-3">
            <p className="text-sm text-muted-foreground tabular-nums">
              {selectedCount.toLocaleString('en-IN')} of {options.length.toLocaleString('en-IN')}{' '}
              selected
            </p>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto px-0"
              disabled={options.length === 0}
              onClick={() =>
                onDraftColumnFiltersChange(
                  setDraftFilterValue(
                    draftColumnFilters,
                    column.id,
                    allVisibleValuesSelected ? [] : null,
                  ),
                )
              }
            >
              {allVisibleValuesSelected ? 'Deselect all' : 'Select all'}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function FiltersTab<TData extends RowData>({
  table,
  draftColumnFilters,
  onDraftColumnFiltersChange,
}: FiltersTabProps<TData>) {
  const filterableColumns = useMemo(
    () => table.getAllLeafColumns().filter((column) => column.getCanFilter()),
    [table],
  );
  const [openColumnId, setOpenColumnId] = useState<string | null>(null);
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

  if (filterableColumns.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
        <p className="text-sm font-medium text-foreground">No filterable columns</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Column filters
        </p>
        <p className="text-sm text-muted-foreground">
          Choose the values to keep in each column, then apply changes.
        </p>
      </div>

      <div className="space-y-2">
        {filterableColumns.map((column) => (
          <ColumnFilterSection
            key={column.id}
            column={column}
            isOpen={openColumnId === column.id}
            draftColumnFilters={draftColumnFilters}
            searchQuery={searchQueries[column.id] ?? ''}
            onToggleOpen={() =>
              setOpenColumnId((current) => (current === column.id ? null : column.id))
            }
            onSearchChange={(value) =>
              setSearchQueries((current) => ({ ...current, [column.id]: value }))
            }
            onDraftColumnFiltersChange={onDraftColumnFiltersChange}
          />
        ))}
      </div>
    </div>
  );
}
