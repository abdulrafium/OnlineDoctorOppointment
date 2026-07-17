# 🏥 Online Doctor Appointment System

A full-stack, modern, and highly responsive web application built with Next.js and MongoDB. This platform connects patients with doctors, allowing seamless appointment booking, profile management, and administrative oversight.

---

## ✨ Features

### 🧑‍⚕️ Role-Based Dashboards
The application features three distinct, secure portals:
- **Patient Portal:** Patients can create detailed profiles, browse a list of available doctors based on specialization, book appointments, and track the real-time status of their requests (Pending, Confirmed, Rejected).
- **Doctor Portal:** Doctors can manage their professional profiles, set their consultation fees and availability, and seamlessly approve or reject incoming patient appointment requests.
- **Admin Dashboard:** A powerful control center for administrators to oversee the entire platform. Admins can view all users, manage accounts (delete users and their associated data), and manage or clear appointment histories.

### 🎨 Premium Modern Design
- **Glassmorphism Aesthetics:** The UI features frosted-glass effects, soft shadows, and semi-transparent backgrounds over beautiful, fluid gradients.
- **Micro-Animations:** Interactive elements (buttons, inputs, cards) include smooth hover effects, scaling, and transitions to make the interface feel alive.
- **Custom Toast Notifications:** A sleek, fully custom animated notification system that slides in from the top right to provide instant, non-intrusive feedback for user actions.
- **Beautiful Modals:** Replaces ugly browser `confirm()` prompts with gorgeous, animated glassmorphism popups for destructive actions (like deleting accounts or logging out).

### 🔐 Security & Architecture
- **Robust Authentication:** Secure JWT-based authentication system with encrypted passwords using `bcrypt`.
- **Protected Routes:** Next.js middleware and client-side protection ensures users can only access their specific role's dashboard.
- **Unified API:** Built entirely within Next.js API routes, bridging the gap between frontend and backend in a single repository.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Frontend Library:** [React](https://reactjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS Modules
- **Database:** [MongoDB](https://www.mongodb.com/) (using [Mongoose](https://mongoosejs.com/) for object data modeling)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A MongoDB cluster (Atlas) or local instance

### Installation

1. **Clone the repository** (or download the source code).

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the App:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

---

## 📂 Project Structure

- `/app`: Next.js App Router containing pages and API routes.
  - `/api`: Backend endpoints for user management, appointments, and profiles.
- `/components`: Reusable React components (Dashboards, Login Forms, Modals, Toasts).
- `/models`: Mongoose schemas defining the database structure (User, DoctorDetails, PatientDetails, Appointment).
- `/styles`: Global styles and specific component CSS files.
- `/lib`: Helper utilities, including the MongoDB connection logic.

---

*Designed and developed with a focus on beautiful UI/UX and robust architecture.*
