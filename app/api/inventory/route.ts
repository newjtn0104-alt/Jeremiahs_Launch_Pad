import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const dateFrom = searchParams.get("from");
    const dateTo = searchParams.get("to");
    
    // Build where clause
    const where: any = {};
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }
    
    // Fetch submissions grouped by submissionId
    const submissions = await prisma.inventorySubmission.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
    
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
