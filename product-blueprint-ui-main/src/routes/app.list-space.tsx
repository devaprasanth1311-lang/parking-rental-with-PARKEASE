import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, CheckCircle2, MapPin, DollarSign, Camera, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/app/list-space")({
  component: ListSpacePage,
  head: () => ({ meta: [{ title: "List your space — ParkEase" }] }),
});

const STEPS = [
  { n: 1, label: "Location", icon: MapPin },
  { n: 2, label: "Details", icon: Shield },
  { n: 3, label: "Photos", icon: Camera },
  { n: 4, label: "Pricing", icon: DollarSign },
] as const;

function ListSpacePage() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [landmark, setLandmark] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("House Parking");
  const [description, setDescription] = useState("");
  const [pricePerHour, setPricePerHour] = useState("60");
  const [pricePerDay, setPricePerDay] = useState("450");
  const [landProof, setLandProof] = useState<File | null>(null);
  const [nationalIdProof, setNationalIdProof] = useState<File | null>(null);
  const [ownerPhoto, setOwnerPhoto] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    if (!otpVerified) {
      alert("Please verify your phone number via OTP before submitting.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("address", address);
    formData.append("city", city);
    formData.append("landmark", landmark);
    formData.append("pricePerHour", pricePerHour);
    formData.append("pricePerDay", pricePerDay);
    formData.append("type", type);
    formData.append("ownerName", ownerName);
    formData.append("ownerPhone", ownerPhone);
    formData.append("phoneVerified", "true");
    
    if (landProof) formData.append("landProof", landProof);
    if (nationalIdProof) formData.append("nationalIdProof", nationalIdProof);
    if (ownerPhoto) formData.append("ownerPhoto", ownerPhoto);
    photos.forEach(p => formData.append("photos", p));

    try {
      await apiFetch("/parking", {
        method: "POST",
        body: formData
      });
      setDone(true);
    } catch (err: any) {
      alert(err.message || "Failed to submit listing");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center md:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-serif text-3xl">Listing submitted!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Our team will review your space within 24 hours. You'll get a notification once it goes live.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild><Link to="/app">Back to dashboard</Link></Button>
          <Button variant="outline" onClick={() => { setDone(false); setStep(1); }}>List another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-coral">Homeowners only</div>
        <h1 className="mt-1 font-serif text-3xl md:text-4xl">List your driveway or home garage</h1>
      </div>

      <div className="mt-8">
        <Progress value={(step / STEPS.length) * 100} className="h-1.5" />
        <div className="mt-4 grid grid-cols-4 gap-2">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const active = step === s.n;
            const complete = step > s.n;
            return (
              <button
                key={s.n}
                onClick={() => setStep(s.n)}
                className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs transition-colors ${
                  active ? "border-primary bg-primary/5" : complete ? "border-success/40 bg-success/5" : "border-border"
                }`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${
                  complete ? "bg-success text-success-foreground" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                </span>
                <span className="hidden md:block">
                  <div className="font-medium text-foreground">Step {s.n}</div>
                  <div className="text-muted-foreground">{s.label}</div>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl">Where is it?</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Full address</Label>
                <Input placeholder="House 12, Block A, Connaught Place" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input placeholder="New Delhi" value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Landmark</Label>
                <Input placeholder="Near Rajiv Chowk Metro" value={landmark} onChange={e => setLandmark(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl">Describe the space</h2>
            <div className="space-y-1.5">
              <Label>Listing title</Label>
              <Input placeholder="Connaught Place — Block A Covered Bay" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Type</Label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={type} onChange={e => setType(e.target.value)}>
                  <option>House Parking</option>
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Owner Name</Label>
                <Input placeholder="Enter your full name" value={ownerName} onChange={e => setOwnerName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>House Ownership Proof (Document)</Label>
                <Input type="file" onChange={e => setLandProof(e.target.files?.[0] || null)} required />
              </div>
              <div className="space-y-1.5">
                <Label>National ID Proof</Label>
                <Input type="file" onChange={e => setNationalIdProof(e.target.files?.[0] || null)} required />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Original Photo of Owner</Label>
                <Input type="file" onChange={e => setOwnerPhoto(e.target.files?.[0] || null)} required />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Contact Phone Number</Label>
                <div className="flex gap-2">
                  <Input placeholder="Enter your phone number" value={ownerPhone} onChange={e => { setOwnerPhone(e.target.value); setOtpVerified(false); setOtpSent(false); }} required disabled={otpVerified} />
                  <Button
                    type="button"
                    onClick={async () => {
                      if (!ownerPhone) { setOtpError("Enter phone number first"); return; }
                      setOtpLoading(true);
                      setOtpError("");
                      try {
                        await apiFetch("/auth/send-phone-otp", { method: "POST", body: JSON.stringify({ phone: ownerPhone }) });
                        setOtpSent(true);
                      } catch (err: any) {
                        setOtpError(err.message || "Failed to send OTP");
                      } finally { setOtpLoading(false); }
                    }}
                    variant={otpVerified ? "default" : "secondary"}
                    className="shrink-0"
                    disabled={otpLoading || otpVerified}
                  >
                    {otpVerified ? "✓ Verified" : otpLoading ? "Sending..." : "Send OTP"}
                  </Button>
                </div>
                {otpError && <p className="text-xs text-destructive mt-1">{otpError}</p>}
              </div>
              {otpSent && !otpVerified && (
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Enter OTP sent to your phone</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} required />
                    <Button
                      type="button"
                      onClick={async () => {
                        if (!otp) return;
                        setOtpLoading(true);
                        setOtpError("");
                        try {
                          const result = await apiFetch("/auth/verify-phone-otp", { method: "POST", body: JSON.stringify({ phone: ownerPhone, otp }) });
                          if (result.verified) {
                            setOtpVerified(true);
                          }
                        } catch (err: any) {
                          setOtpError(err.message || "Invalid OTP");
                        } finally { setOtpLoading(false); }
                      }}
                      className="shrink-0"
                      disabled={otpLoading}
                    >
                      {otpLoading ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                  {otpError && <p className="text-xs text-destructive mt-1">{otpError}</p>}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={4} placeholder="Tell drivers what makes your bay special..." value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl">Add photos</h2>
            <p className="text-sm text-muted-foreground">Upload clear photos of the bay.</p>
            <Input type="file" multiple onChange={e => setPhotos(Array.from(e.target.files || []))} />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl">Set your pricing</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Price per hour (₹)</Label>
                <Input type="number" value={pricePerHour} onChange={e => setPricePerHour(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Price per day (₹)</Label>
                <Input type="number" value={pricePerDay} onChange={e => setPricePerDay(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
            Back
          </Button>
          {step < STEPS.length ? (
            <Button onClick={() => setStep(step + 1)}>Continue →</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="bg-coral text-coral-foreground hover:bg-coral/90">
              {loading ? "Submitting..." : "Submit listing"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
