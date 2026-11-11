import type { ActivityItem, Attachment, ChecklistItem, TaskComment } from '../types/task';

// FAKE checklist, files, comments and history for each mock task. Replaced by the API later.
export type TaskExtras = {
  checklist: ChecklistItem[];
  comments: TaskComment[];
  attachments: Attachment[];
  activity: ActivityItem[];
};

const ago = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

// texts = item names, done = how many are ticked, required = positions that must be done before submit
const items = (texts: string[], done: number, required: number[] = []): ChecklistItem[] =>
  texts.map((text, i) => ({ id: i + 1, text, required: required.includes(i), done: i < done }));

export const mockExtras: Record<number, TaskExtras> = {
  2041: {
    checklist: items(
      ['Count shelves A1 to A12', 'Count shelves B1 to B9', 'Record damaged stock', 'Upload signed count sheet'],
      3,
      [3],
    ),
    comments: [
      { id: 1, author: 'Bilal Ahmed', role: 'Supervisor', body: 'Please attach the signed count sheet before resubmitting.', at: ago(5), mine: false },
      { id: 2, author: 'Ayesha Khan', role: 'You', body: 'Okay, I will upload it in the morning.', at: ago(3), mine: true },
    ],
    attachments: [
      { id: 1, name: 'stock-count-photo.jpg', kind: 'image', sizeKb: 1840, uploadedBy: 'Ayesha Khan', at: ago(30), mine: true },
    ],
    activity: [
      { id: 1, text: 'Bilal requested corrections', at: ago(5) },
      { id: 2, text: 'You submitted for review', at: ago(26) },
      { id: 3, text: 'You uploaded stock-count-photo.jpg', at: ago(30) },
      { id: 4, text: 'You accepted the task', at: ago(70) },
      { id: 5, text: 'Bilal created and assigned the task', at: ago(72) },
    ],
  },
  2046: {
    checklist: items(
      ['Download October invoices', 'Export purchase orders', 'Match invoices to orders', 'Flag differences', 'Write a short summary'],
      3,
      [4],
    ),
    comments: [],
    attachments: [
      { id: 1, name: 'invoices-october.xlsx', kind: 'sheet', sizeKb: 420, uploadedBy: 'Ayesha Khan', at: ago(20), mine: true },
      { id: 2, name: 'purchase-orders.xlsx', kind: 'sheet', sizeKb: 310, uploadedBy: 'Ayesha Khan', at: ago(19), mine: true },
    ],
    activity: [
      { id: 1, text: 'You uploaded 2 files', at: ago(19) },
      { id: 2, text: 'You accepted the task', at: ago(24) },
      { id: 3, text: 'Bilal created and assigned the task', at: ago(25) },
    ],
  },
  2048: {
    checklist: items(['Attend the fire drill', 'Sign the attendance sheet', 'Upload a photo of the signed sheet'], 0, [1, 2]),
    comments: [],
    attachments: [],
    activity: [{ id: 1, text: 'Nadia created and assigned the task', at: ago(6) }],
  },
  2038: {
    checklist: items(
      ['Remove old labels, rack 1', 'Remove old labels, rack 2', 'Print new barcode labels', 'Fix labels, rack 1', 'Fix labels, rack 2', 'Scan-test 10 labels'],
      2,
      [5],
    ),
    comments: [],
    attachments: [],
    activity: [
      { id: 1, text: 'You accepted the task', at: ago(140) },
      { id: 2, text: 'Bilal created and assigned the task', at: ago(144) },
    ],
  },
  2033: {
    checklist: items(['Monday reading', 'Tuesday reading', 'Wednesday reading', 'Thursday reading', 'Upload the log'], 5, [4]),
    comments: [],
    attachments: [
      { id: 1, name: 'temperature-log.pdf', kind: 'pdf', sizeKb: 260, uploadedBy: 'Ayesha Khan', at: ago(10), mine: true },
      { id: 2, name: 'freezer-display.jpg', kind: 'image', sizeKb: 1210, uploadedBy: 'Ayesha Khan', at: ago(10), mine: true },
    ],
    activity: [
      { id: 1, text: 'You submitted for review', at: ago(9) },
      { id: 2, text: 'You uploaded 2 files', at: ago(10) },
      { id: 3, text: 'You accepted the task', at: ago(90) },
    ],
  },
  2050: {
    checklist: items(['Count fast-moving items', 'Update the stock sheet'], 0, [1]),
    comments: [],
    attachments: [],
    activity: [{ id: 1, text: 'Bilal created and assigned the task', at: ago(2) }],
  },
  2029: {
    checklist: items(['Collect fuel receipts', 'Fill the fuel sheet', 'Upload the report'], 3, [2]),
    comments: [{ id: 1, author: 'Hamza Malik', role: 'Manager', body: 'Good work, approved.', at: ago(110), mine: false }],
    attachments: [
      { id: 1, name: 'fuel-report-october.pdf', kind: 'pdf', sizeKb: 540, uploadedBy: 'Ayesha Khan', at: ago(150), mine: true },
    ],
    activity: [
      { id: 1, text: 'Hamza gave final approval', at: ago(110) },
      { id: 2, text: 'Bilal approved level 1', at: ago(130) },
      { id: 3, text: 'You submitted for review', at: ago(150) },
    ],
  },
};
