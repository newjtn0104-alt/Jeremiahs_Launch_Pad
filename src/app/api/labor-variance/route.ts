import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get("week_start");
    
    let query = supabase
      .from("labor_variance")
      .select("*")
      .order("variance", { ascending: true });
    
    if (weekStart) {
      query = query.eq("week_start", weekStart);
    } else {
      // Get most recent week
      query = query.order("week_start", { ascending: false }).limit(100);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch labor variance" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: data || [],
    });
    
  } catch (error) {
    console.error("Error fetching labor variance:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch labor variance" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from("labor_variance")
      .insert(body)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create labor variance entry" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data,
    });
    
  } catch (error) {
    console.error("Error creating labor variance:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create labor variance entry" },
      { status: 500 }
    );
  }
}
