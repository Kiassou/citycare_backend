const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const multer = require("multer");
const path = require("path");

// Configuration du stockage Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/news/");
  },
  filename: (req, file, cb) => {
    cb(null, "news-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Routes
router.get("/", newsController.getAllNews);
router.post("/", upload.single("image"), newsController.createNews); // "image" doit être le nom du champ côté Flutter
router.delete("/:id", newsController.deleteNews);

module.exports = router;
