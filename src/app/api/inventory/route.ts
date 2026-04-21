import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("from");
    const dateTo = searchParams.get("to");

    // Build query
    let query = supabase
      .from("inventory_submissions")
      .select("*")
      .order("submitted_at", { ascending: false });

    // Apply date filters if provided
    if (dateFrom) {
      query = query.gte("date", dateFrom);
    }
    if (dateTo) {
      query = query.lte("date", dateTo);
    }

    const { data: submissions, error } = await query;

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch submissions: " + error.message },
        { status: 500 }
      );
    }

    // Format submissions for frontend
    const formattedSubmissions = (submissions || []).map((sub: any) => ({
      id: sub.id,
      employeeName: sub.employee_name,
      location: sub.location,
      date: sub.date,
      items: sub.items || {},
      submittedAt: sub.submitted_at,
    }));

    return NextResponse.json({
      success: true,
      submissions: formattedSubmissions,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch inventory submissions",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
