'use client';

import { useState, useEffect } from 'react';
import ScheduleMaker from '@/components/ScheduleMaker';
import AddEmployeeModal from '@/components/AddEmployeeModal';
import { Button } from '@/components/ui/button';
import { Plus, Users, CalendarDays } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  store: string;
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

export default function SchedulePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    fetchData();
  }, [currentWeek]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees
      const empRes = await fetch('/api/employees');
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData.employees || []);
      }

      // Fetch shifts for the week
      const startDate = format(weekStart, 'yyyy-MM-dd');
      const endDate = format(addDays(weekStart, 6), 'yyyy-MM-dd');
      const shiftRes = await fetch(`/api/shifts?start=${startDate}&end=${endDate}`);
      if (shiftRes.ok) {
        const shiftData = await shiftRes.json();
        setShifts(shiftData.shifts || []);
      }
    } catch (error) {
      console.error('Error fetching schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    console.log('Opening employee modal');
    setIsEmployeeModalOpen(true);
  };

  const handleAddShift = () => {
    // TODO: Open shift modal
    console.log('Add shift clicked');
  };

  const handleShiftUpdate = () => {
    fetchData();
  };

  const handleEmployeeAdded = () => {
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Schedule Maker</h1>
              <p className="text-sm text-gray-500 mt-1">
                Week of {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentWeek(new Date())}
                className="flex items-center gap-2"
              >
                <CalendarDays className="w-4 h-4" />
                Today
              </Button>
              <Button
                variant="outline"
                onClick={handleAddEmployee}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Add Employee
              </Button>
              <Button
                onClick={handleAddShift}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Shift
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
          >
            ← Previous Week
          </Button>
          <div className="flex gap-2">
            {weekDays.map((day, i) => (
              <div
                key={i}
                className={`text-center px-3 py-2 rounded-lg min-w-[60px] ${
                  format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600'
                }`}
              >
                <div className="text-xs font-medium">{format(day, 'EEE')}</div>
                <div className="text-lg font-bold">{format(day, 'd')}</div>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
          >
            Next Week →
          </Button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <ScheduleMaker
            employees={employees}
            shifts={shifts}
            weekStart={weekStart}
            onShiftUpdate={handleShiftUpdate}
          />
        )}
      </div>

      {/* Modals */}
      <AddEmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSuccess={handleEmployeeAdded}
      />
    </div>
  );
}
