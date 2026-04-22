-- Par Settings Table
-- Stores minimum stock levels for inventory items

CREATE TABLE IF NOT EXISTS par_settings (
  item_id TEXT PRIMARY KEY,
  par_level INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_par_settings_item_id ON par_settings(item_id);

-- Enable Row Level Security
ALTER TABLE par_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access
CREATE POLICY "Allow anonymous read access" ON par_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access" ON par_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update access" ON par_settings
  FOR UPDATE USING (true);
