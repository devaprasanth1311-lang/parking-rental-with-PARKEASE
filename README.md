# ParkEase - Domestic Parking Rental Platform

![ParkEase](https://images.unsplash.com/photo-1590674899484-13e6a8fef8e4?auto=format&fit=crop&w=1200&q=80)

ParkEase is a comprehensive, full-stack web application designed to connect homeowners with unused driveway space to drivers looking for secure, affordable parking. The platform features robust security measures, including real-time SMS OTP verification and live CCTV integration.

## 🌟 Key Features

*   **Role-Based Access Control:** Secure portals with dedicated functionalities for Admins (approval workflows) and standard Users (hosts/renters).
*   **AI Smart Space Optimization:** Employs an intelligent size-matching algorithm that categorizes vehicles (from bikes to trucks) and automatically allocates the best-fitting driveway space based on exact physical dimensions.
*   **Geolocation & Distance Sorting:** Native HTML5 GPS integration allows drivers to fetch their live coordinates and sorts available parking spaces dynamically using the Haversine distance formula.
*   **Live CCTV Integration:** Homeowners can register their IP cameras, providing drivers with a live MJPEG stream exclusively during active booking hours.
*   **Space Management:** Seamlessly list domestic driveways with exact physical dimensions, up to 5 photo uploads, custom pricing, amenities, and dynamic status tracking.
*   **Secure Booking System:** Mandatory real-time Email OTP verification before confirming any parking reservation to prevent fraud.
*   **Admin Dashboard:** Centralized hub to approve/reject new parking listings and monitor overall platform activity.
*   **Owner/User Dashboard:** Dedicated interfaces to manage personal listings, view incoming bookings, and monitor history.

## 🛠️ Technology Stack

**Frontend:**
*   React 18
*   TypeScript
*   Vite
*   Tailwind CSS
*   TanStack Router & Query
*   Lucide React (Icons)

**Backend:**
*   Node.js
*   Express.js
*   MongoDB (Mongoose)
*   JSON Web Tokens (JWT) for Authentication
*   Multer (for image uploads)
*   MSG91 API (for real-time SMS OTPs)

---

## 🚀 Working Procedures & Setup Guide

### Prerequisites
Make sure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [MongoDB](https://www.mongodb.com/try/download/community) (Running locally on port 27017)

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Ensure your MongoDB server is running.
4. Check the `.env` file in the `backend` directory. It should contain the following baseline variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/parking-rental
   JWT_SECRET=your_jwt_secret_here
   ADMIN_EMAIL=admin@parking.com
   ADMIN_PASSWORD=Admin@1234
   MSG91_AUTH_KEY=your_msg91_key
   MSG91_TEMPLATE_ID=your_msg91_template
   NODE_ENV=development
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:5000`.*

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd product-blueprint-ui-main
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The app will be accessible at `http://localhost:5173`.*

---

## 📸 How to Setup the Live CCTV Mobile Demo

To showcase the live security camera feature using your own smartphone:

1. **Download an IP Camera App:** 
   *   Android: Install **"IP Webcam"** from the Play Store.
   *   iOS: Install **"Live Reporter"**.
2. **Connect to Wi-Fi:** Ensure your smartphone and your development PC are connected to the **exact same Wi-Fi network**.
3. **Start the Server:** Open the app on your phone and tap "Start Server". Note the IP address shown on your screen (e.g., `http://192.168.1.5:8080`).
4. **Register the Camera:** 
   *   Log in to ParkEase as a Homeowner and go to "List your space".
   *   In **Step 2 (Describe the space)**, enter the IP address URL shown on your phone (e.g., `http://192.168.1.5:8080/video`) into the "CCTV Camera IP/URL" input field.
   *   Submit the form and wait for Admin approval.
5. **View the Feed:** When a user books that specific space, the live CCTV feed will automatically become active on their "My Bookings" page precisely during their booked time slot!

---

## 👨‍💻 Author

**Deva Prasanth**
*Built with passion for modern web development.*
