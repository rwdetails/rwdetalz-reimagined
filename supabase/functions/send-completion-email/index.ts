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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const data: CompletionRequest = await req.json();
    const servicesHtml = (data.services || []).map((s) => `<li>${s}</li>`).join("");

    const businessEmail = await resend.emails.send({
      from: "RWDetailz <onboarding@resend.dev>",
      to: ["rwdetailz@gmail.com"],
      subject: `Booking Completed - ${data.bookingNumber}`,
      html: `
        <h2>Booking Completed</h2>
        <p><strong>Booking #:</strong> ${data.bookingNumber}</p>
        <p><strong>Customer:</strong> ${data.name} (${data.email})</p>
        <p><strong>Address:</strong> ${data.address}</p>
        <p><strong>Date/Time:</strong> ${data.date} at ${data.time}</p>
        <p><strong>Services:</strong></p>
        <ul>${servicesHtml}</ul>
        ${data.totalAmount ? `<p><strong>Total:</strong> $${data.totalAmount}</p>` : ""}
      `,
    });

    const customerEmail = await resend.emails.send({
      from: "RWDetailz <onboarding@resend.dev>",
      to: [data.email],
      subject: `Thanks! Your Service Is Complete - ${data.bookingNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">Your service is complete!</h1>
          <p>Hi ${data.name}, thanks for choosing RWDetailz.</p>
          <h3>Summary</h3>
          <p><strong>Booking #:</strong> ${data.bookingNumber}</p>
          <p><strong>Date/Time:</strong> ${data.date} at ${data.time}</p>
          <p><strong>Address:</strong> ${data.address}</p>
          <p><strong>Services:</strong></p>
          <ul>${servicesHtml}</ul>
          ${data.totalAmount ? `<p><strong>Total:</strong> $${data.totalAmount}</p>` : ""}
          <p>We’d love a review if you’re happy with the results!</p>
        </div>
      `,
    });

    console.log("Completion emails sent:", { businessEmail, customerEmail });
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e: any) {
    console.error("send-completion-email error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
