# OnlineDoctorOppointment
# 🏥 Online Doctor Appointment System - Phase 1

This is **Phase 1** of the Online Doctor Appointment project, which includes role-based login and registration functionality for three roles: **Patient**, **Doctor**, and **Admin**. The system is built using **React.js (frontend)** and **Node.js + Express.js (backend)**, with credentials securely stored in a **MongoDB Atlas** cloud database.

---

## Key Features (Phase 1)
- **Role Selection Page** for Patient, Doctor, and Admin.
- **Login Page** for:
  - Patient (dedicated form)
  - Doctor and Admin (shared login form with role verification)
- **Patient Registration Page** for new account creation.
- **Credential Storage** in MongoDB Atlas with:
  - Password hashing using bcrypt.
  - Role-based access checks.
- **Secure Login** with error handling for incorrect credentials and role mismatches.

---

## 🛠️ Tech Stack
- **Frontend:** React (Vite), TailwindCSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Cloud-based)
- **Others:** bcryptjs, JWT (optional for future phases), dotenv, cors

---


## 🏥 Online Doctor Appointment System - Phase 2

This phase focuses on core appointment management, availability scheduling, and dynamic dashboards for each role with backend connectivity.

---

### Key Features (Phase 2)

- **Patient Dashboard:**
  - View list of available **Doctors** in card format
  - Book appointments

- **Doctor Dashboard:**
  - View list of **Confirmed Patients**
  - Set **Available Time Slots**
  - See patient details in card format

- **Admin Dashboard:**
  - View **All Appointments**
  - Confirm/Reject appointments using card-style interface

- **Backend Integration:**
  - APIs to fetch/save doctor availability
  - Appointment status update (Confirm/Reject) handled via API
  - MongoDB collections for users, patientDetails, doctorDetails, and appointments
  - Frontend connected with backend using RESTful API routes

### UI Enhancements (Phase 2)
- Card-based layout for patient and doctor information
- Improved UX in forms, dashboards, and status indicators
- Popup alerts and feedback with auto-close animations

---



## 🚀 Getting Started

Follow the steps below to run the project locally:

1. **Clone the repository**  
   ```bash
   git clone https://github.com/abdulrafium/OnlineDoctorOppointment.git

2. **Start the backend server**  
   ```bash
   cd OnlineDoctorAppointment
   cd backend
   nodemon server.js

3. **Start the frontent server**  
   ```bash
   cd OnlineDoctorAppointment
   cd frontend
   npm run dev
