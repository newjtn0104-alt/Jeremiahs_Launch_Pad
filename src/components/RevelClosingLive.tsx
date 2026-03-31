"use client";

import { useState, useEffect } from "react";

interface StoreData {
  totalPayments: number;
  cash: number;
  credit: number;
  other: number;
  tips: number;
  netSales: number;
  laborCost: number;
  laborPct: number;
  payIns: number;
  payOuts: number;
  orderCount: number;
  employeeCount: number;
}

interface ClosingData {
  pembrokePines: StoreData;
  coralSprings: StoreData;
  lastUpdated: string;
}

export default function RevelClosingLive() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [data, setData] = useState<ClosingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/revel/closing?date=${selectedDate}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString();
  };

  const StoreCard = ({
    title,
    storeData,
  }: {
    title: string;
    storeData: StoreData;
  }) => (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-blue-200 text-sm">Total Payments</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(storeData.totalPayments)}
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-green-200 text-sm">Net Sales</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(storeData.netSales)}
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-yellow-200 text-sm">Cash</p>
          <p className="text-xl font-bold text-white">
            {formatCurrency(storeData.cash)}
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-purple-200 text-sm">Credit</p>
          <p className="text-xl font-bold text-white">
            {formatCurrency(storeData.credit)}
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-pink-200 text-sm">Labor Cost</p>
          <p className="text-xl font-bold text-white">
            {formatCurrency(storeData.laborCost)}
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-orange-200 text-sm">Labor %</p>
          <p className="text-xl font-bold text-white">
            {storeData.laborPct.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-cyan-200 text-sm">Orders</p>
          <p className="text-xl font-bold text-white">{storeData.orderCount}</p>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-indigo-200 text-sm">Employees</p>
          <p className="text-xl font-bold text-white">
            {storeData.employeeCount}
          </p>
        </div>
      </div>

      {(storeData.payIns > 0 || storeData.payOuts > 0) && (
        <div className="mt-4 flex gap-4">
          {storeData.payIns > 0 && (
            <div className="bg-green-500/20 rounded-lg px-3 py-2">
              <span className="text-green-300 text-sm">
                Pay Ins: {formatCurrency(storeData.payIns)}
              </span>
            </div>
          )}
          {storeData.payOuts > 0 && (
            <div className="bg-red-500/20 rounded-lg px-3 py-2">
              <span className="text-red-300 text-sm">
                Pay Outs: {formatCurrency(storeData.payOuts)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header with Date Picker and Refresh */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-white font-medium">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-4">
          {data?.lastUpdated && (
            <span className="text-blue-200 text-sm">
              Last updated: {formatTime(data.lastUpdated)}
            </span>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Refreshing...
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* Data Display */}
      {data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-auto">
          <StoreCard title="🏢 Pembroke Pines" storeData={data.pembrokePines} />
          <StoreCard title="🍦 Coral Springs" storeData={data.coralSprings} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/50 text-lg">
            {loading ? "Loading data..." : "Click Refresh to load data"}
          </p>
        </div>
      )}
    </div>
  );
}
