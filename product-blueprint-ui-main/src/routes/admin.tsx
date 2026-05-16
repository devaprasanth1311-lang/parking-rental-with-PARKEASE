import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { LayoutDashboard, Users, ListChecks, CalendarCheck, TrendingUp, Search, CheckCircle2, XCircle, MoreHorizontal, MapPin, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin — ParkEase" }] }),
});

type Tab = "overview" | "listings" | "users" | "bookings";

function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [spaces, setSpaces] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Fetch all needed data for admin
    Promise.all([
      apiFetch("/admin/spaces"),
      apiFetch("/admin/users"),
      apiFetch("/admin/bookings"),
      apiFetch("/admin/stats").catch(() => null)
    ]).then(([s, u, b, st]) => {
      setSpaces(s);
      setUsers(u);
      setBookings(b);
      setStats(st);
    }).catch(console.error);
  }, []);

  const nav: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "listings", label: "Listings", icon: ListChecks },
    { id: "users", label: "Users", icon: Users },
    { id: "bookings", label: "Bookings", icon: CalendarCheck },
  ];

  const handleApprove = async (id: string, status: string) => {
    try {
      if (status === "approved") {
        await apiFetch(`/admin/spaces/${id}/approve`, { method: "PUT" });
      } else {
        await apiFetch(`/admin/spaces/${id}/reject`, { method: "PUT" });
      }
      alert(`Space ${status}`);
      // Refresh
      const s = await apiFetch("/admin/spaces");
      setSpaces(s);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pr_token");
    localStorage.removeItem("pr_user");
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar md:block">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="font-serif font-semibold">ParkEase</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin Dashboard</div>
          </div>
        </div>
        <nav className="p-3">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" /> {n.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface/60 px-5 md:px-8">
          <div>
            <div className="font-serif text-lg capitalize">{tab}</div>
          </div>
          <button onClick={handleLogout} className="text-xs text-muted-foreground hover:text-foreground">Logout</button>
        </header>

        <div className="p-5 md:p-8">
          {tab === "overview" && <Overview stats={stats} pending={spaces.filter(s => s.approvalStatus === "pending")} onApprove={handleApprove} />}
          {tab === "listings" && <Listings spaces={spaces} onApprove={handleApprove} />}
          {tab === "users" && <UsersTab users={users} />}
          {tab === "bookings" && <BookingsTab bookings={bookings} />}
        </div>
      </div>
    </div>
  );
}

function Overview({ stats, pending, onApprove }: any) {
  const statItems = [
    { l: "Total spaces", v: stats?.totalSpaces || 0, tone: "text-primary" },
    { l: "Active users", v: stats?.totalUsers || 0, tone: "text-success" },
    { l: "Total bookings", v: stats?.totalBookings || 0, tone: "text-coral" },
  ];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {statItems.map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-card p-5">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</span>
            <div className="mt-2 font-serif text-3xl">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-5">
        <h3 className="font-serif text-lg">Pending Approvals ({pending.length})</h3>
        <div className="mt-4 space-y-3">
          {pending.length === 0 && <p className="text-sm text-muted-foreground">No pending approvals.</p>}
          {pending.map((s: any) => (
            <div key={s._id} className="flex items-center gap-3 border-b pb-3">
              <div className="flex-1">
                <div className="text-sm font-medium">{s.title}</div>
                <div className="text-xs text-muted-foreground">{s.location?.address}, {s.location?.city}</div>
                {s.landProof && <a href={`${BASE_URL}${s.landProof}`} target="_blank" className="text-[10px] text-primary underline">View Proof</a>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onApprove(s._id, "approved")} className="bg-success text-white">Approve</Button>
                <Button size="sm" onClick={() => onApprove(s._id, "rejected")} variant="destructive">Reject</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Listings({ spaces, onApprove }: any) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="px-5 py-4 border-b">
        <h3 className="font-serif text-lg">All listings · {spaces.length}</h3>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-5 py-3">Space</th>
            <th className="px-5 py-3">City</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {spaces.map((s: any) => (
            <tr key={s._id} className="border-t">
              <td className="px-5 py-3 font-medium">{s.title}</td>
              <td className="px-5 py-3">{s.location?.city}</td>
              <td className="px-5 py-3">
                <Badge variant={s.approvalStatus === "approved" ? "default" : s.approvalStatus === "pending" ? "secondary" : "destructive"}>
                  {s.approvalStatus}
                </Badge>
              </td>
              <td className="px-5 py-3">
                {s.approvalStatus === "pending" && (
                   <Button size="sm" onClick={() => onApprove(s._id, "approved")}>Approve</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersTab({ users }: any) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="px-5 py-4 border-b">
        <h3 className="font-serif text-lg">Users · {users.length}</h3>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-5 py-3">User</th>
            <th className="px-5 py-3">Role</th>
            <th className="px-5 py-3">Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u._id} className="border-t">
              <td className="px-5 py-3 font-medium">{u.username}</td>
              <td className="px-5 py-3"><Badge variant="outline">{u.role}</Badge></td>
              <td className="px-5 py-3">{u.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BookingsTab({ bookings }: any) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="px-5 py-4 border-b">
        <h3 className="font-serif text-lg">Bookings · {bookings?.length || 0}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Booking ID</th>
              <th className="px-5 py-3">User Details</th>
              <th className="px-5 py-3">Space & Vehicle</th>
              <th className="px-5 py-3">Time</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bookings?.map((b: any) => (
              <tr key={b._id} className="border-t">
                <td className="px-5 py-3 font-medium text-xs">#{b._id.slice(-6).toUpperCase()}</td>
                <td className="px-5 py-3">
                  <div className="font-medium">{b.customerId?.username || "N/A"}</div>
                  <div className="text-xs text-muted-foreground">{b.customerId?.email}</div>
                  <div className="text-xs text-muted-foreground">{b.customerId?.phone}</div>
                </td>
                <td className="px-5 py-3">
                  <div className="font-medium">{b.parkingSpaceId?.title || "Unknown Space"}</div>
                  <div className="text-xs text-muted-foreground">{b.vehicleModel} ({b.vehicleSize})</div>
                </td>
                <td className="px-5 py-3">
                  <div className="text-xs whitespace-nowrap">{new Date(b.startTime).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">to {new Date(b.endTime).toLocaleString()}</div>
                </td>
                <td className="px-5 py-3">
                  <Badge variant={b.status === "completed" ? "secondary" : b.status === "cancelled" ? "destructive" : "default"}>
                    {b.status}
                  </Badge>
                </td>
                <td className="px-5 py-3 font-medium">₹{b.totalPrice}</td>
              </tr>
            ))}
            {(!bookings || bookings.length === 0) && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
