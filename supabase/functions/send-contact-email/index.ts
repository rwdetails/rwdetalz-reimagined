import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  phone: string;
  message: string;
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contactData: ContactRequest = await req.json();
    console.log("Received contact request:", contactData);

    const messageContent = `
      <div style="background:#f9fafb; padding:20px; border-radius:8px; margin:20px 0;">
        <p style="color:#374151; margin:5px 0;"><strong>Message:</strong></p>
        <p style="color:#374151; margin:5px 0;">${contactData.message}</p>
      </div>
    `;

    // Send email to business
    const businessEmail = await resend.emails.send({
      from: "RWDetailz Contact <onboarding@resend.dev>",
      to: ["rwdetailz@gmail.com"],
      subject: `New Contact Message from ${contactData.name}`,
      html: emailTemplate(
        "New Contact Message",
        "Team",
        `You have a new message from <strong>${contactData.name}</strong> (${contactData.email}, ${contactData.phone}).`,
        "https://rwdetailz.com",
        "View Dashboard",
        messageContent
      ),
    });

    // Send confirmation email to customer
    const customerEmail = await resend.emails.send({
      from: "RWDetailz <onboarding@resend.dev>",
      to: [contactData.email],
      subject: "We received your message - RWDetailz",
      html: emailTemplate(
        "Thanks for Reaching Out!",
        contactData.name,
        "We've received your message and will get back to you as soon as possible.",
        "https://rwdetailz.com",
        "View Our Services",
        messageContent
      ),
    });

    console.log("Emails sent successfully:", { businessEmail, customerEmail });

    return new Response(
      JSON.stringify({ success: true, message: "Message sent successfully!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
