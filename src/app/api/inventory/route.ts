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

    // Format submissions - handle both old Tally format and new format
    const formattedSubmissions = (submissions || []).map((sub: any) => {
      // Check if this is old Tally format (has submission_id) or new format (has employee_name)
      if (sub.submission_id) {
        // Old Tally format - convert to new format
        const itemsMap = new Map();
        
        // Group by submission_id and process items
        submissions
          .filter((s: any) => s.submission_id === sub.submission_id)
          .forEach((item: any) => {
            if (!itemsMap.has(item.item_name) || item.id > itemsMap.get(item.item_name).id) {
              itemsMap.set(item.item_name, item);
            }
          });

        return {
          id: sub.submission_id,
          employeeName: sub.submitter_name || "Unknown",
          location: sub.location || "Unknown",
          date: sub.responded_at ? sub.responded_at.split('T')[0] : sub.created_at.split('T')[0],
          items: Object.fromEntries(
            Array.from(itemsMap.values()).map((item: any) => [item.item_name, item.count])
          ),
          submittedAt: sub.created_at,
          isLegacy: true,
        };
      } else {
        // New format
        return {
          id: sub.id,
          employeeName: sub.employee_name,
          location: sub.location,
          date: sub.date,
          items: sub.items || {},
          submittedAt: sub.submitted_at,
          isLegacy: false,
        };
      }
    });

    // Remove duplicates for legacy format (same submission_id appears multiple times)
    const uniqueSubmissions = formattedSubmissions.filter((sub, index, self) => 
      index === self.findIndex((s) => s.id === sub.id)
    );

    return NextResponse.json({
      success: true,
      submissions: uniqueSubmissions,
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
