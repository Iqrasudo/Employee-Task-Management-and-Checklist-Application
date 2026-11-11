// Password rules shown live while the user types. Keep these the same as the
// ASP.NET Core Identity password options on the backend.
export type PasswordRule = { id: string; label: string; test: (value: string) => boolean };

export const passwordRules: PasswordRule[] = [
  { id: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'upper', label: 'One capital letter (A–Z)', test: (v) => /[A-Z]/.test(v) },
  { id: 'number', label: 'One number (0–9)', test: (v) => /\d/.test(v) },
  { id: 'symbol', label: 'One symbol (like @ # !)', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export const isStrongPassword = (value: string) => passwordRules.every((rule) => rule.test(value));

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
