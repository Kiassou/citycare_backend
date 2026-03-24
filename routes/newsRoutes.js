const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const multer = require("multer");

// Utilise le stockage en mémoire, pas sur disque
const upload = multer({ storage: multer.memoryStorage() });

// Routes
router.get("/", newsController.getAllNews);

router.post("/", upload.single("image"), newsController.createNews);

router.post("/", upload.single("image"), newsController.createNews); 

router.put("/:id", upload.single("image"), newsController.updateNews);
router.delete("/:id", newsController.deleteNews);

module.exports = router;
