"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

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
  // Month to date data
  monthToDateLaborCost: number;
  monthToDateLaborPct: number;
  monthToDatePayments: number;
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
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const StoreCard = ({ title, storeData }: { title: string; storeData: StoreData }) => (
    <Card className="bg-white border-slate-200 shadow-md">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-lg text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Main Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500">Total Payments</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(storeData.totalPayments)}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500">Net Sales</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(storeData.netSales)}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500">Cash</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(storeData.cash)}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500">Credit</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(storeData.credit)}</p>
          </div>
        </div>

        {/* Pay Ins / Cash Tips */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-xs text-green-600">Pay Ins</p>
            <p className="text-lg font-semibold text-green-700">{formatCurrency(storeData.payIns)}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-xs text-red-600">Cash Tips</p>
            <p className="text-lg font-semibold text-red-700">{formatCurrency(storeData.payOuts)}</p>
          </div>
        </div>
        
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Labor: {storeData.laborPct.toFixed(1)}%
          </Badge>
          <Badge variant="outline" className="border-slate-300 text-slate-600">
            {storeData.orderCount} orders
          </Badge>
          <Badge variant="outline" className="border-slate-300 text-slate-600">
            {storeData.employeeCount} employees
          </Badge>
        </div>

        {/* Month to Date Section */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Month to Date</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-500">MTD Payments</p>
              <p className="text-lg font-semibold text-slate-900">{formatCurrency(storeData.monthToDatePayments)}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-500">MTD Labor %</p>
              <p className={`text-lg font-semibold ${storeData.monthToDateLaborPct <= 17 ? 'text-green-600' : 'text-red-600'}`}>
                {storeData.monthToDateLaborPct.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500">MTD Labor Cost</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(storeData.monthToDateLaborCost)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto border-slate-300"
          />
        </div>
        <Button onClick={fetchData} disabled={loading} variant="outline" className="border-slate-300">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StoreCard title="🏢 Pembroke Pines" storeData={data.pembrokePines} />
          <StoreCard title="🍦 Coral Springs" storeData={data.coralSprings} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 text-slate-400">
          {loading ? "Loading..." : "Select a date and click Refresh"}
        </div>
      )}
    </div>
  );
}
