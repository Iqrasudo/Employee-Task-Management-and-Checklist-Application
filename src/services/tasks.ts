// TEMPORARY mock task service. Each function names the real API it will call later.
// Screens only talk to this file, so swapping in the real API later will not change the screens.
import { mockTasks } from '../data/mockTasks';
import { mockExtras, TaskExtras } from '../data/mockTaskDetails';
import type { ApprovalDecision, ApprovalStep, Dashboard, Task, TaskDetail } from '../types/task';
import { isDueToday, isOverdue } from '../utils/date';
import type { PickedFile } from '../utils/files';
import { t as tr, TKey } from '../i18n';

export class TaskError extends Error {}

const ME = 'Ayesha Khan';
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const now = () => new Date().toISOString();
let nextId = 1000;

// In-memory copies, so actions change what you see while testing.
const tasks: Task[] = mockTasks.map((t) => ({ ...t }));
const extras = new Map<number, TaskExtras>(Object.entries(mockExtras).map(([k, v]) => [Number(k), copy(v)]));

// Who approves at each level (later: from ApprovalChainLevels + the reporting tree).
const LADDER: { roleKey: TKey; name: string }[] = [
  { roleKey: 'ladder.supervisor', name: 'Bilal Ahmed' },
  { roleKey: 'ladder.asstManager', name: 'Nadia Rehman' },
  { roleKey: 'ladder.manager', name: 'Hamza Malik' },
];

function find(id: number): Task {
  const t = tasks.find((x) => x.id === id);
  if (!t) throw new TaskError(tr('task.err.notAvailable'));
  return t;
}

function extrasOf(id: number): TaskExtras {
  let e = extras.get(id);
  if (!e) {
    e = { checklist: [], comments: [], attachments: [], activity: [] };
    extras.set(id, e);
  }
  return e;
}

function log(id: number, text: string) {
  extrasOf(id).activity.unshift({ id: nextId++, text, at: now() });
}

function syncCounts(t: Task) {
  const e = extrasOf(t.id);
  t.checklistTotal = e.checklist.length;
  t.checklistDone = e.checklist.filter((i) => i.done).length;
  t.filesCount = e.attachments.length;
}

function approvalsFor(t: Task): ApprovalStep[] {
  return LADDER.slice(0, t.approvalLevels).map((person, i) => {
    const level = i + 1;
    let decision: ApprovalDecision = 'waiting';
    if (t.status === 'approved' || level < t.currentLevel) decision = 'approved';
    else if (level === t.currentLevel && t.status === 'pendingReview') decision = 'current';
    else if (level === t.currentLevel && t.status === 'corrections') decision = 'corrections';
    return { level, role: tr(person.roleKey), name: person.name, decision };
  });
}

// The employee can work on it: accepted, not submitted, not finished.
export function canEdit(t: Pick<Task, 'status' | 'isNew'>): boolean {
  return !t.isNew && (t.status === 'assigned' || t.status === 'inProgress' || t.status === 'corrections');
}

// Withdraw is allowed only while level 1 has not decided yet.
export function canWithdraw(t: Pick<Task, 'status' | 'currentLevel'>): boolean {
  return t.status === 'pendingReview' && t.currentLevel === 1;
}

const byDeadline = (a: Task, b: Task) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime();

// ---------- Reading ----------

// Later: GET /api/me/tasks
export async function getMyTasks(): Promise<Task[]> {
  await wait(700);
  tasks.forEach(syncCounts);
  return copy([...tasks].sort(byDeadline));
}

// Later: GET /api/tasks/{id}
export async function getTask(id: number): Promise<Task | undefined> {
  await wait(400);
  return tasks.find((t) => t.id === id);
}

// Later: GET /api/tasks/{id}  (with checklist, files, comments, approvals, activity)
export async function getTaskDetail(id: number): Promise<TaskDetail | null> {
  await wait(500);
  const t = tasks.find((x) => x.id === id);
  if (!t) return null;
  syncCounts(t);
  return copy({ ...t, ...extrasOf(id), approvals: approvalsFor(t) });
}

// Later: GET /api/me/dashboard
export async function getDashboard(): Promise<Dashboard> {
  await wait(700);
  tasks.forEach(syncCounts);
  const open = tasks.filter((t) => t.status !== 'approved' && t.status !== 'rejected');
  const attention = open.filter((t) => t.status === 'corrections' || isOverdue(t)).sort(byDeadline);
  const today = open.filter((t) => isDueToday(t.deadline) && !attention.includes(t)).sort(byDeadline);

  return copy({
    dueToday: open.filter((t) => isDueToday(t.deadline)).length,
    inProgress: open.filter((t) => t.status === 'inProgress').length,
    toFix: open.filter((t) => t.status === 'corrections').length,
    newCount: open.filter((t) => t.isNew).length,
    attention,
    today,
  });
}

// ---------- Actions ----------

// Later: POST /api/tasks/{id}/accept
export async function acceptTask(id: number): Promise<void> {
  await wait(600);
  const t = find(id);
  if (!t.isNew) throw new TaskError(tr('task.err.alreadyAccepted'));
  t.isNew = false;
  t.status = 'inProgress';
  log(id, tr('activity.accepted'));
}

// Later: POST /api/tasks/{id}/decline  { reason }
// The task goes back to the person who assigned it, so it leaves this employee's list.
export async function declineTask(id: number, reason: string): Promise<string> {
  await wait(700);
  const t = find(id);
  if (!t.isNew) throw new TaskError(tr('task.err.onlyNewDecline'));
  if (reason.trim().length < 10) throw new TaskError(tr('task.err.reasonShort'));
  tasks.splice(tasks.indexOf(t), 1);
  return t.createdBy;
}

// Later: PATCH /api/tasks/{id}/checklist/{itemId}
export async function toggleChecklistItem(id: number, itemId: number): Promise<void> {
  await wait(200);
  const t = find(id);
  if (!canEdit(t)) throw new TaskError(tr('task.err.checklistLocked'));
  const item = extrasOf(id).checklist.find((i) => i.id === itemId);
  if (!item) throw new TaskError(tr('task.err.itemGone'));
  item.done = !item.done;
  if (t.status === 'assigned') t.status = 'inProgress';
  syncCounts(t);
}

// Later: POST /api/tasks/{id}/comments  { body }
export async function addComment(id: number, body: string): Promise<void> {
  await wait(400);
  find(id);
  const text = body.trim();
  if (!text) throw new TaskError(tr('task.err.emptyComment'));
  extrasOf(id).comments.push({ id: nextId++, author: ME, role: tr('common.you'), body: text, at: now(), mine: true });
}

// Later: POST /api/tasks/{id}/attachments  (multipart upload)
export async function addAttachment(id: number, file: PickedFile): Promise<void> {
  await wait(900);
  const t = find(id);
  if (!canEdit(t)) throw new TaskError(tr('task.err.filesLocked'));
  extrasOf(id).attachments.push({
    id: nextId++,
    name: file.name,
    kind: file.kind,
    sizeKb: file.sizeKb,
    uploadedBy: ME,
    at: now(),
    mine: true,
    uri: file.uri,
  });
  syncCounts(t);
  log(id, tr('activity.uploaded', { name: file.name }));
}

// Later: DELETE /api/attachments/{attachmentId}
export async function removeAttachment(id: number, attachmentId: number): Promise<void> {
  await wait(500);
  const t = find(id);
  const e = extrasOf(id);
  const file = e.attachments.find((a) => a.id === attachmentId);
  if (!file) return;
  if (!file.mine || !canEdit(t)) throw new TaskError(tr('task.err.removeOwn'));
  e.attachments = e.attachments.filter((a) => a.id !== attachmentId);
  syncCounts(t);
  log(id, tr('activity.removed', { name: file.name }));
}

// Later: POST /api/tasks/{id}/submit  { note }
export async function submitTask(id: number, note?: string): Promise<void> {
  await wait(900);
  const t = find(id);
  if (!canEdit(t)) throw new TaskError(tr('task.err.cannotSubmit'));
  const missing = extrasOf(id).checklist.filter((i) => i.required && !i.done);
  if (missing.length) throw new TaskError(tr('task.err.requiredFirst', { items: missing.map((i) => i.text).join('، ') }));

  const resubmit = t.status === 'corrections';
  if (note?.trim()) extrasOf(id).comments.push({ id: nextId++, author: ME, role: tr('common.you'), body: note.trim(), at: now(), mine: true });
  t.status = 'pendingReview';
  t.currentLevel = 1;
  t.reviewerNote = undefined;
  t.reviewerName = undefined;
  log(id, resubmit ? tr('activity.resubmitted') : tr('activity.submitted'));
}

// Later: POST /api/tasks/{id}/withdraw
export async function withdrawTask(id: number): Promise<void> {
  await wait(600);
  const t = find(id);
  if (!canWithdraw(t)) throw new TaskError(tr('task.err.reviewStarted'));
  t.status = 'inProgress';
  t.currentLevel = 0;
  log(id, tr('activity.withdrew'));
}
