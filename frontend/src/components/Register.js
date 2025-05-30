import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/register", formData);
      alert("Registration successful! Please login.");
      navigate("/");
    } catch (err) {
      alert("Error registering user.");
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
        <h2 style={{ textAlign: "center" }}>Register</h2>
        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          required
          style={{ padding: "0.75rem", fontSize: "1rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
          style={{ padding: "0.75rem", fontSize: "1rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
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
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
