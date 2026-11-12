import { t } from '../i18n';

// "5 min ago", "3 h ago", "yesterday", "4 days ago"
export function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return t('ago.now');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t('ago.min', { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('ago.hours', { n: hours });
  const days = Math.floor(hours / 24);
  return days === 1 ? t('ago.yesterday') : t('ago.days', { n: days });
}
