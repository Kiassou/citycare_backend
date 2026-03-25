const express = require("express");
const router = express.Router();
const multer = require("multer");
const signalementController = require("../controllers/signalementController");

// --- CONFIGURATION MULTER EN MÉMOIRE ---
// On n'utilise plus { dest: ... } car Render peut bloquer l'écriture
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

// --- Routes ---
router.post(
  "/",
  upload.single("photo"), // Le nom "photo" doit correspondre à ton code Flutter
  signalementController.createSignalement
);

router.get("/user/:userId", signalementController.getUserSignalements);
router.delete("/:id", signalementController.deleteSignalement);
router.get("/", signalementController.getAllSignalements);
router.post("/validate", signalementController.validateSignalement);

module.exports = router;
