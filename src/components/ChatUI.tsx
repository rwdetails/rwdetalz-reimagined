import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const ChatUI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hey! RWDetailz here — want to schedule your power wash today?", sender: "bot", time: "Just now" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [userName, setUserName] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    if (showNamePrompt) {
      setUserName(inputValue);
      setMessages(prev => [
        ...prev,
        { text: inputValue, sender: "user", time: "Just now" },
        { text: `Great to meet you, ${inputValue}! How can I help you today?`, sender: "bot", time: "Just now" }
      ]);
      setShowNamePrompt(false);
    } else {
      setMessages(prev => [...prev, { text: inputValue, sender: "user", time: "Just now" }]);
      
      setTimeout(() => {
        if (!userName) {
          setMessages(prev => [...prev, { text: "What's your name?", sender: "bot", time: "Just now" }]);
          setShowNamePrompt(true);
        } else {
          setMessages(prev => [...prev, { text: "Thanks for reaching out! I'll connect you with our team right away.", sender: "bot", time: "Just now" }]);
        }
      }, 1000);
    }

    setInputValue("");
  };

  return (
    <>
      {/* Chat Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center glow-border"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-96 h-[500px] border-primary/50 bg-card/95 backdrop-blur-lg shadow-2xl flex flex-col animate-scale-in">
          {/* Header */}
          <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/20 to-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">RWDetailz Chat</h3>
                <p className="text-xs text-muted-foreground">We typically reply instantly</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${message.sender === "user" ? "order-1" : "order-2"}`}>
                  <div className={`rounded-2xl px-4 py-2 ${
                    message.sender === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-foreground"
                  }`}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-2">{message.time}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder={showNamePrompt ? "Enter your name..." : "Type your message..."}
                className="flex-1 bg-background/50"
              />
              <Button onClick={handleSend} size="icon" className="bg-primary hover:bg-primary/90 glow-border">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatUI;
