"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";

interface StaffMember {
  id: number;
  name: string;
  role: string;
  clockedIn: string | null;
  shiftStart: string;
  shiftEnd: string;
  location: string;
  isWorking: boolean;
  isClockedIn?: boolean;
  status?: 'working' | 'scheduled' | 'extra' | 'completed';
  clockedInTime?: string;
  clockedOutTime?: string | null;
}

interface LocationSummary {
  scheduled: number;
  clockedIn: number;
  noShows: number;
}

interface ScheduleData {
  pembrokePines: StaffMember[];
  coralSprings: StaffMember[];
  usingActualPunches: boolean;
  lastUpdated: string;
  pembrokeSummary?: LocationSummary;
  coralSummary?: LocationSummary;
}

export default function WhosWorking() {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCrossCheck, setShowCrossCheck] = useState(false);

  useEffect(() => {
    fetchSchedule();
    const timeTimer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timeTimer);
  }, [showCrossCheck]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const endpoint = showCrossCheck ? "/api/attendance" : "/api/7shifts/schedule";
      const res = await fetch(endpoint);
      const scheduleData = await res.json();
      setData(scheduleData);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentlyWorking = (shiftStart: string, shiftEnd: string) => {
    if (shiftEnd === 'Working...') return true;
    const now = currentTime;
    const start = new Date(`${now.toDateString()} ${shiftStart}`);
    const end = new Date(`${now.toDateString()} ${shiftEnd}`);
    return now >= start && now <= end;
  };

  if (loading) {
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
        <Button onClick={fetchSchedule} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  const StaffList = ({ 
    staff, 
    location, 
    usingActual,
    summary
  }: { 
    staff: StaffMember[]; 
    location: string;
    usingActual: boolean;
    summary?: LocationSummary;
  }) => {
    const workingCount = staff.filter((s) => 
      s.status === 'working' || isCurrentlyWorking(s.shiftStart, s.shiftEnd)
    ).length;
    
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <h3 className="text-lg font-bold text-slate-800">🏪 {location}</h3>
          <Badge variant="secondary">{workingCount} on duty</Badge>
          {usingActual && (
            <Badge className="bg-green-100 text-green-700">Live</Badge>
          )}
          {showCrossCheck && summary && (
            <>
              <Badge className="bg-blue-50 text-blue-700">
                Scheduled: {summary.scheduled}
              </Badge>
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Clocked In: {summary.clockedIn}
              </Badge>
              {summary.noShows > 0 && (
                <Badge className="bg-red-100 text-red-700">
                  <XCircle className="w-3 h-3 mr-1" />
                  No Shows: {summary.noShows}
                </Badge>
              )}
            </>
          )}
        </div>
        
        {staff.length === 0 ? (
          <p className="text-slate-500 text-sm">No one scheduled</p>
        ) : (
          <div className="space-y-2">
            {staff.map((member) => {
              const isWorking = isCurrentlyWorking(member.shiftStart, member.shiftEnd);
              
              // Cross-check view
              if (showCrossCheck && member.status) {
                // Determine actual status based on clock out time
                const hasClockedOut = member.clockedOutTime !== null && member.clockedOutTime !== undefined;
                const actualStatus = member.isClockedIn 
                  ? (hasClockedOut ? 'completed' : 'working')
                  : member.status;
                
                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      actualStatus === 'working'
                        ? "bg-green-50 border-green-200"
                        : actualStatus === 'completed'
                        ? "bg-slate-50 border-slate-200"
                        : actualStatus === 'scheduled'
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {actualStatus === 'working' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : actualStatus === 'completed' ? (
                        <Clock className="w-5 h-5 text-slate-500" />
                      ) : actualStatus === 'scheduled' ? (
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                      <div>
                        <p className="text-slate-900 font-medium">{member.name}</p>
                        <p className="text-sm text-slate-500">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {actualStatus === 'working' ? (
                        <>
                          <p className="text-green-700 text-sm font-medium">
                            ✓ Working
                          </p>
                          <p className="text-xs text-slate-500">
                            Clocked in: {member.clockedInTime}
                          </p>
                        </>
                      ) : actualStatus === 'completed' ? (
                        <>
                          <p className="text-slate-600 text-sm font-medium">
                            ✓ Completed
                          </p>
                          <p className="text-xs text-slate-500">
                            {member.clockedInTime} - {member.clockedOutTime}
                          </p>
                        </>
                      ) : actualStatus === 'scheduled' ? (
                        <>
                          <p className="text-yellow-700 text-sm font-medium">
                            ⚠ Not clocked in
                          </p>
                          <p className="text-xs text-slate-500">
                            Scheduled: {member.shiftStart} - {member.shiftEnd}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-blue-700 text-sm font-medium">
                            ✓ Extra staff
                          </p>
                          <p className="text-xs text-slate-500">
                            {member.clockedInTime} - {member.clockedOutTime || 'Working'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                );
              }
              
              // Regular schedule view
              return (
                <div
                  key={member.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isWorking
                      ? "bg-green-50 border-green-200"
                      : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isWorking ? "bg-green-500 animate-pulse" : "bg-slate-400"
                      }`}
                    />
                    <div>
                      <p className="text-slate-900 font-medium">{member.name}</p>
                      <p className="text-sm text-slate-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {member.clockedIn ? (
                      <>
                        <p className="text-slate-700 text-sm font-medium">
                          Clocked in: {member.clockedIn}
                        </p>
                        <p className="text-xs text-green-600">Currently working</p>
                      </>
                    ) : (
                      <p className="text-slate-700 text-sm font-medium">
                        {member.shiftStart} - {member.shiftEnd}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-slate-500">
          {showCrossCheck 
            ? "Cross-check: Revel clock-ins vs 7shifts schedule" 
            : data.usingActualPunches 
              ? "✅ Showing actual clock-ins" 
              : "📅 Showing scheduled shifts"}
        </div>
        <div className="flex gap-2">
          <Button
            variant={showCrossCheck ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCrossCheck(!showCrossCheck)}
          >
            {showCrossCheck ? "Show Schedule" : "Cross-Check"}
          </Button>
          <Button 
            onClick={fetchSchedule} 
            disabled={loading} 
            variant="outline" 
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <StaffList 
        staff={data.pembrokePines} 
        location="Pembroke Pines" 
        usingActual={data.usingActualPunches}
        summary={data.pembrokeSummary}
      />
      <StaffList 
        staff={data.coralSprings} 
        location="Coral Springs" 
        usingActual={data.usingActualPunches}
        summary={data.coralSummary}
      />
    </div>
  );
}
