import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/login", formData);
      const token = res.data.token;
      const decoded = JSON.parse(atob(token.split(".")[1]));
      if (decoded.role !== "admin") {
        return alert("Access denied. Not an admin.");
      }

      localStorage.setItem("token", token);
      navigate("/admin-dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f0f0",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "2rem",
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          minWidth: "300px",
        }}
      >
        <h2 style={{ textAlign: "center" }}>Admin Login</h2>
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ padding: "0.75rem", fontSize: "1rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ padding: "0.75rem", fontSize: "1rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button
          type="submit"
          style={{
            padding: "0.75rem",
            fontSize: "1rem",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
