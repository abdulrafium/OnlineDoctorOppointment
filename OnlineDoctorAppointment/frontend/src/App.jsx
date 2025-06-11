import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleSelection from './components/RoleSelection';
import DoctorImage from './components/DoctorImage';
import { PatientLogin } from './components/PatientLogin';
import { Login } from './components/Login';
import { Registration } from './components/Registration';
import './App.css';
import './styles/Responsive.css';


function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="routes-wrapper">
          <Routes>
            <Route path="/" element={<RoleSelection />} />
            <Route path="/patient" element={<PatientLogin role="Patient" />} />
            <Route path="/doctor" element={<Login role="Doctor" />} />
            <Route path="/admin" element={<Login role="Admin" />} />
            <Route path="/registration" element={<Registration role="Registration" />} />
          </Routes>
        </div>

        <DoctorImage />
      </div>
    </Router>
  );
}

export default App;
