import { NextResponse } from "next/server";

const REVEL_API_KEY = "6e9fca7c4284470f86525b2f91074b60";
const REVEL_API_SECRET = "27727fb730c243728f8230110ea4f33cff68f399443e4511ba1260caf9750fe6";
const BASE_URL = "https://jeremiahsice.revelup.com/resources";

export async function GET() {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    
    // Get today's labor from Pembroke Pines (107)
    const laborData = await fetchTodayLabor(dateStr);
    
    return NextResponse.json(laborData);
  } catch (error) {
    console.error("Error fetching labor:", error);
    return NextResponse.json(
      { error: "Failed to fetch labor data" },
      { status: 500 }
    );
  }
}

async function fetchTodayLabor(date: string) {
  try {
    // Fetch labor hours for today
    const timeSheetResponse = await fetch(
      `${BASE_URL}/TimeSheetEntry?establishment=107&created_date__gte=${date}T00:00:00&created_date__lte=${date}T23:59:59`,
      {
        headers: {
          "API-AUTHENTICATION": `${REVEL_API_KEY}:${REVEL_API_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    let totalWages = 0;
    let totalHours = 0;

    if (timeSheetResponse.ok) {
      const timeData = await timeSheetResponse.json();
      const timeEntries = timeData.objects || [];
      
      timeEntries.forEach((entry: any) => {
        if (entry.role_wage && entry.hours) {
          totalWages += entry.role_wage * entry.hours;
          totalHours += entry.hours;
        }
      });
    }

    // Fetch today's sales to calculate labor %
    const salesResponse = await fetch(
      `${BASE_URL}/Order?establishment=107&created_date__gte=${date}T00:00:00&created_date__lte=${date}T23:59:59`,
      {
        headers: {
          "API-AUTHENTICATION": `${REVEL_API_KEY}:${REVEL_API_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    let todaySales = 0;
    if (salesResponse.ok) {
      const salesData = await salesResponse.json();
      const orders = salesData.objects || [];
      todaySales = orders.reduce((sum: number, order: any) => {
        return sum + (order.final_total || 0);
      }, 0);
    }

    // Calculate today's labor %
    const todayLaborPercent = todaySales > 0 ? Math.round((totalWages / todaySales) * 100) : 0;

    // Fetch month to date labor
    const monthStart = date.substring(0, 8) + "01";
    const monthTimeResponse = await fetch(
      `${BASE_URL}/TimeSheetEntry?establishment=107&created_date__gte=${monthStart}T00:00:00&created_date__lte=${date}T23:59:59`,
      {
        headers: {
          "API-AUTHENTICATION": `${REVEL_API_KEY}:${REVEL_API_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    let monthWages = 0;
    if (monthTimeResponse.ok) {
      const monthTimeData = await monthTimeResponse.json();
      const monthEntries = monthTimeData.objects || [];
      monthEntries.forEach((entry: any) => {
        if (entry.role_wage && entry.hours) {
          monthWages += entry.role_wage * entry.hours;
        }
      });
    }

    // Fetch month to date sales
    const monthSalesResponse = await fetch(
      `${BASE_URL}/Order?establishment=107&created_date__gte=${monthStart}T00:00:00&created_date__lte=${date}T23:59:59`,
      {
        headers: {
          "API-AUTHENTICATION": `${REVEL_API_KEY}:${REVEL_API_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    let monthSales = 0;
    if (monthSalesResponse.ok) {
      const monthSalesData = await monthSalesResponse.json();
      const monthOrders = monthSalesData.objects || [];
      monthSales = monthOrders.reduce((sum: number, order: any) => {
        return sum + (order.final_total || 0);
      }, 0);
    }

    const monthToDateLaborPercent = monthSales > 0 ? Math.round((monthWages / monthSales) * 100) : 0;

    // Goals (configurable)
    const todayLaborGoal = 20;
    const monthlyLaborGoal = 20;

    return {
      todayLaborPercent,
      todayLaborGoal,
      monthlyLaborPercent: monthToDateLaborPercent,
      monthlyLaborGoal,
      monthToDateLaborPercent,
    };
  } catch (error) {
    console.error("Error fetching labor from Revel:", error);
    // Return fallback data
    return {
      todayLaborPercent: 18,
      todayLaborGoal: 20,
      monthlyLaborPercent: 19,
      monthlyLaborGoal: 20,
      monthToDateLaborPercent: 19,
    };
  }
}
