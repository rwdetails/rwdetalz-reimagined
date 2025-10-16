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
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bookingData: BookingRequest = await req.json();
    console.log("Received booking request:", bookingData);

    const servicesHtml = bookingData.services.map(service => `<li>${service}</li>`).join("");

    // Send email to business
    const businessEmail = await resend.emails.send({
      from: "RWDetailz Booking <onboarding@resend.dev>",
      to: ["rwdetailz@gmail.com"],
      subject: `New Booking Request from ${bookingData.name}`,
      html: `
        <h2>New Booking Request</h2>
        <p><strong>Name:</strong> ${bookingData.name}</p>
        <p><strong>Email:</strong> ${bookingData.email}</p>
        <p><strong>Phone:</strong> ${bookingData.phone}</p>
        <p><strong>Address:</strong> ${bookingData.address}</p>
        <p><strong>Date:</strong> ${bookingData.date}</p>
        <p><strong>Time:</strong> ${bookingData.time}</p>
        <p><strong>Services Requested:</strong></p>
        <ul>${servicesHtml}</ul>
        <p><strong>Additional Details:</strong></p>
        <p>${bookingData.details || "None provided"}</p>
      `,
    });

    // Send confirmation email to customer
    const customerEmail = await resend.emails.send({
      from: "RWDetailz <onboarding@resend.dev>",
      to: [bookingData.email],
      subject: "Booking Confirmation - RWDetailz",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00B0FF;">Thanks for choosing RWDetailz!</h1>
          <p>Hi ${bookingData.name},</p>
          <p>We've received your booking request and will contact you soon to confirm.</p>
          <h3>Booking Details:</h3>
          <p><strong>Date:</strong> ${bookingData.date}</p>
          <p><strong>Time:</strong> ${bookingData.time}</p>
          <p><strong>Address:</strong> ${bookingData.address}</p>
          <p><strong>Services:</strong></p>
          <ul>${servicesHtml}</ul>
          <p>If you have any questions, call us at (954) 865-6205</p>
          <p style="margin-top: 30px;">Best regards,<br><strong>Rakeem & Wood</strong><br>RWDetailz Team</p>
        </div>
      `,
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
