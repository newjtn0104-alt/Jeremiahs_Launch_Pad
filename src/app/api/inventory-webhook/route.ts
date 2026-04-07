import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    console.log("Webhook received:", JSON.stringify(payload, null, 2));
    
    // Extract fields from Tally webhook
    const fields = payload.data?.fields || [];
    
    console.log(`Processing ${fields.length} fields`);
    
    // Process each field and store in Supabase
    const storedItems = [];
    
    for (const field of fields) {
      console.log(`Field: ${field.label}, Type: ${field.type}, Value: ${field.value}`);
      
      // Skip empty values
      if (field.value === null || field.value === undefined || field.value === "") {
        console.log(`Skipping ${field.label} - empty value`);
        continue;
      }
      
      // Try to parse as number
      const count = parseFloat(String(field.value));
      
      // Skip if not a valid number or is 0
      if (isNaN(count) || count === 0) {
        console.log(`Skipping ${field.label} - invalid or zero count: ${count}`);
        continue;
      }
      
      console.log(`Storing ${field.label}: ${count}`);
      
      // Store in Supabase
      const { data, error } = await supabase
        .from("inventory_submissions")
        .insert({
          item_name: field.label,
          count: count,
          submission_id: payload.data.submissionId,
          form_id: payload.data.formId,
          responded_at: payload.data.createdAt,
        })
        .select()
        .single();
      
      if (error) {
        console.error("Supabase insert error:", error);
        continue;
      }
      
      storedItems.push(data);
      console.log(`Stored successfully: ${data.id}`);
    }
    
    console.log(`Total stored: ${storedItems.length} items`);
    
    return NextResponse.json(
      { 
        success: true, 
        message: `Stored ${storedItems.length} items`,
        items: storedItems 
      }, 
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Inventory webhook error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to process inventory submission",
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

// Handle GET requests for testing
export async function GET() {
  return NextResponse.json(
    { message: "Inventory webhook endpoint is active. Send POST requests from Tally." },
    { status: 200 }
  );
}
