import { NextResponse } from "next/server";
import { getSubmissions } from "@/lib/inventory-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("from");
    const dateTo = searchParams.get("to");
    
    // Fetch all submissions
    let submissions = getSubmissions();
    
    // Filter by date if provided
    if (dateFrom || dateTo) {
      submissions = submissions.filter(sub => {
        const subDate = new Date(sub.createdAt);
        if (dateFrom && subDate < new Date(dateFrom)) return false;
        if (dateTo && subDate > new Date(dateTo)) return false;
        return true;
      });
    }
    
    // Group by submissionId
    const groupedSubmissions = submissions.reduce((acc, item) => {
      if (!acc[item.submissionId]) {
        acc[item.submissionId] = {
          submissionId: item.submissionId,
          formId: item.formId,
          respondedAt: item.respondedAt,
          createdAt: item.createdAt,
          items: [],
        };
      }
      acc[item.submissionId].items.push({
        id: item.id,
        itemName: item.itemName,
        count: item.count,
      });
      return acc;
    }, {} as Record<string, any>);
    
    return NextResponse.json({
      success: true,
      submissions: Object.values(groupedSubmissions),
    });
    
  } catch (error) {
    console.error("Error fetching inventory:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch inventory submissions",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
