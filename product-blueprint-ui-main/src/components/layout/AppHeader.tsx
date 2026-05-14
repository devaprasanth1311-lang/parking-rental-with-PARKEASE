import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MapPin, LayoutDashboard, Search, CalendarCheck, Plus, Shield, LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/app", label: "Home", icon: LayoutDashboard },
  { to: "/app/browse", label: "Browse", icon: Search },
  { to: "/app/bookings", label: "My Bookings", icon: CalendarCheck },
  { to: "/app/list-space", label: "List driveway", icon: Plus },
] as const;

export function AppHeader() {
  const location = useLocation();
  const path = location.pathname;
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("pr_user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pr_token");
    localStorage.removeItem("pr_user");
    window.location.href = "/";
  };

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <MapPin className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <div className="font-serif text-lg font-semibold">ParkEase</div>
            <div className="-mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Park. Easy. Done.
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => {
            const Icon = l.icon;
            const active = path === l.to || (l.to !== "/app" && path.startsWith(l.to));
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary md:inline-flex"
            >
              <Shield className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3.5 py-2 text-xs font-medium text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-xs font-medium text-background hover:opacity-90"
            >
              <LogIn className="h-3.5 w-3.5" /> Sign in
            </Link>
          )}
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 md:hidden">
        {navLinks.map((l) => {
          const Icon = l.icon;
          const active = path === l.to || (l.to !== "/app" && path.startsWith(l.to));
          return (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
