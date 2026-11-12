// Helpers for the month calendar. Weeks start on Monday.
import { dayName, monthName, t } from '../i18n';

const pad = (n: number) => String(n).padStart(2, '0');

// "2026-11-12" in the phone's local time (not UTC), so late-evening deadlines land on the right day.
export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function monthTitle(year: number, month: number): string {
  return `${monthName(month)} ${year}`;
}

export function longDate(d: Date): string {
  return `${dayName(d.getDay())}${t('punct.comma')} ${d.getDate()} ${monthName(d.getMonth())}`;
}

// 6 rows × 7 days, including the grey days from the months before and after.
export function monthMatrix(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday = 0
  const start = new Date(year, month, 1 - offset);
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d));
    }
    weeks.push(week);
  }
  return weeks;
}
