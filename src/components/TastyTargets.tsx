"use client";

import { useState, useEffect } from "react";

interface SalesData {
  todayGoal: number;
  todayActual: number;
  sameDayLastYear: number;
  monthlyGoal: number;
  monthToDate: number;
  todayLaborPercent: number;
  todayLaborGoal: number;
  monthlyLaborPercent: number;
  monthlyLaborGoal: number;
  monthToDateLaborPercent: number;
}

export default function TastyTargets() {
  const [data, setData] = useState<SalesData>({
    todayGoal: 1200,
    todayActual: 850,
    sameDayLastYear: 1100,
    monthlyGoal: 36000,
    monthToDate: 28500,
    todayLaborPercent: 18,
    todayLaborGoal: 20,
    monthlyLaborPercent: 19,
    monthlyLaborGoal: 20,
    monthToDateLaborPercent: 19,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch sales data
      const salesRes = await fetch("/api/revel/sales");
      const salesData = await salesRes.json();
      
      // Fetch labor data
      const laborRes = await fetch("/api/revel/labor");
      const laborData = await laborRes.json();
      
      setData({
        ...salesData,
        ...laborData,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const percentOfGoal = (actual: number, goal: number) => {
    return Math.round((actual / goal) * 100);
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl h-full">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-3xl">🎯</span>
          Tasty Targets
        </h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl h-full">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-3xl">🎯</span>
        Tasty Targets
      </h2>

      <div className="space-y-4">
        {/* Today's Sales Goal */}
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-blue-200 text-sm mb-1">Today&apos;s Sales Goal</p>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(data.todayGoal)}
          </p>
        </div>

        {/* Same Day Last Year */}
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-blue-200 text-sm mb-1">Same Day Last Year</p>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(data.sameDayLastYear)}
          </p>
        </div>

        {/* Monthly Sales Goal */}
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-blue-200 text-sm mb-1">Monthly Sales Goal</p>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(data.monthlyGoal)}
          </p>
        </div>

        {/* Month to Date Sales */}
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-blue-200 text-sm mb-1">Month to Date Sales</p>
          <div className="flex justify-between items-end">
            <p className="text-3xl font-bold text-white">
              {formatCurrency(data.monthToDate)}
            </p>
            <span className="text-white font-bold bg-blue-500/30 px-2 py-1 rounded">
              {percentOfGoal(data.monthToDate, data.monthlyGoal)}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(percentOfGoal(data.monthToDate, data.monthlyGoal), 100)}%` }}
            />
          </div>
        </div>

        {/* Today's Labor % Goal */}
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-blue-200 text-sm mb-1">Today&apos;s Labor % Goal</p>
          <div className="flex justify-between items-end">
            <p className="text-3xl font-bold text-white">
              {data.todayLaborGoal}%
            </p>
            <span className={`font-bold px-2 py-1 rounded ${
              data.todayLaborPercent <= data.todayLaborGoal 
                ? "text-green-400 bg-green-500/20" 
                : "text-red-400 bg-red-500/20"
            }`}>
              Actual: {data.todayLaborPercent}%
            </span>
          </div>
        </div>

        {/* Monthly Labor % Goal */}
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-blue-200 text-sm mb-1">Monthly Labor % Goal</p>
          <div className="flex justify-between items-end">
            <p className="text-3xl font-bold text-white">
              {data.monthlyLaborGoal}%
            </p>
            <span className={`font-bold px-2 py-1 rounded ${
              data.monthlyLaborPercent <= data.monthlyLaborGoal 
                ? "text-green-400 bg-green-500/20" 
                : "text-red-400 bg-red-500/20"
            }`}>
              Actual: {data.monthlyLaborPercent}%
            </span>
          </div>
        </div>

        {/* Month to Date Labor % */}
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-blue-200 text-sm mb-1">Month to Date Labor %</p>
          <p className="text-3xl font-bold text-white">
            {data.monthToDateLaborPercent}%
          </p>
        </div>
      </div>
    </div>
  );
}
