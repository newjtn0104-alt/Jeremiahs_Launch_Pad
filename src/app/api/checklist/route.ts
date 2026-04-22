import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("from");
    const dateTo = searchParams.get("to");

    // Build query
    let query = supabase
      .from("daily_checklists")
      .select("*")
      .order("submitted_at", { ascending: false });

    // Apply date filters if provided
    if (dateFrom) {
      query = query.gte("date", dateFrom);
    }
    if (dateTo) {
      query = query.lte("date", dateTo);
    }

    const { data: checklists, error } = await query;

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch checklists: " + error.message },
        { status: 500 }
      );
    }

    // Format checklists
    const formattedChecklists = (checklists || []).map((sub: any) => ({
      id: sub.id,
      employeeName: sub.employee_name,
      location: sub.location,
      date: sub.date,
      items: sub.items || {},
      submittedAt: sub.submitted_at,
    }));

    return NextResponse.json({
      success: true,
      checklists: formattedChecklists,
    });
  } catch (error) {
    console.error("Error fetching checklists:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch checklists",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
