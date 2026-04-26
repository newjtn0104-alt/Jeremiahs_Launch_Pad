import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET all employees
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("active", true)
      .order("last_name", { ascending: true });

    if (error) {
      console.error("Error fetching employees:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, employees: data });
  } catch (error) {
    console.error("Error in employees API:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

// POST create new employee
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.first_name || !body.last_name || !body.email || !body.store) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("employees")
      .insert({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        password_hash: body.password_hash || "temp_password",
        role: body.role || "employee",
        store: body.store,
        wage: body.wage || 11.00,
        active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating employee:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, employee: data });
  } catch (error) {
    console.error("Error in create employee API:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
