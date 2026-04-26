"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Repeat } from "lucide-react";
import { format, addDays } from "date-fns";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  position?: string;
}

interface AddShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employees: Employee[];
  weekStart: Date;
  store: string;
  preselectedDate?: Date | null;
  preselectedEmployeeId?: string | null;
}

const POSITIONS = [
  "Server",
  "Cashier",
  "Shift Leader",
  "Assistant Manager",
  "Store Manager",
  "Production",
  "Prep"
];

const WEEKDAYS = [
  { key: "mon", label: "M", full: "Monday" },
  { key: "tue", label: "T", full: "Tuesday" },
  { key: "wed", label: "W", full: "Wednesday" },
  { key: "thu", label: "T", full: "Thursday" },
  { key: "fri", label: "F", full: "Friday" },
  { key: "sat", label: "S", full: "Saturday" },
  { key: "sun", label: "S", full: "Sunday" },
];

export default function AddShiftModal({
  isOpen,
  onClose,
  onSuccess,
  employees,
  weekStart,
  store,
  preselectedDate,
  preselectedEmployeeId,
}: AddShiftModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    date: format(weekStart, "yyyy-MM-dd"),
    start_time: "09:00",
    end_time: "17:00",
    store: store,
    position: "",
    notes: "",
  });
  const [recurringDays, setRecurringDays] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);

  // Generate week days for date selection
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return {
      value: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE, MMM d"),
      dayKey: WEEKDAYS[i].key,
    };
  });

  // Update form when preselected values change
  useEffect(() => {
    if (preselectedDate) {
      setFormData((prev) => ({
        ...prev,
        date: format(preselectedDate, "yyyy-MM-dd"),
      }));
      
      // Auto-select the corresponding day for recurring
      const dayIndex = weekDays.findIndex(
        (d) => d.value === format(preselectedDate, "yyyy-MM-dd")
      );
      if (dayIndex >= 0) {
        setRecurringDays([WEEKDAYS[dayIndex].key]);
      }
    }
    if (preselectedEmployeeId) {
      setFormData((prev) => ({
        ...prev,
        employee_id: preselectedEmployeeId,
      }));
      
      // Auto-fill position from employee
      const emp = employees.find((e) => e.id === preselectedEmployeeId);
      if (emp?.position) {
        setFormData((prev) => ({ ...prev, position: emp.position! }));
      }
    }
    // Update store when it changes
    setFormData((prev) => ({
      ...prev,
      store: store,
    }));
  }, [preselectedDate, preselectedEmployeeId, store, employees]);

  const toggleRecurringDay = (dayKey: string) => {
    setRecurringDays((prev) =>
      prev.includes(dayKey)
        ? prev.filter((d) => d !== dayKey)
        : [...prev, dayKey]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // If recurring, create shifts for all selected days
      const datesToCreate = isRecurring && recurringDays.length > 0
        ? recurringDays.map((dayKey) => {
            const dayIndex = WEEKDAYS.findIndex((d) => d.key === dayKey);
            const date = addDays(weekStart, dayIndex);
            return format(date, "yyyy-MM-dd");
          })
        : [formData.date];

      // Create shifts for all selected dates
      for (const date of datesToCreate) {
        const res = await fetch("/api/shifts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            date,
          }),
        });

        const data = await res.json();

        if (!data.success) {
          alert(data.error || "Failed to add shift for " + date);
          setLoading(false);
          return;
        }
      }

      onSuccess();
      onClose();
      // Reset form
      setFormData({
        employee_id: "",
        date: format(weekStart, "yyyy-MM-dd"),
        start_time: "09:00",
        end_time: "17:00",
        store: store,
        position: "",
        notes: "",
      });
      setRecurringDays([]);
      setIsRecurring(false);
    } catch (error) {
      console.error("Error adding shift:", error);
      alert("Failed to add shift");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedEmployee = employees.find((e) => e.id === formData.employee_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Add New Shift</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Employee *</Label>
            <Select
              value={formData.employee_id}
              onValueChange={(value) => {
                setFormData({ ...formData, employee_id: value });
                // Auto-fill position from employee
                const emp = employees.find((e) => e.id === value);
                if (emp?.position) {
                  setFormData((prev) => ({ ...prev, position: emp.position! }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                    {emp.position && ` (${emp.position})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={formData.position}
              onValueChange={(value) =>
                setFormData({ ...formData, position: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEmployee?.position && (
              <p className="text-xs text-gray-500">
                Employee default: {selectedEmployee.position}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Date *</Label>
            <Select
              value={formData.date}
              onValueChange={(value) => {
                setFormData({ ...formData, date: value });
                // Auto-select the day for recurring
                const dayIndex = weekDays.findIndex((d) => d.value === value);
                if (dayIndex >= 0 && !isRecurring) {
                  setRecurringDays([WEEKDAYS[dayIndex].key]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {weekDays.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recurring Shift Toggle */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="recurring" className="mb-0 flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                Make this a recurring shift
              </Label>
            </div>

            {isRecurring && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Select days for this week:</Label>
                <div className="flex gap-1">
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleRecurringDay(day.key)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                        recurringDays.includes(day.key)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title={day.full}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {recurringDays.length > 0
                    ? `Will create ${recurringDays.length} shift(s)`
                    : "Select at least one day"}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Store *</Label>
            <Select
              value={formData.store}
              onValueChange={(value) =>
                setFormData({ ...formData, store: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pembroke Pines">Pembroke Pines</SelectItem>
                <SelectItem value="Coral Springs">Coral Springs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Optional notes..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || (isRecurring && recurringDays.length === 0)} 
              className="flex-1"
            >
              {loading 
                ? "Adding..." 
                : isRecurring 
                  ? `Add ${recurringDays.length} Shifts` 
                  : "Add Shift"
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
