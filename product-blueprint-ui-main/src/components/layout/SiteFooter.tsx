import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="font-serif text-lg font-semibold">ParkEase</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            India's homeowner-only parking marketplace. Rent a driveway in seconds —
            or earn from the one at your own home.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold">Product</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/app/browse" className="hover:text-foreground">Find parking</Link></li>
            <li><Link to="/app/list-space" className="hover:text-foreground">List your driveway</Link></li>
            <li><Link to="/app/bookings" className="hover:text-foreground">My bookings</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold">Company</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a className="hover:text-foreground" href="#">About</a></li>
            <li><a className="hover:text-foreground" href="#">Careers</a></li>
            <li><a className="hover:text-foreground" href="#">Press</a></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold">Support</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/app/support" className="hover:text-foreground">Help center</Link></li>
            <li><Link to="/app/support" className="hover:text-foreground">Trust & safety</Link></li>
            <li><Link to="/app/support" className="hover:text-foreground">Contact Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground md:flex-row md:px-6">
          <div>© 2026 ParkEase Technologies Pvt. Ltd.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
