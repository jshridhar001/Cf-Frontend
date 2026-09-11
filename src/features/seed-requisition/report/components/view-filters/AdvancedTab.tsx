import { Plus, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  AdvancedFilterCondition,
  AdvancedFilterOperator,
  AdvancedSrGlobalFilter,
  SeedRequisitionFilterableColumnId,
} from '@/features/seed-requisition/report/lib/filter-fns';
import type { Column, Table } from '@/features/seed-requisition/report/lib/react-table';
import type { ColumnMeta, SeedRequisitionRow } from '@/features/seed-requisition/report/types';
import { cn } from '@/lib/utils';

interface AdvancedTabProps {
  table: Table<SeedRequisitionRow>;
  draftGlobalFilter: AdvancedSrGlobalFilter;
  onDraftGlobalFilterChange: (filter: AdvancedSrGlobalFilter) => void;
}

const STRING_OPERATOR_OPTIONS: {
  value: AdvancedFilterOperator;
  label: string;
  requiresValue?: boolean;
}[] = [
  { value: 'contains', label: 'contains', requiresValue: true },
  { value: 'notContains', label: 'does not contain', requiresValue: true },
  { value: 'equals', label: 'equals', requiresValue: true },
  { value: 'notEquals', label: 'does not equal', requiresValue: true },
  { value: 'startsWith', label: 'starts with', requiresValue: true },
  { value: 'endsWith', label: 'ends with', requiresValue: true },
  { value: 'isEmpty', label: 'is blank' },
  { value: 'isNotEmpty', label: 'is not blank' },
];

function getColumnLabel(column: Column<SeedRequisitionRow, unknown>) {
  const meta = column.columnDef.meta as ColumnMeta | undefined;
  return meta?.filterLabel ?? column.id;
}

function getColumnValueOptions(column: Column<SeedRequisitionRow, unknown> | undefined) {
  if (!column) return [];
  return Array.from(column.getFacetedUniqueValues().keys())
    .map((value) => {
      if (value instanceof Date) return value.toISOString();
      return String(value ?? '').trim();
    })
    .filter((value) => value.length > 0)
    .sort((a, b) => a.localeCompare(b, 'en-IN', { numeric: true, sensitivity: 'base' }));
}

function createCondition(column: Column<SeedRequisitionRow, unknown>): AdvancedFilterCondition {
  return {
    id: `condition-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    columnId: column.id as SeedRequisitionFilterableColumnId,
    operator: 'contains',
    value: '',
  };
}

function isValueRequired(operator: AdvancedFilterOperator) {
  return STRING_OPERATOR_OPTIONS.find((option) => option.value === operator)?.requiresValue;
}

export function AdvancedTab({
  table,
  draftGlobalFilter,
  onDraftGlobalFilterChange,
}: AdvancedTabProps) {
  const columns = table.getAllLeafColumns().filter((column) => column.id !== 'actions');
  const columnsById = new Map(columns.map((column) => [column.id, column]));
  const conditions = draftGlobalFilter.conditions;
  const firstColumn = columns[0];

  const updateFilter = (next: Partial<AdvancedSrGlobalFilter>) => {
    onDraftGlobalFilterChange({ ...draftGlobalFilter, ...next });
  };

  const updateCondition = (conditionId: string, patch: Partial<AdvancedFilterCondition>) => {
    updateFilter({
      conditions: conditions.map((condition) =>
        condition.id === conditionId ? { ...condition, ...patch } : condition,
      ),
    });
  };

  const activeConditionCount = conditions.filter(
    (condition) => !isValueRequired(condition.operator) || condition.value.trim().length > 0,
  ).length;

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Logic builder
          </p>
          <p className="text-sm text-muted-foreground">Combine conditions with AND / OR logic.</p>
        </div>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto shrink-0 gap-1 px-0 text-muted-foreground"
          disabled={conditions.length === 0 && draftGlobalFilter.logic === 'AND'}
          onClick={() =>
            onDraftGlobalFilterChange({
              logic: 'AND',
              conditions: [],
              manualSearch: draftGlobalFilter.manualSearch,
            })
          }
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Reset
        </Button>
      </div>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
            <span>Match</span>
            <div className="inline-flex rounded-full bg-muted p-0.5">
              {(['AND', 'OR'] as const).map((logic) => (
                <button
                  key={logic}
                  type="button"
                  className={cn(
                    'rounded-full px-3 py-1 text-sm font-semibold transition-colors',
                    draftGlobalFilter.logic === logic
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  onClick={() => updateFilter({ logic })}
                  aria-pressed={draftGlobalFilter.logic === logic}
                >
                  {logic}
                </button>
              ))}
            </div>
            <span>conditions</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={!firstColumn}
            onClick={() => {
              if (!firstColumn) return;
              updateFilter({ conditions: [...conditions, createCondition(firstColumn)] });
            }}
          >
            <Plus className="size-4" aria-hidden />
            Condition
          </Button>
        </div>

        {conditions.length > 0 ? (
          <div className="space-y-2">
            {conditions.map((condition) => {
              const selectedColumn = columnsById.get(String(condition.columnId));
              const needsValue = isValueRequired(condition.operator);
              const valueOptions = getColumnValueOptions(selectedColumn);
              const valueListId = `advanced-filter-values-${condition.id}`;

              return (
                <div
                  key={condition.id}
                  className="grid gap-2 rounded-xl border border-border bg-background p-2 sm:grid-cols-[minmax(0,1fr)_minmax(8rem,0.9fr)_minmax(0,1.4fr)_auto] sm:items-center"
                >
                  <Select
                    value={String(condition.columnId)}
                    onValueChange={(value) => {
                      if (value == null) return;
                      const column = columnsById.get(value);
                      if (!column) return;
                      updateCondition(condition.id, {
                        columnId: column.id as SeedRequisitionFilterableColumnId,
                        operator: 'contains',
                        value: '',
                      });
                    }}
                  >
                    <SelectTrigger className="h-10 w-full rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          {getColumnLabel(column)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={condition.operator}
                    onValueChange={(value) => {
                      if (value == null) return;
                      updateCondition(condition.id, {
                        operator: value as AdvancedFilterOperator,
                        value: value === 'isEmpty' || value === 'isNotEmpty' ? '' : condition.value,
                      });
                    }}
                  >
                    <SelectTrigger className="h-10 w-full rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STRING_OPERATOR_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="text"
                    value={condition.value}
                    disabled={!needsValue}
                    list={needsValue ? valueListId : undefined}
                    placeholder={needsValue ? 'Select or type value...' : 'No value needed'}
                    onChange={(event) =>
                      updateCondition(condition.id, { value: event.target.value })
                    }
                    className="h-10"
                  />
                  {needsValue ? (
                    <datalist id={valueListId}>
                      {valueOptions.map((value) => (
                        <option key={value} value={value} />
                      ))}
                    </datalist>
                  ) : null}

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="justify-self-end"
                    onClick={() =>
                      updateFilter({
                        conditions: conditions.filter((item) => item.id !== condition.id),
                      })
                    }
                    aria-label="Remove condition"
                  >
                    <X className="size-4" aria-hidden />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-8 text-center">
            <p className="text-sm font-semibold text-foreground">No advanced logic yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a condition to filter rows with AND / OR rules.
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground tabular-nums">
          {activeConditionCount.toLocaleString('en-IN')} active condition
          {activeConditionCount === 1 ? '' : 's'}
        </p>
      </section>
    </div>
  );
}
