import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DoctorLoginPage({ onLogin }) {
  const [phone, setPhone] = useState("1234567890"); // default phone
  const [password, setPassword] = useState("doctor123"); // default password
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can call your backend API to validate doctor login.
    // For now we just go to the dashboard:
    if (onLogin) onLogin(phone); // optional callback
    navigate("/dashboard", { state: { phone } });
  };

  return (
    <>
      <style>{`
        .doctor-login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          font-family: Arial, sans-serif;
        }
        .doctor-login-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 40px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        .doctor-login-card h2 {
          text-align: center;
          margin-bottom: 24px;
          color: #333333;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          margin-bottom: 6px;
          color: #555555;
          font-weight: bold;
        }
        .form-group input {
          width: 100%;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #cccccc;
          font-size: 14px;
        }
        .form-group input:focus {
          outline: none;
          border-color: #4facfe;
          box-shadow: 0 0 3px #4facfe;
        }
        .login-button {
          width: 100%;
          padding: 12px;
          background-color: #4facfe;
          border: none;
          color: white;
          font-size: 16px;
          font-weight: bold;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .login-button:hover {
          background-color: #00c6fb;
        }
      `}</style>

      <div className="doctor-login-container">
        <div className="doctor-login-card">
         <h2
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "24px",
    color: "#333333",
  }}
>
  <img
    src="/image.png"  // Replace with the actual file name in public folder
    alt="Logo"
    style={{ width: "40px", height: "40px", objectFit: "contain" }}
  />
  Doctor Login
</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="text"
                id="phone"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
