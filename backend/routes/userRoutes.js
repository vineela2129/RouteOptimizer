const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Middleware: Validate Admin Token
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send("No token provided");

  const token = authHeader.split(" ")[1];
  jwt.verify(token, "secret_key", (err, decoded) => {
    if (err) return res.status(403).send("Invalid token");
    if (decoded.role !== "admin") return res.status(403).send("Access denied");
    req.user = decoded;
    next();
  });
};

// Register user
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, hashedPassword, "user"], (err) => {
      if (err) {
        console.error("Registration error:", err);
        return res.status(500).send("Registration failed");
      }
      res.send("User registered successfully");
    });
  } catch (error) {
    console.error("Hashing error:", error);
    res.status(500).send("Server error");
  }
});

// Login user/admin
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).send("Login failed");
    if (results.length === 0) return res.status(404).send("User not found");

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send("Invalid credentials");

    const token = jwt.sign({ id: user.id, role: user.role }, "secret_key", { expiresIn: "1d" });
    res.json({ token, userId: user.id }); // ✅ send userId to frontend
  });
});

// Save trip
router.post("/save-trip", (req, res) => {
  const { userId, destinations } = req.body;
  const sql = "INSERT INTO trips (user_id, destinations) VALUES (?, ?)";
  db.query(sql, [userId, JSON.stringify(destinations)], (err) => {
    if (err) {
      console.error("Trip save failed:", err);
      return res.status(500).send("Failed to save trip");
    }
    res.send("Trip saved successfully");
  });
});

// Get trip history
router.get("/trips/:userId", (req, res) => {
  const { userId } = req.params;
  const sql = "SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Trip history fetch failed:", err);
      return res.status(500).send("Failed to fetch trips");
    }
    res.json(results);
  });
});

// ====================== ADMIN ROUTES ======================

// Get all users
router.get("/admin/users", requireAdmin, (req, res) => {
  const sql = "SELECT id, name, email, role FROM users";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Failed to fetch users:", err);
      return res.status(500).send("Error fetching users");
    }
    res.json(results);
  });
});

// Delete user
router.delete("/admin/users/:id", requireAdmin, (req, res) => {
  const userId = req.params.id;
  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [userId], (err) => {
    if (err) {
      console.error("Failed to delete user:", err);
      return res.status(500).send("Error deleting user");
    }
    res.send("User deleted successfully");
  });
});

// Add user
router.post("/admin/users", requireAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, hashedPassword, role || "user"], (err) => {
      if (err) {
        console.error("Failed to add user:", err);
        return res.status(500).send("Error adding user");
      }
      res.send("User added successfully");
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).send("Server error");
  }
});

// Admin: Get all trips with user info
router.get("/admin/trips", requireAdmin, (req, res) => {
  const sql = `
    SELECT trips.id, trips.user_id, trips.destinations, trips.created_at, users.name, users.email
    FROM trips
    JOIN users ON trips.user_id = users.id
    ORDER BY trips.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Failed to fetch trips:", err);
      return res.status(500).send("Failed to fetch trips");
    }
    res.json(results);
  });
});

// Admin: Send notification to user
router.post("/admin/send-notification", requireAdmin, (req, res) => {
  const { userId, message } = req.body;
  const sql = "INSERT INTO alerts (user_id, message) VALUES (?, ?)";
  db.query(sql, [userId, message], (err) => {
    if (err) {
      console.error("Failed to send notification:", err);
      return res.status(500).send("Failed to send notification");
    }
    res.send("Notification sent");
  });
});

// Get alerts for a user
router.get("/alerts/:userId", (req, res) => {
  const { userId } = req.params;
  const sql = "SELECT message, created_at FROM alerts WHERE user_id = ? ORDER BY created_at DESC";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Failed to fetch alerts:", err);
      return res.status(500).send("Error fetching alerts");
    }
    res.json(results);
  });
});

module.exports = router;
