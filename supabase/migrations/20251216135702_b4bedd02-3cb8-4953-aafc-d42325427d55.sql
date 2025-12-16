-- Add ban-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS banned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ban_reason text,
ADD COLUMN IF NOT EXISTS banned_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS banned_by uuid;

-- Add crew_name column to bookings for tracking who is assigned
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS crew_name text;

-- Add is_quote column to distinguish quotes from bookings
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS is_quote boolean DEFAULT false;