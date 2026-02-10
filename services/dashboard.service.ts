import prisma from "@/lib/prisma";
import { TransactionStatus } from "@/prisma/generated/prisma/client";

const successStatuses: TransactionStatus[] = ["PAID", "PROCESSED", "SHIPPED", "COMPLETED"];

export const getDashboardOverview = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const LOW_STOCK_THRESHOLD = 5;

  const [revenueAgg, transactionCount, activeUsers, lowStockCount] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        status: { in: successStatuses },
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    }),

    prisma.transaction.count({
      where: {
        status: { in: successStatuses },
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    }),

    prisma.transaction.findMany({
      where: {
        status: { in: successStatuses },
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      distinct: ["userId"],
      select: {
        userId: true,
      },
    }),

    prisma.card.count({
      where: {
        stock: {
          lte: LOW_STOCK_THRESHOLD,
        },
        isActive: true,
      },
    }),
  ]);

  return {
    revenue: Number(revenueAgg._sum.totalPrice || 0),
    transactions: transactionCount,
    activeUsers: activeUsers.length,
    lowStock: lowStockCount,
  };
};

export const getRevenueChart = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const transactions = await prisma.transaction.findMany({
    where: {
      status: { in: successStatuses },
      createdAt: { gte: thirtyDaysAgo },
    },
    select: {
      createdAt: true,
      totalPrice: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const revenueMap: Record<string, number> = {};

  transactions.forEach((t) => {
    const dateStr = t.createdAt.toISOString().split("T")[0];
    revenueMap[dateStr] = (revenueMap[dateStr] || 0) + Number(t.totalPrice);
  });

  const chartData = Object.entries(revenueMap).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  return chartData;
};

export const getTopProducts = async () => {
  const items = await prisma.transactionItem.groupBy({
    by: ["productName"],
    _sum: {
      quantity: true,
    },
    where: {
      transaction: {
        status: { in: successStatuses },
      },
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: 5,
  });

  return items.map((item) => ({
    name: item.productName,
    sold: item._sum.quantity || 0,
  }));
};

export const getCategoryStats = async () => {
  const soldItems = await prisma.transactionItem.findMany({
    where: {
      transaction: { status: { in: successStatuses } },
      card: { isNot: null },
    },
    include: {
      card: {
        include: {
          categories: {
            include: { category: true },
          },
        },
      },
    },
  });

  const categoryMap: Record<string, number> = {};

  soldItems.forEach((item) => {
    if (item.card?.categories) {
      item.card.categories.forEach((catRel) => {
        const catName = catRel.category.name;
        categoryMap[catName] = (categoryMap[catName] || 0) + Number(item.subTotal);
      });
    }
  });

  return Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));
};

export const getRecentTransactions = async () => {
  const transactions = await prisma.transaction.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      user: { select: { name: true, email: true } },
      customerName: true,
      totalPrice: true,
      status: true,
      createdAt: true,
    },
  });

  return transactions.map((t) => ({
    id: t.id,
    user: t.user?.name || t.customerName || t.user?.email || "Guest",
    total: Number(t.totalPrice),
    status: t.status,
    date: t.createdAt.toISOString(),
  }));
};
