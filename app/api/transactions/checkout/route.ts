import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { checkout } from "@/services/transaction/transaction.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DeliveryMethod } from "@/prisma/generated/prisma/enums";

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return sendResponse({
        success: false,
        message: "Unauthorized",
        status: 401,
      });
    }

    const body = await req.json();

    const {
      address,
      voucherCode,
      customerEmailGuest,
      customerNameGuest,
      deliveryMethod,
      shopId,
      countryIsoCode,
      provinceCode,
      cityCode,
      subDistrictCode,
      villageCode,
      postalCode,
      courierCode,
      shippingFee,
    } = body;

    if (deliveryMethod === DeliveryMethod.SHIP) {
      if (!address?.trim()) {
        return sendResponse({
          success: false,
          message: "Shipping address is required",
          status: 400,
        });
      }
      if (!courierCode) {
        return sendResponse({
          success: false,
          message: "Courier service is required",
          status: 400,
        });
      }
    }

    if (deliveryMethod === DeliveryMethod.PICKUP && !shopId) {
      return sendResponse({
        success: false,
        message: "Pickup shop is required",
        status: 400,
      });
    }

    const transaction = await checkout({
      userId: session.user.id,
      deliveryMethod,
      customerName: session.user.name || customerNameGuest,
      customerEmail: session.user.email || customerEmailGuest,

      voucherCode: voucherCode || null,

      address: deliveryMethod === DeliveryMethod.SHIP ? address : null,
      countryIsoCode: deliveryMethod === DeliveryMethod.SHIP ? countryIsoCode : null,
      provinceCode: deliveryMethod === DeliveryMethod.SHIP ? provinceCode : null,
      cityCode: deliveryMethod === DeliveryMethod.SHIP ? cityCode : null,
      subDistrictCode: deliveryMethod === DeliveryMethod.SHIP ? subDistrictCode : null,
      villageCode: deliveryMethod === DeliveryMethod.SHIP ? villageCode : null,
      postalCode: deliveryMethod === DeliveryMethod.SHIP ? postalCode : null,
      courierCode: deliveryMethod === DeliveryMethod.SHIP ? courierCode : null,
      shippingFee: deliveryMethod === DeliveryMethod.SHIP ? Number(shippingFee) : 0,

      shopId: deliveryMethod === DeliveryMethod.PICKUP ? shopId : null,
    });

    return sendResponse({
      success: true,
      message: "Checkout successful",
      data: transaction,
      status: 201,
    });
  } catch (err: any) {
    if (
      err.message === "Your cart is empty." ||
      err.message.includes("Insufficient stock") ||
      err.message.includes("Invalid voucher") ||
      err.message.includes("Voucher out of stock") ||
      err.message.includes("Min. purchase")
    ) {
      return sendResponse({
        success: false,
        message: err.message,
        status: 400,
      });
    }

    return handleApiError(err);
  }
};
