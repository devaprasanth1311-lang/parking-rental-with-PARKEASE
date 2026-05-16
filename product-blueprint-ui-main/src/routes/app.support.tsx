import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Mail, Phone, Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/app/support")({
  component: SupportPage,
  head: () => ({ meta: [{ title: "Support — ParkEase" }] }),
});

type Message = {
  id: string;
  type: "bot" | "user";
  text: string;
};

const PREBUILT_OPTIONS = [
  "How do I list my driveway?",
  "How do I book a parking space?",
  "How does the pricing work?",
];

function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      text: "Hi there! I'm the ParkEase AI Assistant. How can I help you today? You can choose one of the options below or type your question.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleBotResponse = async (question: string) => {
    setIsLoading(true);
    try {
      const response = await apiFetch("/chat", {
        method: "POST",
        body: JSON.stringify({ message: question }),
      });
      
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), type: "bot", text: response.reply },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      // Fallback local response if API fails
      let botResponse = "I'm having trouble connecting to the AI server right now. Please try again later or contact our admin at 6369955445.";
      
      const lowerQ = question.toLowerCase();
      if (lowerQ.includes("list") && (lowerQ.includes("driveway") || lowerQ.includes("space"))) {
        botResponse = "To list your driveway, click on 'List your driveway' in the navigation menu, fill in the details about your space, upload photos, and submit for approval.";
      } else if (lowerQ.includes("book") && (lowerQ.includes("parking") || lowerQ.includes("space") || lowerQ.includes("driveway"))) {
        botResponse = "You can browse available driveways on the 'Find parking' page, select a driveway, choose your dates, and click 'Book Now'.";
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), type: "bot", text: botResponse },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Add user message
    setMessages((prev) => [...prev, { id: Date.now().toString(), type: "user", text }]);
    setInputValue("");

    // Process bot response
    await handleBotResponse(text);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-coral">Help Center</div>
        <h1 className="mt-1 font-serif text-3xl md:text-4xl">Support & Contact</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Need help? Chat with our AI assistant or contact our admin team directly.
        </p>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_350px]">
        {/* Chatbot Interface */}
        <div className="flex h-[600px] flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-6 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <div className="font-semibold">ParkEase AI Assistant</div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-green-500">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                Online
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-surface/30 p-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.type === "user" ? "ml-auto flex-row-reverse" : "",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    msg.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {msg.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </span>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                    msg.type === "user"
                      ? "rounded-tr-sm bg-primary text-primary-foreground"
                      : "rounded-tl-sm bg-muted text-foreground",
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                  <Bot className="h-4 w-4" />
                </span>
                <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:0.2s]"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="mt-4 flex flex-col gap-2 pl-11">
                <div className="mb-1 text-xs font-medium text-muted-foreground">
                  Frequently asked questions:
                </div>
                {PREBUILT_OPTIONS.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(option)}
                    className="w-fit rounded-full border border-border bg-background px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border bg-background p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 rounded-full border-transparent bg-muted/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary"
              />
              <Button
                type="submit"
                size="icon"
                className="shrink-0 rounded-full"
                disabled={!inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-muted/40 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <div className="font-semibold">Contact Admin (Email)</div>
                <div className="break-all text-sm text-muted-foreground">
                  gamingraistar560@gmail.com
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-muted/40 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <div className="font-semibold">Contact Admin (Phone)</div>
                <div className="text-sm text-muted-foreground">6369955445</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-muted/40 p-5">
            <div className="flex flex-col gap-2">
              <div className="font-semibold">Trust & Safety</div>
              <div className="text-sm leading-relaxed text-muted-foreground">
                Your safety is our priority. All homeowners are verified and all bookings are
                monitored securely. If you notice any suspicious activity, please contact our admin
                immediately using the details above.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
