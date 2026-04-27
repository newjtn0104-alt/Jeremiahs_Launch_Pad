"use client";

import { useState, useEffect, useMemo } from "react";
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
import { X, Trash2, Clock } from "lucide-react";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
}

interface Shift {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  store: string;
  status: string;
  notes?: string;
}

interface EditShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  shift: Shift | null;
  employees: Employee[];
}

// Generate time options in 15-minute intervals from 6 AM to 12 AM
const generateTimeOptions = () => {
  const options: { value: string; label: string }[] = [];
  for (let hour = 6; hour <= 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 24 && minute > 0) continue;
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      const value = `${h}:${m}`;
      
      // Format label as 12-hour time
      const displayHour = hour % 12 || 12;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const label = `${displayHour}:${m} ${ampm}`;
      
      options.push({ value, label });
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

export default function EditShiftModal({
  isOpen,
  onClose,
  onSuccess,
  shift,
  employees,
}: EditShiftModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    date: "",
    start_time: "",
    end_time: "",
    store: "",
    status: "scheduled",
    notes: "",
  });

  useEffect(() => {
    if (shift) {
      setFormData({
        employee_id: shift.employee_id,
        date: shift.date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        store: shift.store,
        status: shift.status,
        notes: shift.notes || "",
      });
    }
  }, [shift]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shift) return;
    
    setLoading(true);

    try {
      const res = await fetch(`/api/shifts/${shift.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        alert(data.error || "Failed to update shift");
      }
    } catch (error) {
      console.error("Error updating shift:", error);
      alert("Failed to update shift");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!shift) return;
    if (!confirm("Are you sure you want to delete this shift?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/shifts/${shift.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        alert(data.error || "Failed to delete shift");
      }
    } catch (error) {
      console.error("Error deleting shift:", error);
      alert("Failed to delete shift");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !shift) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Shift</h2>
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
              onValueChange={(value) =>
                setFormData({ ...formData, employee_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Select
                value={formData.start_time}
                onValueChange={(value) =>
                  setFormData({ ...formData, start_time: value })
                }
              >
                <SelectTrigger className="w-full">
                  <Clock className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {TIME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>End Time *</Label>
              <Select
                value={formData.end_time}
                onValueChange={(value) =>
                  setFormData({ ...formData, end_time: value })
                }
              >
                <SelectTrigger className="w-full">
                  <Clock className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {TIME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="needs_cover">Needs Cover</SelectItem>
                <SelectItem value="covered">Covered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
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
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
