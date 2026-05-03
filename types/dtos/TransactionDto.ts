import { DeliveryMethod, TransactionStatus } from "@/prisma/generated/prisma/enums";
import { VoucherDto } from "./VoucherDto";
import { ShopDto } from "./ShopDto";

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
  status: TransactionStatus;
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
  deliveryMethod: DeliveryMethod;
  shopId: string | null;
  shop: ShopDto;
  note: string;

  items: TransactionItemDto[];
  statusLogs?: StatusLogDto[];
  user: {
    name: string;
    email: string;
  } | null;
  voucher?: VoucherDto | null;
}
