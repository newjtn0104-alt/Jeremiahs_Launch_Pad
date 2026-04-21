"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin,
  Loader2,
  AlertCircle,
  Users,
  ExternalLink
} from "lucide-react";
import { format, parseISO, isValid, isToday, isTomorrow } from "date-fns";

interface Shift {
  id: string;
  employeeName: string;
  location: string;
  role: string;
  startTime: string;
  endTime: string;
  date: string;
}

export default function SevenShiftsSchedule() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/7shifts/schedule");
      
      if (!response.ok) {
        throw new Error("Failed to fetch schedule data");
      }

      const data = await response.json();
      
      if (data.success && data.schedules) {
        // Combine shifts from both locations
        const allShifts: Shift[] = [];
        
        // Process Pembroke Pines shifts
        if (data.schedules.pembroke_pines?.shifts) {
          data.schedules.pembroke_pines.shifts.forEach((shift: any) => {
            allShifts.push({
              id: `pp-${shift.id}`,
              employeeName: shift.employee_name || shift.user?.name || 'Unknown',
              location: 'Pembroke Pines',
              role: shift.role || 'Staff',
              startTime: shift.start_time,
              endTime: shift.end_time,
              date: shift.date
            });
          });
        }
        
        // Process Coral Springs shifts
        if (data.schedules.coral_springs?.shifts) {
          data.schedules.coral_springs.shifts.forEach((shift: any) => {
            allShifts.push({
              id: `cs-${shift.id}`,
              employeeName: shift.employee_name || shift.user?.name || 'Unknown',
              location: 'Coral Springs',
              role: shift.role || 'Staff',
              startTime: shift.start_time,
              endTime: shift.end_time,
              date: shift.date
            });
          });
        }
        
        // Sort by date and time
        allShifts.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.startTime}`);
          const dateB = new Date(`${b.date}T${b.startTime}`);
          return dateA.getTime() - dateB.getTime();
        });
        
        setShifts(allShifts);
      }
    } catch (err) {
      console.error("Schedule fetch error:", err);
      setError("Unable to load schedule. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingShifts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return shifts
      .filter(shift => {
        const shiftDate = new Date(shift.date);
        return shiftDate >= today;
      })
      .slice(0, 10);
  };

  const formatShiftTime = (startTime: string, endTime: string) => {
    try {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
    } catch {
      return `${startTime} - ${endTime}`;
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
  };

  if (loading) {
    return (
      <Card className="border-slate-200 shadow-md bg-white">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
          <p className="text-slate-600">Loading schedule...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-slate-200 shadow-md bg-white">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
          <p className="text-red-600 mb-3">{error}</p>
          <Button onClick={fetchScheduleData} variant="outline" size="sm">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const upcomingShifts = getUpcomingShifts();

  return (
    <Card className="border-slate-200 shadow-md bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-green-100">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">
              Upcoming Shifts
            </CardTitle>
            <p className="text-sm text-slate-500">
              {shifts.length} shifts scheduled
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://app.7shifts.com', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          7shifts
        </Button>
      </CardHeader>
      <CardContent>
        {upcomingShifts.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No upcoming shifts.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingShifts.map((shift) => (
              <div
                key={shift.id}
                className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-green-100 flex flex-col items-center justify-center">
                  <span className="text-xs font-semibold text-green-600 uppercase">
                    {format(new Date(shift.date), 'MMM')}
                  </span>
                  <span className="text-lg font-bold text-green-700">
                    {format(new Date(shift.date), 'd')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate">
                    {shift.employeeName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                    <MapPin className="w-3 h-3" />
                    <span>{shift.location}</span>
                    <span className="text-slate-300">•</span>
                    <span>{shift.role}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {formatShiftTime(shift.startTime, shift.endTime)}
                  </p>
                </div>
                <Badge 
                  variant={isToday(new Date(shift.date)) ? "default" : "secondary"}
                  className="flex-shrink-0"
                >
                  {getDateLabel(shift.date)}
                </Badge>
              </div>
            ))}
          </div>
        )}
        
        {/* Calendar Links */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-3">View Full Calendars:</p>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://app.7shifts.com/page/calendar/schedule/128416/66efb332161525df991291a30a0ce3a4', '_blank')}
            >
              <CalendarIcon className="w-4 h-4 mr-1" />
              Pembroke Pines
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://app.7shifts.com/page/calendar/schedule/341974/8a8998fafc49e823f0f11284351aacbb', '_blank')}
            >
              <CalendarIcon className="w-4 h-4 mr-1" />
              Coral Springs
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
