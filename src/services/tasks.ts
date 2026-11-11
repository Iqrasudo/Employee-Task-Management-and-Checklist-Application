// TEMPORARY mock task service. Each function names the real API it will call later.
import { mockTasks } from '../data/mockTasks';
import type { Dashboard, Task } from '../types/task';
import { isDueToday, isOverdue } from '../utils/date';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory copy so later steps (accept, submit) can change it.
const tasks: Task[] = mockTasks.map((t) => ({ ...t }));

const byDeadline = (a: Task, b: Task) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime();

// Later: GET /api/me/tasks
export async function getMyTasks(): Promise<Task[]> {
  await wait(700);
  return [...tasks].sort(byDeadline);
}

// Later: GET /api/tasks/{id}
export async function getTask(id: number): Promise<Task | undefined> {
  await wait(400);
  return tasks.find((t) => t.id === id);
}

// Later: GET /api/me/dashboard
export async function getDashboard(): Promise<Dashboard> {
  await wait(700);
  const open = tasks.filter((t) => t.status !== 'approved' && t.status !== 'rejected');
  const attention = open.filter((t) => t.status === 'corrections' || isOverdue(t)).sort(byDeadline);
  const today = open.filter((t) => isDueToday(t.deadline) && !attention.includes(t)).sort(byDeadline);

  return {
    dueToday: open.filter((t) => isDueToday(t.deadline)).length,
    inProgress: open.filter((t) => t.status === 'inProgress').length,
    toFix: open.filter((t) => t.status === 'corrections').length,
    newCount: open.filter((t) => t.isNew).length,
    attention,
    today,
  };
}
