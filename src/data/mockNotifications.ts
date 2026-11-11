import type { AppNotification } from '../types/notification';

const ago = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

// FAKE notifications for Ayesha Khan. They point at the mock tasks in mockTasks.ts.
export const mockNotifications: AppNotification[] = [
  {
    id: 1,
    type: 'assigned',
    title: 'New task: Weekly stock count',
    body: 'Bilal Ahmed gave you a new task. Accept or decline it.',
    taskId: 2050,
    at: ago(1),
    read: false,
  },
  {
    id: 2,
    type: 'reminder',
    title: 'Due today: Vendor invoices reconciliation',
    body: 'This task is due today at 11:00 PM. 3 of 5 checklist items are done.',
    taskId: 2046,
    at: ago(2),
    read: false,
  },
  {
    id: 3,
    type: 'corrections',
    title: 'Corrections needed: Monthly stock audit',
    body: 'Bilal Ahmed: "Please attach the signed count sheet before resubmitting."',
    taskId: 2041,
    at: ago(5),
    read: false,
  },
  {
    id: 4,
    type: 'assigned',
    title: 'New task: Safety drill sign-off',
    body: 'Nadia Rehman gave you a new task. It is due today.',
    taskId: 2048,
    at: ago(6),
    read: true,
  },
  {
    id: 5,
    type: 'overdue',
    title: 'Overdue: Shelf labelling · Aisle 4',
    body: 'The deadline has passed. Finish it as soon as you can; Bilal Ahmed has been told.',
    taskId: 2038,
    at: ago(28),
    read: false,
  },
  {
    id: 6,
    type: 'comment',
    title: 'New comment on Cold store temperature log',
    body: 'Bilal Ahmed: "Checking the readings now."',
    taskId: 2033,
    at: ago(30),
    read: true,
  },
  {
    id: 7,
    type: 'approved',
    title: 'Approved: Fleet fuel report · October',
    body: 'Hamza Malik gave the final approval. Well done.',
    taskId: 2029,
    at: ago(110),
    read: true,
  },
];
