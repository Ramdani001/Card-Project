import { ALLOWED_NEXT_STATUS, FAILED_STATUSES } from "@/constants";
import { logError } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { DeliveryMethod, DiscountType, NotificationType, Prisma, TransactionStatus, VoucherUsageCategory } from "@/prisma/generated/prisma/client";
import { CreateTransactionParams, GetTransactionParams, ShipTransactionParams } from "@/types/params/transactionParams";
import { sendTransactionReceipt } from "../system/email.service";
import { createNotificationByCode } from "./notification.service";
import { createPaymentToken } from "./payment.service";

export const checkout = async (params: CreateTransactionParams) => {
  const {
    userId,
    customerName,
    customerEmail,
    shopId,
    deliveryMethod,
    voucherCodes,
    address,
    countryIsoCode,
    provinceCode,
    cityCode,
    subDistrictCode,
    villageCode,
    postalCode,
    courierCode,
    shippingFee,
  } = params;

  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          card: { include: { categories: true } },
        },
      },
    },
  });

  if (!cart?.items.length) {
    throw new Error("Your cart is empty.");
  }

  for (const item of cart.items) {
    if (!item.card) throw new Error(`Missing product: ${item.id}`);

    if (item.card.maxQtyPurchase && item.quantity > item.card.maxQtyPurchase) {
      throw new Error(`Max purchase for '${item.card.name}' is ${item.card.maxQtyPurchase}`);
    }

    if (item.card.minQtyPurchase && item.quantity < item.card.minQtyPurchase) {
      throw new Error(`Min purchase for '${item.card.name}' is ${item.card.minQtyPurchase}`);
    }

    if (item.quantity <= 0) {
      throw new Error(`Invalid quantity for '${item.card.name}'`);
    }
  }

  let subTotal = 0;

  const prismaItemsPayload: Prisma.TransactionItemCreateWithoutTransactionInput[] = [];
  const midtransItemsPayload: any[] = [];

  const voucherCreatePayload: Prisma.TransactionVoucherCreateWithoutTransactionInput[] = [];

  for (const item of cart.items) {
    const price = Number(item.card!.price);
    const itemTotal = price * item.quantity;

    subTotal += itemTotal;

    prismaItemsPayload.push({
      card: { connect: { id: item.card!.id } },
      productName: item.card!.name,
      productPrice: item.card!.price,
      quantity: item.quantity,
      subTotal: new Prisma.Decimal(itemTotal),
      skuSnapshot: item.card!.sku,
    });

    midtransItemsPayload.push({
      id: item.card!.id.substring(0, 20),
      price,
      quantity: item.quantity,
      name: item.card!.name.substring(0, 50),
    });
  }

  const shippingCost = deliveryMethod === DeliveryMethod.SHIP ? Number(shippingFee || 0) : 0;
  let productDiscount = 0;
  let shippingDiscount = 0;

  const result = await prisma.$transaction(async (tx) => {
    let finalTotal = subTotal;

    if (voucherCodes?.length) {
      const vouchers = await tx.voucher.findMany({
        where: {
          code: { in: voucherCodes },
          isActive: true,
        },
        include: {
          voucherRoles: true,
          voucherCards: true,
          voucherCardCategories: true,
        },
      });

      if (!vouchers.length) throw new Error("Invalid voucher code.");

      const user = await tx.user.findUnique({ where: { id: userId } });

      const cartCardIds = cart.items.map((i) => i.cardId);
      const cartCategoryIds = cart.items.flatMap((i) => i.card!.categories.map((c) => c.categoryId));

      for (const voucher of vouchers) {
        const now = new Date();

        if (now < voucher.startDate || now > voucher.endDate) {
          throw new Error("Voucher not active.");
        }

        if (voucher.stock !== null && voucher.usedCount >= voucher.stock) {
          throw new Error("Voucher out of stock.");
        }

        if (voucher.minPurchase && subTotal < Number(voucher.minPurchase)) {
          throw new Error(`Min purchase Rp ${Number(voucher.minPurchase)}`);
        }

        if (voucher.voucherRoles.length > 0) {
          const allowed = voucher.voucherRoles.some((r) => r.roleId === user?.roleId);

          if (!allowed) {
            throw new Error("Voucher not allowed for your role.");
          }
        }

        const hasProductLimit = voucher.voucherCards.length > 0;
        const hasCategoryLimit = voucher.voucherCardCategories.length > 0;

        if (hasProductLimit || hasCategoryLimit) {
          const allowedByProduct = voucher.voucherCards.some((v) => cartCardIds.includes(v.cardId));

          const allowedByCategory = voucher.voucherCardCategories.some((v) => cartCategoryIds.includes(v.cardCategoryId));

          if (!allowedByProduct && !allowedByCategory) {
            throw new Error("Voucher not applicable to cart items.");
          }
        }

        const rawDiscount = voucher.type === DiscountType.NOMINAL ? Number(voucher.value) : subTotal * (Number(voucher.value) / 100);

        if (voucher.usageCategory === VoucherUsageCategory.CARD) {
          productDiscount += rawDiscount;

          if (voucher.maxDiscount) {
            productDiscount = Math.min(productDiscount, Number(voucher.maxDiscount));
          }

          productDiscount = Math.min(productDiscount, subTotal);

          finalTotal = subTotal - productDiscount;
        } else {
          shippingDiscount += rawDiscount;

          if (voucher.maxDiscount) {
            shippingDiscount = Math.min(shippingDiscount, Number(voucher.maxDiscount));
          }

          shippingDiscount = Math.min(shippingDiscount, shippingCost);
        }

        voucherCreatePayload.push({
          voucherCode: voucher.code,
          voucherAmount: rawDiscount,
          isActive: true,
          usageCategory: voucher.usageCategory,
          voucher: {
            connect: { id: voucher.id },
          },
        });

        await tx.voucher.update({
          where: { id: voucher.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    const finalShippingCost = Math.max(0, shippingCost - shippingDiscount);

    finalTotal = finalTotal + finalShippingCost;

    const invoiceNumber = `INV/${new Date().getFullYear()}/${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTransaction = await tx.transaction.create({
      data: {
        userId,
        invoice: invoiceNumber,
        subTotal: new Prisma.Decimal(subTotal),
        voucherAmount: new Prisma.Decimal(productDiscount),
        shippingVoucherAmount: new Prisma.Decimal(shippingDiscount),
        shippingCost: new Prisma.Decimal(finalShippingCost),
        expedition: courierCode || null,
        totalPrice: new Prisma.Decimal(Math.max(0, finalTotal)),
        status: TransactionStatus.PENDING,
        customerName,
        customerEmail,
        shopId,
        deliveryMethod,
        statusLogs: {
          create: {
            status: TransactionStatus.PENDING,
            note: "Checkout initiated",
            createdBy: userId,
          },
        },
        items: { create: prismaItemsPayload },
      },
    });

    if (deliveryMethod === DeliveryMethod.SHIP) {
      if (!countryIsoCode || !provinceCode || !cityCode || !subDistrictCode || !villageCode || !postalCode || !address || !courierCode) {
        throw new Error("Missing shipping data.");
      }

      const [country, province, city, subDistrict, village] = await Promise.all([
        tx.country.findFirst({ where: { isoCode: countryIsoCode } }),
        tx.province.findFirst({ where: { code: provinceCode } }),
        tx.city.findFirst({ where: { code: cityCode } }),
        tx.subDistrict.findFirst({ where: { code: subDistrictCode } }),
        tx.village.findFirst({ where: { code: villageCode } }),
      ]);

      await tx.transactionShipmentAddress.create({
        data: {
          transactionId: newTransaction.id,
          countryIsoCode: country?.isoCode || "-",
          countryName: country?.name || "-",
          provinceCode: province?.code || "-",
          provinceName: province?.name || "-",
          cityCode: city?.code || "-",
          cityName: city?.name || "-",
          subDistrictCode: subDistrict?.code || "-",
          subDistrictName: subDistrict?.name || "-",
          villageCode: village?.code || "-",
          villageName: village?.name || "-",
          postalCode,
          address,
        },
      });
    }

    for (const item of cart.items) {
      const updated = await tx.card.updateMany({
        where: {
          id: item.cardId,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      if (!updated.count) {
        throw new Error(`Insufficient stock for '${item.card!.name}'`);
      }
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    if (voucherCreatePayload.length) {
      for (const v of voucherCreatePayload) {
        await tx.transactionVoucher.create({
          data: {
            ...v,
            transaction: {
              connect: { id: newTransaction.id },
            },
          },
        });
      }
    }

    return {
      transaction: newTransaction,
      finalTotal: Math.max(1, Math.floor(finalTotal)),
    };
  });

  try {
    if (shippingCost > 0) {
      midtransItemsPayload.push({
        id: "SHIPPING",
        price: shippingCost,
        quantity: 1,
        name: `Shipping: ${courierCode}`,
      });
    }

    if (productDiscount > 0) {
      midtransItemsPayload.push({
        id: "DISCOUNT",
        price: -Math.floor(productDiscount),
        quantity: 1,
        name: "Product Discount",
      });
    }

    const payment = await createPaymentToken({
      id: result.transaction.id,
      totalPrice: result.finalTotal,
      customerName,
      customerEmail,
      items: midtransItemsPayload,
    });

    return await prisma.transaction.update({
      where: { id: result.transaction.id },
      data: {
        snapToken: payment.token,
        snapRedirect: payment.redirect_url,
        statusLogs: {
          create: {
            status: TransactionStatus.PENDING,
            note: "Payment link generated",
            createdBy: "SYSTEM",
          },
        },
      },
      include: { items: true },
    });
  } catch (error) {
    logError("TransactionService.checkout", error);
    return result.transaction;
  }
};

export const updateTransactionStatus = async (
  transactionId: string,
  status: TransactionStatus,
  options?: {
    note?: string;
    paymentMethod?: string;
    shippingData?: ShipTransactionParams;
    userId?: string;
  }
) => {
  const { note, paymentMethod, shippingData, userId = "SYSTEM" } = options || {};

  const result = await prisma.$transaction(async (tx) => {
    const oldTransaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      select: { status: true, voucherId: true, subTotal: true, voucherAmount: true, user: true },
    });

    if (!oldTransaction) throw new Error("Transaction not found");

    const updateData: Prisma.TransactionUpdateInput = {
      status,
      ...(paymentMethod && { paymentMethod }),
    };

    if (status === TransactionStatus.SHIPPED && shippingData) {
      const newShippingCost = shippingData.shippingCost || 0;
      const newTotalPrice = Number(oldTransaction.subTotal) - Number(oldTransaction.voucherAmount) + newShippingCost;

      updateData.resi = shippingData.resi;
      updateData.expedition = shippingData.expedition;
      updateData.shippingCost = new Prisma.Decimal(newShippingCost);
      updateData.totalPrice = new Prisma.Decimal(newTotalPrice);
    }

    const updatedTransaction = await tx.transaction.update({
      where: { id: transactionId },
      data: updateData,
      include: { items: true, user: true, voucher: true, shop: true, transactionShipmentAddress: true },
    });

    await tx.transactionStatusLog.create({
      data: {
        transactionId,
        status,
        previousStatus: oldTransaction.status,
        note: note || (status === TransactionStatus.SHIPPED ? `Sent via ${shippingData?.expedition}` : undefined),
        createdBy: userId,
      },
    });

    const isCancelled = FAILED_STATUSES.includes(status);
    const wasAlreadyCancelled = FAILED_STATUSES.includes(oldTransaction.status);

    if (isCancelled && !wasAlreadyCancelled) {
      const items = await tx.transactionItem.findMany({
        where: { transactionId },
        select: { cardId: true, quantity: true },
      });

      for (const item of items) {
        if (item.cardId) {
          await tx.card.update({
            where: { id: item.cardId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      if (oldTransaction.voucherId) {
        await tx.voucher.update({
          where: { id: oldTransaction.voucherId },
          data: { usedCount: { decrement: 1 } },
        });
      }
    }

    await createNotificationByCode({
      notificationCode: "TRANSACTION_NOTIF",
      title: "New Transaction",
      message: `Transaction ${updatedTransaction.invoice} created`,
      type: NotificationType.TRANSACTION,
      url: null,
      metadata: { transactionId: updatedTransaction.id },
    });

    return updatedTransaction;
  });

  sendTransactionReceipt(result);

  await createNotificationByCode({
    notificationCode: "TRANSACTION_NOTIF",
    title: "Transaction Status Updated",
    message: `Transaction ${result.invoice} updated to ${status}`,
    type: NotificationType.TRANSACTION,
    url: null,
    metadata: {
      transactionId: result.id,
      status,
    },
  });

  return result;
};

export const getTransactions = async (params: GetTransactionParams) => {
  const { skip, take, orderBy, where } = params;

  const whereClause: Prisma.TransactionWhereInput = {
    ...where,
  };

  const [total, transactions] = await prisma.$transaction([
    prisma.transaction.count({ where: whereClause }),
    prisma.transaction.findMany({
      where: whereClause,
      skip,
      take,
      orderBy: orderBy || { createdAt: "desc" },
      include: {
        items: true,
        voucher: true,
        statusLogs: { orderBy: { createdAt: "desc" }, take: 1 },
        user: { select: { email: true, name: true, phone: true } },
        shop: true,
        transactionShipmentAddress: true,
      },
    }),
  ]);

  return { transactions, total };
};

export const getUserTransactions = async (userId: string, params: GetTransactionParams) => {
  const { skip, take, orderBy, where } = params;

  const whereClause: Prisma.TransactionWhereInput = {
    userId,
    ...where,
  };

  const [total, transactions] = await prisma.$transaction([
    prisma.transaction.count({ where: whereClause }),
    prisma.transaction.findMany({
      where: whereClause,
      skip,
      take,
      orderBy: orderBy || { createdAt: "desc" },
      include: {
        items: true,
        voucher: true,
        statusLogs: { orderBy: { createdAt: "desc" }, take: 1 },
        user: { select: { email: true, name: true, phone: true } },
        shop: true,
        transactionShipmentAddress: true,
      },
    }),
  ]);

  return { transactions, total };
};

export const getHistoryTransactions = async (
  transactionId: string,
  params: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.TransactionStatusLogOrderByWithRelationInput;
    where?: Prisma.TransactionStatusLogWhereInput;
  }
) => {
  const { skip, take, orderBy, where } = params;

  const whereClause: Prisma.TransactionStatusLogWhereInput = {
    transactionId,
    ...where,
  };

  const [total, logs] = await prisma.$transaction([
    prisma.transactionStatusLog.count({ where: whereClause }),
    prisma.transactionStatusLog.findMany({
      where: whereClause,
      skip,
      take,
      orderBy: orderBy || { createdAt: "desc" },
    }),
  ]);

  const userIds = logs
    .map((log) => log.createdBy)
    .filter((id): id is string => {
      if (!id) return false;

      return true;
    });

  const uniqueUserIds = Array.from(new Set(userIds));

  const users = await prisma.user.findMany({
    where: {
      id: { in: uniqueUserIds },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  const enrichedLogs = logs.map((log) => {
    const userDetail = log.createdBy ? users.find((u) => u.id === log.createdBy) : null;

    return {
      ...log,
      user: userDetail || null,
    };
  });

  return { logs: enrichedLogs, total };
};

export const getTransactionById = async (id: string) => {
  if (!id) return null;

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      items: {
        include: { card: { select: { name: true, images: { take: 1 } } } },
      },
      voucher: true,
      statusLogs: { orderBy: { createdAt: "desc" } },
      user: { select: { name: true, email: true } },
      transactionShipmentAddress: true,
    },
  });

  if (!transaction) return null;

  return transaction;
};

export const batchCancelTransactions = async (
  transactionIds: string[],
  options?: {
    note?: string;
    userId?: string;
  }
) => {
  const { note, userId = "SYSTEM" } = options || {};

  if (!transactionIds || transactionIds.length === 0) {
    throw new Error("Select at least one transaction to cancel");
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const transactions = await tx.transaction.findMany({
        where: {
          id: { in: transactionIds },
        },
        include: {
          items: true,
          user: true,
        },
      });

      if (transactions.length === 0) {
        throw new Error("No transactions found");
      }

      const processedTransactions = [];

      for (const transaction of transactions) {
        const currentStatus = transaction.status;

        const allowedNext = ALLOWED_NEXT_STATUS[currentStatus] || [];

        if (!allowedNext.includes(TransactionStatus.CANCELLED)) {
          throw new Error(`Transaksi ${transaction.invoice} cannot be cancelled because the current status is ${currentStatus}`);
        }

        const updatedTx = await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: TransactionStatus.CANCELLED },
          include: {
            items: true,
            user: true,
            voucher: true,
            shop: true,
            transactionShipmentAddress: true,
          },
        });

        await tx.transactionStatusLog.create({
          data: {
            transactionId: transaction.id,
            status: TransactionStatus.CANCELLED,
            previousStatus: currentStatus,
            note: note || "Cancelled via batch system process",
            createdBy: userId,
          },
        });

        for (const item of transaction.items) {
          if (item.cardId) {
            await tx.card.update({
              where: { id: item.cardId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }

        if (transaction.voucherId) {
          await tx.voucher.update({
            where: { id: transaction.voucherId },
            data: { usedCount: { decrement: 1 } },
          });
        }

        processedTransactions.push(updatedTx);
      }

      return processedTransactions;
    },
    { timeout: 60000 }
  );

  for (const tx of result) {
    sendTransactionReceipt(tx);

    await createNotificationByCode({
      notificationCode: "TRANSACTION_NOTIF",
      title: "Transaction Canceled",
      message: `Transaction ${tx.invoice} has been cancelled`,
      type: NotificationType.TRANSACTION,
      url: null,
      metadata: {
        transactionId: tx.id,
        status: TransactionStatus.CANCELLED,
      },
    }).catch((err) => console.error(`Failed to create notification for ${tx.id}:`, err));
  }

  return {
    success: true,
    message: `${result.length} transaction successfully canceled.`,
    count: result.length,
  };
};
