import { ChevronDown, ChevronUp, Layers3, ListTree, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  Column,
  GroupingState,
  RowData,
  Table,
} from '@/features/seed-requisition/report/lib/react-table';
import type { ColumnMeta } from '@/features/seed-requisition/report/types';
import { cn } from '@/lib/utils';

interface GroupingTabProps<TData extends RowData> {
  table: Table<TData>;
  draftGrouping: GroupingState;
  onDraftGroupingChange: (grouping: GroupingState) => void;
}

function getColumnLabel<TData extends RowData>(column: Column<TData, unknown>): string {
  const meta = column.columnDef.meta as ColumnMeta | undefined;
  return meta?.filterLabel ?? column.id;
}

function moveGroup(grouping: GroupingState, fromIndex: number, toIndex: number): GroupingState {
  const next = [...grouping];
  const [removed] = next.splice(fromIndex, 1);
  if (!removed) return grouping;
  next.splice(toIndex, 0, removed);
  return next;
}

function GroupRow<TData extends RowData>({
  column,
  index,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  column: Column<TData, unknown>;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: (columnId: string) => void;
}) {
  const columnLabel = getColumnLabel(column);

  return (
    <div className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 text-sm">
      <div className="flex shrink-0 flex-col">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={!canMoveUp}
          onClick={onMoveUp}
          aria-label={`Move ${columnLabel} up`}
        >
          <ChevronUp className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={!canMoveDown}
          onClick={onMoveDown}
          aria-label={`Move ${columnLabel} down`}
        >
          <ChevronDown className="size-3.5" />
        </Button>
      </div>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary tabular-nums">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{columnLabel}</p>
        <p className="text-xs text-muted-foreground">Group priority {index + 1}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => onRemove(column.id)}
        aria-label={`Remove ${columnLabel} from grouping`}
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}

export function GroupingTab<TData extends RowData>({
  table,
  draftGrouping,
  onDraftGroupingChange,
}: GroupingTabProps<TData>) {
  const groupableColumns = table.getAllLeafColumns().filter((column) => column.getCanGroup());
  const columnsById = new Map(groupableColumns.map((column) => [column.id, column]));
  const activeColumns = draftGrouping
    .map((columnId) => columnsById.get(columnId))
    .filter((column): column is Column<TData, unknown> => column != null);
  const availableColumns = groupableColumns.filter((column) => !draftGrouping.includes(column.id));

  return (
    <div className="space-y-5 pt-4">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Active groups
          </p>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto shrink-0 px-0"
            disabled={draftGrouping.length === 0}
            onClick={() => onDraftGroupingChange([])}
          >
            Clear all
          </Button>
        </div>

        {activeColumns.length > 0 ? (
          <div className="space-y-2">
            {activeColumns.map((column, index) => (
              <GroupRow
                key={column.id}
                column={column}
                index={index}
                canMoveUp={index > 0}
                canMoveDown={index < activeColumns.length - 1}
                onMoveUp={() => onDraftGroupingChange(moveGroup(draftGrouping, index, index - 1))}
                onMoveDown={() => onDraftGroupingChange(moveGroup(draftGrouping, index, index + 1))}
                onRemove={(columnId) =>
                  onDraftGroupingChange(draftGrouping.filter((id) => id !== columnId))
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 px-4 py-8 text-center">
            <ListTree className="size-9 text-muted-foreground" aria-hidden />
            <p className="mt-3 text-sm font-semibold text-foreground">No groups yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add columns from below to group rows together. Use the arrows to set priority.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Available columns
          </p>
          <span className="text-xs text-muted-foreground tabular-nums">
            {availableColumns.length.toLocaleString('en-IN')} available
          </span>
        </div>

        <div className="space-y-2">
          {availableColumns.length > 0 ? (
            availableColumns.map((column) => {
              const columnLabel = getColumnLabel(column);
              return (
                <div
                  key={column.id}
                  className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-card px-4 py-2 text-sm"
                >
                  <Layers3
                    className={cn(
                      'size-4 shrink-0 text-muted-foreground',
                      column.getIsVisible() && 'text-primary',
                    )}
                    aria-hidden
                  />
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {columnLabel}
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto shrink-0 gap-1 px-0"
                    onClick={() => onDraftGroupingChange([...draftGrouping, column.id])}
                  >
                    <Plus className="size-4" aria-hidden />
                    Add
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-6 text-center">
              <p className="text-sm font-medium text-foreground">All columns are grouped</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
