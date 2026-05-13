import { TransactionStatus } from "@/prisma/generated/prisma/enums";

export const CONSTANT = {
  ROLE_ADMIN_NAME: "Administrator",
  ROLE_GUEST_NAME: "Guest",
};

export const ALLOWED_NEXT_STATUS: Record<string, string[]> = {
  PENDING: [TransactionStatus.PAID, TransactionStatus.CANCELLED, TransactionStatus.FAILED],
  PAID: [TransactionStatus.PROCESSED, TransactionStatus.REFUNDED, TransactionStatus.SHIPPED],
  PROCESSED: [TransactionStatus.SHIPPED, TransactionStatus.REFUNDED],
  SHIPPED: [TransactionStatus.COMPLETED, TransactionStatus.REFUNDED],
  COMPLETED: [TransactionStatus.REFUNDED],
  CANCELLED: [],
  FAILED: [],
  REFUNDED: [],
};

export const FAILED_STATUSES: TransactionStatus[] = [TransactionStatus.CANCELLED, TransactionStatus.FAILED, TransactionStatus.EXPIRED];
