const express = require("express");
const router = express.Router();
const multer = require("multer");
const signalementController = require("../controllers/signalementController");

// Stockage temporaire simple
const upload = multer({ dest: "uploads/signalements/" });

// --- Routes ---

// Création : le champ doit s'appeler "photo"
router.post("/", upload.single("photo"), signalementController.createSignalement);

// Récupérer les signalements d'un utilisateur spécifique
router.get("/user/:userId", signalementController.getUserSignalements);

// Supprimer un signalement
router.delete("/:id", signalementController.deleteSignalement);

// Récupérer tous les signalements (pour l'admin)
router.get("/", signalementController.getAllSignalements);

// Valider/Voter pour un signalement
router.post("/validate", signalementController.validateSignalement);

module.exports = router;
