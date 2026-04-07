import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from("inventory_submissions")
      .select("count");
    
    if (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          hint: "Check if Supabase URL and Anon Key are set correctly in Vercel"
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Supabase connected successfully",
      count: data?.[0]?.count || 0,
      env: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
