import { DragDropProvider } from '@dnd-kit/react';
import { isSortable, useSortable } from '@dnd-kit/react/sortable';
import type {
  Column,
  ColumnOrderState,
  RowData,
  Table,
  VisibilityState,
} from '@tanstack/react-table';
import { GripVertical, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  clearStoredSeedDispatchColumnState,
  hasStoredSeedDispatchColumnState,
  saveSeedDispatchColumnState,
} from '@/features/seed-dispatch/lib/column-preferences';
import type { ColumnMeta } from '@/features/seed-dispatch/types';
import { cn } from '@/lib/utils';

interface ColumnsTabProps<TData extends RowData> {
  table: Table<TData>;
  draftColumnVisibility: VisibilityState;
  draftColumnOrder: ColumnOrderState;
  onDraftColumnVisibilityChange: (visibility: VisibilityState) => void;
  onDraftColumnOrderChange: (order: ColumnOrderState) => void;
}

function getColumnLabel<TData extends RowData>(column: Column<TData, unknown>): string {
  const meta = column.columnDef.meta as ColumnMeta | undefined;
  return meta?.filterLabel ?? column.id;
}

function getDraftColumnVisible(columnId: string, draftColumnVisibility: VisibilityState) {
  return draftColumnVisibility[columnId] !== false;
}

function getOrderedColumns<TData extends RowData>(
  columns: Column<TData, unknown>[],
  draftColumnOrder: ColumnOrderState,
): Column<TData, unknown>[] {
  const columnsById = new Map(columns.map((column) => [column.id, column]));
  const orderedIds = [
    ...draftColumnOrder.filter((columnId) => columnsById.has(columnId)),
    ...columns
      .map((column) => column.id)
      .filter((columnId) => !draftColumnOrder.includes(columnId)),
  ];

  return orderedIds
    .map((columnId) => columnsById.get(columnId))
    .filter((column): column is Column<TData, unknown> => column != null);
}

function moveItem(ids: string[], fromIndex: number, toIndex: number) {
  const next = [...ids];
  const [removed] = next.splice(fromIndex, 1);
  if (!removed) return ids;
  next.splice(toIndex, 0, removed);
  return next;
}

function SortableColumnRow<TData extends RowData>({
  column,
  index,
  isVisible,
  isLastVisible,
  onVisibilityChange,
}: {
  column: Column<TData, unknown>;
  index: number;
  isVisible: boolean;
  isLastVisible: boolean;
  onVisibilityChange: (columnId: string, visible: boolean) => void;
}) {
  const { ref, handleRef, isDragging } = useSortable({
    id: column.id,
    index,
    type: 'sd-column',
    accept: 'sd-column',
  });
  const columnLabel = getColumnLabel(column);

  return (
    <div
      ref={ref}
      className={cn(
        'flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm',
        !isVisible && 'bg-muted/20 text-muted-foreground',
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
      <p
        className={cn(
          'min-w-0 flex-1 truncate text-sm font-medium',
          isVisible ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {columnLabel}
      </p>
      <Switch
        checked={isVisible}
        disabled={!column.getCanHide() || isLastVisible}
        onCheckedChange={(checked) => onVisibilityChange(column.id, checked)}
        aria-label={`${isVisible ? 'Hide' : 'Show'} ${columnLabel} column`}
      />
    </div>
  );
}

export function ColumnsTab<TData extends RowData>({
  table,
  draftColumnVisibility,
  draftColumnOrder,
  onDraftColumnVisibilityChange,
  onDraftColumnOrderChange,
}: ColumnsTabProps<TData>) {
  const allColumns = table.getAllLeafColumns();
  const orderedColumns = useMemo(
    () => getOrderedColumns(allColumns, draftColumnOrder),
    [allColumns, draftColumnOrder],
  );
  const orderedColumnIds = orderedColumns.map((column) => column.id);
  const visibleColumnCount = orderedColumns.filter((column) =>
    getDraftColumnVisible(column.id, draftColumnVisibility),
  ).length;
  const hiddenColumnCount = orderedColumns.length - visibleColumnCount;
  const columnIds = allColumns.map((column) => column.id);
  const [hasSavedDefault, setHasSavedDefault] = useState(() => hasStoredSeedDispatchColumnState());
  const [preferenceStatus, setPreferenceStatus] = useState<'idle' | 'saved' | 'cleared' | 'error'>(
    'idle',
  );

  const handleVisibilityChange = (columnId: string, visible: boolean) => {
    const nextVisibility = { ...draftColumnVisibility };
    if (visible) delete nextVisibility[columnId];
    else nextVisibility[columnId] = false;
    onDraftColumnVisibilityChange(nextVisibility);
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Column visibility & order
          </p>
          <p className="text-sm text-muted-foreground">
            Drag columns to reorder. Toggle columns to show or hide them.
          </p>
        </div>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto shrink-0 px-0"
          disabled={hiddenColumnCount === 0}
          onClick={() => onDraftColumnVisibilityChange({})}
        >
          Show all
        </Button>
      </div>

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground">Default column view</p>
          <p className="text-sm text-muted-foreground">
            Save the current visible columns and order for this browser.
          </p>
          {preferenceStatus !== 'idle' ? (
            <p
              className={cn(
                'text-xs',
                preferenceStatus === 'error' ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {preferenceStatus === 'saved'
                ? 'Default column view saved.'
                : preferenceStatus === 'cleared'
                  ? 'Default column view cleared.'
                  : 'Could not update local storage.'}
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              const saved = saveSeedDispatchColumnState(
                columnIds,
                draftColumnVisibility,
                draftColumnOrder,
              );
              setHasSavedDefault(saved);
              setPreferenceStatus(saved ? 'saved' : 'error');
            }}
          >
            <Save className="size-3.5" aria-hidden />
            Set default
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5"
            disabled={!hasSavedDefault}
            onClick={() => {
              const cleared = clearStoredSeedDispatchColumnState();
              setHasSavedDefault(!cleared ? hasSavedDefault : false);
              setPreferenceStatus(cleared ? 'cleared' : 'error');
            }}
          >
            <Trash2 className="size-3.5" aria-hidden />
            Clear
          </Button>
        </div>
      </section>

      <DragDropProvider
        onDragEnd={(event) => {
          if (event.canceled) return;

          const { source } = event.operation;
          if (!isSortable(source)) return;
          if (source.initialIndex === source.index) return;

          onDraftColumnOrderChange(moveItem(orderedColumnIds, source.initialIndex, source.index));
        }}
      >
        <div className="space-y-2 rounded-xl border border-border bg-muted/10 p-2">
          {orderedColumns.map((column, index) => {
            const isVisible = getDraftColumnVisible(column.id, draftColumnVisibility);
            const isLastVisible = isVisible && visibleColumnCount <= 1;

            return (
              <SortableColumnRow
                key={column.id}
                column={column}
                index={index}
                isVisible={isVisible}
                isLastVisible={isLastVisible}
                onVisibilityChange={handleVisibilityChange}
              />
            );
          })}
        </div>
      </DragDropProvider>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground tabular-nums">
            {visibleColumnCount.toLocaleString('en-IN')}
          </span>{' '}
          of{' '}
          <span className="text-foreground tabular-nums">
            {orderedColumns.length.toLocaleString('en-IN')}
          </span>{' '}
          columns visible
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          disabled={draftColumnOrder.length === 0}
          onClick={() => onDraftColumnOrderChange([])}
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Reset order
        </Button>
      </div>
    </div>
  );
}
