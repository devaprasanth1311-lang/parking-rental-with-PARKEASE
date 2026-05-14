import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Star, MapPin, ShieldCheck, Zap, Camera, Clock, ArrowLeft, User, Lock, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/app/space/$spaceId")({
  component: SpaceDetailPage,
  head: ({ loaderData }: any) => ({
    meta: [
      { title: `${loaderData?.space?.title ?? "Space"} — ParkEase` },
    ],
  }),
});

function SpaceDetailPage() {
  const { spaceId } = Route.useParams();
  const [space, setSpace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [startTime, setStartTime] = useState("2026-04-22T09:00");
  const [endTime, setEndTime] = useState("2026-04-22T18:00");
  const [vehicle, setVehicle] = useState("");

  // OTP modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpSending, setOtpSending] = useState(false);
  const [otpSentTo, setOtpSentTo] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    apiFetch(`/parking/${spaceId}`)
      .then(data => {
        setSpace({
          id: data._id,
          title: data.title,
          owner: data.ownerName || data.ownerId?.username || "Unknown",
          address: data.location?.address || "",
          area: data.location?.landmark || "",
          city: data.location?.city || "",
          pricePerHour: data.pricePerHour,
          pricePerDay: data.pricePerDay || data.pricePerHour * 24,
          rating: 4.5,
          reviews: 0,
          image: data.photos?.[0] ? `http://localhost:5000${data.photos[0]}` : "https://images.unsplash.com/photo-1590674899484-13e6a8fef8e4?auto=format&fit=crop&w=1200&q=80",
          type: "Driveway",
          amenities: ["CCTV", "Gated compound"],
          available: data.isAvailable,
          description: data.description || "",
          vehicleTypes: ["Car", "Bike", "SUV", "EV"],
        });
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [spaceId]);

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSendOtp = async () => {
    setOtpSending(true);
    setOtpError("");
    try {
      const resp = await apiFetch("/bookings/send-otp", { method: "POST" });
      setOtpSentTo(resp.sentTo || "your registered contact");
      setShowOtpModal(true);
      setOtpTimer(300); // 5 minutes
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setOtpError(err.message || "Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError("");
    setOtpDigits(["", "", "", "", "", ""]);
    try {
      const resp = await apiFetch("/bookings/send-otp", { method: "POST" });
      setOtpSentTo(resp.sentTo || "your registered contact");
      setOtpTimer(300);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setOtpError(err.message || "Failed to resend OTP");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    setOtpError("");
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all 6 digits entered
    if (value && index === 5 && newDigits.every(d => d !== "")) {
      handleConfirmBooking(newDigits.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newDigits = pasted.split("");
      setOtpDigits(newDigits);
      otpRefs.current[5]?.focus();
      handleConfirmBooking(pasted);
    }
  };

  const handleConfirmBooking = async (otpCode: string) => {
    setBookingLoading(true);
    setOtpError("");
    try {
      await apiFetch("/bookings", {
        method: "POST",
        body: JSON.stringify({
          parkingSpaceId: spaceId,
          startTime,
          endTime,
          vehicleModel: vehicle,
          vehicleType: "Car",
          otp: otpCode,
        })
      });
      setShowOtpModal(false);
      alert("🎉 Booking confirmed successfully!");
      window.location.href = "/app/bookings";
    } catch (err: any) {
      setOtpError(err.message || "Booking failed");
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBook = () => {
    if (!vehicle) {
      alert("Please enter your vehicle model");
      return;
    }
    handleSendOtp();
  };

  if (loading) return <div className="p-10 text-center">Loading space details...</div>;
  if (!space) return <div className="p-10 text-center text-destructive">Space not found</div>;

  const hours = Math.max(1, (new Date(endTime).getTime() - new Date(startTime).getTime()) / 3600000);
  const subtotal = Math.round(hours * space.pricePerHour);

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Link
        to="/app/browse"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to browse
      </Link>

      <div className="mt-4 grid gap-3 md:grid-cols-[2fr_1fr]">
        <div className="aspect-[16/10] overflow-hidden rounded-3xl md:aspect-auto">
          <img src={space.image} alt={space.title} className="h-full w-full object-cover" />
        </div>
        <div className="hidden md:grid gap-3">
          <div className="aspect-video overflow-hidden rounded-2xl bg-muted">
            <img src="https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=600&q=70" className="h-full w-full object-cover" />
          </div>
          <div className="aspect-video overflow-hidden rounded-2xl bg-muted">
            <img src="https://images.unsplash.com/photo-1545179605-1296651e9d43?auto=format&fit=crop&w=600&q=70" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{space.type}</Badge>
            {space.available ? (
              <Badge className="bg-primary/10 text-primary border-0">Available now</Badge>
            ) : (
              <Badge variant="destructive">Fully booked</Badge>
            )}
          </div>
          <h1 className="mt-3 font-serif text-3xl md:text-4xl">{space.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {space.address}, {space.city}
            </span>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-medium">Hosted by {space.owner}</div>
              <div className="text-xs text-muted-foreground">Verified host · Responds in ~10 min</div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-serif text-xl">About this space</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{space.description}</p>
          </div>

          <div className="mt-8">
            <h2 className="font-serif text-xl">What's included</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {space.amenities.map((a: string) => (
                <div key={a} className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
                  <ShieldCheck className="h-4 w-4 text-success" /> {a}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-muted/50 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Camera className="h-4 w-4 text-primary" /> CCTV live feed
            </div>
            <div className="mt-3 aspect-video rounded-xl bg-foreground/90 text-center text-xs text-background">
              <div className="flex h-full items-center justify-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-background/10 px-3 py-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" /> Live · Bay {space.id.slice(-4).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-lg">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="font-serif text-3xl">₹{space.pricePerHour}</span>
                <span className="text-sm text-muted-foreground"> / hour</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <Label className="text-xs">From</Label>
                <Input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">To</Label>
                <Input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Vehicle Model</Label>
                <Input placeholder="e.g. Maruti Swift" value={vehicle} onChange={e => setVehicle(e.target.value)} />
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{Math.round(hours)} hours × ₹{space.pricePerHour}</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-semibold">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>
            </div>

            <Button
              className="mt-5 w-full rounded-xl"
              size="lg"
              disabled={!space.available || otpSending}
              onClick={handleBook}
            >
              {otpSending ? (
                <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Sending OTP...</span>
              ) : space.available ? (
                <span className="inline-flex items-center gap-2"><Lock className="h-4 w-4" /> Reserve with OTP</span>
              ) : "Unavailable"}
            </Button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              A verification OTP will be sent to your registered email/phone
            </p>
            {otpError && !showOtpModal && (
              <p className="mt-2 text-center text-xs text-destructive">{otpError}</p>
            )}
          </div>
        </aside>
      </div>

      {/* ── OTP Verification Modal ── */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className="relative mx-4 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
            style={{ animation: "otpSlideUp 0.35s ease-out" }}
          >
            {/* Header gradient */}
            <div className="bg-gradient-to-br from-primary to-[oklch(0.48_0.16_265)] px-6 py-8 text-center text-primary-foreground">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Lock className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-serif text-2xl">Verify your identity</h3>
              <p className="mt-1 text-sm opacity-80">
                Enter the 6-digit OTP sent to<br />
                <strong>{otpSentTo}</strong>
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute right-3 top-3 rounded-full bg-white/10 p-1.5 text-primary-foreground/70 transition-colors hover:bg-white/20 hover:text-primary-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            {/* OTP inputs */}
            <div className="px-6 py-8">
              <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className={`h-14 w-12 rounded-xl border-2 bg-muted/50 text-center text-xl font-bold transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      otpError ? "border-destructive" : digit ? "border-primary/40" : "border-border"
                    }`}
                  />
                ))}
              </div>

              {otpError && (
                <p className="mt-3 text-center text-sm text-destructive">{otpError}</p>
              )}

              {/* Timer */}
              <div className="mt-4 text-center text-sm text-muted-foreground">
                {otpTimer > 0 ? (
                  <span>OTP expires in <strong className="text-foreground">{formatTimer(otpTimer)}</strong></span>
                ) : (
                  <span className="text-destructive">OTP has expired</span>
                )}
              </div>

              {/* Confirm button */}
              <Button
                className="mt-5 w-full rounded-xl"
                size="lg"
                disabled={bookingLoading || otpDigits.some(d => !d)}
                onClick={() => handleConfirmBooking(otpDigits.join(""))}
              >
                {bookingLoading ? (
                  <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Confirming...</span>
                ) : (
                  "Confirm Booking"
                )}
              </Button>

              {/* Resend */}
              <div className="mt-4 text-center">
                <button
                  onClick={handleResendOtp}
                  disabled={otpTimer > 270}
                  className="text-sm text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>
                {otpTimer > 270 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (wait {otpTimer - 270}s)
                  </span>
                )}
              </div>

              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                A unique OTP has been sent to your registered phone via SMS
              </p>
            </div>
          </div>
        </div>
      )}

      {/* OTP modal animation CSS */}
      <style>{`
        @keyframes otpSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
