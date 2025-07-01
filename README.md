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
- **Others:** bcryptjs, JWT, dotenv, cors

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

## Updated Phase 2

### Forgot/Reset Password Feature
- Added **Forgot Password** and **Reset Password** functionality.
- Users can request a password reset by email.
- A **secure token** (valid for 15 minutes) is sent via email.
- Users can click the email link to set a **new password** securely.
- Includes password validation and confirmation fields in the UI.

### Email Notifications for Appointment Status
- Implemented **automated email notifications** for appointment **confirmation** and **rejection**.
- Patients are notified when the admin updates the status of their appointment.
- Email includes:
  - Doctor name and hospital
  - Appointment date and time (formatted)
  - Confirmation or rejection message
- Emails are styled professionally and sent via **Nodemailer using Gmail SMTP**.

> These features were finalized and implemented **after completing the main Phase 2**, to enhance security and communication.



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
   npm install
   npm run dev

---

## 👤 Role Credentials & Access Instructions

### 🔹 Patient
- Create a new account using a **valid and active email address**.
- Complete your profile to enable appointment booking.

### 🔹 Doctor
- Use the following predefined login credentials:
  - **Email:** `doctor1@gmail.com`
  - **Password:** `12345`
- Additional sample doctor accounts:
  - `doctor2@gmail.com`, `doctor3@gmail.com`, `doctor4@gmail.com`
  - **Password:** `12345` for all

### 🔹 Admin
- Use the following credentials to access the admin dashboard:
  - **Email:** `admin@gmail.com`
  - **Password:** `12345`

