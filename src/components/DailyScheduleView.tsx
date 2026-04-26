"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Clock, GripVertical, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";

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

interface DailyScheduleViewProps {
  date: Date;
  employees: Employee[];
  shifts: Shift[];
  onClose: () => void;
  onShiftUpdate?: () => void;
  onEditShift?: (shift: Shift) => void;
  onAddShift?: (date: Date, employeeId?: string) => void;
}

// Generate time slots from 8 AM to 11 PM (15-min intervals for grid)
const START_HOUR = 8;
const END_HOUR = 23;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const PIXELS_PER_HOUR = 60; // Width of each hour column in pixels

export default function DailyScheduleView({
  date,
  employees,
  shifts,
  onClose,
  onShiftUpdate,
  onEditShift,
  onAddShift,
}: DailyScheduleViewProps) {
  const [draggedShift, setDraggedShift] = useState<Shift | null>(null);
  const [resizingShift, setResizingShift] = useState<{shift: Shift, edge: 'start' | 'end'} | null>(null);
  const [previewTime, setPreviewTime] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Filter shifts for this date
  const dateStr = format(date, "yyyy-MM-dd");
  const dayShifts = useMemo(() => {
    return shifts.filter((s) => s.date === dateStr);
  }, [shifts, dateStr]);

  // Generate hour labels
  const hourLabels = useMemo(() => {
    const labels = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      const ampm = h >= 12 ? "PM" : "AM";
      const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
      labels.push(`${displayHour} ${ampm}`);
    }
    return labels;
  }, []);

  // Parse time to minutes from start
  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return (hours - START_HOUR) * 60 + minutes;
  };

  // Minutes to time string
  const minutesToTime = (minutes: number) => {
    const totalMinutes = minutes + START_HOUR * 60;
    const h = Math.floor(totalMinutes / 60);
    const m = Math.round(totalMinutes % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Calculate shift position and width
  const getShiftStyle = (shift: Shift) => {
    const startMinutes = timeToMinutes(shift.start_time);
    const endMinutes = timeToMinutes(shift.end_time);
    const duration = endMinutes - startMinutes;
    
    const left = (startMinutes / (TOTAL_HOURS * 60)) * 100;
    const width = (duration / (TOTAL_HOURS * 60)) * 100;
    
    return {
      left: `${left}%`,
      width: `${width}%`,
    };
  };

  // Format time for display
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Calculate hours
  const calculateHours = (start: string, end: string) => {
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    return (endH + endM / 60) - (startH + startM / 60);
  };

  // Get mouse position relative to timeline and convert to time
  const getTimeFromMousePosition = useCallback((clientX: number) => {
    if (!timelineRef.current) return null;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = x / rect.width;
    const totalMinutes = percentage * TOTAL_HOURS * 60;
    // Snap to 15-minute increments
    const snappedMinutes = Math.round(totalMinutes / 15) * 15;
    return minutesToTime(Math.max(0, Math.min(snappedMinutes, TOTAL_HOURS * 60)));
  }, []);

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, shift: Shift, edge: 'start' | 'end') => {
    e.stopPropagation();
    e.preventDefault();
    setResizingShift({ shift, edge });
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newTime = getTimeFromMousePosition(moveEvent.clientX);
      if (newTime) {
        setPreviewTime(newTime);
      }
    };

    const handleMouseUp = async (upEvent: MouseEvent) => {
      const finalTime = getTimeFromMousePosition(upEvent.clientX);
      if (finalTime && resizingShift) {
        const updates: Partial<Shift> = {};
        if (resizingShift.edge === 'start') {
          updates.start_time = finalTime;
        } else {
          updates.end_time = finalTime;
        }

        try {
          const res = await fetch(`/api/shifts/${resizingShift.shift.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });

          const data = await res.json();
          if (data.success) {
            if (onShiftUpdate) onShiftUpdate();
          } else {
            alert(data.error || "Failed to update shift");
          }
        } catch (error) {
          console.error("Error updating shift:", error);
          alert("Failed to update shift");
        }
      }
      
      setResizingShift(null);
      setPreviewTime(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Drag handlers for moving between employees
  const handleDragStart = (e: React.DragEvent, shift: Shift) => {
    setDraggedShift(shift);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, employeeId: string) => {
    e.preventDefault();
    if (!draggedShift) return;

    if (draggedShift.employee_id === employeeId) {
      setDraggedShift(null);
      return;
    }

    try {
      const res = await fetch(`/api/shifts/${draggedShift.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employeeId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (onShiftUpdate) onShiftUpdate();
      } else {
        alert(data.error || "Failed to move shift");
      }
    } catch (error) {
      console.error("Error moving shift:", error);
      alert("Failed to move shift");
    }

    setDraggedShift(null);
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
        if (onShiftUpdate) onShiftUpdate();
      } else {
        alert(data.error || "Failed to delete shift");
      }
    } catch (error) {
      console.error("Error deleting shift:", error);
      alert("Failed to delete shift");
    }
  };

  const handleShiftClick = (e: React.MouseEvent, shift: Shift) => {
    e.stopPropagation();
    if (onEditShift) {
      onEditShift(shift);
    }
  };

  const handleCellClick = (employeeId: string) => {
    if (onAddShift) {
      onAddShift(date, employeeId);
    }
  };

  const getEmployeeShifts = (employeeId: string) => {
    return dayShifts.filter((s) => s.employee_id === employeeId);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">
                Daily View - {format(date, "EEEE, MMMM d, yyyy")}
              </CardTitle>
              <p className="text-sm text-slate-500">
                {dayShifts.length} shifts scheduled
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Time header */}
        <div className="flex mb-2">
          <div className="w-40 flex-shrink-0 font-semibold text-sm text-slate-600 p-2">
            Employee
          </div>
          <div className="flex-1 relative" ref={timelineRef}>
            {/* Hour grid lines and labels */}
            <div className="flex h-8 relative">
              {hourLabels.map((label, i) => (
                <div
                  key={i}
                  className="flex-1 text-xs text-slate-400 text-center border-l border-slate-200 first:border-l-0"
                  style={{ minWidth: `${PIXELS_PER_HOUR}px` }}
                >
                  {label}
                </div>
              ))}
            </div>
            {/* Vertical grid lines */}
            <div className="absolute top-8 bottom-0 left-0 right-0 flex pointer-events-none">
              {Array.from({ length: hourLabels.length }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 border-l border-slate-100 first:border-l-0"
                  style={{ minWidth: `${PIXELS_PER_HOUR}px` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Employee rows */}
        <div className="space-y-2">
          {employees.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No employees found
            </div>
          ) : (
            employees.map((employee) => {
              const empShifts = getEmployeeShifts(employee.id);

              return (
                <div
                  key={employee.id}
                  className="flex items-center min-h-[60px]"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, employee.id)}
                >
                  {/* Employee name */}
                  <div className="w-40 flex-shrink-0 p-2 border-r border-slate-200">
                    <div className="font-medium text-sm">
                      {employee.first_name} {employee.last_name}
                    </div>
                    <div className="text-xs text-slate-500 capitalize">
                      {employee.role}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div
                    className="flex-1 relative h-[60px] bg-slate-50 rounded cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => empShifts.length === 0 && handleCellClick(employee.id)}
                    style={{ minWidth: `${hourLabels.length * PIXELS_PER_HOUR}px` }}
                  >
                    {/* Hour grid lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {Array.from({ length: hourLabels.length }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 border-l border-slate-200 first:border-l-0"
                        />
                      ))}
                    </div>

                    {/* Shifts */}
                    {empShifts.map((shift) => (
                      <div
                        key={shift.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, shift)}
                        onClick={(e) => handleShiftClick(e, shift)}
                        className={`absolute top-2 bottom-2 rounded-md text-xs cursor-move group/shift overflow-hidden ${
                          shift.status === "needs_cover"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : shift.status === "covered"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        } ${draggedShift?.id === shift.id ? "opacity-50" : ""}`}
                        style={getShiftStyle(shift)}
                        title={`${formatTime(shift.start_time)} - ${formatTime(shift.end_time)} (${calculateHours(shift.start_time, shift.end_time).toFixed(1)} hrs)`}
                      >
                        {/* Resize handles */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-blue-400/50 flex items-center justify-center opacity-0 group-hover/shift:opacity-100 transition-opacity"
                          onMouseDown={(e) => handleResizeStart(e, shift, 'start')}
                        >
                          <div className="w-1 h-4 bg-slate-400 rounded-full" />
                        </div>
                        
                        <div
                          className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-blue-400/50 flex items-center justify-center opacity-0 group-hover/shift:opacity-100 transition-opacity"
                          onMouseDown={(e) => handleResizeStart(e, shift, 'end')}
                        >
                          <div className="w-1 h-4 bg-slate-400 rounded-full" />
                        </div>

                        {/* Drag handle */}
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/shift:opacity-100 transition-opacity">
                          <GripVertical className="w-3 h-3 text-slate-400" />
                        </div>

                        {/* Shift content */}
                        <div className="pl-6 pr-6 h-full flex flex-col justify-center">
                          <div className="font-medium truncate">
                            {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                          </div>
                          <div className="text-[10px] opacity-75">
                            {calculateHours(shift.start_time, shift.end_time).toFixed(1)} hrs
                          </div>
                        </div>

                        {/* Edit/Delete buttons */}
                        <div className="absolute top-1 right-4 flex gap-1 opacity-0 group-hover/shift:opacity-100 transition-opacity">
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

                        {/* Preview time while resizing */}
                        {resizingShift?.shift.id === shift.id && previewTime && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                            {resizingShift.edge === 'start' ? 'Start: ' : 'End: '}{formatTime(previewTime)}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Empty state */}
                    {empShifts.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-xs text-slate-400">+ Add shift</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded" />
            <span className="text-slate-600">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded" />
            <span className="text-slate-600">Needs Cover</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded" />
            <span className="text-slate-600">Covered</span>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-4 text-xs text-slate-400">
          💡 Tip: Drag edges to resize, drag center to move, click to edit
        </div>
      </CardContent>
    </Card>
  );
}
