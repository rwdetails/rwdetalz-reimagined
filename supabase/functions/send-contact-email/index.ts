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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contactData: ContactRequest = await req.json();
    console.log("Received contact request:", contactData);

    // Send email to business
    const businessEmail = await resend.emails.send({
      from: "RWDetailz Contact <onboarding@resend.dev>",
      to: ["rwdetailz@gmail.com"],
      subject: `New Contact Message from ${contactData.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Phone:</strong> ${contactData.phone}</p>
        <p><strong>Message:</strong></p>
        <p>${contactData.message}</p>
      `,
    });

    // Send confirmation email to customer
    const customerEmail = await resend.emails.send({
      from: "RWDetailz <onboarding@resend.dev>",
      to: [contactData.email],
      subject: "We received your message - RWDetailz",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00B0FF;">Thanks for reaching out!</h1>
          <p>Hi ${contactData.name},</p>
          <p>We've received your message and will get back to you as soon as possible.</p>
          <h3>Your Message:</h3>
          <p>${contactData.message}</p>
          <p>If you need immediate assistance, call us at (954) 865-6205</p>
          <p style="margin-top: 30px;">Best regards,<br><strong>Rakeem & Wood</strong><br>RWDetailz Team</p>
        </div>
      `,
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
