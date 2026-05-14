# 🅿️ ParkEase — Smart Parking Rental System

A full-stack parking rental web app with 3 roles: Customer, House Owner, and Admin.

---

## Tech Stack
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Multer
- **Frontend**: React (Vite), Tailwind CSS, React Router v6, Axios, hls.js, Leaflet.js

---

## Quick Start

### 1. Prerequisites
- Node.js ≥ 18
- MongoDB running locally (`mongod`) or a MongoDB Atlas URI

### 2. Backend Setup
```bash
cd backend
npm install
# Edit .env if needed (MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD)
npm run dev
# → Server runs on http://localhost:5000
# → Admin account auto-seeded on first run
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Edit .env if needed (VITE_API_URL)
npm run dev
# → App runs on http://localhost:5173
```

---

## Default Credentials

| Role       | Email                  | Password    |
|------------|------------------------|-------------|
| Admin      | admin@parking.com      | Admin@1234  |
| Customer   | Register via app       | —           |
| House Owner| Register via app       | —           |

---

## Features by Role

### 🧑 Customer
- Register/Login
- Browse approved parking spaces with photo, location, price
- Filter by address, price range, availability
- Book a space by selecting date/time range
- Pay to confirm (simulated)
- View live CCTV feed after confirmed booking
- My Bookings page with status tracking and cancel

### 🏠 House Owner
- Register/Login
- Add parking space with photos, map picker, price, CCTV URL
- Dashboard showing own spaces and bookings
- Toggle availability of spaces
- Edit/Delete own listings
- View all bookings for their spaces

### 🛡️ Admin
- Dedicated login
- Stats dashboard (users, owners, bookings, revenue)
- User management (activate/deactivate)
- Listing management (approve/reject)
- All bookings and transactions view

---

## Folder Structure
```
parking-rental/
├── backend/
│   ├── controllers/    # Business logic
│   ├── middleware/     # JWT auth + Multer upload
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── uploads/        # Uploaded parking photos
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/   # Shared UI components
    │   ├── context/      # AuthContext
    │   ├── pages/
    │   │   ├── customer/ # BrowseSpace, SpaceDetail, MyBooking, CustomerDashboard
    │   │   ├── owner/    # OwnerDashboard, AddSpace, EditSpace
    │   │   └── admin/    # AdminDashboard
    │   ├── routes/       # PrivateRoute
    │   ├── services/     # Axios API instance
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```
