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

async function fetchStoreData(estId: number, dateStr: string) {
  // Fetch orders
  const ordersData = await apiGet("Order", {
    establishment: estId,
    created_date__gte: `${dateStr}T00:00:00`,
    created_date__lte: `${dateStr}T23:59:59`,
    limit: 200,
  });

  // Fetch payments
  const paymentsData = await apiGet("Payment", {
    establishment: estId,
    created_date__gte: `${dateStr}T00:00:00`,
    created_date__lte: `${dateStr}T23:59:59`,
    limit: 200,
  });

  // Fetch payouts
  const payoutsData = await apiGet("Payout", {
    establishment: estId,
    created_date__gte: `${dateStr}T00:00:00`,
    created_date__lte: `${dateStr}T23:59:59`,
    limit: 100,
  });

  // Fetch timesheet
  const timesheetData = await apiGet("TimeSheetEntry", {
    establishment: estId,
    clock_in__gte: `${dateStr}T00:00:00`,
    clock_in__lte: `${dateStr}T23:59:59`,
    limit: 100,
  });

  const orders = ordersData.objects || [];
  const payments = paymentsData.objects || [];
  const payouts = payoutsData.objects || [];
  const timesheet = timesheetData.objects || [];

  // Calculate sales
  let totalSales = 0;
  let subtotal = 0;
  let tax = 0;
  let discount = 0;
  let orderCount = 0;

  for (const order of orders) {
    if (order.deleted || order.is_unpaid) continue;
    totalSales += parseFloat(order.final_total || 0);
    subtotal += parseFloat(order.subtotal || 0);
    tax += parseFloat(order.tax || 0);
    discount += parseFloat(order.discount_amount || 0);
    orderCount++;
  }

  const netSales = subtotal - discount;

  // Calculate payments (exclude Type 4)
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

  const totalPayments = cash + credit + other + tips;

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

  // Calculate labor (exclude cashiers with $0 wage)
  let laborCost = 0;
  let employeeCount = 0;
  const employees = new Set();

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

    const empId = entry.employee?.split("/").filter(Boolean).pop();
    if (empId) {
      employees.add(empId);
    }
  }

  employeeCount = employees.size;

  // Calculate labor %
  const laborPct = totalPayments > 0 ? (laborCost / totalPayments) * 100 : 0;

  return {
    totalPayments,
    cash,
    credit,
    other,
    tips,
    netSales,
    laborCost,
    laborPct,
    payIns,
    payOuts,
    orderCount,
    employeeCount,
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
