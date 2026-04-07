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
    
    // Safety limit - don't fetch more than 10,000 records
    if (offset >= 10000) {
      console.warn(`Payment fetch limit reached for ${startDate} to ${endDate}`);
      break;
    }
  }
  
  return allPayments;
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

async function fetchStoreData(estId: number, dateStr: string) {
  // Calculate dates
  const currentDate = new Date(dateStr);
  
  // Last year same date
  const lastYearDate = new Date(currentDate);
  lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
  const lastYearStr = lastYearDate.toISOString().split("T")[0];
  
  // Last year month start and end
  const lastYearMonthStart = `${lastYearDate.getFullYear()}-${String(lastYearDate.getMonth() + 1).padStart(2, '0')}-01`;
  // Calculate last day of the month last year
  const lastYearMonthEndDate = new Date(lastYearDate.getFullYear(), lastYearDate.getMonth() + 1, 0);
  const lastYearMonthEnd = lastYearMonthEndDate.toISOString().split("T")[0];
  
  // Current month start
  const currentMonthStart = dateStr.substring(0, 8) + "01";

  // Fetch today's orders for actual sales
  const todayOrdersData = await apiGet("Order", {
    establishment: estId,
    created_date__gte: `${dateStr}T00:00:00`,
    created_date__lte: `${dateStr}T23:59:59`,
    limit: 200,
  });

  const todayOrders = todayOrdersData.objects || [];
  
  // Calculate today's actual sales
  let todayActual = 0;
  for (const order of todayOrders) {
    if (order.deleted || order.is_unpaid) continue;
    todayActual += parseFloat(order.final_total || 0);
  }

  // Fetch SAME DAY LAST YEAR payments (with pagination)
  const lastYearPayments = await fetchAllPayments(estId, lastYearStr, lastYearStr);
  const sameDayLastYear = calculateTotalPayments(lastYearPayments);

  // Fetch LAST YEAR'S FULL MONTH payments (with pagination)
  const lastYearMonthPayments = await fetchAllPayments(estId, lastYearMonthStart, lastYearMonthEnd);
  const lastYearMonthTotal = calculateTotalPayments(lastYearMonthPayments);

  // Calculate CURRENT month-to-date sales
  const currentMonthOrdersData = await apiGet("Order", {
    establishment: estId,
    created_date__gte: `${currentMonthStart}T00:00:00`,
    created_date__lte: `${dateStr}T23:59:59`,
    limit: 500,
  });

  const currentMonthOrders = currentMonthOrdersData.objects || [];
  let monthToDate = 0;
  for (const order of currentMonthOrders) {
    if (order.deleted || order.is_unpaid) continue;
    monthToDate += parseFloat(order.final_total || 0);
  }

  // TODAY'S GOAL = Same day last year total payments, rounded UP to nearest 100
  const todayGoal = Math.ceil(sameDayLastYear / 100) * 100;
  
  // MONTHLY GOAL = Same month last year total (all days), rounded UP to nearest 1000
  const monthlyGoal = Math.ceil(lastYearMonthTotal / 1000) * 1000;

  return {
    todayGoal,
    todayActual: Math.round(todayActual),
    sameDayLastYear: Math.round(sameDayLastYear),
    monthlyGoal,
    monthToDate: Math.round(monthToDate),
  };
}

export async function GET() {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    
    // Get data for Pembroke Pines (107)
    const salesData = await fetchStoreData(107, dateStr);
    
    return NextResponse.json(salesData);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales data" },
      { status: 500 }
    );
  }
}
