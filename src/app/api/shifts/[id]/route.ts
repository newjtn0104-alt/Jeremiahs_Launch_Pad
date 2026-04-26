import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// PUT update shift
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const { data, error } = await supabase
      .from("shifts")
      .update({
        employee_id: body.employee_id,
        date: body.date,
        start_time: body.start_time,
        end_time: body.end_time,
        store: body.store,
        status: body.status,
        notes: body.notes,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating shift:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, shift: data });
  } catch (error) {
    console.error("Error in update shift API:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

// DELETE shift
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
