import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET shifts for a date range
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");
    const store = searchParams.get("store");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Start and end dates required" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("shifts")
      .select(`
        *,
        employee:employees(id, first_name, last_name, role)
      `)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (store) {
      query = query.eq("store", store);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching shifts:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, shifts: data });
  } catch (error) {
    console.error("Error in shifts API:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

// POST create new shift
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.employee_id || !body.date || !body.start_time || !body.end_time || !body.store) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("shifts")
      .insert({
        employee_id: body.employee_id,
        date: body.date,
        start_time: body.start_time,
        end_time: body.end_time,
        store: body.store,
        status: body.status || "scheduled",
        notes: body.notes,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating shift:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, shift: data });
  } catch (error) {
    console.error("Error in create shift API:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

// DELETE shift
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Shift ID required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("shifts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting shift:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete shift API:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
