import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Fetch all par settings
export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from("par_settings")
      .select("*");

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch par settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: settings || [],
    });
  } catch (error) {
    console.error("Error fetching par settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch par settings" },
      { status: 500 }
    );
  }
}

// POST - Save par settings
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid settings data" },
        { status: 400 }
      );
    }

    // Convert settings object to array of records
    const records = Object.entries(settings).map(([item_id, par_level]) => ({
      item_id,
      par_level: parseInt(par_level as string) || 0,
    }));

    // Upsert records (insert or update)
    const { error } = await supabase
      .from("par_settings")
      .upsert(records, { onConflict: "item_id" });

    if (error) {
      console.error("Supabase upsert error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to save par settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
    });
  } catch (error) {
    console.error("Error saving par settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save par settings" },
      { status: 500 }
    );
  }
}
