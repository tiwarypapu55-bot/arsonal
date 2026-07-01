-- ==========================================
-- ARCENOL ENERGY - CORPORATE UNIT REGISTRY
-- SUPABASE SQL BLUEPRINT SETUP SCRIPT
-- ==========================================
-- Instructions:
-- 1. Log in to your Supabase Dashboard (https://supabase.com).
-- 2. Open your project and click on the "SQL Editor" tab on the left sidebar.
-- 3. Click "New Query" to open an SQL query editor page.
-- 4. Copy and paste the entire script below into the editor.
-- 5. Click the "Run" button at the bottom right.
-- 6. Go back to your Arcenol Admin Portal and click "Sync ERP" or "Retry Handshake" to link the schema!

-- Create or link the Arcenol Corporate Units table
CREATE TABLE IF NOT EXISTS public.arcenol_corporate_units (
  id text PRIMARY KEY,
  name text NOT NULL,
  "shortName" text,
  type text,
  gstin text,
  cin text,
  "contactEmail" text,
  phone text,
  website text,
  address text,
  capacity text,
  manager text,
  status text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) policies for secure anonymous REST CRUD
ALTER TABLE public.arcenol_corporate_units ENABLE ROW LEVEL SECURITY;

-- Drop policy if it already exists to prevent duplication errors
DROP POLICY IF EXISTS "Allow public access to all records" ON public.arcenol_corporate_units;

-- Create policy for full anonymous public read, write, update, delete
CREATE POLICY "Allow public access to all records" 
ON public.arcenol_corporate_units 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Insert central core backup registry default values
INSERT INTO public.arcenol_corporate_units (id, name, "shortName", type, gstin, cin, "contactEmail", phone, website, address, capacity, manager, status)
VALUES 
  ('ARC-HQ-01', 'Arcenol Corporate Headquarters', 'CENTRAL HEADQUARTERS', 'HEADQUARTERS', '24AAAAC1234A1Z1', 'L31901GJ1995PLC026131', 'corporate@arcenol.com', '+91 79 4028 9200', 'www.arcenol.com', 'Arcenol Tower, GIDC Zone 2, Sector 11, Gandhinagar, Gujarat - 382011', '5,000 MWh / Year', 'Siddharth Arcenol', 'ACTIVE'),
  ('ARC-PL-02', 'Ahmedabad GIDC Mega Assembly Unit-2', 'MEGA ASSEMBLY-2', 'PLANT', '24AAAAC1234A2Z2', 'L31901GJ1995PLC026132', 'ahmedabad-plant2@arcenol.com', '+91 79 2530 0112', 'www.arcenol.com', 'Plot 412, Phase II, GIDC Industrial Estate, Vatva, Ahmedabad, Gujarat - 382445', '12,000 MWh / Year', 'Baldev Singh', 'ACTIVE'),
  ('ARC-PL-03', 'Sanand Battery Pack Assembly Hub-1', 'BATTERY ASSEMBLY-1', 'PLANT', '24AAAAC1234A3Z3', 'L31901GJ1995PLC026133', 'sanand-hub1@arcenol.com', '+91 2717 294011', 'www.arcenol.com', 'Plot A-1/2, Sanand II Industrial Area, GIDC, Bol, Sanand, Gujarat - 382110', '8,000 MWh / Year', 'Ananya Sharma', 'ACTIVE'),
  ('ARC-RC-04', 'Vadodara Lithium Material Recycling Facility', 'RECYCLING FACILITY', 'RECYCLING', '24AAAAC1234A4Z4', 'L31901GJ1995PLC026134', 'recycling-vadodara@arcenol.com', '+91 265 2315112', 'www.arcenol.com', 'GIDC Ranoli, Vadodara, Gujarat - 391350', '2,500 MWh / Year', 'Rajesh Patel', 'DECOMMISSIONED'),
  ('ARC-PL-05', 'Noida Solid-State Cell Assembly Facility-4', 'SOLID CELL ASSEMBLY-4', 'PLANT', '09AAAAC1234A5Z5', 'L31901GJ1995PLC026135', 'noida-cell4@arcenol.com', '+91 120 4581290', 'www.arcenol.com', 'C-56, Phase II, Sector 63, Noida, Uttar Pradesh - 201301', '4,000 MWh / Year', 'Deepak Verma', 'UPGRADE'),
  ('ARC-RC-06', 'Chennai Lithium-Ion Eco-Recycling Depot', 'RECYCLING DEPOT-2', 'RECYCLING', '33AAAAC1234A6Z6', 'L31901GJ1995PLC026136', 'recycling-chennai@arcenol.com', '+91 44 2715 9011', 'www.arcenol.com', 'SIPCOT Industrial Park, Sriperumbudur, Chennai, Tamil Nadu - 602105', '4,000 MWh / Year', 'K. Ramanujam', 'AUDITING')
ON CONFLICT (id) DO NOTHING;
