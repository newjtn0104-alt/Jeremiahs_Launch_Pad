import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://jeremiahsice.worldmanager.com/admin/modules/calendar/icalFeed.php?auth=950be48249416ae5c2cf8928fd4e0fb6611ed16da3487",
      {
        headers: {
          Accept: "text/calendar",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch calendar: ${response.status}`);
    }

    const icalData = await response.text();

    return new NextResponse(icalData, {
      headers: {
        "Content-Type": "text/calendar",
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar data" },
      { status: 500 }
    );
  }
}
