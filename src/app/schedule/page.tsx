'use client';

import { useState, useEffect } from 'react';
import ScheduleMaker from '@/components/ScheduleMaker';
import AddEmployeeModal from '@/components/AddEmployeeModal';
import EditEmployeeModal from '@/components/EditEmployeeModal';
import AddShiftModal from '@/components/AddShiftModal';
import EditShiftModal from '@/components/EditShiftModal';
import DailyScheduleView from '@/components/DailyScheduleView';
import BulkImportEmployeesModal from '@/components/BulkImportEmployeesModal';
import ClientOnly from '@/components/ClientOnly';
import { Button } from '@/components/ui/button';
import { Plus, Users, CalendarDays, ChevronLeft, LayoutDashboard, Calendar, Users2, ChevronDown, ChevronRight, CalendarX, CalendarCheck, RefreshCw, Upload, Edit2, Trash2, Mail, Store, DollarSign } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  role: string;
  store: string;
  position?: string;
  wage?: number;
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

type ViewType = 'schedules' | 'time-off' | 'availability' | 'shift-pool' | 'team';

export default function SchedulePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [store, setStore] = useState("Pembroke Pines");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  const [dailyViewDate, setDailyViewDate] = useState<Date | null>(null);
  const [scheduleExpanded, setScheduleExpanded] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('schedules');

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    fetchData();
  }, [currentWeek, store]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const empRes = await fetch('/api/employees');
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData.employees || []);
      }

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
    setIsEmployeeModalOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEditEmployeeModalOpen(true);
  };

  const handleBulkImport = () => {
    setIsBulkImportOpen(true);
  };

  const handleAddShift = () => {
    setSelectedDate(null);
    setSelectedEmployeeId(null);
    setIsShiftModalOpen(true);
  };

  const handleCellClick = (date: Date, employeeId?: string) => {
    setSelectedDate(date);
    setSelectedEmployeeId(employeeId || null);
    setIsShiftModalOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setIsEditModalOpen(true);
  };

  const handleShiftUpdate = () => {
    fetchData();
  };

  const handleEmployeeAdded = () => {
    fetchData();
  };

  const handleOpenDailyView = (date: Date) => {
    setDailyViewDate(date);
  };

  const handleCloseDailyView = () => {
    setDailyViewDate(null);
  };

  const handleScheduleClick = () => {
    setScheduleExpanded(!scheduleExpanded);
  };

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    if (view === 'schedules') {
      setDailyViewDate(null);
    }
  };

  const timeOffCount = 0;
  const shiftPoolCount = 0;

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'employee': 'Employee',
      'assistant_manager': 'Asst. Manager',
      'manager': 'Manager',
      'admin': 'Admin'
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex-shrink-0">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6 px-2">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              JI
            </div>
            <span className="font-semibold text-lg">Jeremiah&apos;s</span>
          </div>

          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>

            <div>
              <button 
                onClick={handleScheduleClick}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                  activeView === 'schedules' && !dailyViewDate
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Schedule</span>
                </div>
                {scheduleExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {scheduleExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  <button
                    onClick={() => handleViewChange('schedules')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeView === 'schedules' && !dailyViewDate
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <CalendarDays className="w-4 h-4" />
                    <span>Schedules</span>
                  </button>
                  
                  <button
                    onClick={() => handleViewChange('time-off')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeView === 'time-off'
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CalendarX className="w-4 h-4" />
                      <span>Time Off</span>
                    </div>
                    {timeOffCount > 0 && (
                      <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {timeOffCount}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleViewChange('availability')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeView === 'availability'
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Availability</span>
                  </button>
                  
                  <button
                    onClick={() => handleViewChange('shift-pool')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeView === 'shift-pool'
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-4 h-4" />
                      <span>Shift Pool</span>
                    </div>
                    {shiftPoolCount > 0 && (
                      <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {shiftPoolCount}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={() => handleViewChange('team')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeView === 'team'
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users2 className="w-5 h-5" />
              <span className="font-medium">Team</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeView === 'schedules' && 'Schedule Maker'}
                  {activeView === 'time-off' && 'Time Off Requests'}
                  {activeView === 'availability' && 'Employee Availability'}
                  {activeView === 'shift-pool' && 'Shift Pool'}
                  {activeView === 'team' && 'Team Members'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {activeView === 'team' 
                    ? `${employees.length} employees`
                    : dailyViewDate 
                      ? format(dailyViewDate, 'EEEE, MMMM d, yyyy')
                      : `Week of ${format(weekStart, 'MMM d')} - ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`
                  }
                </p>
              </div>
              <div className="flex gap-3">
                {dailyViewDate ? (
                  <Button
                    variant="outline"
                    onClick={handleCloseDailyView}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Weekly View
                  </Button>
                ) : activeView === 'schedules' ? (
                  <>
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
                      variant="outline"
                      onClick={handleBulkImport}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Bulk Import
                    </Button>
                    <Button
                      onClick={handleAddShift}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Shift
                    </Button>
                  </>
                ) : activeView === 'team' ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleAddEmployee}
                      className="flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Add Employee
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleBulkImport}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Bulk Import
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => handleViewChange('schedules')}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Back to Schedule
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Week Navigation */}
        {activeView === 'schedules' && !dailyViewDate && (
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
                    className={`text-center px-3 py-2 rounded-lg min-w-[60px] cursor-pointer hover:bg-slate-100 transition-colors ${
                      format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600'
                    }`}
                    onClick={() => handleOpenDailyView(day)}
                    title="Click for daily timeline view"
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
        )}

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : activeView === 'schedules' ? (
            dailyViewDate ? (
              <DailyScheduleView
                date={dailyViewDate}
                employees={employees}
                shifts={shifts}
                onClose={handleCloseDailyView}
                onShiftUpdate={handleShiftUpdate}
                onEditShift={handleEditShift}
                onAddShift={handleCellClick}
              />
            ) : (
              <ScheduleMaker
                employees={employees}
                shifts={shifts}
                weekStart={weekStart}
                onShiftUpdate={handleShiftUpdate}
                onAddShift={handleCellClick}
                onEditShift={handleEditShift}
                onDayHeaderClick={handleOpenDailyView}
              />
            )
          ) : activeView === 'team' ? (
            /* Team View */
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wage</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No employees found. Add your first employee to get started.
                        </td>
                      </tr>
                    ) : (
                      employees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                {employee.first_name[0]}{employee.last_name[0]}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {employee.first_name} {employee.last_name}
                                </div>
                                {employee.email && (
                                  <div className="text-sm text-gray-500 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {employee.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {getRoleLabel(employee.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 flex items-center gap-1">
                              <Store className="w-4 h-4 text-gray-400" />
                              {employee.store}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {employee.position || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 flex items-center gap-1">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              {employee.wage ? employee.wage.toFixed(2) : '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleEditEmployee(employee)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                              title="Edit employee"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeView === 'time-off' ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <CalendarX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Time Off Requests</h3>
              <p className="text-gray-500 mb-6">No pending time off requests.</p>
            </div>
          ) : activeView === 'availability' ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <CalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Employee Availability</h3>
              <p className="text-gray-500 mb-6">Manage when employees are available to work.</p>
            </div>
          ) : activeView === 'shift-pool' ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Shift Pool</h3>
              <p className="text-gray-500 mb-6">Shifts that need coverage will appear here.</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Modals */}
      <ClientOnly>
        <AddEmployeeModal
          isOpen={isEmployeeModalOpen}
          onClose={() => setIsEmployeeModalOpen(false)}
          onSuccess={handleEmployeeAdded}
        />
      </ClientOnly>
      <ClientOnly>
        <EditEmployeeModal
          isOpen={isEditEmployeeModalOpen}
          onClose={() => setIsEditEmployeeModalOpen(false)}
          onSuccess={handleEmployeeAdded}
          employee={editingEmployee}
        />
      </ClientOnly>
      <ClientOnly>
        <BulkImportEmployeesModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
          onSuccess={handleEmployeeAdded}
        />
      </ClientOnly>
      <ClientOnly>
        <AddShiftModal
          isOpen={isShiftModalOpen}
          onClose={() => setIsShiftModalOpen(false)}
          onSuccess={handleShiftUpdate}
          employees={employees}
          weekStart={weekStart}
          store={store}
          preselectedDate={selectedDate}
          preselectedEmployeeId={selectedEmployeeId}
        />
      </ClientOnly>
      <ClientOnly>
        <EditShiftModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleShiftUpdate}
          shift={editingShift}
          employees={employees}
        />
      </ClientOnly>
    </div>
  );
}
