const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const signalementController = require("../controllers/signalementController");

// Configuration du stockage des images
const storage = multer.diskStorage({
  destination: "uploads/signalements",
  filename: (req, file, cb) => {
    cb(null, `img_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Route POST avec le middleware 'upload.single'
router.post("/", upload.single("photo"), signalementController.createSignalement);

router.get("/user/:userId", signalementController.getUserSignalements,);

router.delete("/:id", signalementController.deleteSignalement);

router.get("/", signalementController.getAllSignalements);

router.post("/validate", signalementController.validateSignalement,);

module.exports = router;
