import { Notification } from '@renderer/domain/notification';
import { ID, NotificationDS } from '@renderer/services/storage';

export interface INotificationService {
  getNotifications: <T extends Notification>(where?: Partial<T>) => Promise<NotificationDS[]>;
  getLiveNotifications: <T extends Notification>(where?: Partial<T>) => NotificationDS[];
  addNotification: (notification: Notification) => Promise<ID>;
}
