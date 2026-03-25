const express = require("express");
const router = express.Router();
const signalementController = require("../controllers/signalementController");
const multer = require("multer");

// Utilise le stockage en mémoire, pas sur disque
const upload = multer({ storage: multer.memoryStorage() });

// Route POST avec le middleware upload.single
router.post("/", upload.single("photo"), signalementController.createSignalement);

router.get("/user/:userId", signalementController.getUserSignalements);
router.delete("/:id", signalementController.deleteSignalement);
router.get("/", signalementController.getAllSignalements);
router.post("/validate", signalementController.validateSignalement);

module.exports = router;
