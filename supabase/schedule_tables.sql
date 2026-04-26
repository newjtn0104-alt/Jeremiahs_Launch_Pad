-- Schedule Maker Database Schema
-- Run this in Supabase SQL Editor

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('employee', 'manager')),
    store TEXT NOT NULL CHECK (store IN ('Pembroke Pines', 'Coral Springs')),
    wage DECIMAL(10,2) NOT NULL DEFAULT 11.00,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Availability table (when employees CAN work)
CREATE TABLE IF NOT EXISTS availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 1=Mon, etc
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shifts table
CREATE TABLE IF NOT EXISTS shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    store TEXT NOT NULL CHECK (store IN ('Pembroke Pines', 'Coral Springs')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'needs_cover', 'covered', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shift swaps (cover requests)
CREATE TABLE IF NOT EXISTS shift_swaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    cover_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    requester_notes TEXT,
    manager_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time off requests
CREATE TABLE IF NOT EXISTS time_off_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    manager_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Employees: Managers can see all, employees can see themselves
CREATE POLICY "Managers can manage all employees" ON employees
    FOR ALL USING (auth.uid() IN (SELECT id FROM employees WHERE role = 'manager' AND active = true));

CREATE POLICY "Employees can view themselves" ON employees
    FOR SELECT USING (auth.uid() = id);

-- Availability: Managers can see all, employees can see their own
CREATE POLICY "Managers can manage all availability" ON availability
    FOR ALL USING (auth.uid() IN (SELECT id FROM employees WHERE role = 'manager' AND active = true));

CREATE POLICY "Employees can manage their own availability" ON availability
    FOR ALL USING (auth.uid() = employee_id);

-- Shifts: Managers can see all, employees can see their own
CREATE POLICY "Managers can manage all shifts" ON shifts
    FOR ALL USING (auth.uid() IN (SELECT id FROM employees WHERE role = 'manager' AND active = true));

CREATE POLICY "Employees can view their own shifts" ON shifts
    FOR SELECT USING (auth.uid() = employee_id);

-- Shift swaps: Managers can see all, employees can see their own
CREATE POLICY "Managers can manage all swaps" ON shift_swaps
    FOR ALL USING (auth.uid() IN (SELECT id FROM employees WHERE role = 'manager' AND active = true));

CREATE POLICY "Employees can manage their own swaps" ON shift_swaps
    FOR ALL USING (auth.uid() = requester_id OR auth.uid() = cover_id);

-- Time off: Managers can see all, employees can see their own
CREATE POLICY "Managers can manage all time off" ON time_off_requests
    FOR ALL USING (auth.uid() IN (SELECT id FROM employees WHERE role = 'manager' AND active = true));

CREATE POLICY "Employees can manage their own time off" ON time_off_requests
    FOR ALL USING (auth.uid() = employee_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shifts_employee_date ON shifts(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_shifts_store_date ON shifts(store, date);
CREATE INDEX IF NOT EXISTS idx_availability_employee ON availability(employee_id);
CREATE INDEX IF NOT EXISTS idx_shift_swaps_shift ON shift_swaps(shift_id);
CREATE INDEX IF NOT EXISTS idx_time_off_employee ON time_off_requests(employee_id);
