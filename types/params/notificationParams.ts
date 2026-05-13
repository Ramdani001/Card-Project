import { NotificationType } from "@/prisma/generated/prisma/enums";

export type CreateNotificationParams = {
  toUserId: string;
  title: string;
  message: string;
  type: NotificationType;
  url?: string;
  metadata?: any;
};

export type CreateNotificationByCodeParams = {
  notificationCode: string;
  title: string;
  message: string;
  type: NotificationType;
  url?: string | null;
  metadata?: any;
};
