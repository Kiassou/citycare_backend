const express = require("express");
const router = express.Router();
const multer = require("multer");
const signalementController = require("../controllers/signalementController");

// Stockage temporaire pour Multer
const upload = multer({ dest: "uploads/signalements/" });

// --- Routes ---

// Création
router.post("/", upload.single("photo"), signalementController.createSignalement);

// Récupération par utilisateur (Vérifie bien le nom ici)
router.get("/user/:userId", signalementController.getUserSignalements);

// Suppression
router.delete("/:id", signalementController.deleteSignalement);

// Liste complète
router.get("/", signalementController.getAllSignalements);

// Validation
router.post("/validate", signalementController.validateSignalement);

module.exports = router;
