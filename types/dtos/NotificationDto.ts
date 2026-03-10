export type NotificationDto = {
  id: string;
  title: string;
  message: string;
  url?: string;
  isRead: boolean;
  createdAt: string;
};
