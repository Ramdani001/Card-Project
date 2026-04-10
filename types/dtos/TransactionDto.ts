import { VoucherDto } from "./VoucherDto";

export interface TransactionItemDto {
  id: string;
  transactionId: string;
  cardId: string;
  productName: string;
  productPrice: string | number;
  quantity: number;
  subTotal: string | number;
  skuSnapshot: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StatusLogDto {
  id: string;
  transactionId: string;
  status: string;
  previousStatus: string | null;
  note: string | null;
  createdBy: string;
  createdAt: string;
}

export interface TransactionDto {
  id: string;
  invoice: string;
  userId: string;
  subTotal: string | number;
  voucherAmount: string | number;
  totalPrice: string | number;
  status: "PENDING" | "PAID" | "PROCESSED" | "SHIPPED" | "COMPLETED" | "CANCELLED" | "FAILED";
  paymentMethod: string | null;
  snapToken: string | null;
  snapRedirect: string | undefined;
  customerName: string | null;
  customerEmail: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  voucherId: string | null;
  expedition: string | null;
  resi: string | null;
  shippingCost: string | number;

  items: TransactionItemDto[];
  statusLogs?: StatusLogDto[];
  user: {
    name: string;
    email: string;
  } | null;
  voucher?: VoucherDto | null;
}
