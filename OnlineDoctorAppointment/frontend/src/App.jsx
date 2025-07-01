import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import RoleSelection from './components/RoleSelection';
import DoctorImage from './components/DoctorImage';
import { PatientLogin } from './components/PatientLogin';
import { Login } from './components/Login';
import { Registration } from './components/Registration';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PatientProfile from './components/PatientProfile';

import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';


import './App.css';
import './styles/Responsive.css';

function AppContent() {
  const location = useLocation();
  const isAuthPage =
  ["/", "/patient", "/doctor", "/admin", "/registration", "/forgot-password"].includes(location.pathname) ||
  location.pathname.startsWith("/reset-password");


  return (
    <div className={isAuthPage ? 'auth-layout' : 'main-layout'}>
      {isAuthPage ? (
        <>
          <div className="routes-wrapper">
            <Routes>
              <Route path="/" element={<RoleSelection />} />
              <Route path="/patient" element={<PatientLogin role="Patient" />} />
              <Route path="/doctor" element={<Login role="Doctor" />} />
              <Route path="/admin" element={<Login role="Admin" />} />
              <Route path="/registration" element={<Registration role="Patient" />} />

              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Routes>
          </div>
          <DoctorImage />
        </>
      ) : (
        <Routes>
          <Route
            path="/patientdashboard"
            element={
              <ProtectedRoute allowedRole="Patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute allowedRole="Patient">
                <PatientProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctordashboard"
            element={
              <ProtectedRoute allowedRole="Doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admindashboard"
            element={
              <ProtectedRoute allowedRole="Admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
