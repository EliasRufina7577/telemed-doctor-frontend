import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [inCall, setInCall] = useState(false);
  const socketRef = useRef();
  const navigate = useNavigate();

  const doctorIdentity = localStorage.getItem("doctorIdentity") || "doctor1";
  const API = "https://telemed-backend-ysea.onrender.com";
  const SOCKET = "https://telemed-backend-ysea.onrender.com";

  // Store doctorIdentity if not already in localStorage
  useEffect(() => {
    if (!localStorage.getItem("doctorIdentity")) {
      localStorage.setItem("doctorIdentity", doctorIdentity);
    }
  }, [doctorIdentity]);

  // Socket and live patient setup
  useEffect(() => {
    socketRef.current = io(SOCKET);

    // Register doctor for real-time updates
    socketRef.current.emit("registerDoctor", { doctorId: doctorIdentity });
    console.log("Doctor socket connected:", socketRef.current.connected);

    // Listen for new patient data
    socketRef.current.on("newPatientData", (data) => {
      console.log("New patient data received:", data);
      setPatients((prev) => [data, ...prev]);
    });

    // Fetch existing live patients after login
    fetch(`${API}/api/live-patients?doctorId=${doctorIdentity}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.records) setPatients(data.records);
      })
      .catch((err) => console.error("Error fetching live patients:", err));

    return () => {
      socketRef.current.disconnect();
    };
  }, [doctorIdentity]);

  const startVideoCall = async (patientPhone) => {
    setInCall(true);

    const room = `room-${patientPhone}-${Date.now()}`;

    socketRef.current.emit("callDoctor", {
      doctorId: doctorIdentity,
      patientPhone,
      room,
    });

    navigate("/doctor-video", { state: { room, identity: doctorIdentity } });

    await fetch(`${API}/api/mark-seen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: patientPhone }),
    });

    setPatients((prev) => prev.filter((p) => p.phone !== patientPhone));
  };

  const endVideoCall = () => {
    setInCall(false);
    alert("Prescription loaded!");
  };

  return (
    <div style={{ padding: 30, background: "#f5f7fa", minHeight: "100vh" }}>
      
      {/* Top centered heading */}
      <h1 style={{ textAlign: "center", color: "#2c3e50", marginBottom: 40 }}>
        Sehat Bandhu
      </h1>

      <h1 style={{ color: "#3498db" }}>Doctor Dashboard</h1>

      {patients.length === 0 && <p>No patient data yet.</p>}

      {patients.map((patient, idx) => (
        <div
          key={idx}
          style={{
            background: "#fff",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            maxWidth: 500,
            marginBottom: 20,
          }}
        >
          <h3>{patient.name || "Patient"}</h3>
          <p>Phone: {patient.phone}</p>
          <p>Symptoms: {patient.symptoms}</p>
          {patient.vitals && (
            <>
              <p>Heart Rate: {patient.vitals.heartRate}</p>
              <p>SpO₂: {patient.vitals.spo2}</p>
            </>
          )}

          {!inCall ? (
            <button
              onClick={() => startVideoCall(patient.phone)}
              style={{
                marginTop: 10,
                background: "#3498db",
                color: "#fff",
                padding: "8px 12px",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Start Video Call
            </button>
          ) : (
            <button
              onClick={endVideoCall}
              style={{
                marginTop: 10,
                background: "red",
                color: "#fff",
                padding: "8px 12px",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              End Call & Load Prescription
            </button>
          )}
        </div>
      ))}

      {inCall && (
        <div
          style={{
            marginTop: 30,
            width: "600px",
            height: "400px",
            background: "black",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: 24,
          }}
        >
          Video Call in Progress…
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;
