import type { PriorityKey, StatusKey } from '../theme';

// Shape of a task as the mobile app uses it.
// Later this comes from the API (Tasks, ChecklistItems, Comments, Attachments, TaskActivities tables).
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

export type ChecklistItem = { id: number; text: string; required: boolean; done: boolean };

export type TaskComment = { id: number; author: string; role: string; body: string; at: string; mine: boolean };

export type FileKind = 'image' | 'pdf' | 'doc' | 'sheet' | 'other';

export type Attachment = {
  id: number;
  name: string;
  kind: FileKind;
  sizeKb: number;
  uploadedBy: string;
  at: string;
  mine: boolean;
  uri?: string; // local file on the phone (only for files picked in this session)
};

export type ActivityItem = { id: number; text: string; at: string };

export type ApprovalDecision = 'approved' | 'current' | 'corrections' | 'waiting';

export type ApprovalStep = { level: number; role: string; name: string; decision: ApprovalDecision };

export type TaskDetail = Task & {
  checklist: ChecklistItem[];
  comments: TaskComment[];
  attachments: Attachment[];
  activity: ActivityItem[];
  approvals: ApprovalStep[];
};

export type Dashboard = {
  dueToday: number;
  inProgress: number;
  toFix: number;
  newCount: number;
  attention: Task[]; // corrections + overdue
  today: Task[]; // due today (not already in attention)
};
