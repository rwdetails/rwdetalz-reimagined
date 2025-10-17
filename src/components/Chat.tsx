import { useState } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hey! 👋 Welcome to RWDetailz! I'm here to help. What can I do for you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [userName, setUserName] = useState("");
  const [showNameInput, setShowNameInput] = useState(true);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    if (showNameInput) {
      setUserName(inputValue);
      setShowNameInput(false);
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          text: inputValue,
          sender: "user",
          timestamp: new Date(),
        },
        {
          id: messages.length + 2,
          text: `Nice to meet you, ${inputValue}! 😊 How can RWDetailz help you today? We offer pressure washing, roof cleaning, driveway cleaning, and more!`,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } else {
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputValue,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages([...messages, newMessage]);

      // Simulate bot response
      setTimeout(() => {
        let botResponse = "I'm here to help! For bookings, you can use our Book Now form, or call us at (954) 865-6205. What else would you like to know?";

        if (inputValue.toLowerCase().includes("book") || inputValue.toLowerCase().includes("schedule")) {
          botResponse = "Great! You can book a service by clicking 'Book Now' in the navigation, or I can connect you with our team at (954) 865-6205. What service are you interested in?";
        } else if (inputValue.toLowerCase().includes("price") || inputValue.toLowerCase().includes("cost")) {
          botResponse = "Our prices start at $39.99 for trash can cleaning, $59.99 for driveways, $79.99 for pressure washing, and $99.99 for roof & gutter cleaning. Want to book today?";
        } else if (inputValue.toLowerCase().includes("area") || inputValue.toLowerCase().includes("location")) {
          botResponse = "We serve all of Fort Lauderdale and Broward County! That includes Plantation, Coral Springs, Pembroke Pines, and surrounding areas. Are you in our service area?";
        }

        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: botResponse,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      }, 1000);
    }

    setInputValue("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-primary text-black shadow-glow-strong hover:scale-110 transition-transform flex items-center justify-center glow-border"
      >
        <MessageCircle className="w-7 h-7" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 glass-card rounded-2xl shadow-2xl border-2 border-primary/30 overflow-hidden transition-all ${
        isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
      }`}
    >
      {/* Header */}
      <div className="bg-primary/10 p-4 flex items-center justify-between border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black font-bold">
            RW
          </div>
          <div>
            <h3 className="font-bold">RWDetailz Support</h3>
            <p className="text-xs text-muted-foreground">Online • Usually replies instantly</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-primary/20 rounded-lg p-2 transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-primary/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-[calc(100%-140px)] overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-primary text-black"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">{formatTime(message.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={showNameInput ? "What's your name?" : "Type a message..."}
                className="bg-background/50"
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
        </>
      )}
    </div>
  );
};

export default Chat;
