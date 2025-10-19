import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancellationRequest {
  bookingNumber: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  date: string;
  time: string;
  services: string[];
  totalAmount?: number;
  reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: CancellationRequest = await req.json();

    const servicesHtml = (data.services || []).map((s) => `<li>${s}</li>`).join("");

    const businessEmail = await resend.emails.send({
      from: "RWDetailz Cancellations <onboarding@resend.dev>",
      to: ["rwdetailz@gmail.com"],
      subject: `Booking Cancelled - ${data.bookingNumber}`,
      html: `
        <h2>Booking Cancelled</h2>
        <p><strong>Booking #:</strong> ${data.bookingNumber}</p>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || "N/A"}</p>
        <p><strong>Address:</strong> ${data.address}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Time:</strong> ${data.time}</p>
        <p><strong>Services:</strong></p>
        <ul>${servicesHtml}</ul>
        ${data.totalAmount ? `<p><strong>Total Amount:</strong> $${data.totalAmount}</p>` : ""}
        ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ""}
      `,
    });

    const customerEmail = await resend.emails.send({
      from: "RWDetailz <onboarding@resend.dev>",
      to: [data.email],
      subject: `Your Booking Has Been Cancelled - ${data.bookingNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ef4444;">Booking Cancelled</h1>
          <p>Hi ${data.name},</p>
          <p>Your booking <strong>#${data.bookingNumber}</strong> has been cancelled.</p>
          ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ""}
          <h3>Details</h3>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.time}</p>
          <p><strong>Address:</strong> ${data.address}</p>
          <p><strong>Services:</strong></p>
          <ul>${servicesHtml}</ul>
          ${data.totalAmount ? `<p><strong>Quoted Total:</strong> $${data.totalAmount}</p>` : ""}
          <p>If this was a mistake, reply to this email or call (954) 865-6205.</p>
          <p style="margin-top: 30px;">Best regards,<br><strong>RWDetailz Team</strong></p>
        </div>
      `,
    });

    console.log("Cancellation emails sent:", { businessEmail, customerEmail });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-cancellation-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
