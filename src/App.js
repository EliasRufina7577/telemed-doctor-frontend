import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DoctorLoginPage from "./pages/DoctorLoginPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorVideoPage from "./DoctorVideoPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DoctorLoginPage />} />
        <Route path="/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor-video" element={<DoctorVideoPage />} />
      </Routes>
    </Router>
  );
}

export default App;
