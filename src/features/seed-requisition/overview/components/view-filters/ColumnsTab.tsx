import { DragDropProvider } from '@dnd-kit/react';
import { isSortable, useSortable } from '@dnd-kit/react/sortable';
import type { ColumnOrderState, ColumnVisibilityState } from '@tanstack/react-table';
import { GripVerticalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { RequisitionsTable } from '@/features/seed-requisition/overview/components/use-requisitions-table';
import {
  getColumnFilterLabel,
  moveItem,
  orderedColumnIds,
} from '@/features/seed-requisition/overview/components/view-filters/helpers';
import {
  clearColumnPreferences,
  saveColumnPreferences,
} from '@/features/seed-requisition/overview/lib/column-preferences';

const SORTABLE_TYPE = 'sr-column';

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

export function ColumnsTab({
  table,
  columnVisibility,
  columnOrder,
  onColumnVisibilityChange,
  onColumnOrderChange,
}: {
  table: RequisitionsTable;
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
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onColumnVisibilityChange({})}
          >
            Show all
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              saveColumnPreferences({
                columnVisibility,
                columnOrder,
              })
            }
          >
            Set default
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              clearColumnPreferences();
              onColumnVisibilityChange({});
              onColumnOrderChange([]);
            }}
          >
            Clear
          </Button>
        </div>
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
