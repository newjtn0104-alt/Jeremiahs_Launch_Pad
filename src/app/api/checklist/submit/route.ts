import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received checklist submission:", {
      name: body.name,
      location: body.location,
      date: body.date,
      itemCount: Object.keys(body.items || {}).length,
    });

    // Validate required fields
    if (!body.name || !body.location || !body.date) {
      console.log("Missing required fields");
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check payload size (Vercel has 4.5MB limit)
    const payloadSize = JSON.stringify(body).length;
    console.log("Payload size:", payloadSize, "bytes");
    if (payloadSize > 4000000) { // 4MB limit
      return NextResponse.json(
        { success: false, error: "Payload too large. Please reduce photo sizes." },
        { status: 413 }
      );
    }

    // Insert into database
    const { data, error } = await supabase
      .from("daily_checklists")
      .insert({
        employee_name: body.name,
        location: body.location,
        date: body.date,
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

    console.log("Successfully saved checklist:", data);
    return NextResponse.json({
      success: true,
      submission: data,
    });
  } catch (error) {
    console.error("Error submitting checklist:", error);
    return NextResponse.json(
      { success: false, error: "Server error: " + (error as Error).message },
      { status: 500 }
    );
  }
}
