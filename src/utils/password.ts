// Password rules shown live while the user types. Keep these the same as the
// ASP.NET Core Identity password options on the backend.
import { t } from '../i18n';

export type PasswordRule = { id: string; readonly label: string; test: (value: string) => boolean };

export const passwordRules: PasswordRule[] = [
  { id: 'length', get label() { return t('pw.length'); }, test: (v) => v.length >= 8 },
  { id: 'upper', get label() { return t('pw.upper'); }, test: (v) => /[A-Z]/.test(v) },
  { id: 'number', get label() { return t('pw.number'); }, test: (v) => /\d/.test(v) },
  { id: 'symbol', get label() { return t('pw.symbol'); }, test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export const isStrongPassword = (value: string) => passwordRules.every((rule) => rule.test(value));

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
