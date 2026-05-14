import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Sign in — ParkEase" }],
  }),
});

function LoginPage() {
  const [step, setStep] = useState<"cred" | "otp">("cred");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [otpKey, setOtpKey] = useState("");
  const [otpInput, setOtpInput] = useState("");

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden md:block">
        <img
          src="https://images.unsplash.com/photo-1590674899484-13e6a8fef8e4?auto=format&fit=crop&w=1200&q=80"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 to-foreground/60" />
        <div className="absolute inset-0 flex flex-col justify-between p-10 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-background/20 backdrop-blur">
              <MapPin className="h-5 w-5" />
            </span>
            <span className="font-serif text-xl">ParkEase</span>
          </Link>
          <div>
            <div className="max-w-sm font-serif text-3xl leading-tight">
              "Found a covered bay next to my office in under 20 seconds. Saved me ₹3,000 a month."
            </div>
            <div className="mt-4 text-sm opacity-80">Ananya K. · Bengaluru</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 md:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="font-serif text-lg font-semibold">ParkEase</span>
          </Link>

          {step === "cred" ? (
            <>
              <h1 className="font-serif text-3xl">Welcome back</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to manage your bookings and spaces.
              </p>

              <form
                className="mt-8 space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await apiFetch("/auth/login", {
                      method: "POST",
                      body: JSON.stringify({ email: emailInput, password: passwordInput }),
                    });
                    if (res.requireOtp) {
                      setOtpKey(res.key);
                      setStep("otp");
                    } else {
                      localStorage.setItem("pr_token", res.token);
                      localStorage.setItem("pr_user", JSON.stringify(res.user));
                      window.location.href = "/app";
                    }
                  } catch (err: any) {
                    alert(err.message || "Login failed");
                  }
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email or phone</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} className="pl-10" placeholder="you@example.com" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-xs text-primary hover:underline">
                      Forgot?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="password" type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <Button type="submit" className="w-full rounded-xl" size="lg">
                  Continue <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </form>

              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                OR
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="rounded-xl">Google</Button>
                <Button variant="outline" className="rounded-xl">Apple</Button>
              </div>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                New to ParkEase?{" "}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  Create an account
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="font-serif text-3xl">Enter OTP</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                We sent a 6-digit code to your registered phone or email.
              </p>
              <form
                className="mt-8 space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await apiFetch("/auth/verify-otp", {
                      method: "POST",
                      body: JSON.stringify({ key: otpKey, otp: otpInput }),
                    });
                    localStorage.setItem("pr_token", res.token);
                    localStorage.setItem("pr_user", JSON.stringify(res.user));
                    window.location.href = "/app";
                  } catch (err: any) {
                    alert(err.message || "Invalid OTP");
                  }
                }}
              >
                <Input value={otpInput} onChange={e => setOtpInput(e.target.value)} placeholder="••••••" maxLength={6} className="text-center text-2xl tracking-[0.5em]" />
                <Button type="submit" className="w-full rounded-xl" size="lg">
                  Verify & sign in
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("cred")}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
                >
                  ← Back
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
