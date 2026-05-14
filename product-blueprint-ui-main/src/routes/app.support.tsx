import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/app/support")({
  component: SupportPage,
  head: () => ({ meta: [{ title: "Support — ParkEase" }] }),
});

function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
    }, 500);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center md:px-6">
        <h1 className="font-serif text-3xl">Message Sent</h1>
        <p className="mt-2 text-muted-foreground">
          Our admin team has received your message and will get back to you shortly.
        </p>
        <Button className="mt-6" onClick={() => setSubmitted(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-coral">Help Center</div>
        <h1 className="mt-1 font-serif text-3xl md:text-4xl">Contact Support</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Have a question or need to report an issue? Send a message directly to our admin team.
        </p>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_300px]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="E.g. Issue with payment, Feedback on app"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or feedback in detail..."
                required
              />
            </div>
            <Button type="submit" size="lg">Send Message to Admin</Button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-muted/40 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <div className="font-semibold">Email us</div>
                <div className="text-sm text-muted-foreground">admin@parkease.com</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-muted/40 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <div className="font-semibold">Call us</div>
                <div className="text-sm text-muted-foreground">+91 1800-123-4567</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-muted/40 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageSquare className="h-5 w-5" />
              </span>
              <div>
                <div className="font-semibold">Live Chat</div>
                <div className="text-sm text-muted-foreground">Available 9 AM - 6 PM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
