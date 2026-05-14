# 🅿️ ParkEase — Product Description Document (PRD)

**Version:** 2.0  
**Date:** April 20, 2026  
**Status:** In Development

---

## 1. Product Overview

**ParkEase** is a full-stack smart parking rental web application that connects parking space owners with customers seeking parking. The platform features intelligent vehicle-size-based slot allocation, OTP-based authentication, live CCTV monitoring, and admin-controlled space verification.

### 1.1 Core Value Proposition
- **For Customers:** Find and book optimal parking spaces based on vehicle size and location with live CCTV monitoring.
- **For Space Providers (Clients):** Monetize unused parking spaces by listing them on the platform after admin verification.
- **For Admins:** Manage the entire ecosystem — verify land proofs, approve/reject spaces, and monitor platform activity.

---

## 2. System Roles (2 Login Phases Only)

> **IMPORTANT CHANGE:** The system uses only **2 login types** — **Admin** and **Client**.  
> The previous 3-role system (Customer, House Owner, Admin) is consolidated. A single **Client** role can both book parking AND list their own spaces.

| Role | Description |
|------|-------------|
| **Admin** | Platform administrator. Logs in with email + password + OTP. Manages users, verifies land proofs, approves/rejects spaces. |
| **Client** | End user. Logs in with email/phone + OTP only (no password). Can search & book parking, view CCTV, and also list their own parking spaces for others. |

---

## 3. Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, JWT, Multer |
| **Frontend** | React (Vite), Tailwind CSS, React Router v6, Axios, hls.js, Leaflet.js |
| **OTP Service** | Nodemailer (email) + Twilio/Fast2SMS (SMS for phone OTP) |
| **File Storage** | Local disk (`/uploads`) via Multer |
| **Auth** | JWT tokens with OTP-based verification |

---

## 4. Authentication System

### 4.1 Login Page — 2 Phases Only

The login page presents **two cards/buttons**:
1. **Admin Login**
2. **Client Login**

### 4.2 Admin Login Flow
```
Step 1: Enter Email + Password
Step 2: OTP sent to admin's registered email
Step 3: Verify 6-digit OTP → JWT token issued → Redirect to /admin
```

### 4.3 Client Login Flow
```
Step 1: Enter Email OR Phone Number (toggle option provided)
Step 2: OTP sent to the provided email/phone
Step 3: Verify 6-digit OTP → JWT token issued → Redirect to /dashboard
```

- **No password required** for client login — OTP-only authentication.
- **Phone number field** must be added to the login page as an alternative to email.
- Client accounts are **auto-approved** — no admin authorization needed for login.
- OTP is verified on **every login session**.

### 4.4 Registration Flow (Client Only)
```
Step 1: Enter username, email, phone number, password (optional, for future use)
Step 2: OTP sent to email or phone for verification
Step 3: Account created → Redirect to login
```

### 4.5 OTP Configuration
- **Development mode:** Fixed OTP `123456`, logged to console.
- **Production mode:** Random 6-digit OTP sent via SMTP (email) or SMS gateway (phone).
- **Expiry:** 10 minutes.
- **Resend:** Available after initial send.

---

## 5. Client Dashboard — Feature Specification

### 5.1 Tab/Page Structure

| Tab/Page | Route | Description |
|----------|-------|-------------|
| **Home** | `/dashboard` | App logo, user profile details, quick stats |
| **Search Parking** | `/browse` | Search by location + vehicle model for smart allocation |
| **My Bookings** | `/my-bookings` | Booking history with live CCTV feed |
| **List My Space** | `/list-space` | Add own parking space with proof documents |

---

### 5.2 Home Page (`/dashboard`)

**Content:**
- ParkEase app logo (prominent display)
- Logged-in user details: name, email, phone number, member since date
- Quick action cards: "Search Parking", "My Bookings", "List Your Space"
- Summary stats: total bookings made, active bookings, spaces listed

---

### 5.3 Search Parking (`/browse`)

**Search Input Fields:**
1. **Location** (text input) — Address, area, city, or landmark
2. **Vehicle Model** (text input with suggestions) — e.g., "Maruti Swift", "Honda Activa", "Toyota Fortuner"
3. **Vehicle Type** (dropdown) — Car / Bike / SUV / Truck

**Smart Allocation Logic (Size-Based):**

The system auto-predicts vehicle size from the model name using a built-in lookup table:

| Vehicle Category | Example Models | Size Classification | Slot Width Required |
|-----------------|----------------|---------------------|-------------------|
| Bike/Scooter | Activa, Splendor, Duke | `small` | 3 ft |
| Hatchback | Swift, i10, WagonR, Alto | `medium` | 7 ft |
| Sedan | City, Verna, Ciaz | `medium-large` | 8 ft |
| SUV/MUV | Fortuner, Creta, Innova | `large` | 9 ft |
| Truck/Van | Bolero, Tata Ace | `extra-large` | 10 ft |

**Slot Display Rules:**
- ❌ **NOT** first-come-first-serve order.
- ✅ Show slots sorted by **best fit** for the vehicle size to prevent congestion.
- Smaller vehicles shown smaller slots first; larger vehicles shown larger slots first.
- Available slots are highlighted; occupied slots are grayed out.
- Each result card shows: title, photos, address, price/hr, distance, available spots, slot size compatibility badge.

---

### 5.4 Booking System

**Booking Flow:**
```
1. Customer selects a parking space from search results
2. Selects start time and end time
3. System validates: min 1 hour, max 24 hours (1 day)
4. Total price calculated: hours × pricePerHour
5. Payment (simulated) → Booking confirmed
6. Live CCTV feed becomes available
```

**Time Constraints:**
| Rule | Value |
|------|-------|
| Minimum booking duration | **1 hour** |
| Maximum booking duration | **24 hours (1 day)** |

**Booking Extension:**
- Customer can extend the parking slot timing **only within the last 10 minutes** before the booking ends.
- Extension range: 0.5 hours to 24 hours.
- Additional cost calculated and charged.
- A new transaction record is created for the extension.
- If the 10-minute window passes without extension, the booking ends automatically.

---

### 5.5 My Bookings (`/my-bookings`)

**Display:**
- List of all bookings (past and current), sorted by most recent.
- Each booking card shows:
  - Parking space name and address
  - Start time → End time
  - Status badge: `pending` | `confirmed` | `completed` | `cancelled`
  - Total price paid
  - Vehicle model used for booking

**Live CCTV Feed:**
- For **confirmed/active** bookings, a "Watch Live" button appears.
- Clicking it opens the CCTV feed (HLS stream via hls.js) showing the parking area.
- Feed is available **from start time to end time** of the booking only.
- Uses the `cctvUrl` field from the parking space.

**Actions:**
- **Pay** (for pending bookings)
- **Cancel** (for pending/confirmed bookings)
- **Extend** (for confirmed bookings within last 10 minutes)

---

### 5.6 List My Space (`/list-space`)

A client can add their **own parking space** for others to use. This is a multi-step form:

**Step 1 — Owner Details:**
| Field | Required | Description |
|-------|----------|-------------|
| Full Name | ✅ | Space provider's legal name |
| Phone Number | ✅ | Contact number (verified via OTP) |
| Email | Auto-filled | From logged-in user profile |

**Step 2 — Space Details:**
| Field | Required | Description |
|-------|----------|-------------|
| Listing Title | ✅ | e.g., "Covered parking near Central Mall" |
| Description | ❌ | Details about the space |
| Full Address | ✅ | Complete street address |
| City | ✅ | City name |
| Pincode | ❌ | Area pincode |
| Landmark | ❌ | Nearby landmark |
| Latitude/Longitude | ❌ | GPS coordinates |
| Total Spots | ✅ | Number of parking spots |
| Slot Sizes | ✅ | Size categories available (small/medium/large) |
| CCTV Feed URL | ❌ | Live camera feed URL |

**Step 3 — Photos & Documents:**
| Field | Required | Description |
|-------|----------|-------------|
| Parking Space Photos | ✅ | Up to 6 images (JPG/PNG, max 5MB each) |
| Land Proof / House Proof | ✅ | Document proving ownership (PDF/JPG/PNG) |

**Step 4 — Pricing:**
| Field | Required | Description |
|-------|----------|-------------|
| Price per Hour (₹) | ✅ | Hourly rate |
| Price per Day (₹) | ❌ | Optional daily rate discount |

**OTP Verification for Space Listing:**
- Before final submission, the space provider **must verify via OTP** sent to their provided phone number.
- This ensures the phone number is valid and belongs to the provider.

**Post-Submission:**
- Space status set to `pending` (not approved).
- Admin must review land proof and approve/reject the listing.
- Provider is notified of approval/rejection.

---

## 6. Admin Dashboard — Feature Specification

### 6.1 Overview Stats
- Total registered clients
- Total parking space providers (who have listed spaces)
- Total bookings (all time)
- Total revenue
- Pending approvals count

### 6.2 Parking Space Management (Primary New Feature)

**Accept / Reject / Activate / Deactivate spaces based on land proof:**

| Action | Description |
|--------|-------------|
| **Approve** | Admin reviews land proof document → marks space as approved → space becomes visible to customers |
| **Reject** | Admin finds land proof insufficient → marks space as rejected → space remains invisible |
| **Activate** | Re-enable a previously deactivated space |
| **Deactivate** | Temporarily disable a space (e.g., for violations) |

**Admin Review Panel for Each Space:**
- View all uploaded photos
- View/download land proof document
- Owner details: name, phone, email
- Location details with map preview
- Approve / Reject / Deactivate buttons

### 6.3 User Management
- View all registered clients
- Activate / Deactivate client accounts
- **Note:** Customers do NOT need admin approval to register or login. They are auto-verified via OTP.
- Admin can only manage parking space *providers* (clients who list spaces).

### 6.4 Booking Management
- View all bookings across the platform
- Filter by status, date range, space
- View booking details including customer and space info

### 6.5 Transaction Management
- View all payment transactions
- Filter by date, amount, status
- Revenue analytics

---

## 7. Data Models

### 7.1 User Model (Updated)
```javascript
{
  username:    String (required, unique),
  email:       String (required, unique),
  phone:       String (unique),              // NEW — phone number
  password:    String (required for admin only),
  role:        String (enum: ['client', 'admin']),  // CHANGED — only 2 roles
  isActive:    Boolean (default: true),
  createdAt:   Date,
  updatedAt:   Date
}
```

### 7.2 ParkingSpace Model (Updated)
```javascript
{
  ownerId:       ObjectId (ref: User, required),
  title:         String (required),
  description:   String,
  photos:        [String],                    // photo file paths
  landProof:     String,                      // NEW — land proof document path
  ownerName:     String (required),           // NEW — provider's full name
  ownerPhone:    String (required),           // NEW — provider's phone
  phoneVerified: Boolean (default: false),    // NEW — OTP verified
  location: {
    address:  String (required),
    city:     String,
    pincode:  String,
    landmark: String,
    lat:      Number,
    lng:      Number
  },
  slotSizes: [{                               // NEW — slot size categories
    category:  String (enum: ['small','medium','medium-large','large','extra-large']),
    count:     Number,
    widthFt:   Number
  }],
  pricePerHour:  Number (required),
  pricePerDay:   Number,
  isAvailable:   Boolean (default: true),
  isApproved:    Boolean (default: false),
  approvalStatus: String (enum: ['pending','approved','rejected']),  // NEW
  cctvUrl:       String,
  totalSpots:    Number (default: 1),
  createdAt:     Date,
  updatedAt:     Date
}
```

### 7.3 Booking Model (Updated)
```javascript
{
  customerId:     ObjectId (ref: User, required),
  parkingSpaceId: ObjectId (ref: ParkingSpace, required),
  vehicleModel:   String (required),          // NEW — car/bike model name
  vehicleType:    String (enum: ['bike','hatchback','sedan','suv','truck']),  // NEW
  vehicleSize:    String (enum: ['small','medium','medium-large','large','extra-large']),  // NEW
  slotAssigned:   String,                     // NEW — specific slot ID/number
  startTime:      Date (required),
  endTime:        Date (required),
  totalPrice:     Number (required),
  status:         String (enum: ['pending','confirmed','completed','cancelled']),
  createdAt:      Date,
  updatedAt:      Date
}
```

### 7.4 Transaction Model (No Change)
```javascript
{
  bookingId:     ObjectId (ref: Booking, required),
  customerId:    ObjectId (ref: User, required),
  amount:        Number (required),
  paymentStatus: String (enum: ['paid','refunded']),
  createdAt:     Date,
  updatedAt:     Date
}
```

### 7.5 VehicleSizeLookup (New — Static/Config)
```javascript
// Built-in lookup table (can be a JSON file or DB collection)
{
  modelName:    String,       // e.g., "Maruti Swift"
  type:         String,       // "hatchback"
  sizeCategory: String,      // "medium"
  widthFt:      Number       // 7
}
```

---

## 8. API Endpoints

### 8.1 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new client (username, email, phone) |
| POST | `/api/auth/send-otp` | Send OTP to email or phone |
| POST | `/api/auth/verify-otp` | Verify OTP and issue JWT |
| POST | `/api/auth/login` | Legacy login (admin password + OTP) |

### 8.2 Parking Spaces
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/parking` | Client | Browse approved spaces (filter by location, vehicle size) |
| GET | `/api/parking/:id` | Client | Get space details |
| POST | `/api/parking` | Client | Create new space listing (with photos + land proof) |
| PUT | `/api/parking/:id` | Client | Update own space |
| DELETE | `/api/parking/:id` | Client | Delete own space |
| GET | `/api/parking/my-spaces` | Client | Get spaces listed by current user |
| POST | `/api/parking/verify-phone` | Client | Send OTP to verify phone for space listing |
| POST | `/api/parking/confirm-phone` | Client | Confirm phone OTP |

### 8.3 Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings` | Client | Create booking (with vehicle model) |
| GET | `/api/bookings/my` | Client | Get my bookings |
| PUT | `/api/bookings/:id/pay` | Client | Pay for booking |
| PUT | `/api/bookings/:id/cancel` | Client | Cancel booking |
| PUT | `/api/bookings/:id/extend` | Client | Extend booking (last 10 mins) |

### 8.4 Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard statistics |
| GET | `/api/admin/users` | Admin | All users list |
| PUT | `/api/admin/users/:id/toggle` | Admin | Activate/deactivate user |
| GET | `/api/admin/spaces` | Admin | All spaces (including pending) |
| PUT | `/api/admin/spaces/:id/approve` | Admin | Approve space (after land proof review) |
| PUT | `/api/admin/spaces/:id/reject` | Admin | Reject space |
| PUT | `/api/admin/spaces/:id/deactivate` | Admin | Deactivate approved space |
| GET | `/api/admin/bookings` | Admin | All bookings |
| GET | `/api/admin/transactions` | Admin | All transactions |

---

## 9. Vehicle Size Prediction Engine

### 9.1 How It Works
```
Input: Vehicle Model Name (string) → e.g., "Maruti Swift"
  ↓
Step 1: Fuzzy match against vehicle database
  ↓
Step 2: Return size category + dimensions
  ↓
Step 3: Filter available slots that fit this size
  ↓
Step 4: Sort by BEST FIT (smallest adequate slot first)
  ↓
Output: Ordered list of compatible parking spaces
```

### 9.2 Allocation Strategy
- **Best-fit algorithm:** Assign the smallest slot that fits the vehicle.
- This prevents large slots being wasted on small vehicles.
- Reduces congestion by optimal space utilization.
- If exact model not found, use the vehicle type dropdown as fallback.

### 9.3 Sample Vehicle Database (Initial Seed)
```
Bikes: Activa, Splendor, Pulsar, Duke, R15, Jupiter, Access
Hatchbacks: Swift, i10, i20, WagonR, Alto, Celerio, Tiago, Polo
Sedans: City, Verna, Ciaz, Rapid, Amaze, Dzire, Slavia
SUVs: Creta, Seltos, Fortuner, XUV700, Thar, Scorpio, Hector
Large: Innova, Bolero Pickup, Tata Ace
```

---

## 10. Frontend Page Map

```
/login              → Login (Admin | Client selection)
/register           → Client Registration (with phone number)
/dashboard          → Client Home (logo, user details, quick actions)
/browse             → Search Parking (location + vehicle model)
/space/:id          → Space Detail (book, view CCTV)
/my-bookings        → Booking History (with live CCTV per booking)
/list-space         → List Own Parking Space (with proof upload + OTP)
/admin              → Admin Dashboard (stats, approvals, users, bookings)
```

---

## 11. Key Business Rules Summary

| # | Rule |
|---|------|
| 1 | Login page has exactly **2 modes**: Admin and Client |
| 2 | Clients authenticate via **OTP only** (email or phone) — no password |
| 3 | Admin authenticates via **email + password + OTP** |
| 4 | Clients can login **without admin approval** — auto-verified by OTP |
| 5 | Minimum parking duration: **1 hour** |
| 6 | Maximum parking duration: **24 hours (1 day)** |
| 7 | Booking extension allowed **within last 10 minutes** only |
| 8 | Vehicle size is **auto-predicted** from model name |
| 9 | Slot allocation is **best-fit based on vehicle size**, NOT first-come-first-serve |
| 10 | Space providers must verify phone via **OTP** before listing |
| 11 | Space providers must upload **land proof or house proof** |
| 12 | Admin must **verify land proof** before approving a space |
| 13 | Admin can **activate, deactivate, or reject** space providers |
| 14 | Live CCTV footage shown to car owner **from start time to end time** |
| 15 | Client role is unified — same user can **book** and **list** spaces |

---

## 12. Implementation Phases

### Phase 1: Auth Refactor
- [ ] Merge `customer` + `houseOwner` roles into single `client` role
- [ ] Add `phone` field to User model
- [ ] Update login page to 2 modes only (Admin / Client)
- [ ] Add phone number input option on login page
- [ ] Implement SMS OTP sending (via Twilio/Fast2SMS)
- [ ] Update registration to include phone number
- [ ] Remove password requirement for client login

### Phase 2: Vehicle Size Engine
- [ ] Create vehicle model lookup table/database
- [ ] Build size prediction API endpoint
- [ ] Add `vehicleModel`, `vehicleType`, `vehicleSize` to Booking model
- [ ] Add `slotSizes` array to ParkingSpace model
- [ ] Implement best-fit allocation algorithm
- [ ] Update search/browse to accept vehicle model input
- [ ] Sort results by optimal fit (not FCFS)

### Phase 3: Space Listing Enhancement
- [ ] Add `landProof` field to ParkingSpace model
- [ ] Add `ownerPhone`, `phoneVerified` fields
- [ ] Update ListMySpace form with phone, land proof upload
- [ ] Implement phone OTP verification for space listing
- [ ] Add `approvalStatus` field (pending/approved/rejected)
- [ ] File upload support for land proof documents (PDF/JPG)

### Phase 4: Admin Dashboard Enhancement
- [ ] Add land proof review panel
- [ ] Approve/Reject with land proof viewer
- [ ] Add Activate/Deactivate toggle for space providers
- [ ] Add pending approvals section with count badge
- [ ] Download/view land proof documents

### Phase 5: Booking & CCTV
- [ ] Update booking flow to include vehicle model selection
- [ ] Enforce min 1hr / max 24hr constraints (already exists)
- [ ] Booking extension within last 10 mins (already exists)
- [ ] CCTV live feed on My Bookings page (start-to-end time window)
- [ ] HLS stream player integration per booking card

### Phase 6: Client Dashboard Polish
- [ ] Home page with app logo and user details
- [ ] Quick stats cards
- [ ] Responsive navigation tabs
- [ ] Booking history with status filters
- [ ] Smooth animations and transitions

---

## 13. Environment Variables

```env
# Server
PORT=5000
MONGO_URI=mongodb://localhost:27017/parking-rental
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173

# Admin Seed
ADMIN_EMAIL=admin@parking.com
ADMIN_PASSWORD=Admin@1234

# Email OTP (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# SMS OTP (Twilio or Fast2SMS)
SMS_PROVIDER=twilio
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE=+1234567890

# Mode
NODE_ENV=development
```

---

## 14. Folder Structure (Updated)

```
parking-rental/
├── backend/
│   ├── config/
│   │   └── vehicleDatabase.js     # Vehicle model → size lookup
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js       # Updated: phone OTP support
│   │   ├── bookingController.js    # Updated: vehicle size allocation
│   │   ├── parkingController.js    # Updated: land proof, phone verify
│   │   └── transactionController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js               # Updated: support PDF for land proof
│   ├── models/
│   │   ├── Booking.js              # Updated: vehicle fields
│   │   ├── ParkingSpace.js         # Updated: slotSizes, landProof
│   │   ├── Transaction.js
│   │   └── User.js                 # Updated: phone, 2 roles only
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── booking.js
│   │   ├── parking.js
│   │   └── transaction.js
│   ├── uploads/                    # Photos + land proof docs
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── DashboardLayout.jsx
    │   │   └── CCTVPlayer.jsx       # NEW: HLS CCTV component
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── data/
    │   │   └── vehicleModels.js     # NEW: client-side vehicle lookup
    │   ├── pages/
    │   │   ├── Login.jsx            # Updated: 2 modes + phone input
    │   │   ├── Register.jsx         # Updated: phone number field
    │   │   ├── customer/
    │   │   │   ├── BrowseSpace.jsx  # Updated: vehicle model search
    │   │   │   ├── CustomerDashboard.jsx  # Updated: home with user info
    │   │   │   ├── ListMySpace.jsx  # Updated: phone OTP + land proof
    │   │   │   ├── MyBooking.jsx    # Updated: CCTV per booking
    │   │   │   └── SpaceDetail.jsx
    │   │   └── admin/
    │   │       └── AdminDashboard.jsx  # Updated: land proof review
    │   ├── routes/
    │   │   └── PrivateRoute.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx                  # Updated: removed owner routes
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 15. What's Removed / Changed from Current Codebase

| Item | Current State | New State |
|------|--------------|-----------|
| Roles | 3 roles (customer, houseOwner, admin) | 2 roles (client, admin) |
| Login phases | 3 phases (select → email → OTP) | 2 modes (Admin / Client) |
| Phone login | Not supported | Email OR Phone OTP |
| Owner pages | Separate `/owner/*` routes | Merged into client `/list-space` |
| Vehicle model | Not captured | Required at booking time |
| Slot allocation | First-come-first-serve | Best-fit by vehicle size |
| Land proof | Not required | Required for space listing |
| Phone OTP | Not supported | Required for space providers |
| CCTV per booking | Basic implementation | Time-windowed per booking |

---

*This document serves as the complete specification for building ParkEase v2.0. All features should be implemented following the phases outlined in Section 12.*
