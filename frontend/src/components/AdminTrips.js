import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../services/api";

const AdminTrips = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [optimizedInfo, setOptimizedInfo] = useState(null);
  const [message, setMessage] = useState("");

  const ORS_API_KEY = "5b3ce3597851110001cf62486d99a38bfff7441d9299c4625a9d300a"; // 🔁 Replace with your key

  const fetchTrips = async () => {
    try {
      const res = await API.get("/admin/trips");
      setTrips(res.data);
    } catch (err) {
      alert("Failed to load trips");
    }
  };

  const geocode = async (place) => {
    const res = await axios.get("https://api.openrouteservice.org/geocode/search", {
      params: {
        api_key: ORS_API_KEY,
        text: place,
      },
    });
    return res.data.features[0].geometry.coordinates;
  };

  const suggestPath = async (trip) => {
    try {
      setSelectedTrip(trip);
      const coords = await Promise.all(JSON.parse(trip.destinations).map(geocode));
      const body = { coordinates: coords };

      const route = await axios.post(
        "https://api.openrouteservice.org/v2/directions/driving-car",
        body,
        {
          headers: {
            Authorization: ORS_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      setOptimizedInfo({
        distance: (route.data.routes[0].summary.distance / 1000).toFixed(2),
        duration: (route.data.routes[0].summary.duration / 60).toFixed(2),
        coords,
      });
    } catch (err) {
      alert("Failed to get route");
      console.error(err);
    }
  };

  const sendNotification = async () => {
    try {
      await API.post("/admin/send-notification", {
        userId: selectedTrip.user_id,
        message,
      });
      alert("Notification sent!");
      setMessage("");
    } catch (err) {
      alert("Failed to send notification");
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin - Review User Trips</h2>
      {trips.map((trip) => (
        <div key={trip.id} style={{ marginBottom: 20, borderBottom: "1px solid #ccc", paddingBottom: 10 }}>
          <p><strong>User:</strong> {trip.name} ({trip.email})</p>
          <p><strong>Destinations:</strong> {JSON.parse(trip.destinations).join(" ➜ ")}</p>
          <button onClick={() => suggestPath(trip)}>Suggest Optimized Path</button>
        </div>
      ))}

      {optimizedInfo && (
        <div style={{ marginTop: 30, border: "1px solid #000", padding: 15 }}>
          <h3>Suggested Route:</h3>
          <p><strong>Distance:</strong> {optimizedInfo.distance} km</p>
          <p><strong>Duration:</strong> {optimizedInfo.duration} mins</p>
          <textarea
            placeholder="Write a message for the user..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            cols={50}
          />
          <br />
          <button onClick={sendNotification}>Send Notification to User</button>
        </div>
      )}
    </div>
  );
};

export default AdminTrips;
