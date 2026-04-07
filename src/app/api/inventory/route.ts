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
      .order("created_at", { ascending: false });
    
    // Apply date filters if provided
    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo);
    }
    
    const { data: submissions, error } = await query;
    
    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }
    
    // Group by submission_id
    const groupedSubmissions = (submissions || []).reduce((acc, item) => {
      if (!acc[item.submission_id]) {
        acc[item.submission_id] = {
          submissionId: item.submission_id,
          formId: item.form_id,
          respondedAt: item.responded_at,
          createdAt: item.created_at,
          items: [],
        };
      }
      acc[item.submission_id].items.push({
        id: item.id,
        itemName: item.item_name,
        count: item.count,
      });
      return acc;
    }, {} as Record<string, any>);
    
    return NextResponse.json({
      success: true,
      submissions: Object.values(groupedSubmissions),
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
