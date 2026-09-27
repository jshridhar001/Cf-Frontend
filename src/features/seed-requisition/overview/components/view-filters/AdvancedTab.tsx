import { PlusIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RequisitionsTable } from '@/features/seed-requisition/overview/components/use-requisitions-table';
import {
  getColumnFilterLabel,
  isActionsColumn,
} from '@/features/seed-requisition/overview/components/view-filters/helpers';
import {
  ADVANCED_FILTER_OPERATORS,
  type AdvancedFilterCondition,
  type AdvancedFilterOperator,
  type AdvancedGlobalFilter,
  getFilterValueKey,
  operatorRequiresValue,
} from '@/features/seed-requisition/overview/lib/filter-fns';

function newConditionId() {
  return crypto.randomUUID();
}

export function AdvancedTab({
  table,
  globalFilter,
  onGlobalFilterChange,
}: {
  table: RequisitionsTable;
  globalFilter: AdvancedGlobalFilter;
  onGlobalFilterChange: (next: AdvancedGlobalFilter) => void;
}) {
  const columns = table
    .getAllLeafColumns()
    .filter((column) => !isActionsColumn(column.id) && column.getCanFilter());
  const firstColumnId = columns[0]?.id ?? 'farmer';

  const addCondition = () => {
    const condition: AdvancedFilterCondition = {
      id: newConditionId(),
      columnId: firstColumnId,
      operator: 'contains',
      value: '',
    };
    onGlobalFilterChange({
      ...globalFilter,
      conditions: [...globalFilter.conditions, condition],
    });
  };

  const updateCondition = (id: string, patch: Partial<AdvancedFilterCondition>) => {
    onGlobalFilterChange({
      ...globalFilter,
      conditions: globalFilter.conditions.map((condition) =>
        condition.id === id ? { ...condition, ...patch } : condition,
      ),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Match</span>
          <div className="flex rounded-full bg-muted p-1">
            {(['AND', 'OR'] as const).map((logic) => (
              <Button
                key={logic}
                type="button"
                size="xs"
                variant={globalFilter.logic === logic ? 'default' : 'ghost'}
                onClick={() => onGlobalFilterChange({ ...globalFilter, logic })}
              >
                {logic}
              </Button>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">conditions</span>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addCondition}>
          <PlusIcon data-icon="inline-start" />
          Condition
        </Button>
      </div>

      {globalFilter.conditions.length === 0 ? (
        <p className="rounded-xl border border-dashed px-3 py-4 text-sm text-muted-foreground">
          Add a condition to filter across columns with AND/OR logic.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {globalFilter.conditions.map((condition) => {
            const column = columns.find((entry) => entry.id === condition.columnId);
            const datalistId = `advanced-${condition.id}`;
            const suggestions = column
              ? [...column.getFacetedUniqueValues().keys()]
                  .map((value) => getFilterValueKey(value))
                  .filter(Boolean)
              : [];
            const requiresValue = operatorRequiresValue(condition.operator);

            return (
              <div key={condition.id} className="flex flex-col gap-2 rounded-xl border bg-card p-3">
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <Select
                    value={condition.columnId}
                    onValueChange={(value) => {
                      if (!value) return;
                      updateCondition(condition.id, {
                        columnId: value,
                        operator: 'contains',
                        value: '',
                      });
                    }}
                  >
                    <SelectTrigger className="h-11 min-w-0 sm:h-9">
                      <SelectValue placeholder="Column" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((entry) => (
                        <SelectItem key={entry.id} value={entry.id}>
                          {getColumnFilterLabel(entry)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={condition.operator}
                    onValueChange={(value) => {
                      if (!value) return;
                      const operator = value as AdvancedFilterOperator;
                      updateCondition(condition.id, {
                        operator,
                        value: operatorRequiresValue(operator) ? condition.value : '',
                      });
                    }}
                  >
                    <SelectTrigger className="h-11 min-w-0 sm:h-9">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADVANCED_FILTER_OPERATORS.map((operator) => (
                        <SelectItem key={operator.value} value={operator.value}>
                          {operator.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="self-center"
                    aria-label="Remove condition"
                    onClick={() =>
                      onGlobalFilterChange({
                        ...globalFilter,
                        conditions: globalFilter.conditions.filter(
                          (entry) => entry.id !== condition.id,
                        ),
                      })
                    }
                  >
                    <XIcon />
                  </Button>
                </div>
                <Input
                  value={condition.value}
                  disabled={!requiresValue}
                  list={datalistId}
                  placeholder={requiresValue ? 'Value' : 'Not needed'}
                  className="h-11 sm:h-9"
                  onChange={(event) => updateCondition(condition.id, { value: event.target.value })}
                />
                <datalist id={datalistId}>
                  {suggestions.map((suggestion) => (
                    <option key={suggestion} value={suggestion} />
                  ))}
                </datalist>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
