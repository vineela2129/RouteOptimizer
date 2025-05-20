import React, { useEffect, useState } from "react";
import API from "../services/api";

const UserNotifications = () => {
  const [alerts, setAlerts] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await API.get(`/alerts/${userId}`);
        setAlerts(res.data);
      } catch (err) {
        alert("Failed to load notifications");
      }
    };

    fetchAlerts();
  }, [userId]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Notifications</h2>
      {alerts.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul>
          {alerts.map((alert, index) => (
            <li key={index} style={{ marginBottom: 10 }}>
              <strong>{new Date(alert.created_at).toLocaleString()}:</strong>
              <br />
              {alert.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserNotifications;
