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
    
    if (offset >= 10000) {
      console.warn(`Payment fetch limit reached for ${startDate} to ${endDate}`);
      break;
    }
  }
  
  return allPayments;
}

// Calculate total payments
function calculateTotalPayments(payments: any[]) {
  let cash = 0;
  let credit = 0;
  let other = 0;
  let tips = 0;

  for (const payment of payments) {
    if (payment.payment_type === 4) continue;

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

  return { total: cash + credit + other + tips, cash, credit, other, tips };
}

// Calculate labor cost
function calculateLaborCost(timesheet: any[]) {
  let laborCost = 0;
  const employees = new Set();

  for (const entry of timesheet) {
    const wage = parseFloat(entry.role_wage || 0);
    if (wage === 0) continue;

    const clockIn = entry.clock_in;
    const clockOut = entry.clock_out;

    if (clockIn && clockOut) {
      const start = new Date(clockIn);
      const end = new Date(clockOut);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      laborCost += hours * wage;
    }

    const empId = entry.employee?.split("/").filter(Boolean).pop();
    if (empId) {
      employees.add(empId);
    }
  }

  return { laborCost, employeeCount: employees.size };
}

async function fetchStoreData(estId: number, dateStr: string) {
  const monthStart = dateStr.substring(0, 8) + "01";

  // Fetch TODAY'S data
  const [ordersData, payments, payoutsData, timesheetData] = await Promise.all([
    apiGet("Order", {
      establishment: estId,
      created_date__gte: `${dateStr}T00:00:00`,
      created_date__lte: `${dateStr}T23:59:59`,
      limit: 200,
    }),
    fetchAllPayments(estId, dateStr, dateStr),
    apiGet("Payout", {
      establishment: estId,
      created_date__gte: `${dateStr}T00:00:00`,
      created_date__lte: `${dateStr}T23:59:59`,
      limit: 100,
    }),
    apiGet("TimeSheetEntry", {
      establishment: estId,
      clock_in__gte: `${dateStr}T00:00:00`,
      clock_in__lte: `${dateStr}T23:59:59`,
      limit: 100,
    }),
  ]);

  // Fetch MONTH TO DATE data
  const [monthPaymentsData, monthTimesheetData] = await Promise.all([
    fetchAllPayments(estId, monthStart, dateStr),
    apiGet("TimeSheetEntry", {
      establishment: estId,
      clock_in__gte: `${monthStart}T00:00:00`,
      clock_in__lte: `${dateStr}T23:59:59`,
      limit: 1000,
    }),
  ]);

  const orders = ordersData.objects || [];
  const payouts = payoutsData.objects || [];
  const timesheet = timesheetData.objects || [];
  const monthTimesheet = monthTimesheetData.objects || [];

  // Calculate sales
  let totalSales = 0;
  let subtotal = 0;
  let discount = 0;
  let orderCount = 0;

  for (const order of orders) {
    if (order.deleted || order.is_unpaid) continue;
    totalSales += parseFloat(order.final_total || 0);
    subtotal += parseFloat(order.subtotal || 0);
    discount += parseFloat(order.discount_amount || 0);
    orderCount++;
  }

  const netSales = subtotal - discount;

  // Calculate today's payments
  const todayPayments = calculateTotalPayments(payments);

  // Calculate payouts
  let payIns = 0;
  let payOuts = 0;

  for (const payout of payouts) {
    const amount = parseFloat(payout.amount || 0);
    if (amount < 0) {
      payIns += Math.abs(amount);
    } else {
      payOuts += amount;
    }
  }

  // Calculate today's labor
  const todayLabor = calculateLaborCost(timesheet);
  const laborPct = todayPayments.total > 0 
    ? (todayLabor.laborCost / todayPayments.total) * 100 
    : 0;

  // Calculate month to date
  const monthPayments = calculateTotalPayments(monthPaymentsData);
  const monthLabor = calculateLaborCost(monthTimesheet);
  const monthToDateLaborPct = monthPayments.total > 0 
    ? (monthLabor.laborCost / monthPayments.total) * 100 
    : 0;

  return {
    totalPayments: todayPayments.total,
    cash: todayPayments.cash,
    credit: todayPayments.credit,
    other: todayPayments.other,
    tips: todayPayments.tips,
    netSales,
    laborCost: todayLabor.laborCost,
    laborPct,
    payIns,
    payOuts,
    orderCount,
    employeeCount: todayLabor.employeeCount,
    // Month to date
    monthToDateLaborCost: monthLabor.laborCost,
    monthToDateLaborPct,
    monthToDatePayments: monthPayments.total,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter required" },
        { status: 400 }
      );
    }

    // Fetch data for both stores
    const [pembrokePines, coralSprings] = await Promise.all([
      fetchStoreData(107, date),
      fetchStoreData(17, date),
    ]);

    return NextResponse.json({
      pembrokePines,
      coralSprings,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
