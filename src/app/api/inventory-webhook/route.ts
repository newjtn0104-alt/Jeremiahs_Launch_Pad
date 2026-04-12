import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    console.log("Webhook received:", JSON.stringify(payload, null, 2));
    
    // Extract fields from Tally webhook
    const fields = payload.data?.fields || [];
    
    // Find name and location fields for the submission title
    let submitterName = "";
    let location = "";
    
    // Look for name/location fields (they might be text fields, not numbers)
    for (const field of fields) {
      const label = field.label?.toLowerCase() || "";
      if (label.includes("name") && !label.includes("item")) {
        submitterName = String(field.value || "");
      }
      if (label.includes("location")) {
        location = String(field.value || "");
      }
    }
    
    // Create submission title
    const submissionTitle = submitterName && location 
      ? `${submitterName} - ${location}`
      : submitterName || location || `Submission ${payload.data.submissionId.slice(0, 8)}`;
    
    console.log(`Submitter: ${submitterName}, Location: ${location}`);
    console.log(`Title: ${submissionTitle}`);
    
    // Process each field and store in Supabase
    const storedItems = [];
    
    for (const field of fields) {
      console.log(`Field: ${field.label}, Type: ${field.type}, Value: ${field.value}`);
      
      // Skip empty values and non-inventory fields (name, location, date)
      const label = field.label?.toLowerCase() || "";
      if (label.includes("name") || label.includes("location") || label.includes("date")) {
        console.log(`Skipping ${field.label} - metadata field`);
        continue;
      }
      
      if (field.value === null || field.value === undefined || field.value === "") {
        console.log(`Skipping ${field.label} - empty value`);
        continue;
      }
      
      // Try to parse as number
      const count = parseFloat(String(field.value));
      
      // Skip if not a valid number (but ALLOW zero - critical for inventory!)
      if (isNaN(count)) {
        console.log(`Skipping ${field.label} - invalid number: ${field.value}`);
        continue;
      }
      
      // Log zero counts specially - these are critical out-of-stock alerts
      if (count === 0) {
        console.log(`🚨 ZERO COUNT ALERT: ${field.label} = 0 (OUT OF STOCK)`);
      }
      
      console.log(`Storing ${field.label}: ${count}`);
      
      // Store in Supabase with submission title
      const { data, error } = await supabase
        .from("inventory_submissions")
        .insert({
          item_name: field.label,
          count: count,
          submission_id: payload.data.submissionId,
          form_id: payload.data.formId,
          responded_at: payload.data.createdAt,
          submitter_name: submitterName,
          location: location,
          submission_title: submissionTitle,
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
        title: submissionTitle,
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
