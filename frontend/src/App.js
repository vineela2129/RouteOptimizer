import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import TripPlanner from "./components/TripPlanner";
import TripHistory from "./components/TripHistory";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import AdminTrips from "./components/AdminTrips";
import UserNotifications from "./components/UserNotifications";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/trip-planner" element={<TripPlanner />} />
        <Route path="/trip-history" element={<TripHistory />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-trips" element={<AdminTrips />} />
        <Route path="/notifications" element={<UserNotifications />} />
      </Routes>
    </Router>
  );
}

export default App;

