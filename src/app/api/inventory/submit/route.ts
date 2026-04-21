import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received inventory submission:", body);

    // Validate required fields
    if (!body.name || !body.location || !body.date) {
      console.log("Missing required fields");
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert into database - use submission_date instead of date
    const { data, error } = await supabase
      .from("inventory_submissions")
      .insert({
        employee_name: body.name,
        location: body.location,
        submission_date: body.date,
        items: body.items || {},
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { success: false, error: "Database error: " + error.message },
        { status: 500 }
      );
    }

    console.log("Successfully saved submission:", data);
    return NextResponse.json({
      success: true,
      submission: data,
    });
  } catch (error) {
    console.error("Error submitting inventory:", error);
    return NextResponse.json(
      { success: false, error: "Server error: " + (error as Error).message },
      { status: 500 }
    );
  }
}
