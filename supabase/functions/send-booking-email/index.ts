import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  date: string;
  time: string;
  services: string[];
  details: string;
  imageUrls?: string[];
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
    const bookingData: BookingRequest = await req.json();
    console.log("Received booking request:", bookingData);

    const servicesHtml = bookingData.services.map(service => `<li style="color:#374151; margin:5px 0;">${service}</li>`).join("");
    
    // Generate images HTML with proper inline embedding for email clients
    let imagesHtml = '';
    if (bookingData.imageUrls && bookingData.imageUrls.length > 0) {
      const imageItems = bookingData.imageUrls.map((url, index) => `
        <tr>
          <td style="padding: 5px;">
            <a href="${url}" target="_blank" style="color:#2563eb; text-decoration:underline;">View Image ${index + 1}</a>
          </td>
        </tr>
      `).join('');
      
      imagesHtml = `
        <div style="margin-top: 20px; background:#f0f9ff; padding:15px; border-radius:8px; border-left:4px solid #2563eb;">
          <p style="color:#374151; font-weight:bold; margin:0 0 10px 0;">📷 Uploaded Images (${bookingData.imageUrls.length}):</p>
          <table cellpadding="0" cellspacing="0">
            ${imageItems}
          </table>
          <p style="color:#6b7280; font-size:12px; margin:10px 0 0 0;">Click links above to view full-size images</p>
        </div>
      `;
    }

    const detailsContent = `
      <div style="background:#f9fafb; padding:20px; border-radius:8px; margin:20px 0;">
        <p style="color:#374151; margin:5px 0;"><strong>Date:</strong> ${bookingData.date}</p>
        <p style="color:#374151; margin:5px 0;"><strong>Time:</strong> ${bookingData.time}</p>
        <p style="color:#374151; margin:5px 0;"><strong>Address:</strong> ${bookingData.address}</p>
        <p style="color:#374151; margin:10px 0 5px;"><strong>Services:</strong></p>
        <ul style="margin:0; padding-left:20px;">${servicesHtml}</ul>
        ${bookingData.details ? `<p style="color:#374151; margin:10px 0 5px;"><strong>Additional Details:</strong> ${bookingData.details}</p>` : ''}
      </div>
      ${imagesHtml}
    `;

    // Send email to business
    const businessEmail = await resend.emails.send({
      from: "RWDetailz Booking <onboarding@resend.dev>",
      to: ["rwdetailz@gmail.com"],
      subject: `New Booking Request from ${bookingData.name}`,
      html: emailTemplate(
        "New Booking Request",
        "Team",
        `You have a new booking request from <strong>${bookingData.name}</strong> (${bookingData.email}, ${bookingData.phone}).`,
        "https://rwdetailz.com",
        "View Dashboard",
        detailsContent
      ),
    });

    // Send confirmation email to customer
    const customerEmail = await resend.emails.send({
      from: "RWDetailz <onboarding@resend.dev>",
      to: [bookingData.email],
      subject: "Booking Confirmation - RWDetailz",
      html: emailTemplate(
        "Thanks for Your Booking!",
        bookingData.name,
        "We've received your booking request and will contact you soon to confirm the details.",
        "https://rwdetailz.com",
        "View Our Services",
        detailsContent
      ),
    });

    console.log("Emails sent successfully:", { businessEmail, customerEmail });

    return new Response(
      JSON.stringify({ success: true, message: "Booking received successfully!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-email function:", error);
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
