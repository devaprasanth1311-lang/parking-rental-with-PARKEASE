export type ParkingSpace = {
  id: string;
  title: string;
  owner: string;
  address: string;
  area: string;
  city: string;
  pricePerHour: number;
  pricePerDay: number;
  rating: number;
  reviews: number;
  image: string;
  type: "Driveway" | "Private Garage" | "Gated Compound" | "Stilt Parking" | "Porch";
  vehicleTypes: ("Car" | "Bike" | "SUV" | "EV")[];
  amenities: string[];
  available: boolean;
  distanceKm: number;
  description: string;
  houseType: "Independent House" | "Villa" | "Bungalow" | "Row House" | "Apartment (Owner)";
};

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=900&q=70`;

export const mockSpaces: ParkingSpace[] = [
  {
    id: "sp-01",
    title: "Gated driveway at Malhotra residence",
    owner: "Rajesh Malhotra",
    address: "House 12, Block A, Green Park",
    area: "Green Park",
    city: "New Delhi",
    pricePerHour: 50,
    pricePerDay: 350,
    rating: 4.8,
    reviews: 42,
    image: img("1506521781263-d8422e82f27a"),
    type: "Driveway",
    houseType: "Independent House",
    vehicleTypes: ["Car", "SUV", "EV"],
    amenities: ["CCTV", "EV Charger (home socket)", "Gated compound", "Owner on premises"],
    available: true,
    distanceKm: 0.4,
    description:
      "Quiet residential driveway inside a gated plot. Host lives upstairs and can help with any issues. EV charging from a 15A home socket available on request.",
  },
  {
    id: "sp-02",
    title: "Shah family bungalow — rear porch",
    owner: "Nikhil Shah",
    address: "32 Pali Hill Lane, Bandra W",
    area: "Bandra West",
    city: "Mumbai",
    pricePerHour: 70,
    pricePerDay: 500,
    rating: 4.6,
    reviews: 28,
    image: img("1590674899484-13e6a8fef8e4"),
    type: "Porch",
    houseType: "Bungalow",
    vehicleTypes: ["Car", "Bike"],
    amenities: ["CCTV", "Shaded", "Society security"],
    available: true,
    distanceKm: 1.2,
    description:
      "Covered rear porch of a family bungalow. Shaded through the day, society guard at the main gate.",
  },
  {
    id: "sp-03",
    title: "Private garage — Nair residence",
    owner: "Priya Nair",
    address: "45, 5th Block, Koramangala",
    area: "Koramangala",
    city: "Bengaluru",
    pricePerHour: 45,
    pricePerDay: 320,
    rating: 4.9,
    reviews: 61,
    image: img("1545179605-1296651e9d43"),
    type: "Private Garage",
    houseType: "Independent House",
    vehicleTypes: ["Car", "SUV", "EV"],
    amenities: ["CCTV", "Shutter garage", "EV Charger (Type-2)", "Locked overnight"],
    available: true,
    distanceKm: 0.8,
    description:
      "Fully enclosed shutter garage attached to a private home. Type-2 EV charger installed. Perfect for overnight or weekly parking.",
  },
  {
    id: "sp-04",
    title: "Stilt parking — Das family flat",
    owner: "Anirban Das",
    address: "Block C, Lake Gardens",
    area: "Lake Gardens",
    city: "Kolkata",
    pricePerHour: 35,
    pricePerDay: 220,
    rating: 4.4,
    reviews: 19,
    image: img("1568605117036-5fe5e7bab0b7"),
    type: "Stilt Parking",
    houseType: "Apartment (Owner)",
    vehicleTypes: ["Car", "Bike"],
    amenities: ["CCTV", "Building watchman", "Covered"],
    available: false,
    distanceKm: 2.1,
    description:
      "Owner's allotted stilt parking slot in a small residential building. Watchman manages the gate 24×7.",
  },
  {
    id: "sp-05",
    title: "Villa driveway, Reddy family",
    owner: "Sneha Reddy",
    address: "Road No. 36, Jubilee Hills",
    area: "Jubilee Hills",
    city: "Hyderabad",
    pricePerHour: 60,
    pricePerDay: 420,
    rating: 4.7,
    reviews: 33,
    image: img("1568844293986-8d0400bd4745"),
    type: "Driveway",
    houseType: "Villa",
    vehicleTypes: ["Car", "SUV"],
    amenities: ["CCTV", "Gated compound", "Garden-side"],
    available: true,
    distanceKm: 1.6,
    description: "Spacious villa driveway that fits an SUV comfortably. Gated compound, friendly host family.",
  },
  {
    id: "sp-06",
    title: "Subramanian row house carport",
    owner: "Karthik Subramanian",
    address: "2nd Avenue, Anna Nagar",
    area: "Anna Nagar",
    city: "Chennai",
    pricePerHour: 45,
    pricePerDay: 300,
    rating: 4.5,
    reviews: 24,
    image: img("1597007030739-6d2e7172ee6b"),
    type: "Driveway",
    houseType: "Row House",
    vehicleTypes: ["Car", "Bike", "EV"],
    amenities: ["CCTV", "EV Charger (home socket)", "Covered carport"],
    available: true,
    distanceKm: 0.9,
    description:
      "Covered carport of a row house — shaded, tiled floor, EV-ready with a home socket.",
  },
  {
    id: "sp-07",
    title: "Deshpande bungalow — front yard",
    owner: "Amit Deshpande",
    address: "Plot 14, Baner Road",
    area: "Baner",
    city: "Pune",
    pricePerHour: 30,
    pricePerDay: 200,
    rating: 4.3,
    reviews: 15,
    image: img("1486006920555-c77dcf18193c"),
    type: "Driveway",
    houseType: "Bungalow",
    vehicleTypes: ["Car", "Bike"],
    amenities: ["CCTV", "Owner on premises"],
    available: true,
    distanceKm: 3.2,
    description:
      "Open driveway in front of a quiet family bungalow. Great for long weekday stays. Monthly rate negotiable.",
  },
  {
    id: "sp-08",
    title: "Menon villa — private double garage",
    owner: "Kavita Menon",
    address: "Indiranagar, 12th Main",
    area: "Indiranagar",
    city: "Bengaluru",
    pricePerHour: 75,
    pricePerDay: 550,
    rating: 4.9,
    reviews: 48,
    image: img("1449965408869-eaa3f722e40d"),
    type: "Private Garage",
    houseType: "Villa",
    vehicleTypes: ["Car", "SUV", "EV"],
    amenities: ["CCTV", "EV Charger (Type-2)", "Shutter garage", "Gated compound"],
    available: true,
    distanceKm: 0.3,
    description:
      "Double shutter garage inside a villa compound. Space for one premium car with room to spare. EV Type-2 charger included.",
  },
];

export type Booking = {
  id: string;
  spaceId: string;
  spaceTitle: string;
  city: string;
  from: string;
  to: string;
  total: number;
  status: "Upcoming" | "Active" | "Completed" | "Cancelled";
  vehicle: string;
};

export const mockBookings: Booking[] = [
  {
    id: "bk-1001",
    spaceId: "sp-01",
    spaceTitle: "Gated driveway at Malhotra residence",
    city: "New Delhi",
    from: "2026-04-22 09:00",
    to: "2026-04-22 18:00",
    total: 470,
    status: "Upcoming",
    vehicle: "DL 8C AB 1234 · Hyundai Creta",
  },
  {
    id: "bk-0997",
    spaceId: "sp-08",
    spaceTitle: "Menon villa — private double garage",
    city: "Bengaluru",
    from: "2026-04-18 10:30",
    to: "2026-04-18 15:30",
    total: 375,
    status: "Completed",
    vehicle: "KA 05 MN 9921 · Tata Nexon EV",
  },
  {
    id: "bk-0991",
    spaceId: "sp-03",
    spaceTitle: "Private garage — Nair residence",
    city: "Bengaluru",
    from: "2026-04-10 08:00",
    to: "2026-04-10 20:00",
    total: 320,
    status: "Completed",
    vehicle: "KA 05 MN 9921 · Tata Nexon EV",
  },
  {
    id: "bk-0988",
    spaceId: "sp-06",
    spaceTitle: "Subramanian row house carport",
    city: "Chennai",
    from: "2026-04-05 12:00",
    to: "2026-04-05 17:00",
    total: 225,
    status: "Cancelled",
    vehicle: "TN 10 CD 4410 · Honda Activa",
  },
];

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "Driver" | "Homeowner" | "Admin";
  joined: string;
  bookings: number;
  status: "Active" | "Suspended";
};

export const mockUsers: AdminUser[] = [
  { id: "u-01", name: "Aditi Sharma", email: "aditi@example.com", role: "Driver", joined: "2025-11-04", bookings: 14, status: "Active" },
  { id: "u-02", name: "Rajesh Malhotra", email: "rajesh@example.com", role: "Homeowner", joined: "2025-08-12", bookings: 0, status: "Active" },
  { id: "u-03", name: "Priya Nair", email: "priya@example.com", role: "Homeowner", joined: "2025-09-22", bookings: 0, status: "Active" },
  { id: "u-04", name: "Kabir Singh", email: "kabir@example.com", role: "Driver", joined: "2026-01-15", bookings: 3, status: "Active" },
  { id: "u-05", name: "Neha Gupta", email: "neha@example.com", role: "Driver", joined: "2026-02-01", bookings: 1, status: "Suspended" },
  { id: "u-06", name: "Amit Deshpande", email: "amit@example.com", role: "Homeowner", joined: "2025-07-19", bookings: 0, status: "Active" },
];

export const cities = [
  "New Delhi",
  "Mumbai",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
];

export const vehicleTypes = ["Car", "Bike", "SUV", "EV"] as const;

export function getSpaceById(id: string) {
  return mockSpaces.find((s) => s.id === id);
}
