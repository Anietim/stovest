import { NextResponse } from "next/server";
import { fetchLiveNews } from "@/services/marketDataService";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const news = await fetchLiveNews();
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      dataSource: "Live African & Global Financial Feeds",
      status: "live",
      news,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error?.message || "Failed to fetch news",
      },
      { status: 500 }
    );
  }
}
