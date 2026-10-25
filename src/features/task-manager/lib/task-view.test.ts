import { describe, expect, it } from 'vitest';
import {
  filterTasks,
  groupTaskPage,
  isOverdue,
  toTaskListItem,
} from '@/features/task-manager/lib/task-view';
import type { FieldTask } from '@/features/task-manager/types';

function task(overrides: Partial<FieldTask> = {}): FieldTask {
  return {
    id: 'task-1',
    fieldId: 'field-1',
    plantationId: 'plantation-1',
    assignedOfficerId: 'officer-1',
    activityType: 'ROUGING',
    status: 'PENDING',
    dueDate: '2026-11-05',
    name: 'Rouging',
    type: 'TASK',
    startDate: '2026-11-01',
    endDate: '2026-11-05',
    progress: 0,
    dependencies: null,
    project: null,
    completedRougingId: null,
    completedDehaulmingId: null,
    completedStripTestId: null,
    completedAt: null,
    createdAt: '2026-11-01T06:00:00.000Z',
    updatedAt: '2026-11-01T06:00:00.000Z',
    field: {
      id: 'field-1',
      name: 'North plot',
      acres: '2.500',
      farmerId: 'farmer-1',
    },
    plantation: { id: 'plantation-1', startDate: '2026-11-01', endDate: null },
    assignedOfficer: { id: 'officer-1', name: 'Anita Sharma', email: 'anita@example.com' },
    ...overrides,
  };
}

describe('task view', () => {
  it('marks a pending task overdue only when the due date is before today', () => {
    expect(isOverdue(task({ dueDate: '2026-10-24' }), '2026-10-25')).toBe(true);
    expect(isOverdue(task({ dueDate: '2026-10-25' }), '2026-10-25')).toBe(false);
    expect(isOverdue(task({ dueDate: '2026-10-24', status: 'DONE' }), '2026-10-25')).toBe(false);
  });

  it('filters by search, status, and activity without dropping due-date order', () => {
    const names = new Map([['farmer-1', 'Abhi Singh']]);
    const items = [
      toTaskListItem(task(), names, '2026-10-25'),
      toTaskListItem(
        task({
          id: 'task-2',
          activityType: 'DEHAULMING',
          status: 'DONE',
          dueDate: '2026-11-13',
          field: { id: 'field-2', name: 'South plot', acres: '1', farmerId: 'farmer-1' },
        }),
        names,
        '2026-10-25',
      ),
    ];

    expect(filterTasks(items, 'south', 'all', 'all').map((item) => item.task.id)).toEqual([
      'task-2',
    ]);
    expect(filterTasks(items, '', 'DONE', 'all')).toHaveLength(1);
    expect(filterTasks(items, '', 'all', 'ROUGING')).toHaveLength(1);
    expect(items[0]?.activityLabel).toBe('Rouging');
    expect(items[0]?.farmerName).toBe('Abhi Singh');
    expect(items[0]?.status.label).toBe('Pending');
  });

  it('groups a page without reordering tasks inside a group', () => {
    const names = new Map([['farmer-1', 'Abhi Singh']]);
    const items = [
      toTaskListItem(task({ id: 'a', dueDate: '2026-11-05' }), names),
      toTaskListItem(
        task({
          id: 'b',
          dueDate: '2026-11-09',
          field: { id: 'field-2', name: 'South plot', acres: '1', farmerId: 'farmer-1' },
        }),
        names,
      ),
      toTaskListItem(task({ id: 'c', dueDate: '2026-11-13', activityType: 'DEHAULMING' }), names),
    ];

    const groups = groupTaskPage(items, 'field');
    expect(groups.map((group) => group.label)).toEqual(['North plot', 'South plot']);
    expect(groups[0]?.items.map((item) => item.task.id)).toEqual(['a', 'c']);
  });
});
