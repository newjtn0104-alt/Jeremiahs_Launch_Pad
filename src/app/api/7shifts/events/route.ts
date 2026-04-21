import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch 7shifts events calendar from server side (no CORS issues)
    const response = await fetch(
      "https://app.7shifts.com/page/calendar/events/128416/66efb332161525df991291a30a0ce3a4",
      {
        headers: {
          "Accept": "text/calendar, text/plain, */*",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const icalData = await response.text();

    return NextResponse.json({
      success: true,
      data: icalData,
    });
  } catch (error) {
    console.error("Error fetching 7shifts events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
