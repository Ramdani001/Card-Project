export const CONSTANT = {
  ROLE_ADMIN_NAME: "Administrator",
  ROLE_GUEST_NAME: "Guest",
};

export const ALLOWED_NEXT_STATUS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED", "FAILED"],
  PAID: ["PROCESSED", "REFUNDED", "SHIPPED"],
  PROCESSED: ["SHIPPED", "REFUNDED"],
  SHIPPED: ["COMPLETED", "REFUNDED"],
  COMPLETED: ["REFUNDED"],
  CANCELLED: [],
  FAILED: [],
  REFUNDED: [],
};
