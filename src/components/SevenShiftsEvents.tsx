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
  Gift,
  Star,
  ExternalLink
} from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";

interface CalendarEvent {
  uid: string;
  summary: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
}

export default function SevenShiftsEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEventsData();
  }, []);

  const fetchEventsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch from our API route (avoids CORS)
      const response = await fetch("/api/7shifts/events");
      
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch events");
      }
      
      const parsedEvents = parseICal(result.data);
      setEvents(parsedEvents);
    } catch (err) {
      console.error("Events fetch error:", err);
      setError("Unable to load events. Please try again later.");
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
      // Handle line continuations
      if (line.startsWith(" ")) {
        currentLine += line.substring(1);
        continue;
      }

      // Process the previous line
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

  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events
      .filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= today || isToday(eventDate);
      })
      .slice(0, 10);
  };

  const getEventIcon = (summary: string) => {
    const lower = summary.toLowerCase();
    if (lower.includes('birthday')) return <Gift className="w-5 h-5 text-pink-500" />;
    if (lower.includes('anniversary')) return <Star className="w-5 h-5 text-yellow-500" />;
    return <CalendarIcon className="w-5 h-5 text-blue-500" />;
  };

  const getEventType = (summary: string) => {
    const lower = summary.toLowerCase();
    if (lower.includes('birthday')) return 'Birthday';
    if (lower.includes('anniversary')) return 'Work Anniversary';
    return 'Event';
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
  };

  if (loading) {
    return (
      <Card className="border-slate-200 shadow-md bg-white">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-3" />
          <p className="text-slate-600">Loading 7shifts events...</p>
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
          <Button onClick={fetchEventsData} variant="outline" size="sm">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const upcomingEvents = getUpcomingEvents();

  return (
    <Card className="border-slate-200 shadow-md bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-100">
            <CalendarIcon className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">
              7shifts Events
            </CardTitle>
            <p className="text-sm text-slate-500">
              {upcomingEvents.length} upcoming events
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://app.7shifts.com/page/calendar/events/128416/66efb332161525df991291a30a0ce3a4', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No upcoming events.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.uid}
                className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-purple-100 flex flex-col items-center justify-center">
                  <span className="text-xs font-semibold text-purple-600 uppercase">
                    {format(event.startDate, 'MMM')}
                  </span>
                  <span className="text-lg font-bold text-purple-700">
                    {format(event.startDate, 'd')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.summary)}
                    <h4 className="font-semibold text-slate-900 truncate">
                      {event.summary.replace(/·/g, '').trim()}
                    </h4>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {getEventType(event.summary)}
                  </p>
                </div>
                <Badge 
                  variant={isToday(event.startDate) ? "default" : "secondary"}
                  className="flex-shrink-0"
                >
                  {getDateLabel(event.startDate)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
