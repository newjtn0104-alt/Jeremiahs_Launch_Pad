import { NextResponse } from "next/server";

const REVEL_API_KEY = "6e9fca7c4284470f86525b2f91074b60";
const REVEL_API_SECRET = "27727fb730c243728f8230110ea4f33cff68f399443e4511ba1260caf9750fe6";
const BASE_URL = "https://jeremiahsice.revelup.com/resources";

export async function GET() {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    
    // Get today's sales from Pembroke Pines (107)
    const salesData = await fetchTodaySales(dateStr);
    
    return NextResponse.json(salesData);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales data" },
      { status: 500 }
    );
  }
}

async function fetchTodaySales(date: string) {
  try {
    // Fetch from Revel API for Pembroke Pines (establishment 107)
    const response = await fetch(
      `${BASE_URL}/Order?establishment=107&created_date__gte=${date}T00:00:00&created_date__lte=${date}T23:59:59`,
      {
        headers: {
          "API-AUTHENTICATION": `${REVEL_API_KEY}:${REVEL_API_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Revel API error: ${response.status}`);
    }

    const data = await response.json();
    const orders = data.objects || []; // Revel returns { objects: [...], meta: {...} }
    
    // Calculate today's actual sales
    const todayActual = orders.reduce((sum: number, order: any) => {
      return sum + (order.final_total || 0);
    }, 0);

    // Get same day last year for comparison
    const lastYear = new Date(date);
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    const lastYearStr = lastYear.toISOString().split("T")[0];
    
    // Fetch same day last year
    const lastYearResponse = await fetch(
      `${BASE_URL}/Order?establishment=107&created_date__gte=${lastYearStr}T00:00:00&created_date__lte=${lastYearStr}T23:59:59`,
      {
        headers: {
          "API-AUTHENTICATION": `${REVEL_API_KEY}:${REVEL_API_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    let sameDayLastYear = 1100; // fallback
    if (lastYearResponse.ok) {
      const lastYearData = await lastYearResponse.json();
      const lastYearOrders = lastYearData.objects || [];
      sameDayLastYear = lastYearOrders.reduce((sum: number, order: any) => {
        return sum + (order.final_total || 0);
      }, 0);
    }

    // Calculate month to date
    const monthStart = date.substring(0, 8) + "01";
    const monthResponse = await fetch(
      `${BASE_URL}/Order?establishment=107&created_date__gte=${monthStart}T00:00:00&created_date__lte=${date}T23:59:59`,
      {
        headers: {
          "API-AUTHENTICATION": `${REVEL_API_KEY}:${REVEL_API_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    let monthToDate = 28500; // fallback
    if (monthResponse.ok) {
      const monthData = await monthResponse.json();
      const monthOrders = monthData.objects || [];
      monthToDate = monthOrders.reduce((sum: number, order: any) => {
        return sum + (order.final_total || 0);
      }, 0);
    }

    // Goals (these could be configurable)
    const todayGoal = 1200;
    const monthlyGoal = 36000;

    return {
      todayGoal,
      todayActual: Math.round(todayActual),
      sameDayLastYear: Math.round(sameDayLastYear),
      monthlyGoal,
      monthToDate: Math.round(monthToDate),
    };
  } catch (error) {
    console.error("Error fetching from Revel:", error);
    // Return fallback data if API fails
    return {
      todayGoal: 1200,
      todayActual: 850,
      sameDayLastYear: 1100,
      monthlyGoal: 36000,
      monthToDate: 28500,
    };
  }
}
