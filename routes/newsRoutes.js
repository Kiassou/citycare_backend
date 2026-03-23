const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const multer = require("multer");

// On utilise un stockage temporaire simple car l'image part ensuite sur ImgBB
const upload = multer({ dest: "uploads/news/" });

// --- Routes ---
router.get("/", newsController.getAllNews);

// Création : le champ doit s'appeler "image"
router.post("/", upload.single("image"), newsController.createNews);

// Modification : on ajoute la route PUT avec l'ID
router.put("/:id", upload.single("image"), newsController.updateNews);

router.delete("/:id", newsController.deleteNews);

module.exports = router;
