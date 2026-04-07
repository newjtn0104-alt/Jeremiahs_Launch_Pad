"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

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

const CACHE_KEY = "tasty-targets-cache";
const CACHE_TIMESTAMP_KEY = "tasty-targets-timestamp";

export default function TastyTargets() {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Load cached data on mount
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (cached) {
      setData(JSON.parse(cached));
      if (timestamp) {
        setLastUpdated(new Date(timestamp).toLocaleTimeString());
      }
    } else {
      // No cache - fetch initial data
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch both sales and labor data
      const [salesRes, laborRes] = await Promise.all([
        fetch("/api/revel/sales"),
        fetch("/api/revel/labor"),
      ]);

      const salesData = await salesRes.json();
      const laborData = await laborRes.json();

      const combinedData = { ...salesData, ...laborData };
      
      // Update state
      setData(combinedData);
      
      // Cache the data
      localStorage.setItem(CACHE_KEY, JSON.stringify(combinedData));
      const now = new Date().toISOString();
      localStorage.setItem(CACHE_TIMESTAMP_KEY, now);
      setLastUpdated(new Date(now).toLocaleTimeString());
      
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

  if (!data && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-slate-500">No data available</p>
        <Button onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Load Data
        </Button>
      </div>
    );
  }

  const MetricCard = ({ 
    label, 
    value, 
    badge,
    progress 
  }: { 
    label: string; 
    value: string; 
    badge?: { text: string; color: string };
    progress?: number;
  }) => (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <p className="text-slate-500 text-sm mb-1">{label}</p>
      <div className="flex justify-between items-end">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {badge && (
          <Badge className={badge.color}>{badge.text}</Badge>
        )}
      </div>
      {progress !== undefined && (
        <div className="mt-3">
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          {lastUpdated ? `Last updated: ${lastUpdated}` : "No data cached"}
        </div>
        <Button 
          onClick={fetchData} 
          disabled={loading} 
          variant="outline" 
          size="sm"
          className="border-slate-300"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Sales Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard 
          label="Today's Sales Goal" 
          value={formatCurrency(data.todayGoal)} 
        />
        <MetricCard 
          label="Same Day Last Year" 
          value={formatCurrency(data.sameDayLastYear)} 
        />
      </div>

      <MetricCard 
        label="Monthly Sales Goal" 
        value={formatCurrency(data.monthlyGoal)} 
      />

      <MetricCard 
        label="Month to Date Sales" 
        value={formatCurrency(data.monthToDate)}
        badge={{ 
          text: `${percentOfGoal(data.monthToDate, data.monthlyGoal)}%`, 
          color: "bg-blue-100 text-blue-700" 
        }}
        progress={Math.min(percentOfGoal(data.monthToDate, data.monthlyGoal), 100)}
      />

      {/* Labor Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-slate-500 text-sm mb-1">Today's Labor % Goal</p>
          <div className="flex justify-between items-end">
            <p className="text-2xl font-bold text-slate-900">{data.todayLaborGoal}%</p>
            <Badge className={data.todayLaborPercent <= data.todayLaborGoal 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-700"
            }>
              Actual: {data.todayLaborPercent}%
            </Badge>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-slate-500 text-sm mb-1">Monthly Labor % Goal</p>
          <div className="flex justify-between items-end">
            <p className="text-2xl font-bold text-slate-900">{data.monthlyLaborGoal}%</p>
            <Badge className={data.monthlyLaborPercent <= data.monthlyLaborGoal 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-700"
            }>
              Actual: {data.monthlyLaborPercent}%
            </Badge>
          </div>
        </div>
      </div>

      <MetricCard 
        label="Month to Date Labor %" 
        value={`${data.monthToDateLaborPercent}%`} 
      />
    </div>
  );
}
