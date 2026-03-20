const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/stats", async (req, res) => {
  try {
    const [reports] = await db.query(
      "SELECT COUNT(*) AS totalReports FROM signalements",
    );

    const [citizens] = await db.query(
      "SELECT COUNT(*) AS totalCitizens FROM users",
    );

    const [emergencies] = await db.query(
      "SELECT COUNT(*) AS totalEmergencies FROM signalements WHERE statut='en_cours'",
    );

    res.json({
      totalReports: reports[0].totalReports,
      totalCitizens: citizens[0].totalCitizens,
      totalEmergencies: emergencies[0].totalEmergencies,
    });
  } catch (error) {
    console.error("Erreur stats:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
