import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log detailed info
    const payloadSize = JSON.stringify(body).length;
    const photoCount = Object.values(body.items || {}).filter((item: any) => item.photo).length;
    console.log("Checklist submission:", {
      name: body.name,
      location: body.location,
      date: body.date,
      itemCount: Object.keys(body.items || {}).length,
      photoCount,
      payloadSizeKB: Math.round(payloadSize / 1024),
    });

    // Validate required fields
    if (!body.name || !body.location || !body.date) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check payload size (Vercel has 4.5MB limit)
    if (payloadSize > 4500000) {
      console.error("Payload too large:", payloadSize, "bytes");
      return NextResponse.json(
        { 
          success: false, 
          error: `Payload too large (${Math.round(payloadSize/1024)}KB). Maximum is 4.5MB. Please retake photos with lower quality.` 
        },
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

    console.log("Successfully saved checklist:", data.id);
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
