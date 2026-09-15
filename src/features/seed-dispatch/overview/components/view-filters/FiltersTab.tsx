import type { ColumnFiltersState } from '@tanstack/react-table';
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
import type { DispatchColumnMeta } from '@/features/seed-dispatch/overview/components/data-table-features';
import type { DispatchesTable } from '@/features/seed-dispatch/overview/components/use-dispatches-table';
import {
  formatFacetLabel,
  getColumnFilterLabel,
  getSelectedFilterKeys,
  isActionsColumn,
  setColumnFilterValue,
} from '@/features/seed-dispatch/overview/components/view-filters/helpers';
import { getFilterValueKey } from '@/features/seed-dispatch/overview/lib/filter-fns';

type FacetOption = {
  key: string;
  label: string;
  count: number;
  isBlank: boolean;
};

type FilterableColumn = {
  id: string;
  columnDef: { meta?: DispatchColumnMeta };
  getFacetedUniqueValues: () => Map<unknown, number>;
};

function facetOptions(column: FilterableColumn): FacetOption[] {
  const unique = column.getFacetedUniqueValues();
  return [...unique.entries()]
    .map(([value, count]) => {
      const key = getFilterValueKey(value);
      return {
        key,
        label: formatFacetLabel(column, value),
        count,
        isBlank: key === '',
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
  column: FilterableColumn;
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
                <span className="text-xs tabular-nums text-muted-foreground">
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

export function FiltersTab({
  table,
  columnFilters,
  onColumnFiltersChange,
}: {
  table: DispatchesTable;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: (next: ColumnFiltersState) => void;
}) {
  const columns = table
    .getAllLeafColumns()
    .filter((column) => !isActionsColumn(column.id) && column.getCanFilter());

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
