/**
 * Edge Function: update-detailer-location
 * 
 * Purpose: Receives GPS location updates from the detailer's mobile device
 * and updates the booking record in real-time.
 * 
 * Security: Only admins/detailers can update location for a booking
 * The booking must have tracking_enabled = true
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { booking_number, lat, lng, status, eta_minutes } = await req.json();

    // Validate required fields
    if (!booking_number) {
      return new Response(
        JSON.stringify({ error: 'booking_number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return new Response(
        JSON.stringify({ error: 'lat and lng must be valid numbers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate coordinates are within valid ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return new Response(
        JSON.stringify({ error: 'Invalid coordinates' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Updating location for booking ${booking_number}: lat=${lat}, lng=${lng}`);

    // Build update object
    const updateData: Record<string, any> = {
      detailer_lat: lat,
      detailer_lng: lng,
      detailer_updated_at: new Date().toISOString(),
      tracking_enabled: true,
    };

    // Optionally update status if provided
    const validStatuses = ['scheduled', 'on-the-way', 'arrived', 'in-progress', 'completed', 'cancelled'];
    if (status && validStatuses.includes(status)) {
      updateData.status = status;
    }

    // Optionally update ETA if provided
    if (typeof eta_minutes === 'number' && eta_minutes >= 0) {
      updateData.eta_minutes = Math.round(eta_minutes);
    }

    // Update the booking record
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('booking_number', booking_number)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update location', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully updated booking ${booking_number}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Location updated successfully',
        booking_number: data.booking_number,
        status: data.status,
        detailer_lat: data.detailer_lat,
        detailer_lng: data.detailer_lng,
        eta_minutes: data.eta_minutes
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
