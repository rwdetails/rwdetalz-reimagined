-- Add UPDATE policy for bookings so users and owner can update status
CREATE POLICY "Users can update own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add DELETE policy for bookings
CREATE POLICY "Users can delete own bookings" 
ON public.bookings 
FOR DELETE 
USING (auth.uid() = user_id);