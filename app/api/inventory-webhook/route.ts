import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface TallyField {
  key: string;
  label: string;
  type: string;
  value: string | number | null;
}

interface TallyWebhookPayload {
  eventId: string;
  eventType: string;
  createdAt: string;
  data: {
    responseId: string;
    submissionId: string;
    respondentId: string;
    formId: string;
    formName: string;
    createdAt: string;
    fields: TallyField[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload: TallyWebhookPayload = await request.json();
    
    // Extract fields from Tally webhook
    const { fields } = payload.data;
    
    // Process each field and store in database
    const submissions = [];
    
    for (const field of fields) {
      // Skip non-number fields or empty values
      if (field.type !== "NUMBER" || field.value === null || field.value === undefined || field.value === "") {
        continue;
      }
      
      const count = parseFloat(String(field.value));
      
      // Skip if count is 0 or invalid
      if (isNaN(count) || count === 0) {
        continue;
      }
      
      // Store in database
      const submission = await prisma.inventorySubmission.create({
        data: {
          itemName: field.label,
          count: count,
          submissionId: payload.data.submissionId,
          formId: payload.data.formId,
          respondedAt: new Date(payload.data.createdAt),
        },
      });
      
      submissions.push(submission);
    }
    
    console.log(`Stored ${submissions.length} inventory items from submission ${payload.data.submissionId}`);
    
    return NextResponse.json(
      { 
        success: true, 
        message: `Stored ${submissions.length} items`,
        submissions 
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
