import { useEffect, useState } from 'react';
import { subscribeUnread } from '../services/notifications';

// Number of unread notifications. Updates by itself when something is marked as read.
export function useUnreadCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => subscribeUnread(setCount), []);
  return count;
}
