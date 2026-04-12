-- Sysco Orders Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS sysco_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL,
  location VARCHAR(100) NOT NULL,
  order_date DATE NOT NULL,
  expected_delivery DATE,
  status VARCHAR(20) DEFAULT 'ordered',
  email_subject TEXT,
  total_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sysco_orders_location ON sysco_orders(location);
CREATE INDEX IF NOT EXISTS idx_sysco_orders_order_date ON sysco_orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_sysco_orders_status ON sysco_orders(status);

-- Enable Row Level Security
ALTER TABLE sysco_orders ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous read access
CREATE POLICY "Allow anonymous read access" ON sysco_orders
  FOR SELECT USING (true);

-- Create policy for anonymous insert access
CREATE POLICY "Allow anonymous insert access" ON sysco_orders
  FOR INSERT WITH CHECK (true);

-- Create policy for anonymous update access
CREATE POLICY "Allow anonymous update access" ON sysco_orders
  FOR UPDATE USING (true);
