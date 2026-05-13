import prisma from "@/lib/prisma";
import { CreateNotificationByCodeParams, CreateNotificationParams } from "@/types/params/notificationParams";

export async function createNotificationByCode(params: CreateNotificationByCodeParams) {
  const roleNotifications = await prisma.roleNotification.findMany({
    where: {
      notificationCode: params.notificationCode,
    },
    select: {
      roleId: true,
    },
  });

  const roleIds = roleNotifications.map((r) => r.roleId);

  if (!roleIds.length) return { count: 0 };

  const users = await prisma.user.findMany({
    where: {
      roleId: {
        in: roleIds,
      },
    },
    select: {
      id: true,
    },
  });

  if (!users.length) return { count: 0 };

  return prisma.notification.createMany({
    data: users.map((user) => ({
      toUserId: user.id,
      title: params.title,
      message: params.message,
      type: params.type,
      url: params.url,
      metadata: params.metadata,
    })),
  });
}

export async function createNotification(params: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      toUserId: params.toUserId,
      title: params.title,
      message: params.message,
      type: params.type,
      url: params.url,
      metadata: params.metadata,
    },
  });
}

export async function getUserNotifications(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: {
      toUserId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: {
      toUserId: userId,
      isRead: false,
    },
  });
}

export async function markNotificationAsRead(notificationId: string) {
  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
    },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      toUserId: userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

export async function deleteNotification(notificationId: string) {
  return prisma.notification.delete({
    where: {
      id: notificationId,
    },
  });
}
