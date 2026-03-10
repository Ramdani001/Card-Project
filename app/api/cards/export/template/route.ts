import { handleApiError } from "@/helpers/response.helper";
import { generateCardTemplate } from "@/services/master/card.service";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const buffer = await generateCardTemplate();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="Template_Import_Cards.xlsx"',
      },
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
