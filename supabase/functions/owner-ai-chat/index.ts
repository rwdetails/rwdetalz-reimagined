import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage { role: "system" | "user" | "assistant"; content: string }

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      console.error("LOVABLE_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body = await req.json();
    const messages = (body?.messages || []) as ChatMessage[];
    const context = body?.context;

    const systemPrompt = `You are RWDetailz Owner Assistant - a helpful AI for the owner of RWDetailz pressure washing and detailing business. Be precise, helpful, and action-oriented. Use the provided context to answer questions about bookings, customers, and business operations.

Context:
${JSON.stringify(context ?? {}, null, 2)}

Guidelines:
- Provide clear, actionable responses
- Help with booking management decisions
- Suggest ways to improve customer service
- Be professional and concise`;

    const payload = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.filter((m: ChatMessage) => m.role !== "system"),
      ],
    };

    console.log("Calling Lovable AI Gateway...");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error("Lovable AI error:", resp.status, err);
      
      if (resp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      if (resp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? "";

    console.log("AI response received successfully");

    return new Response(
      JSON.stringify({ content }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e) {
    console.error("Owner AI chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
