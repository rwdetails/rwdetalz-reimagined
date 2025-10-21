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
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not set" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body = await req.json();
    const messages = (body?.messages || []) as ChatMessage[];
    const context = body?.context;

    const systemPrompt = `You are RWDetailz Owner Assistant. Be precise, helpful, and action-oriented. Use the provided context to answer.
Context:\n${JSON.stringify(context ?? {}, null, 2)}\n`;

    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.filter((m: ChatMessage) => m.role !== "system"),
      ],
      temperature: 0.3,
    };

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return new Response(JSON.stringify({ error: err }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? "";

    return new Response(
      JSON.stringify({ content }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e?.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
