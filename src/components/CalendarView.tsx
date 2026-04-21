"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin,
  Loader2,
  AlertCircle
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isValid
} from "date-fns";
import SevenShiftsSchedule from "./SevenShiftsSchedule";

interface CalendarEvent {
  uid: string;
  summary: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/calendar");
      
      if (!response.ok) {
        throw new Error("Failed to fetch calendar data");
      }

      const icalData = await response.text();
      const parsedEvents = parseICal(icalData);
      setEvents(parsedEvents);
    } catch (err) {
      console.error("Calendar fetch error:", err);
      setError("Unable to load calendar events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const parseICal = (icalData: string): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const lines = icalData.split(/\r?\n/);
    
    let currentEvent: Partial<CalendarEvent> | null = null;
    let inEvent = false;
    let currentLine = "";

    for (const line of lines) {
      // Handle line continuations (lines starting with space are continuations)
      if (line.startsWith(" ")) {
        currentLine += line.substring(1);
        continue;
      }

      // Process the previous line if we have one
      if (currentLine) {
        processLine(currentLine, inEvent, currentEvent, events);
      }

      currentLine = line;

      if (line === "BEGIN:VEVENT") {
        inEvent = true;
        currentEvent = {};
      } else if (line === "END:VEVENT") {
        if (currentEvent && currentEvent.uid && currentEvent.startDate) {
          events.push(currentEvent as CalendarEvent);
        }
        inEvent = false;
        currentEvent = null;
      }
    }

    // Process the last line
    if (currentLine) {
      processLine(currentLine, inEvent, currentEvent, events);
    }

    return events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  };

  const processLine = (
    line: string, 
    inEvent: boolean, 
    currentEvent: Partial<CalendarEvent> | null,
    events: CalendarEvent[]
  ) => {
    if (!inEvent || !currentEvent) return;

    if (line.startsWith("UID:")) {
      currentEvent.uid = line.substring(4);
    } else if (line.startsWith("SUMMARY:")) {
      currentEvent.summary = line.substring(8);
    } else if (line.startsWith("DESCRIPTION:")) {
      currentEvent.description = line.substring(12);
    } else if (line.startsWith("LOCATION:")) {
      currentEvent.location = line.substring(9);
    } else if (line.startsWith("DTSTART")) {
      const dateStr = line.split(":")[1];
      if (dateStr) {
        currentEvent.startDate = parseICalDate(dateStr);
      }
    } else if (line.startsWith("DTEND")) {
      const dateStr = line.split(":")[1];
      if (dateStr) {
        currentEvent.endDate = parseICalDate(dateStr);
      }
    }
  };

  const parseICalDate = (dateStr: string): Date => {
    // Handle various iCal date formats
    // UTC format: 20240115T120000Z
    // Local format: 20240115T120000
    // Date only: 20240115
    
    const cleanStr = dateStr.trim();
    
    if (cleanStr.includes("T")) {
      // Date-time format
      const year = parseInt(cleanStr.substring(0, 4));
      const month = parseInt(cleanStr.substring(4, 6)) - 1;
      const day = parseInt(cleanStr.substring(6, 8));
      const hour = parseInt(cleanStr.substring(9, 11));
      const minute = parseInt(cleanStr.substring(11, 13));
      const second = parseInt(cleanStr.substring(13, 15));
      
      if (cleanStr.endsWith("Z")) {
        // UTC time - convert to local
        return new Date(Date.UTC(year, month, day, hour, minute, second));
      }
      
      return new Date(year, month, day, hour, minute, second);
    } else {
      // Date only format
      const year = parseInt(cleanStr.substring(0, 4));
      const month = parseInt(cleanStr.substring(4, 6)) - 1;
      const day = parseInt(cleanStr.substring(6, 8));
      
      return new Date(year, month, day);
    }
  };

  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(event.startDate, date));
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return events
      .filter(event => event.startDate >= today)
      .slice(0, 5);
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loading) {
    return (
      <Card className="border-slate-200 shadow-md bg-white">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-600">Loading calendar events...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-slate-200 shadow-md bg-white">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchCalendarData} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const days = getDaysInMonth();
  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className="border-slate-200 shadow-md bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                {format(currentDate, "MMMM yyyy")}
              </CardTitle>
              <p className="text-sm text-slate-500">
                {events.length} events scheduled
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-slate-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    min-h-[80px] p-2 text-left rounded-lg border transition-all
                    ${isCurrentMonth ? "bg-white" : "bg-slate-50 text-slate-400"}
                    ${isToday ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-200"}
                    ${isSelected ? "bg-blue-50 border-blue-400" : "hover:border-blue-300"}
                  `}
                >
                  <span className={`
                    text-sm font-medium
                    ${isToday ? "text-blue-600" : isCurrentMonth ? "text-slate-900" : "text-slate-400"}
                  `}>
                    {format(day, "d")}
                  </span>
                  
                  {/* Event indicators */}
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 3).map((event, idx) => (
                      <div
                        key={idx}
                        className="text-xs truncate px-1 py-0.5 rounded bg-blue-100 text-blue-700"
                        title={event.summary}
                      >
                        {event.summary}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-slate-500 px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Events */}
      {selectedDate && (
        <Card className="border-slate-200 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">
              Events for {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getEventsForDay(selectedDate).length === 0 ? (
              <p className="text-slate-500">No events scheduled for this day.</p>
            ) : (
              <div className="space-y-3">
                {getEventsForDay(selectedDate).map((event) => (
                  <div
                    key={event.uid}
                    className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900">{event.summary}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(event.startDate, "h:mm a")} - {format(event.endDate, "h:mm a")}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="mt-2 text-sm text-slate-500">{event.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events */}
      <Card className="border-slate-200 shadow-md bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <p className="text-slate-500">No upcoming events.</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.uid}
                  className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-blue-100 flex flex-col items-center justify-center">
                    <span className="text-xs font-semibold text-blue-600 uppercase">
                      {format(event.startDate, "MMM")}
                    </span>
                    <span className="text-lg font-bold text-blue-700">
                      {format(event.startDate, "d")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate">{event.summary}</h4>
                    <p className="text-sm text-slate-500">
                      {format(event.startDate, "EEEE")} at {format(event.startDate, "h:mm a")}
                    </p>
                  </div>
                  <Badge variant="secondary" className="flex-shrink-0">
                    {format(event.startDate, "h:mm a")}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 7shifts Schedule */}
      <SevenShiftsSchedule />
    </div>
  );
}
