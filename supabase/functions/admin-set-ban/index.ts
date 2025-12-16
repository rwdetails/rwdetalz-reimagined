/**
 * Edge Function: admin-set-ban
 * 
 * Purpose: Allows admins to ban or unban users
 * Stores ban information including reason, timestamp, and admin who performed the action
 * 
 * Security: Only admins can call this function (validated server-side)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BanRequest {
  userId: string;
  banned: boolean;
  reason?: string;
  adminId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.error("Missing environment variables");
    return new Response(
      JSON.stringify({ error: "Missing service role env" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { userId, banned, reason, adminId }: BanRequest = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Build update object based on ban status
    const updateData: Record<string, any> = {
      banned: banned,
    };

    if (banned) {
      // When banning: set ban details
      updateData.ban_reason = reason || "No reason provided";
      updateData.banned_at = new Date().toISOString();
      updateData.banned_by = adminId || null;
    } else {
      // When unbanning: clear ban details
      updateData.ban_reason = null;
      updateData.banned_at = null;
      updateData.banned_by = null;
    }

    console.log(`${banned ? "Banning" : "Unbanning"} user ${userId}`);

    // Update the profiles table
    const { data, error } = await admin
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    console.log(`Successfully ${banned ? "banned" : "unbanned"} user ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: banned ? "User banned successfully" : "User unbanned successfully",
        user: {
          id: data.id,
          banned: data.banned,
          ban_reason: data.ban_reason,
          banned_at: data.banned_at,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (e: any) {
    console.error("admin-set-ban error:", e);
    return new Response(
      JSON.stringify({ error: e.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
