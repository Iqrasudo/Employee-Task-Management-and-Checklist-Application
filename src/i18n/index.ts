// Tiny translation helper. All app text lives in en.ts and ar.ts.
// The chosen language is set once at start-up (and again when the user switches),
// so t() can be used anywhere: screens, components, utils and services.
import { I18nManager } from 'react-native';
import { ar } from './ar';
import { en, TKey } from './en';

export type Lang = 'en' | 'ar';
export type { TKey };

let current: Lang = 'en';
const tables: Record<Lang, Record<TKey, string>> = { en, ar };

export function setLang(lang: Lang) {
  current = lang;
}

export function getLang(): Lang {
  return current;
}

export const isArabic = () => current === 'ar';

// t('home.greeting', { name: 'Ayesha' }) → "Good evening, Ayesha"
export function t(key: TKey, vars?: Record<string, string | number>): string {
  let text = tables[current][key] ?? en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) text = text.split(`{${name}}`).join(String(value));
  }
  return text;
}

// Counted words. Arabic has a separate form for 2 ("مهمتان"), English uses the plural.
// tn('count.tasks', 3) → "3 tasks" / "3 مهام"
type CountBase<K = TKey> = K extends `${infer B}.one` ? B : never;
export function tn(base: CountBase, n: number): string {
  const form = n === 1 ? 'one' : n === 2 ? 'two' : 'many';
  return t(`${base}.${form}` as TKey, { n });
}

// Arrows that point "back" or "forward" must flip in right-to-left layouts.
export function chevron(direction: 'back' | 'forward'): 'chevron-back' | 'chevron-forward' {
  const flip = I18nManager.isRTL;
  if (direction === 'back') return flip ? 'chevron-forward' : 'chevron-back';
  return flip ? 'chevron-back' : 'chevron-forward';
}

const MONTHS: Record<Lang, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
};
const MONTHS_SHORT: Record<Lang, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ar: MONTHS.ar,
};
const DAYS: Record<Lang, string[]> = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
};
// Calendar header, Monday first
const WEEKDAYS_SHORT: Record<Lang, string[]> = {
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  ar: ['اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت', 'أحد'],
};

export const monthName = (m: number) => MONTHS[current][m];
export const monthShort = (m: number) => MONTHS_SHORT[current][m];
export const dayName = (d: number) => DAYS[current][d];
export const weekdaysShort = () => WEEKDAYS_SHORT[current];
