import { ALLOWED_NEXT_STATUS } from "@/constants";
import { getTransactionById } from "@/services/transaction.service";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const transaction = await getTransactionById(id);

    if (!transaction) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }

    const currentStatus = transaction.status;

    const validNextStatuses = ALLOWED_NEXT_STATUS[currentStatus] || [];

    const options = [currentStatus, ...validNextStatuses];

    const uniqueOptions = Array.from(new Set(options));

    return NextResponse.json({
      success: true,
      data: uniqueOptions,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};
