import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Email template for password reset
const resetEmailTemplate = (customerName: string, resetLink: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset - RW Detailz</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:#111827; padding:20px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:24px;">
                RW Detailz
              </h1>
              <p style="color:#9ca3af; margin:5px 0 0; font-size:14px;">
                Password Reset Request
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px;">
              <h2 style="color:#111827; margin-top:0;">
                Reset Your Password
              </h2>

              <p style="color:#374151; font-size:16px; line-height:1.5;">
                Hi ${customerName},
              </p>

              <p style="color:#374151; font-size:16px; line-height:1.5;">
                We received a request to reset your password for your RW Detailz account. Click the button below to create a new password.
              </p>

              <p style="color:#6b7280; font-size:14px; line-height:1.5;">
                This link will expire in <strong>1 hour</strong> for security reasons.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" 
                       style="background:#2563eb; color:#ffffff; text-decoration:none; padding:14px 24px; border-radius:6px; font-weight:bold; display:inline-block;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#6b7280; font-size:14px;">
                If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>

              <p style="color:#374151; font-size:16px;">
                — RW Detailz Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb; padding:20px; text-align:center;">
              <p style="color:#9ca3af; font-size:12px; margin:0;">
                © 2025 RWDetailz.com • All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, adminTriggered, adminId } = await req.json();
    console.log("Password reset request for:", email, "Admin triggered:", adminTriggered);

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find user by email in profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      console.log("User not found:", email);
      // Return success anyway to prevent email enumeration
      return new Response(
        JSON.stringify({ success: true, message: "If the email exists, a reset link has been sent." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate token and expiry (1 hour)
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Store token in database
    const { error: tokenError } = await supabaseAdmin
      .from("password_reset_tokens")
      .insert({
        user_id: profile.id,
        email: email,
        token: token,
        expires_at: expiresAt,
      });

    if (tokenError) {
      console.error("Error storing token:", tokenError);
      throw new Error("Failed to create reset token");
    }

    // Build reset link - goes to custom reset page
    const resetLink = `https://rwdetailz.com/auth?reset_token=${token}`;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "RWDetailz <onboarding@resend.dev>",
      to: [email],
      subject: "Reset Your Password - RWDetailz",
      html: resetEmailTemplate(profile.full_name || "Customer", resetLink),
    });

    console.log("Reset email sent:", emailResponse);

    // Log admin action if admin triggered
    if (adminTriggered && adminId) {
      await supabaseAdmin.from("audit_logs").insert({
        admin_id: adminId,
        action_type: "password_reset_sent",
        target_type: "user",
        target_id: profile.id,
        details: { email: email },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Password reset email sent!" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-password-reset:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
