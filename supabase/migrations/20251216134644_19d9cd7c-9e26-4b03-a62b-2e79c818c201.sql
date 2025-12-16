-- Add tracking columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS detailer_lat double precision,
ADD COLUMN IF NOT EXISTS detailer_lng double precision,
ADD COLUMN IF NOT EXISTS detailer_updated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS customer_lat double precision,
ADD COLUMN IF NOT EXISTS customer_lng double precision,
ADD COLUMN IF NOT EXISTS tracking_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS eta_minutes integer;

-- Update status column to support new tracking statuses
-- Status values: 'scheduled', 'on-the-way', 'arrived', 'in-progress', 'completed', 'cancelled'

-- Enable realtime for bookings table
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- Ensure REPLICA IDENTITY is set for realtime updates
ALTER TABLE public.bookings REPLICA IDENTITY FULL;