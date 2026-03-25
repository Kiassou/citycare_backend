const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const signalementController = require("../controllers/signalementController");
const multer = require("multer");

// Utilise le stockage en mémoire, pas sur disque
const upload = multer({ storage: multer.memoryStorage() });

// Route POST avec le middleware upload.single
router.post("/", upload.single("photo"), signalementController.createSignalement);

router.get("/user/:userId", signalementController.getUserSignalements);
router.delete("/:id", signalementController.deleteSignalement);
router.get("/", signalementController.getAllSignalements);
=======
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
>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1
router.post("/validate", signalementController.validateSignalement);

module.exports = router;
