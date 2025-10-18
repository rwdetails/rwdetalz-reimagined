import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatUI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! Welcome to RWDetailz! 👋 What's your name?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [userName, setUserName] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (!userName) {
      return `Nice to meet you, ${userMessage}! I'm here to help you with booking services, pricing, or any questions about RWDetailz. What can I help you with today?`;
    }

    if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("how much")) {
      return "Our pricing varies by service:\n• Pressure Washing: $150\n• Driveway Cleaning: $120\n• Trash Can Cleaning: $50\n• Roof Cleaning: $200\n\nWould you like to book a service?";
    }

    if (lowerMessage.includes("book") || lowerMessage.includes("schedule") || lowerMessage.includes("appointment")) {
      return "Great! You can book directly through our 'Book Now' tab above. Just select your preferred services, date, and time. Would you like me to guide you through it?";
    }

    if (lowerMessage.includes("service") || lowerMessage.includes("what do you") || lowerMessage.includes("offer")) {
      return "We offer:\n✨ Pressure Washing\n🚗 Driveway Cleaning\n🗑️ Trash Can Cleaning\n🏠 Roof Cleaning\n\nAnd more services coming soon! What are you interested in?";
    }

    if (lowerMessage.includes("area") || lowerMessage.includes("location") || lowerMessage.includes("where")) {
      return "We service all of Broward County, FL including Fort Lauderdale, Hollywood, Pembroke Pines, and surrounding areas. Are you in our service area?";
    }

    if (lowerMessage.includes("contact") || lowerMessage.includes("phone") || lowerMessage.includes("email")) {
      return "You can reach us at:\n📞 (954) 865-6205\n📧 rwdetailz@gmail.com\n\nWe typically respond within 1 hour during business hours!";
    }

    if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
      return `You're welcome, ${userName}! Let me know if you need anything else. 😊`;
    }

    return "I'm here to help! You can ask me about:\n• Our services\n• Pricing\n• Booking appointments\n• Service areas\n• Contact information\n\nWhat would you like to know?";
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponseText = getBotResponse(inputValue);
      
      if (!userName && inputValue.trim()) {
        setUserName(inputValue.trim());
      }

      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponseText,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center glow-border",
          isOpen && "scale-0"
        )}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-96 h-[500px] glass-card rounded-xl shadow-2xl transition-all duration-300 flex flex-col overflow-hidden",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
        )}
      >
        <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              💬
            </div>
            <div>
              <h3 className="font-bold">RWDetailz Chat</h3>
              <p className="text-xs opacity-90">Usually replies instantly</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:opacity-80 transition-opacity">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3 whitespace-pre-line",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              size="icon"
              variant="glow"
              disabled={!inputValue.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatUI;
