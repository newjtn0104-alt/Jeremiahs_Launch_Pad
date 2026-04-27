import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST reorder employees
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { success: false, error: "Invalid updates array" },
        { status: 400 }
      );
    }

    // Update each employee's sort_order
    for (const update of updates) {
      const { error } = await supabase
        .from("employees")
        .update({ sort_order: update.sort_order })
        .eq("id", update.id);

      if (error) {
        console.error("Error updating employee sort_order:", error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in reorder employees API:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
