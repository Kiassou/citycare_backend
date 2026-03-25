const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const multer = require("multer");

// CONFIGURATION CRUCIALE : On stocke temporairement sur le disque pour ImgBB
const upload = multer({ dest: "uploads/news/" });

// --- Routes ---

// Récupérer toutes les news
router.get("/", newsController.getAllNews);

// Créer une news (Champ 'image' dans Flutter)
router.post("/", upload.single("image"), newsController.createNews);

// Modifier une news
router.put("/:id", upload.single("image"), newsController.updateNews);

// Supprimer une news
router.delete("/:id", newsController.deleteNews);

module.exports = router;
