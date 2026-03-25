const express = require("express");
const router = express.Router();
const multer = require("multer");
const signalementController = require("../controllers/signalementController");

// Stockage temporaire
const upload = multer({ dest: "uploads/signalements/" });

// --- Routes ---
router.post(
  "/",
  upload.single("photo"),
  signalementController.createSignalement,
);
router.get("/user/:userId", signalementController.getUserSignalements);
router.delete("/:id", signalementController.deleteSignalement);
router.get("/", signalementController.getAllSignalements);
router.post("/validate", signalementController.validateSignalement);

module.exports = router;
