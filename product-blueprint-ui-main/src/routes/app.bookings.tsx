import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CalendarCheck, Clock, MapPin, Download, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/app/bookings")({
  component: MyBookings,
  head: () => ({ meta: [{ title: "My Bookings — ParkEase" }] }),
});

type UIStatus = "Upcoming" | "Active" | "Completed" | "Cancelled";
const TABS: UIStatus[] = ["Upcoming", "Active", "Completed", "Cancelled"];

function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [tab, setTab] = useState<UIStatus>("Upcoming");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/bookings/my")
      .then(data => {
        setBookings(data.map((b: any) => {
          let status: UIStatus = "Upcoming";
          if (b.status === "completed") status = "Completed";
          else if (b.status === "cancelled") status = "Cancelled";
          else if (b.status === "confirmed") {
            const now = new Date();
            const start = new Date(b.startTime);
            const end = new Date(b.endTime);
            if (now >= start && now <= end) status = "Active";
            else status = "Upcoming";
          } else {
            status = "Upcoming";
          }

            return {
              id: b._id,
              spaceId: b.parkingSpaceId?._id,
              spaceTitle: b.parkingSpaceId?.title || "Unknown Space",
              city: b.parkingSpaceId?.location?.city || "Unknown City",
              cctvUrl: b.parkingSpaceId?.cctvUrl || "https://images.unsplash.com/photo-1550505187-57d344799014?auto=format&fit=crop&w=600&q=80",
              from: new Date(b.startTime).toLocaleString(),
              to: new Date(b.endTime).toLocaleString(),
              total: b.totalPrice,
              status,
              vehicle: `${b.vehicleModel} (${b.vehicleSize})`,
            };
        }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) => b.status === tab);

  const statusStyle = (s: UIStatus) => {
    switch (s) {
      case "Upcoming": return "bg-primary/10 text-primary";
      case "Active": return "bg-success/15 text-success";
      case "Completed": return "bg-muted text-muted-foreground";
      case "Cancelled": return "bg-destructive/10 text-destructive";
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-coral">History</div>
        <h1 className="mt-1 font-serif text-3xl md:text-4xl">My bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track, manage, and extend your parking reservations.</p>
      </div>

      <div className="mt-8 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => {
          const count = bookings.filter((b) => b.status === t).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === t
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t} <span className="ml-1 text-xs opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="mt-10 text-center">Loading your bookings...</div>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <CalendarCheck className="mx-auto h-8 w-8 text-muted-foreground" />
              <div className="mt-3 font-serif text-xl">No {tab.toLowerCase()} bookings</div>
              <p className="mt-1 text-sm text-muted-foreground">Time to find your next bay.</p>
              <Button asChild className="mt-4"><Link to="/app/browse">Browse spaces</Link></Button>
            </div>
          ) : (
            filtered.map((b) => (
              <div key={b.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={`border-0 ${statusStyle(b.status)}`}>{b.status}</Badge>
                      <span className="text-xs text-muted-foreground">#{b.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <Link
                      to="/app/space/$spaceId"
                      params={{ spaceId: b.spaceId }}
                      className="mt-2 block font-serif text-xl hover:text-primary"
                    >
                      {b.spaceTitle}
                    </Link>
                    <div className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                      <div className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {b.city}</div>
                      <div className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {b.from} → {b.to}</div>
                      <div>🚗 {b.vehicle}</div>
                      <div className="font-medium text-foreground">💳 ₹{b.total}</div>
                    </div>
                  </div>
                </div>
                {b.status === "Active" && (
                  <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-sm font-medium">Live CCTV Footage</span>
                    </div>
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                      <img 
                        src={b.cctvUrl} 
                        alt="Live CCTV" 
                        className="h-full w-full object-cover opacity-80 mix-blend-screen"
                      />
                    </div>
                  </div>
                )}
                {b.status === "Completed" && (
                  <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
                    <span className="text-sm font-medium">Leave Feedback / Complaint</span>
                    <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); alert("Feedback submitted to Admin"); }}>
                      <input 
                        type="text" 
                        placeholder="Was the space clean? Any issues?" 
                        className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm" 
                        required 
                      />
                      <Button size="sm" type="submit">Submit</Button>
                    </form>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
