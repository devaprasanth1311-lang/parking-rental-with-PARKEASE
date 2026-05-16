import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { SpaceCard } from "@/components/SpaceCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cities } from "@/lib/mock-data";
import { apiFetch, BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/app/browse")({
  component: BrowsePage,
  head: () => ({ meta: [{ title: "Browse parking spaces — ParkEase" }] }),
});

const TYPES = ["House Parking"] as const;
const AMENITIES = ["CCTV", "EV Charger (home socket)", "EV Charger (Type-2)", "Gated compound", "Shutter garage", "Covered", "Owner on premises"];

function BrowsePage() {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const [priceMax, setPriceMax] = useState(100);
  const [types, setTypes] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  const [vehicleModel, setVehicleModel] = useState("");
  const [searchedVehicle, setSearchedVehicle] = useState("");

  useEffect(() => {
    if (!searchedVehicle) return;
    
    let url = `/parking?vehicleModel=${encodeURIComponent(searchedVehicle)}`;
    if (userLat && userLng) {
      url += `&lat=${userLat}&lng=${userLng}`;
    }

    apiFetch(url).then((data) => {
      const spacesArray = data.spaces || data;
      setSpaces(spacesArray.map((s: any) => ({
        id: s._id,
        title: s.title,
        owner: s.ownerName || s.ownerId?.username || "Unknown",
        address: s.location?.address || "",
        area: s.location?.landmark || "",
        city: s.location?.city || "Unknown",
        pricePerHour: s.pricePerHour,
        pricePerDay: s.pricePerDay || s.pricePerHour * 24,
        rating: 4.5,
        reviews: 0,
        image: s.photos?.[0] ? `${BASE_URL}${s.photos[0]}` : "https://images.unsplash.com/photo-1590674899484-13e6a8fef8e4?auto=format&fit=crop&w=900&q=70",
        type: "House Parking",
        houseType: "Independent House",
        vehicleTypes: ["Car", "Bike", "SUV", "EV"],
        amenities: ["CCTV", "Gated compound"],
        available: s.isAvailable,
        distanceKm: s.distanceKm ? Number(s.distanceKm.toFixed(1)) : 1.0,
        description: s.description || "",
      })));
    }).catch(console.error);
  }, [searchedVehicle, userLat, userLng]);

  const filtered = useMemo(() => {
    return spaces.filter((s) => {
      if (q && !(`${s.title} ${s.area} ${s.city}`.toLowerCase().includes(q.toLowerCase()))) return false;
      if (city && s.city !== city) return false;
      if (s.pricePerHour > priceMax) return false;
      if (types.length && !types.includes(s.type)) return false;
      if (amenities.length && !amenities.every((a) => s.amenities.includes(a))) return false;
      return true;
    });
  }, [spaces, q, city, priceMax, types, amenities]);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-coral">Browse homes</div>
        <h1 className="mt-1 font-serif text-3xl md:text-4xl">Find a driveway near you</h1>
      </div>

      {/* Search bar */}
      <div className="mt-6 flex flex-col gap-2 md:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by neighbourhood or host name"
            className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
          <Input
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
            placeholder="Car Model (Mandatory, e.g. Honda City)"
            className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            required
          />
        </div>
        <Button 
          variant={userLat ? "default" : "outline"}
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setUserLat(pos.coords.latitude);
                  setUserLng(pos.coords.longitude);
                  alert("Location retrieved successfully! Now sorting by distance.");
                },
                (err) => alert("Failed to get location: " + err.message)
              );
            } else {
              alert("Geolocation is not supported by your browser.");
            }
          }}
          className="rounded-xl border-dashed"
        >
          <MapPin className="mr-2 h-4 w-4" /> {userLat ? "Location Active" : "Use My Location"}
        </Button>
        <Button onClick={() => setSearchedVehicle(vehicleModel)} size="lg" className="rounded-xl">
          Search
        </Button>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto md:overflow-visible">
        <button
          onClick={() => setCity(null)}
          className={`shrink-0 rounded-full border px-3 py-2 text-xs font-medium ${
            !city ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
          }`}
        >
          All cities
        </button>
        {cities.map((c) => (
          <button
            key={c}
            onClick={() => setCity(c === city ? null : c)}
            className={`shrink-0 rounded-full border px-3 py-2 text-xs font-medium ${
              city === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Layout */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filters */}
        <aside className="space-y-6 rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 font-semibold">
              <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
            </div>
            <button
              onClick={() => {
                setTypes([]); setAmenities([]); setPriceMax(100); setCity(null);
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Max price / hour · ₹{priceMax}
            </Label>
            <Slider
              value={[priceMax]}
              onValueChange={([v]) => setPriceMax(v)}
              max={100}
              min={20}
              step={5}
              className="mt-3"
            />
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Type</div>
            <div className="mt-3 space-y-2">
              {TYPES.map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={types.includes(t)}
                    onCheckedChange={() => toggle(types, setTypes, t)}
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Amenities</div>
            <div className="mt-3 space-y-2">
              {AMENITIES.map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={amenities.includes(a)}
                    onCheckedChange={() => toggle(amenities, setAmenities, a)}
                  />
                  {a}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <div className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {filtered.length} homes {city ? `in ${city}` : "across India"}
            </div>
            <select className="rounded-md border border-input bg-card px-2 py-1 text-xs">
              <option>Sort: Recommended</option>
              <option>Price: low to high</option>
              <option>Rating</option>
              <option>Distance</option>
            </select>
          </div>

          {!searchedVehicle ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <div className="font-serif text-xl">Please enter your car model.</div>
              <p className="mt-1 text-sm text-muted-foreground">It is mandatory to enter your car model to find optimal allocation of the parking space automatically.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <div className="font-serif text-xl">No spaces match those filters.</div>
              <p className="mt-1 text-sm text-muted-foreground">Try widening the price range or checking another area.</p>
              <Button className="mt-4" onClick={() => setPriceMax(100)}>Reset</Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((s) => <SpaceCard key={s.id} space={s} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
