// TEMPORARY mock profile & settings service. Each function names the real API it will call later.

export type Profile = {
  employeeCode: string;
  position: string;
  branch: string;
  manager: string; // the person this employee reports to
  phone: string;
  joined: string; // ISO date
  delegate?: { name: string; until: string }; // someone covering for this employee during leave
};

export type Language = 'en' | 'ar';

export type Preferences = {
  language: Language;
  push: boolean; // phone notifications
  emailNewTask: boolean;
  emailCorrections: boolean;
  emailApprovals: boolean;
  emailReminders: boolean;
  dailySummary: boolean;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const profile: Profile = {
  employeeCode: 'EMP-10452',
  position: 'Senior Stock Officer',
  branch: 'Head Office · Lahore',
  manager: 'Bilal Ahmed',
  phone: '+92 300 1234567',
  joined: new Date(2024, 2, 4).toISOString(),
};

let preferences: Preferences = {
  language: 'en',
  push: true,
  emailNewTask: true,
  emailCorrections: true,
  emailApprovals: false,
  emailReminders: true,
  dailySummary: false,
};

// Later: GET /api/me
export async function getProfile(): Promise<Profile> {
  await wait(500);
  return { ...profile };
}

// Later: GET /api/me/preferences
export async function getPreferences(): Promise<Preferences> {
  await wait(300);
  return { ...preferences };
}

// Later: PATCH /api/me/preferences  (only the changed fields)
export async function updatePreferences(changes: Partial<Preferences>): Promise<Preferences> {
  await wait(400);
  preferences = { ...preferences, ...changes };
  return { ...preferences };
}
