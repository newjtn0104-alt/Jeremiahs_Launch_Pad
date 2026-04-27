"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
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

const START_HOUR = 8;
const END_HOUR = 23;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const PIXELS_PER_HOUR = 60;

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
  const [resizing, setResizing] = useState<{
    shift: Shift;
    edge: 'start' | 'end';
    startX: number;
    originalTime: string;
  } | null>(null);
  const [previewTime, setPreviewTime] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dateStr = format(date, "yyyy-MM-dd");
  const dayShifts = useMemo(() => {
    return shifts.filter((s) => s.date === dateStr);
  }, [shifts, dateStr]);

  const hourLabels = useMemo(() => {
    const labels = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      const ampm = h >= 12 ? "PM" : "AM";
      const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
      labels.push(`${displayHour} ${ampm}`);
    }
    return labels;
  }, []);

  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return (hours - START_HOUR) * 60 + minutes;
  };

  const minutesToTime = (minutes: number) => {
    const totalMinutes = minutes + START_HOUR * 60;
    const h = Math.floor(totalMinutes / 60);
    const m = Math.round(totalMinutes % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

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

  // Get time from mouse X position
  const getTimeFromMouseX = useCallback((clientX: number): string | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = x / rect.width;
    const totalMinutes = percentage * TOTAL_HOURS * 60;
    const snappedMinutes = Math.round(totalMinutes / 15) * 15;
    return minutesToTime(Math.max(0, Math.min(snappedMinutes, TOTAL_HOURS * 60)));
  }, []);

  // Start resize
  const startResize = (e: React.MouseEvent, shift: Shift, edge: 'start' | 'end') => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizing({
      shift,
      edge,
      startX: e.clientX,
      originalTime: edge === 'start' ? shift.start_time : shift.end_time,
    });
  };

  // Handle mouse move during resize
  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const newTime = getTimeFromMouseX(e.clientX);
      if (newTime) {
        setPreviewTime(newTime);
      }
    };

    const handleMouseUp = async (e: MouseEvent) => {
      e.preventDefault();
      const finalTime = getTimeFromMouseX(e.clientX);
      
      if (finalTime && resizing) {
        const updates: Partial<Shift> = {};
        if (resizing.edge === 'start') {
          updates.start_time = finalTime;
        } else {
          updates.end_time = finalTime;
        }

        try {
          const res = await fetch(`/api/shifts/${resizing.shift.id}`, {
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
      
      setResizing(null);
      setPreviewTime(null);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, getTimeFromMouseX, onShiftUpdate]);

  // Drag handlers for moving between employees
  const handleDragStart = (e: React.DragEvent, shift: Shift) => {
    if (isResizing) {
      e.preventDefault();
      return;
    }
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
        body: JSON.stringify({ employee_id: employeeId }),
      });

      const data = await res.json();
      if (data.success) {
        if (onShiftUpdate) onShiftUpdate();
      }
    } catch (error) {
      console.error("Error moving shift:", error);
    }

    setDraggedShift(null);
  };

  const handleDeleteShift = async (e: React.MouseEvent, shiftId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this shift?")) return;

    try {
      const res = await fetch(`/api/shifts/${shiftId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success && onShiftUpdate) onShiftUpdate();
    } catch (error) {
      console.error("Error deleting shift:", error);
    }
  };

  const handleShiftClick = (e: React.MouseEvent, shift: Shift) => {
    if (isResizing) return;
    e.stopPropagation();
    if (onEditShift) onEditShift(shift);
  };

  const handleCellClick = (employeeId: string) => {
    if (onAddShift) onAddShift(date, employeeId);
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
          </div>
        </div>

        {/* Employee rows */}
        <div className="space-y-2" ref={containerRef}>
          {employees.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No employees found</div>
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
                  <div className="w-40 flex-shrink-0 p-2 border-r border-slate-200">
                    <div className="font-medium text-sm">
                      {employee.first_name} {employee.last_name}
                    </div>
                    <div className="text-xs text-slate-500 capitalize">{employee.role}</div>
                  </div>

                  <div
                    className="flex-1 relative h-[60px] bg-slate-50 rounded"
                    onClick={() => empShifts.length === 0 && handleCellClick(employee.id)}
                    style={{ minWidth: `${hourLabels.length * PIXELS_PER_HOUR}px` }}
                  >
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {Array.from({ length: hourLabels.length }).map((_, i) => (
                        <div key={i} className="flex-1 border-l border-slate-200 first:border-l-0" />
                      ))}
                    </div>

                    {/* Shifts */}
                    {empShifts.map((shift) => (
                      <div
                        key={shift.id}
                        draggable={!isResizing}
                        onDragStart={(e) => handleDragStart(e, shift)}
                        onClick={(e) => handleShiftClick(e, shift)}
                        className={`absolute top-2 bottom-2 rounded-md text-xs select-none ${
                          shift.status === "needs_cover"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : shift.status === "covered"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        } ${draggedShift?.id === shift.id ? "opacity-50" : ""}`}
                        style={getShiftStyle(shift)}
                      >
                        {/* Left resize handle */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-4 cursor-ew-resize z-20 flex items-center justify-center hover:bg-blue-500/30"
                          onMouseDown={(e) => startResize(e, shift, 'start')}
                          style={{ touchAction: 'none' }}
                        >
                          <div className="w-1 h-8 bg-slate-500/60 rounded-full" />
                        </div>

                        {/* Right resize handle */}
                        <div
                          className="absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize z-20 flex items-center justify-center hover:bg-blue-500/30"
                          onMouseDown={(e) => startResize(e, shift, 'end')}
                          style={{ touchAction: 'none' }}
                        >
                          <div className="w-1 h-8 bg-slate-500/60 rounded-full" />
                        </div>

                        {/* Content area (for dragging) */}
                        <div className="absolute left-4 right-4 top-0 bottom-0 cursor-move flex items-center justify-center">
                          <div className="opacity-0 hover:opacity-100 transition-opacity">
                            <GripVertical className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>

                        {/* Text content */}
                        <div className="px-5 h-full flex flex-col justify-center pointer-events-none">
                          <div className="font-medium truncate">
                            {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                          </div>
                          <div className="text-[10px] opacity-75">
                            {calculateHours(shift.start_time, shift.end_time).toFixed(1)} hrs
                          </div>
                        </div>

                        {/* Edit/Delete buttons */}
                        <div className="absolute top-1 right-5 flex gap-1 opacity-0 hover:opacity-100 transition-opacity z-30">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleShiftClick(e, shift); }}
                            className="p-1 bg-white rounded shadow-sm hover:bg-gray-100"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteShift(e, shift.id)}
                            className="p-1 bg-white rounded shadow-sm hover:bg-red-100 text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Preview tooltip while resizing */}
                        {resizing?.shift.id === shift.id && previewTime && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                            {resizing.edge === 'start' ? 'Start: ' : 'End: '}{formatTime(previewTime)}
                          </div>
                        )}
                      </div>
                    ))}

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

        <div className="mt-4 text-xs text-slate-400">
          💡 Tip: Drag the grey bars on edges to resize, drag center to move, click to edit
        </div>
      </CardContent>
    </Card>
  );
}
