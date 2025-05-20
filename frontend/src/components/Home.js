import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#f2f2f2",
    }}>
      <h1 style={{ marginBottom: 30 }}>Welcome to Smart Trip Planner</h1>
      <button 
        style={buttonStyle} 
        onClick={() => navigate("/admin")}
      >
        👨‍💼 Admin Login
      </button>
      <button 
        style={buttonStyle} 
        onClick={() => navigate("/register")}
      >
        📝 User Register
      </button>
      <button 
        style={buttonStyle} 
        onClick={() => navigate("/login")}
      >
        🔑 User Login
      </button>
    </div>
  );
};

const buttonStyle = {
  padding: "12px 25px",
  margin: "10px",
  fontSize: "16px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#007bff",
  color: "white",
  cursor: "pointer",
  width: "200px"
};

export default Home;
