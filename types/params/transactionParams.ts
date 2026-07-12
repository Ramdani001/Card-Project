import { Prisma } from "@/prisma/generated/prisma/client";
import { DeliveryMethod } from "@/prisma/generated/prisma/enums";

export interface CreateTransactionParams {
  userId: string;
  customerName?: string;
  customerEmail?: string;
  voucherCodes?: string[];
  shopId?: string;
  deliveryMethod: DeliveryMethod;
  address: string;
  countryIsoCode?: string;
  provinceCode?: string;
  cityCode?: string;
  subDistrictCode?: string;
  villageCode?: string;
  postalCode?: string;
  paymentMethod?: string;
  courierCode?: string | null;
  courierName?: string | null;
  shippingFee?: number | null;
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
  courierCode: string;
  shippingCost?: number;
}
