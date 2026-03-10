import { handleApiError } from "@/helpers/response.helper";
import { exportCardsToExcel } from "@/services/master/card.service";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const buffer = await exportCardsToExcel();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Data_Export_Cards_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
