import { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, Sparkles } from "lucide-react";

interface BookingLite {
  id: string;
  booking_number: string;
  service_date: string;
  service_time: string;
  total_amount: number;
  status: string;
  address: string;
  full_name: string;
  email: string;
  phone: string;
}

interface Msg { role: "user" | "assistant"; content: string }

export default function OwnerAIChat({ bookings }: { bookings: BookingLite[] }) {
  const [messages, setMessages] = useState<Msg[]>([{
    role: "assistant",
    content: "Hi! I'm your RWDetailz AI assistant. Ask me about bookings, routes, ETAs, customer summaries, or draft replies.",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const context = useMemo(() => {
    const recent = [...(bookings || [])].slice(0, 25).map(b => ({
      id: b.id,
      booking_number: b.booking_number,
      when: `${b.service_date} ${b.service_time}`,
      status: b.status,
      customer: { name: b.full_name, email: b.email, phone: b.phone },
      address: b.address,
      total: b.total_amount,
    }));
    return { recent_bookings: recent };
  }, [bookings]);

  const scrollToBottom = () => {
    if (endRef.current) {
      const container = endRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  const send = async () => {
    const content = input.trim();
    if (!content) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("owner-ai-chat", {
        body: { messages: next, context },
      });
      if (error) throw error;
      const reply = (data as any)?.content || "";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e: any) {
      toast.error(e?.message || "AI request failed.");
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary"/> Owner AI Assistant</CardTitle>
        <CardDescription>ChatGPT-like assistant. It uses your recent booking context for detailed answers.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[360px] overflow-y-auto border rounded-md p-3 bg-background/50 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`${m.role === "assistant" ? "bg-muted" : "bg-primary/10"} rounded-md p-3 whitespace-pre-wrap`}>{m.content}</div>
          ))}
          <div ref={endRef} />
        </div>
        <Separator className="my-3" />
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about today’s bookings, routes, ETAs, or draft a message…"
            className="min-h-[64px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
          />
          <Button onClick={send} disabled={loading}>
            <Send className="w-4 h-4 mr-2"/>{loading ? "Thinking…" : "Send"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
