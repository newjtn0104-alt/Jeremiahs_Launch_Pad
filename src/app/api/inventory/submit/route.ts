import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.location || !body.date) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert into database
    const { data, error } = await supabase
      .from("inventory_submissions")
      .insert({
        employee_name: body.name,
        location: body.location,
        date: body.date,
        items: body.items,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to save inventory" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submission: data,
    });
  } catch (error) {
    console.error("Error submitting inventory:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit inventory" },
      { status: 500 }
    );
  }
}
