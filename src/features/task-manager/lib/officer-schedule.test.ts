import { describe, expect, it } from 'vitest';
import {
  buildOfficerSchedule,
  formatScheduleDay,
} from '@/features/task-manager/lib/officer-schedule';
import type { FieldTask } from '@/features/task-manager/types';

function task(overrides: Partial<FieldTask> = {}): FieldTask {
  return {
    id: 'task-1',
    fieldId: 'field-b',
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
      id: 'field-b',
      name: 'South plot',
      acres: '1.000',
      farmerId: 'farmer-1',
    },
    plantation: { id: 'plantation-1', startDate: '2026-11-01', endDate: null },
    assignedOfficer: { id: 'officer-1', name: 'Deepak Satwal', email: 'deepak@example.com' },
    ...overrides,
  };
}

describe('officer schedule', () => {
  const names = new Map([['farmer-1', 'Abhi Singh']]);

  it('keeps fields in first-seen order and uses inclusive start and end dates', () => {
    const schedule = buildOfficerSchedule(
      [
        task(),
        task({
          id: 'task-2',
          fieldId: 'field-a',
          activityType: 'DEHAULMING',
          startDate: '2026-11-06',
          endDate: '2026-11-10',
          field: { id: 'field-a', name: 'North plot', acres: '2', farmerId: 'farmer-1' },
        }),
        task({
          id: 'task-3',
          activityType: 'STRIP_TEST_POST_DEHAULMING',
          startDate: '2026-11-10',
          endDate: '2026-11-10',
        }),
      ],
      names,
      '2026-10-25',
    );

    const fields = schedule.tasks.filter((item) => item.type === 'summary');
    expect(fields.map((item) => item.fieldName)).toEqual(['South plot', 'North plot']);
    expect(fields[0]?.rowNumber).toBe(1);
    expect(formatScheduleDay(schedule.start)).toBe('2026-11-01');
    expect(formatScheduleDay(schedule.end)).toBe('2026-11-10');
    expect(schedule.todayInRange).toBe(false);

    const lastBar = fields[0]?.activities?.find((item) => item.id === 'task-3');
    const firstBar = fields[0]?.activities?.find((item) => item.id === 'task-1');
    expect(firstBar?.left).toBe(0);
    expect((lastBar?.left ?? 0) + (lastBar?.width ?? 0)).toBeCloseTo(100);
    expect(schedule.tasks.find((item) => item.id === 'task-2')?.end?.getDate()).toBe(10);
  });

  it('leaves a gap when the next activity starts after the previous one ends', () => {
    const schedule = buildOfficerSchedule(
      [
        task({ startDate: '2026-11-01', endDate: '2026-11-03' }),
        task({
          id: 'task-2',
          activityType: 'DEHAULMING',
          startDate: '2026-11-06',
          endDate: '2026-11-08',
        }),
      ],
      names,
      '2026-10-25',
    );
    const bars = schedule.tasks.find((item) => item.type === 'summary')?.activities ?? [];
    const first = bars.find((item) => item.id === 'task-1');
    const second = bars.find((item) => item.id === 'task-2');

    expect(second && first ? second.left : 0).toBeGreaterThan(
      (first?.left ?? 0) + (first?.width ?? 0),
    );
    expect(second).toMatchObject({
      fieldName: 'South plot',
      rowNumber: 1,
      startDate: '2026-11-06',
      endDate: '2026-11-08',
    });
  });

  it('treats today as inside the range on the first and last day', () => {
    const inside = buildOfficerSchedule([task()], names, '2026-11-01');
    const lastDay = buildOfficerSchedule([task()], names, '2026-11-05');
    const after = buildOfficerSchedule([task()], names, '2026-11-06');

    expect(inside.todayInRange).toBe(true);
    expect(lastDay.todayInRange).toBe(true);
    expect(after.todayInRange).toBe(false);
  });
});
