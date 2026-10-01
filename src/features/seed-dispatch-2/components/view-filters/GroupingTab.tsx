import { DragDropProvider } from '@dnd-kit/react';
import { isSortable, useSortable } from '@dnd-kit/react/sortable';
import type { Column, GroupingState, RowData, Table } from '@tanstack/react-table';
import { GripVertical, Layers3, ListTree, Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { ColumnMeta } from '@/features/seed-dispatch/types';
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

function SortableGroupRow<TData extends RowData>({
  column,
  index,
  onRemove,
}: {
  column: Column<TData, unknown>;
  index: number;
  onRemove: (columnId: string) => void;
}) {
  const { ref, handleRef, isDragging } = useSortable({
    id: column.id,
    index,
    type: 'sd-grouping',
    accept: 'sd-grouping',
  });
  const columnLabel = getColumnLabel(column);

  return (
    <div
      ref={ref}
      className={cn(
        'flex min-h-12 items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 text-sm',
        isDragging && 'z-10 opacity-80 shadow-md ring-1 ring-primary/30',
      )}
    >
      <button
        type="button"
        ref={handleRef}
        className="flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground touch-none hover:bg-muted hover:text-foreground active:cursor-grabbing"
        aria-label={`Drag to reorder ${columnLabel}`}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
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
          <DragDropProvider
            onDragEnd={(event) => {
              if (event.canceled) return;

              const { source } = event.operation;
              if (!isSortable(source)) return;
              if (source.initialIndex === source.index) return;

              onDraftGroupingChange(moveGroup(draftGrouping, source.initialIndex, source.index));
            }}
          >
            <div className="space-y-2">
              {activeColumns.map((column, index) => (
                <SortableGroupRow
                  key={column.id}
                  column={column}
                  index={index}
                  onRemove={(columnId) =>
                    onDraftGroupingChange(draftGrouping.filter((id) => id !== columnId))
                  }
                />
              ))}
            </div>
          </DragDropProvider>
        ) : (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 px-4 py-8 text-center">
            <ListTree className="size-9 text-muted-foreground" aria-hidden />
            <p className="mt-3 text-sm font-semibold text-foreground">No groups yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add columns from below to group rows together. Drag to set priority.
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
