import { Prisma } from "@/prisma/generated/prisma/client";
import { DeliveryMethod } from "@/prisma/generated/prisma/enums";

export interface CreateTransactionParams {
  userId: string;
  customerName?: string;
  customerEmail?: string;
  voucherCode?: string;
  shopId?: string;
  deliveryMethod: DeliveryMethod;
  address: string;
  paymentMethod?: string;
}

export interface GetTransactionParams {
  skip?: number;
  take?: number;
  orderBy?: Prisma.TransactionOrderByWithRelationInput;
  where?: Prisma.TransactionWhereInput;
}

export interface ShipTransactionParams {
  resi: string;
  expedition: string;
  shippingCost?: number;
}
