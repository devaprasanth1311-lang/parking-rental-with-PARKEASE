import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Create account — ParkEase" }] }),
});

function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: `${firstName} ${lastName}`.trim(),
          email,
          phone,
          password,
          role: "client" // Unified role
        }),
      });
      alert("Registration successful! Please login.");
      window.location.href = "/login";
    } catch (err: any) {
      alert(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-[1fr_1.1fr]">
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="font-serif text-lg font-semibold">ParkEase</span>
          </Link>

          <h1 className="font-serif text-3xl">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Takes under a minute. You can list a space later.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>First name</Label>
                <Input placeholder="Aditi" value={firstName} onChange={e => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Last name</Label>
                <Input placeholder="Sharma" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Mobile</Label>
              <div className="flex gap-2">
                <div className="flex items-center rounded-md border border-input bg-muted px-3 text-sm">+91</div>
                <Input placeholder="98xxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full rounded-xl" size="lg" disabled={loading}>
              {loading ? "Creating..." : <>Create account <ArrowRight className="ml-1 h-4 w-4" /></>}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              By signing up you agree to our Terms and Privacy Policy.
            </p>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <div className="relative hidden md:block">
        <img
          src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-primary-foreground">
          <div className="font-serif text-4xl leading-tight">
            Join 84,000 drivers & hosts already on ParkEase.
          </div>
        </div>
      </div>
    </div>
  );
}
