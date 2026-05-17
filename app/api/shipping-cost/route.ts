import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const weight = searchParams.get("weight");

    if (!origin || !destination || !weight) {
      return NextResponse.json({ success: false, message: "Missing parameters" }, { status: 400 });
    }

    const apiKeyCOID = process.env.API_KEY_APICOID || "";
    const baseUrlCOID = process.env.BASE_URL_APICOID || "";

    const response = await fetch(
      `${baseUrlCOID}/expedition/shipping-cost?origin_village_code=${origin}&destination_village_code=${destination}&weight=${weight}`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          "X-API-CO-ID": apiKeyCOID,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        {
          success: false,
          message: `Vendor Error (${response.status}): ${errorText}`,
        },
        { status: response.status }
      );
    }

    const json = await response.json();
    return NextResponse.json({ success: true, data: json.data });
  } catch (error: any) {
    console.error("Catch Block Error:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};
