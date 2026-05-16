import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, MapPin, ShieldCheck, Zap, Wallet, Camera, Star, ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SpaceCard } from "@/components/SpaceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cities } from "@/lib/mock-data";
import { apiFetch, BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "ParkEase — Find & rent parking across India" },
      {
        name: "description",
        content:
          "Search thousands of verified parking spaces or list your own. CCTV-monitored, EV-ready, booked in seconds.",
      },
    ],
  }),
});

function LandingPage() {
  const [spaces, setSpaces] = useState<any[]>([]);

  useEffect(() => {
    apiFetch("/parking").then(data => {
      const spacesArray = data.spaces || data || [];
      setSpaces(spacesArray.map((s: any) => ({
        id: s._id,
        title: s.title,
        owner: s.ownerName || s.ownerId?.username || "Unknown",
        address: s.location?.address || "",
        area: s.location?.landmark || "",
        city: s.location?.city || "",
        pricePerHour: s.pricePerHour,
        image: s.photos?.[0] ? `${BASE_URL}${s.photos[0]}` : "https://images.unsplash.com/photo-1590674899484-13e6a8fef8e4?auto=format&fit=crop&w=900&q=70",
        available: s.isAvailable,
        rating: 4.8,
        reviews: 0
      })));
    }).catch(console.error);
  }, []);

  const featured = spaces.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(900px 500px at 80% -10%, oklch(0.85 0.09 30 / 0.5), transparent 60%), radial-gradient(700px 500px at 0% 10%, oklch(0.7 0.12 250 / 0.35), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 md:px-6 md:pb-24 md:pt-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-coral" />
                Only homeowner-listed driveways & garages
              </span>
              <h1 className="mt-5 font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl">
                Park in someone's{" "}
                <span className="italic text-primary">driveway</span>, not on the street.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
                ParkEase connects drivers with private driveways, porches and home garages
                rented out by the owners themselves — safer, cheaper, and kinder to your neighbourhood.
              </p>

              {/* Search card */}
              <div className="mt-7 rounded-2xl border border-border bg-card p-3 shadow-[0_10px_40px_-20px_oklch(0.58_0.14_250_/_0.35)]">
                <div className="grid gap-2 md:grid-cols-[1.3fr_1fr_auto]">
                  <label className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    <Input
                      placeholder="Neighbourhood or address"
                      className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                    />
                  </label>
                  <label className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5">
                    <Search className="h-4 w-4 text-primary" />
                    <Input
                      placeholder="Vehicle (Honda City, Activa…)"
                      className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                    />
                  </label>
                  <Button asChild size="lg" className="rounded-xl">
                    <Link to="/app/browse">
                      Search <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 px-1">
                  {cities.slice(0, 5).map((c) => (
                    <Link
                      key={c}
                      to="/app/browse"
                      className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" /> CCTV verified</span>
                <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-coral" /> EV charging</span>
                <span className="inline-flex items-center gap-1.5"><Wallet className="h-4 w-4 text-primary" /> UPI & cards</span>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[5/6] overflow-hidden rounded-3xl border border-border shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=900&q=80"
                  alt="Covered parking bay"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -left-4 bottom-6 w-56 rounded-2xl border border-border bg-card p-4 shadow-lg">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Camera className="h-3.5 w-3.5" /> Live feed · Bay A-12
                </div>
                <div className="mt-1 font-serif text-base font-semibold">
                  Booked in 8 seconds
                </div>
                <div className="mt-3 flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="h-7 w-7 rounded-full border-2 border-card bg-gradient-to-br from-primary to-coral"
                    />
                  ))}
                  <span className="ml-3 flex items-center text-xs text-muted-foreground">
                    +128 today
                  </span>
                </div>
              </div>
              <div className="absolute -right-2 top-8 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg">
                <div className="flex items-center gap-1 text-xs">
                  <Star className="h-3.5 w-3.5 fill-coral text-coral" />
                  <span className="font-semibold">4.8</span>
                  <span className="text-muted-foreground">· 9,200 reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border bg-surface/60">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4 md:px-6">
          {[
            { k: "3,800+", v: "Home driveways" },
            { k: "7", v: "Cities" },
            { k: "₹1.6Cr", v: "Paid to homeowners" },
            { k: "4.8 / 5", v: "Avg. rating" },
          ].map((s) => (
            <div key={s.v}>
              <div className="font-serif text-3xl font-semibold text-foreground">{s.k}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-coral">Featured homes</div>
            <h2 className="mt-1 font-serif text-3xl md:text-4xl">Driveways guests love this week</h2>
          </div>
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link to="/app/browse">Browse all <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((s) => <SpaceCard key={s.id} space={s} />)}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface/60 py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.2em] text-coral">How it works</div>
            <h2 className="mt-1 font-serif text-3xl md:text-4xl">
              From curb-circling to a cosy driveway, in three taps.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { n: "01", t: "Find a nearby home", d: "Search any neighbourhood. We only list driveways, porches and garages rented by the actual homeowner." },
              { n: "02", t: "Reserve in seconds", d: "Pay with UPI or card. Get the exact address and gate instructions from your host right after." },
              { n: "03", t: "Park & go", d: "Homeowners verify you on arrival. CCTV on most homes, and your host is usually just upstairs." },
            ].map((step) => (
              <div key={step.n} className="rounded-2xl border border-border bg-card p-6">
                <div className="font-serif text-4xl text-primary">{step.n}</div>
                <div className="mt-3 text-lg font-semibold">{step.t}</div>
                <p className="mt-2 text-sm text-muted-foreground">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Host CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-[oklch(0.48_0.16_265)] p-8 text-primary-foreground md:p-14">
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] opacity-70">For homeowners</div>
              <h2 className="mt-2 font-serif text-3xl leading-tight md:text-5xl">
                Your empty driveway just became a side income.
              </h2>
              <p className="mt-4 max-w-lg text-sm opacity-80 md:text-base">
                Homeowners on ParkEase earn an average of ₹6,800/month from a single
                car slot. We handle bookings, payments and disputes — you just decide
                when your driveway is free.
              </p>
              <Button asChild size="lg" variant="secondary" className="mt-6 rounded-full">
                <Link to="/app/list-space">List your driveway — it's free</Link>
              </Button>
            </div>
            <div className="rounded-2xl bg-background/15 p-6 backdrop-blur">
              {[
                ["Avg. monthly earning", "₹6,800"],
                ["Only homeowners", "Verified with utility bill"],
                ["Payouts", "Weekly, to bank"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-background/20 py-3 last:border-0">
                  <span className="text-sm opacity-75">{k}</span>
                  <span className="font-serif text-xl">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
