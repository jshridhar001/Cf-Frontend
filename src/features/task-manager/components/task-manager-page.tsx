import { Link } from '@tanstack/react-router';
import { Fragment, useMemo, useState } from 'react';
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Item, ItemContent, ItemGroup, ItemHeader, ItemTitle } from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useFarmers } from '@/features/farmers/overview/api/use-farmers';
import { useFieldTasks } from '@/features/task-manager/api/use-field-tasks';
import { TaskFiltersSheet } from '@/features/task-manager/components/task-filters-sheet';
import {
  filterTasks,
  groupTaskPage,
  TASK_PAGE_SIZE,
  type TaskGroup,
  type TaskListItem,
  toTaskListItem,
} from '@/features/task-manager/lib/task-view';
import type {
  FieldTask,
  TaskActivityFilter,
  TaskGroupBy,
  TaskStatusFilter,
} from '@/features/task-manager/types';
import { getApiErrorMessage } from '@/lib/api-client';

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

function TaskTable({ groups, showOfficer }: { groups: TaskGroup[]; showOfficer: boolean }) {
  const columnCount = showOfficer ? 6 : 5;

  return (
    <div className="hidden overflow-hidden rounded-lg border md:block">
      <Table aria-label="Field tasks">
        <TableHeader className="bg-muted">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold">Task</TableHead>
            <TableHead className="font-semibold">Field</TableHead>
            <TableHead className="font-semibold">Farmer</TableHead>
            {showOfficer ? <TableHead className="font-semibold">Officer</TableHead> : null}
            <TableHead className="font-semibold">Due date</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <Fragment key={group.key}>
              {group.label ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columnCount}
                    className="bg-muted/50 text-sm font-medium text-muted-foreground"
                  >
                    {group.label}
                  </TableCell>
                </TableRow>
              ) : null}
              {group.items.map((item) => (
                <TableRow key={item.task.id}>
                  <TableCell className="font-medium">{item.activityLabel}</TableCell>
                  <TableCell>
                    <FieldLink item={item} />
                  </TableCell>
                  <TableCell>
                    <FarmerLink item={item} />
                  </TableCell>
                  {showOfficer ? (
                    <TableCell>
                      <OfficerLink item={item} />
                    </TableCell>
                  ) : null}
                  <TableCell className="tabular-nums">{item.dueLabel}</TableCell>
                  <TableCell>
                    <TaskStatusBadge item={item} />
                  </TableCell>
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TaskItemList({ groups, showOfficer }: { groups: TaskGroup[]; showOfficer: boolean }) {
  return (
    <div className="flex flex-col gap-4 md:hidden">
      {groups.map((group) => (
        <div key={group.key} className="flex flex-col gap-2">
          {group.label ? (
            <p className="text-sm font-medium text-muted-foreground">{group.label}</p>
          ) : null}
          <ItemGroup>
            {group.items.map((item) => (
              <Item key={item.task.id} variant="outline" className="items-start">
                <ItemHeader className="gap-3">
                  <ItemContent className="min-w-0">
                    <ItemTitle>{item.activityLabel}</ItemTitle>
                  </ItemContent>
                  <TaskStatusBadge item={item} />
                </ItemHeader>
                <dl className="mt-1 grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-1 border-t border-border/60 pt-2.5 text-sm">
                  <dt className="text-muted-foreground">Field</dt>
                  <dd className="min-w-0 break-words">
                    <FieldLink item={item} />
                  </dd>
                  <dt className="text-muted-foreground">Farmer</dt>
                  <dd className="min-w-0 break-words">
                    <FarmerLink item={item} />
                  </dd>
                  {showOfficer ? (
                    <>
                      <dt className="text-muted-foreground">Officer</dt>
                      <dd className="min-w-0 break-words">
                        <OfficerLink item={item} />
                      </dd>
                    </>
                  ) : null}
                  <dt className="text-muted-foreground">Due</dt>
                  <dd className="tabular-nums">
                    <time dateTime={item.task.dueDate}>{item.dueLabel}</time>
                  </dd>
                </dl>
              </Item>
            ))}
          </ItemGroup>
        </div>
      ))}
    </div>
  );
}

export function TaskList({
  tasks,
  isPending,
  isError,
  error,
  showOfficer = true,
  searchPlaceholder = 'Search by task, field, farmer, officer...',
}: {
  tasks: FieldTask[] | undefined;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  showOfficer?: boolean;
  searchPlaceholder?: string;
}) {
  const farmersQuery = useFarmers();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TaskStatusFilter>('all');
  const [activity, setActivity] = useState<TaskActivityFilter>('all');
  const [groupBy, setGroupBy] = useState<TaskGroupBy>('none');
  const [page, setPage] = useState(0);

  const items = useMemo(() => {
    const farmerNames = new Map(
      (farmersQuery.data ?? []).map((farmer) => [farmer.id, farmer.name]),
    );
    return (tasks ?? []).map((task) => toTaskListItem(task, farmerNames));
  }, [farmersQuery.data, tasks]);
  const filtered = useMemo(
    () => filterTasks(items, search, status, activity),
    [activity, items, search, status],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / TASK_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(
    currentPage * TASK_PAGE_SIZE,
    currentPage * TASK_PAGE_SIZE + TASK_PAGE_SIZE,
  );
  const groups = groupTaskPage(pageItems, groupBy);
  const from = filtered.length === 0 ? 0 : currentPage * TASK_PAGE_SIZE + 1;
  const to = Math.min(filtered.length, (currentPage + 1) * TASK_PAGE_SIZE);
  const emptyMessage =
    (tasks?.length ?? 0) === 0 ? 'No tasks yet.' : 'No tasks match these filters.';

  const resetPage = () => setPage(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Input
          value={search}
          inputMode="search"
          placeholder={searchPlaceholder}
          className="min-h-11 min-w-0 flex-1 sm:min-h-9"
          onChange={(event) => {
            setSearch(event.target.value);
            resetPage();
          }}
        />
        <TaskFiltersSheet
          status={status}
          activity={activity}
          groupBy={groupBy}
          onStatusChange={(value) => {
            setStatus(value);
            resetPage();
          }}
          onActivityChange={(value) => {
            setActivity(value);
            resetPage();
          }}
          onGroupByChange={setGroupBy}
          onReset={() => {
            setStatus('all');
            setActivity('all');
            setGroupBy('none');
            resetPage();
          }}
        />
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(error, "Couldn't load field tasks.")}
        </p>
      ) : null}

      {!isPending && !isError && filtered.length === 0 ? (
        <p className="rounded-lg border px-3 py-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : null}

      {!isPending && !isError && filtered.length > 0 ? (
        <>
          <TaskTable groups={groups} showOfficer={showOfficer} />
          <TaskItemList groups={groups} showOfficer={showOfficer} />
        </>
      ) : null}

      {!isPending && !isError ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {filtered.length === 0
              ? 'Showing 0 of 0 tasks'
              : `Showing ${from.toLocaleString('en-IN')}–${to.toLocaleString('en-IN')} of ${filtered.length.toLocaleString('en-IN')} tasks`}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 sm:min-h-8"
              disabled={currentPage === 0}
              onClick={() => setPage(Math.max(0, currentPage - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 sm:min-h-8"
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPage(Math.min(pageCount - 1, currentPage + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function TaskManagerPage() {
  const tasksQuery = useFieldTasks();

  return (
    <PageCard>
      <PageCardHeader>
        <CardTitle>Task Manager</CardTitle>
        <CardDescription className="hidden sm:block">
          Track field tasks across plantations. Use view filters and grouping to explore the list.
        </CardDescription>
      </PageCardHeader>
      <PageCardContent>
        <TaskList
          tasks={tasksQuery.data}
          isPending={tasksQuery.isPending}
          isError={tasksQuery.isError}
          error={tasksQuery.error}
        />
      </PageCardContent>
    </PageCard>
  );
}
