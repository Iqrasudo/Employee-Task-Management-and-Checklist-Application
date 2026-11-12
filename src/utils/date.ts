import type { Task } from '../types/task';
import { dayName, monthShort, t } from '../i18n';

const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function formatTime(d: Date): string {
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const hours = d.getHours() % 12 || 12;
  return `${hours}:${minutes} ${d.getHours() >= 12 ? t('time.pm') : t('time.am')}`;
}

export function formatDate(d: Date): string {
  return `${d.getDate()} ${monthShort(d.getMonth())}`;
}

export function friendlyToday(d = new Date()): string {
  return `${dayName(d.getDay())}${t('punct.comma')} ${d.getDate()} ${monthShort(d.getMonth())}`;
}

// Whole days between today and the date (negative = in the past)
export function dayDiff(iso: string, now = new Date()): number {
  return Math.round((startOfDay(new Date(iso)).getTime() - startOfDay(now).getTime()) / DAY_MS);
}

export function isDueToday(iso: string): boolean {
  return dayDiff(iso) === 0;
}

// Overdue = deadline passed and the employee still has to act on it.
export function isOverdue(task: Pick<Task, 'deadline' | 'status'>): boolean {
  if (task.status === 'approved' || task.status === 'rejected' || task.status === 'pendingReview') return false;
  return new Date(task.deadline).getTime() < Date.now();
}

export type DueTone = 'danger' | 'warning' | 'muted';

export function dueLabel(task: Pick<Task, 'deadline' | 'status'>): { text: string; tone: DueTone } {
  const d = new Date(task.deadline);
  if (task.status === 'approved') return { text: t('due.done', { date: formatDate(d) }), tone: 'muted' };
  if (isOverdue(task)) {
    const days = -dayDiff(task.deadline);
    return { text: days === 0 ? t('due.overdueToday') : t('due.overdueDays', { n: days }), tone: 'danger' };
  }
  const diff = dayDiff(task.deadline);
  if (diff === 0) return { text: t('due.today', { time: formatTime(d) }), tone: 'warning' };
  if (diff === 1) return { text: t('due.tomorrow', { time: formatTime(d) }), tone: 'warning' };
  return { text: t('due.on', { date: formatDate(d) }), tone: 'muted' };
}
