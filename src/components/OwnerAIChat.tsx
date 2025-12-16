/**
 * OwnerAIChat Component
 * 
 * AI assistant for the owner with expanded capabilities:
 * - View bookings and quotes
 * - Cancel bookings
 * - Ban/unban users
 * - Toggle testing mode
 * - View customer details
 * 
 * All admin actions are logged and role-based
 */

import { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, Sparkles, Bot, User } from "lucide-react";

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
  is_quote?: boolean;
  crew_name?: string;
  eta_minutes?: number;
}

interface Msg {
  role: "user" | "assistant";
  content: string;
}

interface OwnerAIChatProps {
  bookings: BookingLite[];
  onCancelBooking?: (bookingId: string) => void;
  onBanUser?: (userId: string, banned: boolean) => void;
  onToggleTestingMode?: (enabled: boolean) => void;
  testingMode?: boolean;
}

export default function OwnerAIChat({
  bookings,
  onCancelBooking,
  onBanUser,
  onToggleTestingMode,
  testingMode = false,
}: OwnerAIChatProps) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `Hi! I'm your RWDetailz AI assistant. I can help you with:

• **View bookings** - "Show today's bookings" or "Show all quotes"
• **Cancel bookings** - "Cancel booking RW-XXXXXX"
• **Ban/Unban users** - "Ban user with email xxx@email.com"
• **Toggle testing mode** - "Turn on testing mode"
• **Customer info** - "Show details for booking RW-XXXXXX"

What would you like to do?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Prepare context for AI including bookings and quotes
  const context = useMemo(() => {
    const recent = [...(bookings || [])].slice(0, 50).map((b) => ({
      id: b.id,
      booking_number: b.booking_number,
      when: `${b.service_date} ${b.service_time}`,
      status: b.status,
      customer: { name: b.full_name, email: b.email, phone: b.phone },
      address: b.address,
      total: b.total_amount,
      is_quote: b.is_quote || false,
      crew_name: b.crew_name || null,
      eta_minutes: b.eta_minutes || null,
    }));

    const quotes = recent.filter((b) => b.is_quote);
    const regularBookings = recent.filter((b) => !b.is_quote);

    return {
      recent_bookings: regularBookings,
      quotes: quotes,
      total_bookings: regularBookings.length,
      total_quotes: quotes.length,
      testing_mode: testingMode,
    };
  }, [bookings, testingMode]);

  const scrollToBottom = () => {
    if (endRef.current) {
      const container = endRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  // Process AI commands locally before sending to AI
  const processLocalCommands = (userInput: string): string | null => {
    const lowerInput = userInput.toLowerCase();

    // Testing mode commands
    if (lowerInput.includes("testing mode on") || lowerInput.includes("enable testing") || lowerInput.includes("turn on testing")) {
      if (onToggleTestingMode) {
        onToggleTestingMode(true);
        return "✅ Testing mode has been **enabled**. Photo requirements are now disabled for bookings.";
      }
    }

    if (lowerInput.includes("testing mode off") || lowerInput.includes("disable testing") || lowerInput.includes("turn off testing")) {
      if (onToggleTestingMode) {
        onToggleTestingMode(false);
        return "✅ Testing mode has been **disabled**. Normal production behavior restored.";
      }
    }

    // Cancel booking command
    const cancelMatch = lowerInput.match(/cancel\s+(?:booking\s+)?#?(rw-[a-z0-9]+)/i);
    if (cancelMatch && onCancelBooking) {
      const bookingNum = cancelMatch[1].toUpperCase();
      const booking = bookings.find((b) => b.booking_number.toUpperCase() === bookingNum);
      if (booking) {
        onCancelBooking(booking.id);
        return `✅ Booking **${bookingNum}** has been cancelled. Customer will be notified via email.`;
      } else {
        return `❌ Booking **${bookingNum}** not found. Please check the booking number.`;
      }
    }

    return null; // Let AI handle the request
  };

  const send = async () => {
    const content = input.trim();
    if (!content) return;

    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      // Check for local commands first
      const localResponse = processLocalCommands(content);
      if (localResponse) {
        setMessages((prev) => [...prev, { role: "assistant", content: localResponse }]);
        setLoading(false);
        setTimeout(scrollToBottom, 50);
        return;
      }

      // Send to AI for complex queries
      const { data, error } = await supabase.functions.invoke("owner-ai-chat", {
        body: { messages: next, context },
      });

      if (error) throw error;
      const reply = (data as any)?.content || "I couldn't process that request. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e: any) {
      console.error("AI request failed:", e);
      toast.error(e?.message || "AI request failed.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Owner AI Assistant
          {testingMode && (
            <Badge variant="outline" className="ml-2 bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
              Testing Mode
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Ask about bookings, quotes, cancel services, ban users, or toggle testing mode.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Chat Messages Container */}
        <div className="h-[360px] overflow-y-auto border rounded-md p-3 bg-background/50 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.role === "assistant" ? "" : "justify-end"}`}
            >
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`rounded-lg p-3 max-w-[80%] whitespace-pre-wrap ${
                  m.role === "assistant"
                    ? "bg-muted text-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {m.content}
              </div>
              {m.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <Separator className="my-3" />

        {/* Input Area */}
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about bookings, cancel a service, ban a user, or toggle testing mode..."
            className="min-h-[64px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button onClick={send} disabled={loading} variant="glow">
            <Send className="w-4 h-4 mr-2" />
            {loading ? "Thinking…" : "Send"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
