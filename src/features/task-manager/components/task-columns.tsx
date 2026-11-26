import { Link } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { TaskTableFeatures } from '@/features/task-manager/components/data-table-features';
import type { TaskListItem } from '@/features/task-manager/lib/task-view';

const columnHelper = createColumnHelper<TaskTableFeatures, TaskListItem>();

function TaskStatusBadge({ item }: { item: TaskListItem }) {
  return (
    <Badge variant="outline" className={item.status.className}>
      {item.status.label}
    </Badge>
  );
}

function FieldLink({ item }: { item: TaskListItem }) {
  return (
    <Link
      to="/farmers/$id/fields/$fieldId"
      params={{ id: item.task.field.farmerId, fieldId: item.task.fieldId }}
      className="font-medium text-primary hover:underline"
    >
      {item.fieldName}
    </Link>
  );
}

function FarmerLink({ item }: { item: TaskListItem }) {
  return (
    <Link
      to="/farmers/$id"
      params={{ id: item.task.field.farmerId }}
      className="font-medium text-primary uppercase hover:underline"
    >
      {item.farmerName}
    </Link>
  );
}

function OfficerLink({ item }: { item: TaskListItem }) {
  return (
    <Link
      to="/task-manager/officers/$officerId"
      params={{ officerId: item.task.assignedOfficerId }}
      className="font-medium text-primary hover:underline"
    >
      {item.officerName}
    </Link>
  );
}

export function createTaskColumns(showOfficer: boolean) {
  return columnHelper.columns([
    columnHelper.accessor((row) => row.activityLabel, {
      id: 'task',
      header: 'Task',
      meta: { filterLabel: 'Task' },
      cell: ({ row }) => <span className="font-medium">{row.original.activityLabel}</span>,
    }),
    columnHelper.accessor((row) => row.fieldName, {
      id: 'field',
      header: 'Field',
      meta: { filterLabel: 'Field' },
      cell: ({ row }) => <FieldLink item={row.original} />,
    }),
    columnHelper.accessor((row) => row.farmerName, {
      id: 'farmer',
      header: 'Farmer',
      meta: { filterLabel: 'Farmer' },
      cell: ({ row }) => <FarmerLink item={row.original} />,
    }),
    ...(showOfficer
      ? [
          columnHelper.accessor((row) => row.officerName, {
            id: 'officer',
            header: 'Officer',
            meta: { filterLabel: 'Officer' },
            cell: ({ row }) => <OfficerLink item={row.original} />,
          }),
        ]
      : []),
    columnHelper.accessor((row) => row.dueLabel, {
      id: 'dueDate',
      header: 'Due date',
      meta: { filterLabel: 'Due date' },
      cell: ({ row }) => (
        <time className="tabular-nums" dateTime={row.original.task.dueDate}>
          {row.original.dueLabel}
        </time>
      ),
    }),
    columnHelper.accessor((row) => row.status.label, {
      id: 'status',
      header: 'Status',
      meta: { filterLabel: 'Status' },
      cell: ({ row }) => <TaskStatusBadge item={row.original} />,
    }),
  ]);
}
