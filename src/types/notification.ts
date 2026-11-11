// One in-app notification. Later this comes from GET /api/me/notifications (Notifications table).
export type NotificationType =
  | 'assigned' // a new task was given to you
  | 'corrections' // reviewer asked you to fix something
  | 'approved' // task approved (a level or final)
  | 'rejected' // task rejected and closed
  | 'reminder' // deadline is close
  | 'overdue' // deadline passed
  | 'comment' // someone commented on your task
  | 'reassigned'; // task moved to or from you

export type AppNotification = {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  taskId?: number; // opens this task when tapped
  at: string; // ISO date
  read: boolean;
};
