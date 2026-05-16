import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, MapPin, CalendarCheck, Plus, TrendingUp, Clock, Home, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { SpaceCard } from "@/components/SpaceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiFetch, BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/app/")({
  component: DashboardHome,
  head: () => ({ meta: [{ title: "Dashboard — ParkEase" }] }),
});

function DashboardHome() {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [mySpaces, setMySpaces] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [ownerBookings, setOwnerBookings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("pr_user");
    if (savedUser) setUser(JSON.parse(savedUser));

    Promise.all([
      apiFetch("/parking"),
      apiFetch("/bookings/my"),
      apiFetch("/parking/my-spaces").catch(() => []),
      apiFetch("/bookings/owner/bookings").catch(() => []),
    ]).then(([s, b, ms, ob]) => {
      const spacesArray = s.spaces || s || [];
      setSpaces(spacesArray.map((item: any) => ({
        id: item._id,
        title: item.title,
        owner: item.ownerName || "Unknown",
        address: item.location?.address || "",
        area: item.location?.landmark || "",
        city: item.location?.city || "",
        pricePerHour: item.pricePerHour,
        image: item.photos?.[0] ? `${BASE_URL}${item.photos[0]}` : "https://images.unsplash.com/photo-1590674899484-13e6a8fef8e4?auto=format&fit=crop&w=900&q=70",
        available: item.isAvailable,
        rating: 4.8,
        reviews: 0
      })));
      setBookings(b);
      setMySpaces(ms || []);
      setOwnerBookings(ob || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const recommended = spaces.slice(0, 4);
  const upcomingRaw = bookings.find((b) => b.status === "confirmed" || b.status === "pending");
  const upcoming = upcomingRaw ? {
    spaceTitle: upcomingRaw.parkingSpaceId?.title || "Upcoming Booking",
    from: new Date(upcomingRaw.startTime).toLocaleString(),
    to: new Date(upcomingRaw.endTime).toLocaleString(),
    vehicle: `${upcomingRaw.vehicleModel} (${upcomingRaw.vehicleSize})`,
    total: upcomingRaw.totalPrice
  } : null;

  const totalSpend = bookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);

  const stats = [
    { label: "Total bookings", value: bookings.length.toString(), icon: CalendarCheck, tone: "text-primary" },
    { label: "Total spend", value: `₹${totalSpend}`, icon: TrendingUp, tone: "text-coral" },
    { label: "Spaces active", value: spaces.filter(s => s.available).length.toString(), icon: Clock, tone: "text-success" },
  ];

  const statusStyle = (status: string) => {
    switch (status) {
      case "approved": return { bg: "bg-success/15", text: "text-success", icon: CheckCircle2, label: "Approved" };
      case "rejected": return { bg: "bg-destructive/15", text: "text-destructive", icon: XCircle, label: "Rejected" };
      default: return { bg: "bg-amber-500/15", text: "text-amber-600", icon: AlertCircle, label: "Pending Review" };
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-coral">Dashboard</div>
          <h1 className="mt-1 font-serif text-3xl md:text-4xl">Hi, {user?.username || "User"} 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Let's find you a driveway — or rent out the one you own.
          </p>
        </div>
        <Button asChild className="rounded-full" size="lg">
          <Link to="/app/list-space">
            <Plus className="mr-1 h-4 w-4" /> List my driveway
          </Link>
        </Button>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-3 shadow-sm">
        <div className="grid gap-2 md:grid-cols-[1.3fr_1fr_auto]">
          <label className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5">
            <MapPin className="h-4 w-4 text-primary" />
            <Input
              placeholder="Destination, landmark or pincode"
              className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            />
          </label>
          <label className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5">
            <Search className="h-4 w-4 text-primary" />
            <Input
              placeholder="Car Model (Mandatory)"
              className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            />
          </label>
          <Button asChild size="lg" className="rounded-xl">
            <Link to="/app/browse">Search</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
              <s.icon className={`h-4 w-4 ${s.tone}`} />
            </div>
            <div className="mt-2 font-serif text-3xl">{s.value}</div>
          </div>
        ))}
      </div>

      {upcoming && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-primary to-[oklch(0.48_0.16_265)] p-6 text-primary-foreground md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] opacity-80">Next booking</div>
              <div className="mt-1 font-serif text-2xl">{upcoming.spaceTitle}</div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm opacity-90">
                <span>🗓 {upcoming.from} → {upcoming.to}</span>
                <span>🚗 {upcoming.vehicle}</span>
                <span>💳 ₹{upcoming.total}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="secondary" className="rounded-full">
                <Link to="/app/bookings">Details</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Received Bookings (For Owners) ── */}
      {ownerBookings.length > 0 && (
        <div className="mt-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-coral">Guest Reservations</div>
              <h2 className="mt-1 font-serif text-2xl md:text-3xl">Bookings for my spaces</h2>
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Space & Vehicle</th>
                  <th className="px-5 py-3">Guest Details</th>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Earnings</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {ownerBookings.map((b: any) => (
                  <tr key={b._id} className="border-t">
                    <td className="px-5 py-3">
                      <div className="font-medium">{b.parkingSpaceId?.title || "Unknown Space"}</div>
                      <div className="text-xs text-muted-foreground">🚗 {b.vehicleModel} ({b.vehicleSize})</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-medium">{b.customerId?.username || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">📞 {b.customerId?.phone || "No phone"}</div>
                      <div className="text-xs text-muted-foreground">✉️ {b.customerId?.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-xs whitespace-nowrap">{new Date(b.startTime).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">to {new Date(b.endTime).toLocaleString()}</div>
                    </td>
                    <td className="px-5 py-3 font-medium text-success">₹{b.totalPrice}</td>
                    <td className="px-5 py-3">
                      <Badge variant={b.status === "completed" ? "secondary" : b.status === "cancelled" ? "destructive" : "default"}>
                        {b.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── My Listed Spaces ── */}
      {mySpaces.length > 0 && (
        <div className="mt-12">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-coral">Your listings</div>
              <h2 className="mt-1 font-serif text-2xl md:text-3xl">My registered spaces</h2>
            </div>
            <Button asChild variant="ghost">
              <Link to="/app/list-space">+ Add new →</Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mySpaces.map((s: any) => {
              const st = statusStyle(s.approvalStatus);
              const StatusIcon = st.icon;
              return (
                <div key={s._id} className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg hover:-translate-y-0.5">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={s.photos?.[0] ? `${BASE_URL}${s.photos[0]}` : "https://images.unsplash.com/photo-1590674899484-13e6a8fef8e4?auto=format&fit=crop&w=600&q=70"}
                      alt={s.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <Badge className={`absolute top-3 right-3 border-0 ${st.bg} ${st.text}`}>
                      <StatusIcon className="mr-1 h-3 w-3" /> {st.label}
                    </Badge>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-serif text-lg leading-tight">{s.title}</h3>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {s.location?.address}, {s.location?.city}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="font-serif text-lg">
                        ₹{s.pricePerHour}<span className="text-xs text-muted-foreground font-sans"> /hr</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Home className="h-3 w-3" />
                        {s.totalSpots || 1} spot{(s.totalSpots || 1) > 1 ? "s" : ""}
                      </div>
                    </div>
                    {s.approvalStatus === "pending" && (
                      <p className="mt-2 text-[11px] text-amber-600">
                        ⏳ Under admin review — typically within 24 hours.
                      </p>
                    )}
                    {s.approvalStatus === "rejected" && (
                      <p className="mt-2 text-[11px] text-destructive">
                        ❌ This listing was rejected. Contact support for details.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-12">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-coral">Recommended</div>
            <h2 className="mt-1 font-serif text-2xl md:text-3xl">Near you right now</h2>
          </div>
          <Button asChild variant="ghost">
            <Link to="/app/browse">View all →</Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recommended.map((s) => <SpaceCard key={s.id} space={s} />)}
        </div>
      </div>
    </div>
  );
}
