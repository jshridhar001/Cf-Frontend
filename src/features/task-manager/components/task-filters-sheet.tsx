import { SlidersHorizontalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { activityLabel, taskFilterCount } from '@/features/task-manager/lib/task-view';
import {
  FIELD_TASK_ACTIVITIES,
  FIELD_TASK_STATUSES,
  isTaskActivityFilter,
  isTaskGroupBy,
  isTaskStatusFilter,
  type TaskActivityFilter,
  type TaskGroupBy,
  type TaskStatusFilter,
} from '@/features/task-manager/types';

const STATUS_LABELS: Record<(typeof FIELD_TASK_STATUSES)[number], string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
};

export function TaskFiltersSheet({
  status,
  activity,
  groupBy,
  onStatusChange,
  onActivityChange,
  onGroupByChange,
  onReset,
}: {
  status: TaskStatusFilter;
  activity: TaskActivityFilter;
  groupBy: TaskGroupBy;
  onStatusChange: (status: TaskStatusFilter) => void;
  onActivityChange: (activity: TaskActivityFilter) => void;
  onGroupByChange: (groupBy: TaskGroupBy) => void;
  onReset: () => void;
}) {
  const filterCount = taskFilterCount(status, activity, groupBy);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11 shrink-0 border-primary px-3 text-primary sm:min-h-8"
        >
          <SlidersHorizontalIcon data-icon="inline-start" />
          {filterCount > 0 ? `View filters (${filterCount})` : 'View filters'}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="border-b">
          <SheetTitle>View filters</SheetTitle>
          <SheetDescription className="hidden sm:block">
            Narrow the list by status or activity, or group the rows.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="task-status-filter">Status</FieldLabel>
              <Select
                value={status}
                onValueChange={(value) => {
                  if (isTaskStatusFilter(value)) onStatusChange(value);
                }}
              >
                <SelectTrigger id="task-status-filter" className="w-full min-h-11 sm:min-h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {FIELD_TASK_STATUSES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {STATUS_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="task-activity-filter">Activity</FieldLabel>
              <Select
                value={activity}
                onValueChange={(value) => {
                  if (isTaskActivityFilter(value)) onActivityChange(value);
                }}
              >
                <SelectTrigger id="task-activity-filter" className="w-full min-h-11 sm:min-h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All activities</SelectItem>
                  {FIELD_TASK_ACTIVITIES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {activityLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="task-group-by">Group by</FieldLabel>
              <Select
                value={groupBy}
                onValueChange={(value) => {
                  if (isTaskGroupBy(value)) onGroupByChange(value);
                }}
              >
                <SelectTrigger id="task-group-by" className="w-full min-h-11 sm:min-h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="field">Field</SelectItem>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="officer">Officer</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </div>
        <SheetFooter className="border-t">
          <Button type="button" variant="outline" className="min-h-11 sm:min-h-9" onClick={onReset}>
            Reset
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
