const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const db = require("./db");

const userRoutes = require("./routes/userRoutes");
const hazardRoutes = require("./routes/hazardRoutes");

const app = express(); // ⬅️ This must come before using app

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Routes
app.use("/", userRoutes);
app.use("/", hazardRoutes); // Make sure hazard routes are registered

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("Dynamic Travel Route Optimizer backend running");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});
