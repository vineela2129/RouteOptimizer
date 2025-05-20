import React, { useEffect, useState } from "react";
import axios from "axios";

const TripHistory = () => {
  const [trips, setTrips] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/trips/${userId}`);
        setTrips(res.data);
      } catch (err) {
        console.error("Error fetching trip history", err);
      }
    };

    if (userId) {
      fetchTrips();
    }
  }, [userId]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Trip History</h2>
      {trips.length === 0 ? (
        <p>No trips found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {trips.map((trip) => (
            <li
              key={trip.id}
              style={{
                background: "#f8f8f8",
                marginBottom: 15,
                padding: 15,
                borderRadius: 10,
                boxShadow: "0 0 8px rgba(0,0,0,0.1)",
              }}
            >
              <strong>Trip #{trip.id}</strong> <br />
              🧭 <em>{JSON.parse(trip.destinations).join(" ➜ ")}</em>
              <br />
              📅 <small>{new Date(trip.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TripHistory;
