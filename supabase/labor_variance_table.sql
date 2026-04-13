-- Labor Variance Table
-- Stores scheduled vs actual hours for weekly comparison

CREATE TABLE IF NOT EXISTS labor_variance (
  id SERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  employee_name VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  scheduled_hours DECIMAL(6,2) DEFAULT 0,
  actual_hours DECIMAL(6,2) DEFAULT 0,
  variance DECIMAL(6,2) DEFAULT 0,
  shifts_scheduled INTEGER DEFAULT 0,
  shifts_worked INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ok',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_labor_variance_week ON labor_variance(week_start DESC);
CREATE INDEX IF NOT EXISTS idx_labor_variance_employee ON labor_variance(employee_name);
CREATE INDEX IF NOT EXISTS idx_labor_variance_location ON labor_variance(location);

-- Enable Row Level Security
ALTER TABLE labor_variance ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access
CREATE POLICY "Allow anonymous read access" ON labor_variance
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access" ON labor_variance
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update access" ON labor_variance
  FOR UPDATE USING (true);
