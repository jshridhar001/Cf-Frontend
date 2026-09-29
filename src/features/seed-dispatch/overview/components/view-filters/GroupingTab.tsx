import { DragDropProvider } from '@dnd-kit/react';
import { isSortable, useSortable } from '@dnd-kit/react/sortable';
import type { GroupingState } from '@tanstack/react-table';
import { GripVerticalIcon, PlusIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DispatchesTable } from '@/features/seed-dispatch/overview/components/use-dispatches-table';
import {
  getColumnFilterLabel,
  isActionsColumn,
  moveItem,
} from '@/features/seed-dispatch/overview/components/view-filters/helpers';

const SORTABLE_TYPE = 'sd-grouping';

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

export function GroupingTab({
  table,
  grouping,
  onGroupingChange,
}: {
  table: DispatchesTable;
  grouping: GroupingState;
  onGroupingChange: (next: GroupingState) => void;
}) {
  const groupable = table
    .getAllLeafColumns()
    .filter((column) => !isActionsColumn(column.id) && column.getCanGroup());
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
