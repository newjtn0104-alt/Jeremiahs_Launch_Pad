"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LaborVarianceEntry {
  id: string;
  week_start: string;
  week_end: string;
  employee_name: string;
  location: string;
  scheduled_hours: number;
  actual_hours: number;
  variance: number;
  shifts_scheduled: number;
  shifts_worked: number;
  status: string;
}

export default function LaborVariance() {
  const [data, setData] = useState<LaborVarianceEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [weeks, setWeeks] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = selectedWeek ? `?week_start=${selectedWeek}` : "";
      const response = await fetch(`/api/labor-variance${params}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        
        // Extract unique weeks
        const uniqueWeeks = [...new Set(result.data.map((d: LaborVarianceEntry) => d.week_start))];
        setWeeks(uniqueWeeks.sort().reverse());
        
        if (!selectedWeek && uniqueWeeks.length > 0) {
          setSelectedWeek(uniqueWeeks[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch labor variance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedWeek]);

  const getStatusBadge = (variance: number) => {
    if (variance < -2) {
      return <Badge className="bg-red-100 text-red-700">Missing Hours</Badge>;
    } else if (variance > 2) {
      return <Badge className="bg-yellow-100 text-yellow-700">Overtime</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-700">On Track</Badge>;
    }
  };

  const getStatusIcon = (variance: number) => {
    if (variance < -2) {
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    } else if (variance > 2) {
      return <Clock className="w-5 h-5 text-yellow-600" />;
    } else {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  // Group by location
  const dataByLocation = data.reduce((acc, entry) => {
    if (!acc[entry.location]) {
      acc[entry.location] = [];
    }
    acc[entry.location].push(entry);
    return acc;
  }, {} as Record<string, LaborVarianceEntry[]>);

  // Calculate totals
  const totalScheduled = data.reduce((sum, d) => sum + (d.scheduled_hours || 0), 0);
  const totalActual = data.reduce((sum, d) => sum + (d.actual_hours || 0), 0);
  const totalVariance = totalActual - totalScheduled;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-slate-200 shadow-md bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Labor Variance</CardTitle>
                <p className="text-sm text-slate-500">
                  Scheduled vs Actual Hours - Week of {selectedWeek || "Loading..."}
                </p>
              </div>
            </div>
            <Button 
              onClick={fetchData} 
              variant="outline" 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg text-center">
              <p className="text-sm text-slate-600">Scheduled</p>
              <p className="text-2xl font-bold text-slate-900">{totalScheduled.toFixed(1)} hrs</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg text-center">
              <p className="text-sm text-slate-600">Actual</p>
              <p className="text-2xl font-bold text-slate-900">{totalActual.toFixed(1)} hrs</p>
            </div>
            <div className={`p-4 rounded-lg text-center ${totalVariance < -5 ? 'bg-red-50' : totalVariance > 5 ? 'bg-yellow-50' : 'bg-green-50'}`}>
              <p className="text-sm text-slate-600">Variance</p>
              <p className={`text-2xl font-bold ${totalVariance < -5 ? 'text-red-700' : totalVariance > 5 ? 'text-yellow-700' : 'text-green-700'}`}>
                {totalVariance > 0 ? '+' : ''}{totalVariance.toFixed(1)} hrs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week Selector */}
      {weeks.length > 0 && (
        <Card className="border-slate-200 shadow-md bg-white">
          <CardContent className="p-4">
            <label className="text-sm font-medium text-slate-700 mb-2 block">Select Week</label>
            <select 
              value={selectedWeek} 
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg"
            >
              {weeks.map(week => (
                <option key={week} value={week}>
                  Week of {new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      {/* Location Cards */}
      {Object.entries(dataByLocation).map(([location, entries]) => {
        const locationScheduled = entries.reduce((sum, e) => sum + e.scheduled_hours, 0);
        const locationActual = entries.reduce((sum, e) => sum + e.actual_hours, 0);
        const locationVariance = locationActual - locationScheduled;
        
        return (
          <Card key={location} className="border-slate-200 shadow-md bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-800">{location}</CardTitle>
                    <p className="text-sm text-slate-500">
                      {entries.length} employees | 
                      Scheduled: {locationScheduled.toFixed(1)} hrs | 
                      Actual: {locationActual.toFixed(1)} hrs
                    </p>
                  </div>
                </div>
                <Badge className={locationVariance < -5 ? 'bg-red-100 text-red-700' : locationVariance > 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                  {locationVariance > 0 ? '+' : ''}{locationVariance.toFixed(1)} hrs
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {entries.sort((a, b) => a.variance - b.variance).map((entry) => (
                  <div key={entry.id} className={`flex items-center justify-between px-6 py-3 hover:bg-slate-50 ${entry.variance < -2 ? 'bg-red-50/50' : entry.variance > 2 ? 'bg-yellow-50/50' : ''}`}>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(entry.variance)}
                      <div>
                        <p className="font-medium text-slate-800">{entry.employee_name}</p>
                        <p className="text-sm text-slate-500">
                          {entry.shifts_scheduled} shifts scheduled | {entry.shifts_worked} shifts worked
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-600">
                          <span className="text-slate-400">Scheduled:</span> {entry.scheduled_hours.toFixed(1)} hrs
                        </span>
                        <span className="text-slate-600">
                          <span className="text-slate-400">Actual:</span> {entry.actual_hours.toFixed(1)} hrs
                        </span>
                        <span className={`font-bold ${entry.variance < -2 ? 'text-red-600' : entry.variance > 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {entry.variance > 0 ? '+' : ''}{entry.variance.toFixed(1)} hrs
                        </span>
                      </div>
                      <div className="mt-1">
                        {getStatusBadge(entry.variance)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {data.length === 0 && !loading && (
        <Card className="border-slate-200 shadow-md bg-white">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 rounded-full bg-slate-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Data Yet</h3>
              <p className="text-slate-500">
                Labor variance data will appear here after the weekly cron job runs (Mondays at 9 AM).
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
