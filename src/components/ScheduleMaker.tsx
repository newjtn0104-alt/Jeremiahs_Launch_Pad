"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Store, User, Edit2, Trash2, X, GripVertical, LayoutGrid } from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import DailyScheduleView from "./DailyScheduleView";

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

interface ScheduleMakerProps {
  employees?: Employee[];
  shifts?: Shift[];
  weekStart?: Date;
  onShiftUpdate?: () => void;
  onAddShift?: (date: Date, employeeId?: string) => void;
  onEditShift?: (shift: Shift) => void;
}

export default function ScheduleMaker({
  employees: propEmployees,
  shifts: propShifts,
  weekStart: propWeekStart,
  onShiftUpdate,
  onAddShift,
  onEditShift,
}: ScheduleMakerProps) {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [store, setStore] = useState<string>("Pembroke Pines");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShifts, setSelectedShifts] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [dailyViewDate, setDailyViewDate] = useState<Date | null>(null);
  
  // Drag and drop state
  const [draggedShift, setDraggedShift] = useState<Shift | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{employeeId: string, date: string} | null>(null);

  // Use props if provided, otherwise fetch
  const weekStart = propWeekStart || currentWeek;
  const displayEmployees = propEmployees || employees;
  const displayShifts = propShifts || shifts;

  // Generate week days (Mon-Sun)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (!propEmployees) {
      fetchEmployees();
    }
    if (!propShifts) {
      fetchShifts();
    } else {
      setLoading(false);
    }
  }, [currentWeek, store, propEmployees, propShifts]);

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
    return displayShifts.filter((s) => s.date === dateStr);
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

  const handleCellClick = (day: Date, employeeId?: string) => {
    if (onAddShift) {
      onAddShift(day, employeeId);
    }
  };

  const handleDayHeaderClick = (day: Date) => {
    setDailyViewDate(day);
  };

  const handleCloseDailyView = () => {
    setDailyViewDate(null);
  };

  // Handle shift updates - stays in daily view
  const handleShiftUpdate = () => {
    // Call parent's update handler
    if (onShiftUpdate) onShiftUpdate();
    // Refresh local data if not using props
    if (!propShifts) fetchShifts();
    // Note: We do NOT close the daily view - it stays open
  };

  const handleShiftClick = (e: React.MouseEvent, shift: Shift) => {
    e.stopPropagation();
    if (isSelectMode) {
      toggleShiftSelection(shift.id);
    } else if (onEditShift) {
      onEditShift(shift);
    }
  };

  const handleDeleteShift = async (e: React.MouseEvent, shiftId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this shift?")) return;

    try {
      const res = await fetch(`/api/shifts/${shiftId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        handleShiftUpdate(); // Use our handler that stays in daily view
      } else {
        alert(data.error || "Failed to delete shift");
      }
    } catch (error) {
      console.error("Error deleting shift:", error);
      alert("Failed to delete shift");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, shift: Shift) => {
    setDraggedShift(shift);
    e.dataTransfer.effectAllowed = "move";
    // Set a transparent drag image or use default
  };

  const handleDragOver = (e: React.DragEvent, employeeId: string, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCell({ employeeId, date: format(date, "yyyy-MM-dd") });
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = async (e: React.DragEvent, employeeId: string, date: Date) => {
    e.preventDefault();
    setDragOverCell(null);
    
    if (!draggedShift) return;
    
    const newDate = format(date, "yyyy-MM-dd");
    
    // Only update if something changed
    if (draggedShift.employee_id === employeeId && draggedShift.date === newDate) {
      setDraggedShift(null);
      return;
    }

    try {
      const res = await fetch(`/api/shifts/${draggedShift.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employeeId,
          date: newDate,
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        handleShiftUpdate(); // Use our handler that stays in daily view
      } else {
        alert(data.error || "Failed to move shift");
      }
    } catch (error) {
      console.error("Error moving shift:", error);
      alert("Failed to move shift");
    }
    
    setDraggedShift(null);
  };

  // Bulk selection functions
  const toggleShiftSelection = (shiftId: string) => {
    setSelectedShifts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(shiftId)) {
        newSet.delete(shiftId);
      } else {
        newSet.add(shiftId);
      }
      return newSet;
    });
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedShifts(new Set()); // Clear selections when exiting select mode
    }
  };

  const selectAllShifts = () => {
    const allShiftIds = displayShifts.map(s => s.id);
    setSelectedShifts(new Set(allShiftIds));
  };

  const clearSelection = () => {
    setSelectedShifts(new Set());
  };

  const deleteSelectedShifts = async () => {
    if (selectedShifts.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedShifts.size} selected shifts?`)) return;

    let successCount = 0;
    let failCount = 0;

    for (const shiftId of selectedShifts) {
      try {
        const res = await fetch(`/api/shifts/${shiftId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error("Error deleting shift:", shiftId, error);
        failCount++;
      }
    }

    if (successCount > 0) {
      handleShiftUpdate(); // Use our handler that stays in daily view
    }

    setSelectedShifts(new Set());
    setIsSelectMode(false);

    if (failCount > 0) {
      alert(`Deleted ${successCount} shifts. ${failCount} failed.`);
    }
  };

  // If daily view is open, show it
  if (dailyViewDate) {
    return (
      <DailyScheduleView
        date={dailyViewDate}
        employees={displayEmployees}
        shifts={displayShifts}
        onClose={handleCloseDailyView}
        onShiftUpdate={handleShiftUpdate}
        onEditShift={onEditShift}
        onAddShift={onAddShift}
      />
    );
  }

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
            {!propEmployees && (
              <>
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
              </>
            )}

            <Button 
              variant={isSelectMode ? "secondary" : "outline"}
              onClick={toggleSelectMode}
            >
              {isSelectMode ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                "Select Multiple"
              )}
            </Button>

            {!propEmployees && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => handleCellClick(weekDays[0])}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Shift
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Action Bar */}
        {isSelectMode && (
          <div className="mt-4 p-3 bg-slate-100 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700">
                {selectedShifts.size} shifts selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllShifts}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              disabled={selectedShifts.size === 0}
              onClick={deleteSelectedShifts}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        )}
        
        {/* Drag and drop hint */}
        {!isSelectMode && (
          <div className="mt-2 text-xs text-slate-400">
            💡 Tip: Click on a day header for daily timeline view. Drag and drop shifts to move them.
          </div>
        )}
      </CardHeader>

      <CardContent>
        {loading && !propEmployees ? (
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
                    className={`text-center p-2 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors ${
                      format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                        ? "bg-blue-100"
                        : "bg-slate-50"
                    }`}
                    onClick={() => handleDayHeaderClick(day)}
                    title="Click for daily timeline view"
                  >
                    <div className="text-xs text-slate-500">{format(day, "EEE")}</div>
                    <div className="font-semibold">{format(day, "d")}</div>
                  </div>
                ))}
              </div>

              {/* Employee Rows */}
              {displayEmployees.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No employees found for {store}
                </div>
              ) : (
                displayEmployees.map((employee) => (
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
                      const dateStr = format(day, "yyyy-MM-dd");
                      const isDragOver = dragOverCell?.employeeId === employee.id && dragOverCell?.date === dateStr;

                      return (
                        <div
                          key={dayIndex}
                          className={`p-2 min-h-[80px] rounded-lg border transition-colors group ${
                            isDragOver 
                              ? "bg-blue-100 border-blue-400 border-2" 
                              : "bg-slate-50 border-slate-100 cursor-pointer hover:bg-slate-100"
                          }`}
                          onClick={() => !isSelectMode && dayShifts.length === 0 && handleCellClick(day, employee.id)}
                          onDragOver={(e) => handleDragOver(e, employee.id, day)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, employee.id, day)}
                          title={isSelectMode ? "Click shift to select" : dayShifts.length > 0 ? "Click shift to edit, or drag to move" : "Click to add shift, or drop shift here"}
                        >
                          {dayShifts.map((shift) => (
                            <div
                              key={shift.id}
                              draggable={!isSelectMode}
                              onDragStart={(e) => handleDragStart(e, shift)}
                              className={`text-xs p-2 rounded mb-1 relative group/shift cursor-move ${
                                selectedShifts.has(shift.id)
                                  ? "ring-2 ring-blue-500 bg-blue-100 text-blue-700"
                                  : shift.status === "needs_cover"
                                  ? "bg-red-100 text-red-700"
                                  : shift.status === "covered"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              } ${draggedShift?.id === shift.id ? "opacity-50" : ""}`}
                              onClick={(e) => handleShiftClick(e, shift)}
                            >
                              {/* Drag handle */}
                              {!isSelectMode && (
                                <div className="absolute top-1 left-1 opacity-0 group-hover/shift:opacity-100 transition-opacity">
                                  <GripVertical className="w-3 h-3 text-slate-400" />
                                </div>
                              )}
                              
                              {/* Checkbox in select mode */}
                              {isSelectMode && (
                                <div className="absolute top-1 left-1">
                                  <Checkbox 
                                    checked={selectedShifts.has(shift.id)}
                                    className="w-3 h-3"
                                  />
                                </div>
                              )}
                              
                              <div className={`font-medium ${isSelectMode || !isSelectMode ? "pl-4" : ""}`}>
                                {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                              </div>
                              <div className={`text-[10px] opacity-75 ${isSelectMode || !isSelectMode ? "pl-4" : ""}`}>
                                {calculateHours(shift.start_time, shift.end_time).toFixed(1)} hrs
                              </div>
                              
                              {/* Edit/Delete buttons on hover (only when not in select mode) */}
                              {!isSelectMode && (
                                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover/shift:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => handleShiftClick(e, shift)}
                                    className="p-1 bg-white rounded shadow-sm hover:bg-gray-100"
                                    title="Edit shift"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteShift(e, shift.id)}
                                    className="p-1 bg-white rounded shadow-sm hover:bg-red-100 text-red-600"
                                    title="Delete shift"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}

                          {dayShifts.length === 0 && !isSelectMode && (
                            <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
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
                    const emp = displayEmployees.find((e) => e.id === s.employee_id);
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
