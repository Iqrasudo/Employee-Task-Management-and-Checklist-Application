// TEMPORARY mock notification service. Each function names the real API it will call later.
// On a real phone, push notifications (Firebase) will add to this list too.
import { mockNotifications } from '../data/mockNotifications';
import type { AppNotification } from '../types/notification';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value));

let list: AppNotification[] = copy(mockNotifications);

// ---------- Unread count, shared by the tab badge and the Home bell ----------
type Listener = (unread: number) => void;
const listeners = new Set<Listener>();
const unreadCount = () => list.filter((n) => !n.read).length;

function emit() {
  const n = unreadCount();
  listeners.forEach((listener) => listener(n));
}

// Call the listener now and every time the unread count changes. Returns an "unsubscribe" function.
export function subscribeUnread(listener: Listener): () => void {
  listeners.add(listener);
  listener(unreadCount());
  return () => {
    listeners.delete(listener);
  };
}

// ---------- API ----------

// Later: GET /api/me/notifications
export async function getNotifications(): Promise<AppNotification[]> {
  await wait(600);
  return copy([...list].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()));
}

// Later: PATCH /api/notifications/{id}/read
export async function markRead(id: number): Promise<void> {
  const n = list.find((x) => x.id === id);
  if (!n || n.read) return;
  n.read = true;
  emit(); // update badges straight away
  await wait(200);
}

// Later: PATCH /api/notifications/read-all
export async function markAllRead(): Promise<void> {
  list = list.map((n) => ({ ...n, read: true }));
  emit();
  await wait(400);
}
