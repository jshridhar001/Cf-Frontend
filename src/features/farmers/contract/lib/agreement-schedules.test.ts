import { describe, expect, it } from 'vitest';
import { B101_SCHEDULE, HIMALINI_SCHEDULE, resolveAgreementSchedule } from './agreement-schedules';

describe('resolveAgreementSchedule', () => {
  it('matches Himalini names, including Hindi', () => {
    expect(resolveAgreementSchedule('Kufri Himalini').id).toBe('himalini');
    expect(resolveAgreementSchedule('KUFRI HIMALINI').varietyDisplayEn).toBe(
      HIMALINI_SCHEDULE.varietyDisplayEn,
    );
    expect(resolveAgreementSchedule('कुफरी हिमालिनी').varietyBodyHi).toBe(
      HIMALINI_SCHEDULE.varietyBodyHi,
    );
  });

  it('matches B 101 name variants', () => {
    expect(resolveAgreementSchedule('B 101')).toEqual(B101_SCHEDULE);
    expect(resolveAgreementSchedule('b-101').id).toBe('b101');
    expect(resolveAgreementSchedule('B101').advanceRupees).toBe('25,000');
  });

  it('uses Himalini commercial terms for other varieties, with that variety name', () => {
    const schedule = resolveAgreementSchedule('Kufri Jyoti');
    expect(schedule.id).toBe('himalini');
    expect(schedule.advanceRupees).toBe(HIMALINI_SCHEDULE.advanceRupees);
    expect(schedule.varietyDisplayEn).toBe('KUFRI JYOTI');
    expect(schedule.varietyBodyHi).toBe('KUFRI JYOTI');
  });
});
