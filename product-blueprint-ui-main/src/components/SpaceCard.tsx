import { Link } from "@tanstack/react-router";
import { Star, MapPin, Shield, Zap } from "lucide-react";
import type { ParkingSpace } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export function SpaceCard({ space }: { space: ParkingSpace }) {
  return (
    <Link
      to="/app/space/$spaceId"
      params={{ spaceId: space.id }}
      className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={space.image}
          alt={space.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge className="border-0 bg-background/90 text-foreground backdrop-blur">
            {space.type}
          </Badge>
          {(space.amenities || []).includes("EV Charger") && (
            <Badge className="border-0 bg-success/90 text-success-foreground">
              <Zap className="mr-1 h-3 w-3" /> EV
            </Badge>
          )}
        </div>
        {!space.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
              Fully booked
            </span>
          </div>
        )}
        <div className="absolute right-3 top-3 rounded-full bg-background/90 px-2 py-1 text-xs font-semibold backdrop-blur">
          <Star className="mr-0.5 inline h-3 w-3 fill-coral text-coral" />
          {space.rating}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-serif text-base font-semibold">{space.title}</h3>
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {space.area}, {space.city} · {space.distanceKm} km
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          {(space.amenities || []).includes("CCTV") && (
            <span className="inline-flex items-center gap-1">
              <Shield className="h-3 w-3" /> CCTV
            </span>
          )}
          <span>·</span>
          <span>{space.reviews} reviews</span>
        </div>
        <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
          <div>
            <div className="text-lg font-semibold">
              ₹{space.pricePerHour}
              <span className="text-xs font-normal text-muted-foreground"> / hr</span>
            </div>
            <div className="text-[11px] text-muted-foreground">₹{space.pricePerDay} / day</div>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary group-hover:bg-primary group-hover:text-primary-foreground">
            Book →
          </span>
        </div>
      </div>
    </Link>
  );
}
