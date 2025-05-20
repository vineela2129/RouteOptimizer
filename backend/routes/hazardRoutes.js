const express = require("express");
const router = express.Router();
const db = require("../db");

// 🚨 Report a new hazard (within 10m = confirm instead of insert)
router.post("/report-hazard", (req, res) => {
  const { lat, lng, type } = req.body;

  if (!lat || !lng || !type) {
    return res.status(400).json({ error: "Missing lat/lng/type" });
  }

  // Haversine formula to check nearby same-type hazards within 10 meters
  const sql = `
    SELECT id FROM hazards
    WHERE type = ?
    AND (
      6371000 * 2 * ASIN(SQRT(
        POWER(SIN(RADIANS((latitude - ?) / 2)), 2) +
        COS(RADIANS(?)) * COS(RADIANS(latitude)) *
        POWER(SIN(RADIANS((longitude - ?) / 2)), 2)
      ))
    ) < 10
    LIMIT 1
  `;

  db.query(sql, [type, lat, lat, lng], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (rows.length > 0) {
      // A nearby report exists → confirm it
      const existingId = rows[0].id;
      db.query(
        "UPDATE hazards SET verified_by = verified_by + 1 WHERE id = ?",
        [existingId],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          return res.json({ id: existingId, message: "Confirmed existing hazard." });
        }
      );
    } else {
      // No match, insert new
      db.query(
        "INSERT INTO hazards (latitude, longitude, type) VALUES (?, ?, ?)",
        [lat, lng, type],
        (err3, result) => {
          if (err3) return res.status(500).json({ error: err3.message });
          res.json({ id: result.insertId, message: "New hazard reported." });
        }
      );
    }
  });
});

// ✅ Confirm manually
router.post("/confirm-hazard/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "UPDATE hazards SET verified_by = verified_by + 1 WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// ✅ Fetch all verified hazards
router.get("/hazards", (req, res) => {
  db.query("SELECT * FROM hazards WHERE verified_by >= 2", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;