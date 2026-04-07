import { NextResponse } from "next/server";

const REVEL_API_KEY = "6e9fca7c4284470f86525b2f91074b60";
const REVEL_API_SECRET = "27727fb730c243728f8230110ea4f33cff68f399443e4511ba1260caf9750fe6";
const BASE_URL = "https://jeremiahsice.revelup.com/resources";

async function apiGet(endpoint: string, params?: Record<string, any>) {
  const url = new URL(`${BASE_URL}/${endpoint}/`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      "API-AUTHENTICATION": `${REVEL_API_KEY}:${REVEL_API_SECRET}`,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// Calculate labor cost using SAME method as Revel Closing
function calculateLaborCost(timesheet: any[]) {
  let laborCost = 0;
  
  for (const entry of timesheet) {
    const wage = parseFloat(entry.role_wage || 0);
    if (wage === 0) continue; // Skip cashiers

    const clockIn = entry.clock_in;
    const clockOut = entry.clock_out;

    if (clockIn && clockOut) {
      const start = new Date(clockIn);
      const end = new Date(clockOut);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      laborCost += hours * wage;
    }
  }
  
  return laborCost;
}

// Calculate total payments using SAME method as Revel Closing
function calculateTotalPayments(payments: any[]) {
  let cash = 0;
  let credit = 0;
  let other = 0;
  let tips = 0;

  for (const payment of payments) {
    if (payment.payment_type === 4) continue; // Exclude refunds

    const amount = parseFloat(payment.amount || 0);
    const tip = parseFloat(payment.tip || 0) + parseFloat(payment.gratuity || 0);
    tips += tip;

    if (payment.payment_type === 1) {
      cash += amount;
    } else if (payment.payment_type === 2) {
      credit += amount;
    } else {
      other += amount;
    }
  }

  return cash + credit + other + tips;
}

// Fetch ALL payments with pagination
async function fetchAllPayments(estId: number, startDate: string, endDate: string) {
  const allPayments: any[] = [];
  let offset = 0;
  const limit = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const data = await apiGet("Payment", {
      establishment: estId,
      created_date__gte: `${startDate}T00:00:00`,
      created_date__lte: `${endDate}T23:59:59`,
      limit: limit,
      offset: offset,
    });
    
    const payments = data.objects || [];
    allPayments.push(...payments);
    
    if (payments.length < limit) {
      hasMore = false;
    } else {
      offset += limit;
    }
    
    // Safety limit
    if (offset >= 10000) {
      console.warn(`Payment fetch limit reached for ${startDate} to ${endDate}`);
      break;
    }
  }
  
  return allPayments;
}

async function fetchLaborData(estId: number, dateStr: string) {
  // Calculate dates
  const currentDate = new Date(dateStr);
  const monthStart = dateStr.substring(0, 8) + "01";
  
  // Last year same date for historical comparison
  const lastYearDate = new Date(currentDate);
  lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
  const lastYearStr = lastYearDate.toISOString().split("T")[0];
  const lastYearMonthStart = `${lastYearDate.getFullYear()}-${String(lastYearDate.getMonth() + 1).padStart(2, '0')}-01`;
  const lastYearMonthEndDate = new Date(lastYearDate.getFullYear(), lastYearDate.getMonth() + 1, 0);
  const lastYearMonthEnd = lastYearMonthEndDate.toISOString().split("T")[0];

  // Fetch TODAY'S timesheet and payments
  const [todayTimeData, todayPayments] = await Promise.all([
    apiGet("TimeSheetEntry", {
      establishment: estId,
      clock_in__gte: `${dateStr}T00:00:00`,
      clock_in__lte: `${dateStr}T23:59:59`,
      limit: 200,
    }),
    fetchAllPayments(estId, dateStr, dateStr),
  ]);

  const todayTimeEntries = todayTimeData.objects || [];
  const todayLaborCost = calculateLaborCost(todayTimeEntries);
  const todayTotalPayments = calculateTotalPayments(todayPayments);
  const todayLaborPercent = todayTotalPayments > 0 
    ? Math.round((todayLaborCost / todayTotalPayments) * 100) 
    : 0;

  // Fetch MONTH TO DATE timesheet and payments
  const [monthTimeData, monthPayments] = await Promise.all([
    apiGet("TimeSheetEntry", {
      establishment: estId,
      clock_in__gte: `${monthStart}T00:00:00`,
      clock_in__lte: `${dateStr}T23:59:59`,
      limit: 1000,
    }),
    fetchAllPayments(estId, monthStart, dateStr),
  ]);

  const monthTimeEntries = monthTimeData.objects || [];
  const monthLaborCost = calculateLaborCost(monthTimeEntries);
  const monthTotalPayments = calculateTotalPayments(monthPayments);
  const monthToDateLaborPercent = monthTotalPayments > 0 
    ? Math.round((monthLaborCost / monthTotalPayments) * 100) 
    : 0;

  // Fetch LAST YEAR'S FULL MONTH for historical goal calculation
  const [lastYearMonthTimeData, lastYearMonthPayments] = await Promise.all([
    apiGet("TimeSheetEntry", {
      establishment: estId,
      clock_in__gte: `${lastYearMonthStart}T00:00:00`,
      clock_in__lte: `${lastYearMonthEnd}T23:59:59`,
      limit: 1000,
    }),
    fetchAllPayments(estId, lastYearMonthStart, lastYearMonthEnd),
  ]);

  const lastYearMonthTimeEntries = lastYearMonthTimeData.objects || [];
  const lastYearMonthLaborCost = calculateLaborCost(lastYearMonthTimeEntries);
  const lastYearMonthTotalPayments = calculateTotalPayments(lastYearMonthPayments);
  const lastYearMonthLaborPercent = lastYearMonthTotalPayments > 0 
    ? (lastYearMonthLaborCost / lastYearMonthTotalPayments) * 100 
    : 0;

  // GOALS: Use last year's actual labor %, rounded DOWN to nearest whole number, max 17%
  const todayLaborGoal = Math.min(17, Math.floor(lastYearMonthLaborPercent));
  const monthlyLaborGoal = Math.min(17, Math.floor(lastYearMonthLaborPercent));

  return {
    todayLaborPercent,
    todayLaborGoal,
    monthlyLaborPercent: monthToDateLaborPercent,
    monthlyLaborGoal,
    monthToDateLaborPercent,
  };
}

export async function GET() {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    
    // Get labor data for Pembroke Pines (107)
    const laborData = await fetchLaborData(107, dateStr);
    
    return NextResponse.json(laborData);
  } catch (error) {
    console.error("Error fetching labor:", error);
    return NextResponse.json(
      { error: "Failed to fetch labor data" },
      { status: 500 }
    );
  }
}
