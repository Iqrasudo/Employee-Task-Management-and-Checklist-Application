// TEMPORARY mock login. When the ASP.NET Core API is ready, this function
// will call POST /api/auth/login instead. Screens will not need to change.

export type Role = 'Employee' | 'Supervisor' | 'AssistantManager' | 'Manager' | 'HR' | 'Admin';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  department: string;
};

export class AuthError extends Error {}

let MOCK_PASSWORD = 'Password@123'; // changes when you use "Change password" (until the app restarts)

const MOCK_USERS: AuthUser[] = [
  { id: 12, name: 'Ayesha Khan', email: 'ayesha@company.com', role: 'Employee', department: 'Operations' },
  { id: 11, name: 'Bilal Ahmed', email: 'bilal@company.com', role: 'Supervisor', department: 'Operations' },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Later: POST /api/auth/activate  { email, token, password }
export async function activateAccount(email: string, token: string, password: string): Promise<void> {
  await wait(900);
  if (!token) throw new AuthError('This activation link is not valid. Ask HR to send a new one.');
  if (token === 'expired') throw new AuthError('This activation link has expired. Ask HR to send a new one.');
  void email;
  void password;
}

// Later: POST /api/auth/forgot-password  { email }
// Always succeeds, so nobody can find out which emails have accounts.
export async function requestPasswordReset(email: string): Promise<void> {
  await wait(900);
  void email;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  await new Promise((resolve) => setTimeout(resolve, 900)); // pretend network delay

  const user = MOCK_USERS.find((u) => u.email === email.trim().toLowerCase());

  // Same message for wrong email or wrong password, so nobody can guess which emails exist.
  if (!user || password !== MOCK_PASSWORD) {
    throw new AuthError('Email or password is incorrect.');
  }
  return user;
}

// Later: POST /api/auth/change-password  { currentPassword, newPassword }
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  if (currentPassword !== MOCK_PASSWORD) throw new AuthError('Your current password is not correct.');
  if (newPassword === currentPassword) throw new AuthError('The new password must be different from the current one.');
  MOCK_PASSWORD = newPassword;
}
