import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CompletionRequest {
  bookingNumber: string;
  name: string;
  email: string;
  address: string;
  date: string;
  time: string;
  services: string[];
  totalAmount?: number;
}

const emailTemplate = (title: string, customerName: string, message: string, ctaLink: string, ctaText: string, extraContent: string = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>RW Detailz</title>
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
                Premium Auto Detailing
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px;">
              <h2 style="color:#111827; margin-top:0;">
                ${title}
              </h2>

              <p style="color:#374151; font-size:16px; line-height:1.5;">
                Hi ${customerName},
              </p>

              <p style="color:#374151; font-size:16px; line-height:1.5;">
                ${message}
              </p>

              ${extraContent}

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:30px 0;">
                <tr>
                  <td align="center">
                    <a href="${ctaLink}" 
                       style="background:#2563eb; color:#ffffff; text-decoration:none; padding:14px 24px; border-radius:6px; font-weight:bold; display:inline-block;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#6b7280; font-size:14px;">
                If you have any questions, just reply to this email or call us at (954) 865-6205 — we're happy to help.
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
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const data: CompletionRequest = await req.json();
    const servicesHtml = (data.services || []).map((s) => `<li style="color:#374151; margin:5px 0;">${s}</li>`).join("");

    const detailsContent = `
      <div style="background:#f9fafb; padding:20px; border-radius:8px; margin:20px 0;">
        <p style="color:#374151; margin:5px 0;"><strong>Booking #:</strong> ${data.bookingNumber}</p>
        <p style="color:#374151; margin:5px 0;"><strong>Date:</strong> ${data.date}</p>
        <p style="color:#374151; margin:5px 0;"><strong>Time:</strong> ${data.time}</p>
        <p style="color:#374151; margin:5px 0;"><strong>Address:</strong> ${data.address}</p>
        <p style="color:#374151; margin:10px 0 5px;"><strong>Services:</strong></p>
        <ul style="margin:0; padding-left:20px;">${servicesHtml}</ul>
        ${data.totalAmount ? `<p style="color:#374151; margin:10px 0 5px;"><strong>Total:</strong> $${data.totalAmount}</p>` : ""}
      </div>
    `;

    const businessEmail = await resend.emails.send({
      from: "RWDetailz <onboarding@resend.dev>",
      to: ["rwdetailz@gmail.com"],
      subject: `Booking Completed - ${data.bookingNumber}`,
      html: emailTemplate(
        "Booking Completed",
        "Team",
        `The booking for <strong>${data.name}</strong> (${data.email}) has been marked as completed.`,
        "https://rwdetailz.com",
        "View Dashboard",
        detailsContent
      ),
    });

    const customerEmail = await resend.emails.send({
      from: "RWDetailz <onboarding@resend.dev>",
      to: [data.email],
      subject: `Thanks! Your Service Is Complete - ${data.bookingNumber}`,
      html: emailTemplate(
        "Your Service Is Complete! 🎉",
        data.name,
        "Thank you for choosing RW Detailz! We hope you love the results. We'd really appreciate it if you could leave us a review.",
        "https://g.page/r/CXmNz6dVJOqDEBM/review",
        "Leave a Review",
        detailsContent
      ),
    });

    console.log("Completion emails sent:", { businessEmail, customerEmail });
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e: any) {
    console.error("send-completion-email error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
