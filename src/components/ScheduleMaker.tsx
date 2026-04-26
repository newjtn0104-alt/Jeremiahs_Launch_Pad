"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Store, User } from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  store: string;
  wage: number;
}

interface Shift {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  store: string;
  status: string;
  employee?: Employee;
}

export default function ScheduleMaker() {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [store, setStore] = useState<string>("Pembroke Pines");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate week days (Mon-Sun)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  useEffect(() => {
    fetchEmployees();
    fetchShifts();
  }, [currentWeek, store]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees.filter((e: Employee) => e.store === store));
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const start = format(weekDays[0], "yyyy-MM-dd");
      const end = format(weekDays[6], "yyyy-MM-dd");
      const res = await fetch(`/api/shifts?start=${start}&end=${end}&store=${store}`);
      const data = await res.json();
      if (data.success) {
        setShifts(data.shifts);
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getShiftsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return shifts.filter((s) => s.date === dateStr);
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateHours = (start: string, end: string) => {
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    return (endH + endM / 60) - (startH + startM / 60);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Schedule Maker</CardTitle>
              <p className="text-sm text-slate-500">
                {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={store} onValueChange={setStore}>
              <SelectTrigger className="w-[180px]">
                <Store className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pembroke Pines">Pembroke Pines</SelectItem>
                <SelectItem value="Coral Springs">Coral Springs</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Shift
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading schedule...</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-8 gap-2 mb-2">
                <div className="font-semibold text-sm text-slate-600 p-2">Employee</div>
                {weekDays.map((day, i) => (
                  <div
                    key={i}
                    className={`text-center p-2 rounded-lg ${
                      format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                        ? "bg-blue-100"
                        : "bg-slate-50"
                    }`}
                  >
                    <div className="text-xs text-slate-500">{format(day, "EEE")}</div>
                    <div className="font-semibold">{format(day, "d")}</div>
                  </div>
                ))}
              </div>

              {/* Employee Rows */}
              {employees.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No employees found for {store}
                </div>
              ) : (
                employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="grid grid-cols-8 gap-2 mb-2 border-t border-slate-100 pt-2"
                  >
                    <div className="p-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="font-medium text-sm">
                          {employee.first_name} {employee.last_name}
                        </div>
                        <div className="text-xs text-slate-500 capitalize">{employee.role}</div>
                      </div>
                    </div>

                    {weekDays.map((day, dayIndex) => {
                      const dayShifts = getShiftsForDay(day).filter(
                        (s) => s.employee_id === employee.id
                      );

                      return (
                        <div
                          key={dayIndex}
                          className="p-2 min-h-[80px] bg-slate-50 rounded-lg border border-slate-100"
                        >
                          {dayShifts.map((shift) => (
                            <div
                              key={shift.id}
                              className={`text-xs p-2 rounded mb-1 ${
                                shift.status === "needs_cover"
                                  ? "bg-red-100 text-red-700"
                                  : shift.status === "covered"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              <div className="font-medium">
                                {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                              </div>
                              <div className="text-[10px] opacity-75">
                                {calculateHours(shift.start_time, shift.end_time).toFixed(1)} hrs
                              </div>
                            </div>
                          ))}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-6 text-xs text-slate-400 hover:text-slate-600 opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}

              {/* Summary Row */}
              <div className="grid grid-cols-8 gap-2 mt-4 pt-4 border-t border-slate-200">
                <div className="p-2 font-semibold text-sm">Daily Total</div>
                {weekDays.map((day, i) => {
                  const dayShifts = getShiftsForDay(day);
                  const totalHours = dayShifts.reduce(
                    (sum, s) => sum + calculateHours(s.start_time, s.end_time),
                    0
                  );
                  const laborCost = dayShifts.reduce((sum, s) => {
                    const emp = employees.find((e) => e.id === s.employee_id);
                    return sum + calculateHours(s.start_time, s.end_time) * (emp?.wage || 11);
                  }, 0);

                  return (
                    <div key={i} className="p-2 text-center bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-500">{totalHours.toFixed(1)} hrs</div>
                      <div className="text-xs font-medium text-green-600">
                        ${laborCost.toFixed(0)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
