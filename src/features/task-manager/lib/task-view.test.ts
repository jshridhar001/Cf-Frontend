import { describe, expect, it } from 'vitest';
import {
  isOverdue,
  matchesTaskSearch,
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

  it('matches search across task, field, farmer, and officer', () => {
    const names = new Map([['farmer-1', 'Abhi Singh']]);
    const south = toTaskListItem(
      task({
        id: 'task-2',
        activityType: 'DEHAULMING',
        status: 'DONE',
        dueDate: '2026-11-13',
        field: { id: 'field-2', name: 'South plot', acres: '1', farmerId: 'farmer-1' },
      }),
      names,
      '2026-10-25',
    );
    const north = toTaskListItem(task(), names, '2026-10-25');

    expect(matchesTaskSearch(south, 'south')).toBe(true);
    expect(matchesTaskSearch(north, 'south')).toBe(false);
    expect(matchesTaskSearch(north, 'anita')).toBe(true);
    expect(north.activityLabel).toBe('Rouging');
    expect(north.farmerName).toBe('Abhi Singh');
    expect(north.status.label).toBe('Pending');
    expect(north.dueLabel).toBe('5 Nov 2026');
  });

  it('labels an overdue pending task separately from a pending task', () => {
    const names = new Map([['farmer-1', 'Abhi Singh']]);
    const overdue = toTaskListItem(task({ dueDate: '2026-10-24' }), names, '2026-10-25');
    expect(overdue.status.label).toBe('Overdue');
  });
});
