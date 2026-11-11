import type { PriorityKey, StatusKey } from '../theme';

// Shape of a task as the mobile app uses it.
// Later this comes from GET /api/me/tasks (Tasks + ChecklistItems tables).
export type TaskStatus = Exclude<StatusKey, 'overdue'>; // overdue is worked out from the deadline

export type Task = {
  id: number;
  number: string; // e.g. TSK-2041
  title: string;
  description: string;
  priority: PriorityKey;
  status: TaskStatus;
  isNew: boolean; // assigned but not accepted yet
  startDate: string; // ISO date
  deadline: string; // ISO date
  checklistDone: number;
  checklistTotal: number;
  filesCount: number;
  createdBy: string;
  department: string;
  taskType: string;
  approvalLevels: number; // how many approvals this task type needs
  currentLevel: number; // 0 = not submitted yet
  reviewerName?: string;
  reviewerNote?: string;
};

export type Dashboard = {
  dueToday: number;
  inProgress: number;
  toFix: number;
  newCount: number;
  attention: Task[]; // corrections + overdue
  today: Task[]; // due today (not already in attention)
};
