"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface StaffMember {
  id: number;
  name: string;
  role: string;
  shiftStart?: string;
  shiftEnd?: string;
  clockedInTime?: string;
  isClockedIn: boolean;
  isScheduled: boolean;
  status: 'working' | 'scheduled' | 'extra';
}

interface LocationData {
  staff: StaffMember[];
  summary: {
    scheduled: number;
    clockedIn: number;
    noShows: number;
  };
}

interface AttendanceData {
  pembrokePines: LocationData;
  coralSprings: LocationData;
  lastUpdated: string;
}

export default function AttendanceCheck() {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/attendance");
      const attendanceData = await res.json();
      setData(attendanceData);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
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
        <p className="text-slate-500">No attendance data available</p>
        <Button onClick={fetchAttendance} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  const StaffList = ({ 
    locationData, 
    locationName 
  }: { 
    locationData: LocationData; 
    locationName: string;
  }) => {
    const { staff, summary } = locationData;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">🏪 {locationName}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-blue-50">
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <p className="text-slate-500 text-sm">No staff data</p>
          ) : (
            <div className="space-y-2">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    member.status === 'working'
                      ? "bg-green-50 border-green-200"
                      : member.status === 'scheduled'
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {member.status === 'working' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : member.status === 'scheduled' ? (
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
                    {member.status === 'working' ? (
                      <>
                        <p className="text-green-700 text-sm font-medium">
                          ✓ Clocked in: {member.clockedInTime}
                        </p>
                        {member.shiftStart && (
                          <p className="text-xs text-slate-500">
                            Scheduled: {member.shiftStart} - {member.shiftEnd}
                          </p>
                        )}
                      </>
                    ) : member.status === 'scheduled' ? (
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
                          ✓ Clocked in: {member.clockedInTime}
                        </p>
                        <p className="text-xs text-blue-600">Extra staff</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          Cross-check: Revel clock-ins vs 7shifts schedule
        </div>
        <Button 
          onClick={fetchAttendance} 
          disabled={loading} 
          variant="outline" 
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <StaffList 
        locationData={data.pembrokePines} 
        locationName="Pembroke Pines" 
      />
      <StaffList 
        locationData={data.coralSprings} 
        locationName="Coral Springs" 
      />
    </div>
  );
}
