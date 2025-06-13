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

