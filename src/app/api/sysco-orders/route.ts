import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: orders, error } = await supabase
      .from("sysco_orders")
      .select("*")
      .order("order_date", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: orders || [],
    });
  } catch (error) {
    console.error("Error fetching Sysco orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from("sysco_orders")
      .insert({
        order_number: body.orderNumber,
        location: body.location,
        order_date: body.orderDate,
        expected_delivery: body.expectedDelivery,
        status: body.status || 'ordered',
        email_subject: body.emailSubject,
        total_amount: body.totalAmount,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: data,
    });
  } catch (error) {
    console.error("Error creating Sysco order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
