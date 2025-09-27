import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Video from "twilio-video";

function DoctorVideoPage() {
  const navigate = useNavigate();
  const { room } = useParams(); // get room from URL
  const location = useLocation();
  const identity = location.state?.identity || localStorage.getItem("doctorIdentity");
  const remoteVideoRef = useRef();
  const [roomObj, setRoomObj] = useState(null);

  useEffect(() => {
    if (!room || !identity) {
      navigate("/login"); // redirect only if identity is missing
      return;
    }

    let twilioRoom = null;

    const joinRoom = async () => {
      try {
        const token = localStorage.getItem("doctorToken"); // optional if using auth token
        const res = await fetch("http://localhost:5000/video-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify({ identity, room }),
        });
        const data = await res.json();
        if (!data.success) throw new Error("Failed to get token");

        twilioRoom = await Video.connect(data.token, {
          audio: true,
          video: { width: 640 },
          name: room,
        });
        setRoomObj(twilioRoom);

        // Attach local video in small overlay
        const localTrack = Array.from(twilioRoom.localParticipant.videoTracks.values())[0]?.track;
        if (localTrack) {
          const localContainer = document.createElement("div");
          localContainer.style.position = "absolute";
          localContainer.style.width = "200px";
          localContainer.style.height = "150px";
          localContainer.style.bottom = "10px";
          localContainer.style.right = "10px";
          localContainer.style.border = "2px solid #fff";
          localContainer.style.borderRadius = "8px";
          localContainer.style.overflow = "hidden";
          localContainer.appendChild(localTrack.attach());
          remoteVideoRef.current.appendChild(localContainer);
        }

        // Attach existing remote participants
        twilioRoom.participants.forEach((participant) => {
          participant.tracks.forEach((pub) => {
            if (pub.isSubscribed) remoteVideoRef.current.appendChild(pub.track.attach());
          });
          participant.on("trackSubscribed", (track) => {
            remoteVideoRef.current.appendChild(track.attach());
          });
        });

        // Listen for new participants
        twilioRoom.on("participantConnected", (participant) => {
          participant.tracks.forEach((pub) => {
            if (pub.isSubscribed) remoteVideoRef.current.appendChild(pub.track.attach());
          });
          participant.on("trackSubscribed", (track) => {
            remoteVideoRef.current.appendChild(track.attach());
          });
        });
      } catch (err) {
        console.error("Error joining room:", err);
        navigate("/login");
      }
    };

    joinRoom();

    // Cleanup on unmount
    return () => {
      if (twilioRoom) {
        twilioRoom.localParticipant.tracks.forEach((pub) => pub.track.stop());
        twilioRoom.disconnect();
      }
    };
  }, [room, identity, navigate]);

  const endCall = () => {
    if (roomObj) {
      roomObj.localParticipant.tracks.forEach((pub) => pub.track.stop());
      roomObj.disconnect();
    }
    navigate("/doctor-dashboard"); // go back to dashboard instead of login
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", background: "#000" }}>
      <div ref={remoteVideoRef} style={{ width: "100%", height: "100%", position: "relative" }} />
      {roomObj && (
        <button
          onClick={endCall}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            padding: "10px 20px",
            background: "red",
            color: "#fff",
            zIndex: 1001,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          End Call
        </button>
      )}
    </div>
  );
}

export default DoctorVideoPage;
