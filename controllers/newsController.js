const db = require("../config/db");
<<<<<<< HEAD
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
=======
>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1

// 1. Récupérer toutes les news
exports.getAllNews = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM news ORDER BY created_at DESC",
    );
    res.status(200).json(rows);
  } catch (error) {
<<<<<<< HEAD
    console.error("❌ Erreur Récupération News:", error.message);
=======
    console.error("Erreur SQL:", error);
>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};

<<<<<<< HEAD
// 2. Créer une news avec ImgBB
exports.createNews = async (req, res) => {
  const { title, content } = req.body;
  let imageUrl = null;

  try {
    // Si une image est envoyée via Multer
    if (req.file) {
      console.log("📸 Envoi de l'image News vers ImgBB...");
      const form = new FormData();
      form.append("image", fs.createReadStream(req.file.path));

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        form,
        { headers: form.getHeaders() },
      );

      imageUrl = response.data.data.url;
      console.log("✅ Image News hébergée :", imageUrl);

      // Nettoyage du fichier temporaire sur Render
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    const sql = "INSERT INTO news (title, content, image_url) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [title, content, imageUrl]);

    res.status(201).json({
      success: true,
      message: "Actualité créée",
      id: result.insertId,
      imageUrl,
    });
  } catch (error) {
    console.error("❌ Erreur Create News:", error.message);
=======
// 2. Créer une news (CORRIGÉ : passage en async/await)
exports.createNews = async (req, res) => {
  const { title, content } = req.body;
  const imageUrl = req.file ? `/uploads/news/${req.file.filename}` : null;

  try {
    const sql = "INSERT INTO news (title, content, image_url) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [title, content, imageUrl]);
    res.status(201).json({ message: "Actualité créée", id: result.insertId });
  } catch (error) {
    console.error("Erreur Create:", error);
>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1
    res.status(500).json({ error: error.message });
  }
};

<<<<<<< HEAD
// 3. Modifier une news
exports.updateNews = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  let imageUrl = req.body.image_url; // Garde l'ancienne URL par défaut

  try {
    // Si une NOUVELLE image est téléchargée lors de la modification
    if (req.file) {
      const form = new FormData();
      form.append("image", fs.createReadStream(req.file.path));

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        form,
        { headers: form.getHeaders() },
      );
      imageUrl = response.data.data.url;

      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }

    const sql =
      "UPDATE news SET title = ?, content = ?, image_url = ? WHERE id = ?";
=======
// --- 3. MODIFIER UNE NEWS (UPDATE) ---
exports.updateNews = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  let imageUrl = req.body.image_url; // Garder l'ancienne image par défaut

  try {
    const sql = "UPDATE news SET title = ?, content = ?, image_url = ? WHERE id = ?";
>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1
    const [result] = await db.query(sql, [title, content, imageUrl, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "News introuvable" });
    }

<<<<<<< HEAD
    res.json({ success: true, message: "Actualité mise à jour", imageUrl });
  } catch (error) {
    console.error("❌ Erreur Update News:", error.message);
=======
    res.json({ message: "Actualité mise à jour", url: imageUrl });
  } catch (error) {
    console.error("Erreur UpdateNews:", error);
>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1
    res.status(500).json({ error: error.message });
  }
};

<<<<<<< HEAD
// 4. Supprimer une news
exports.deleteNews = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM news WHERE id = ?", [id]);
=======
// 4. Supprimer une news (CORRIGÉ : passage en async/await)
exports.deleteNews = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = "DELETE FROM news WHERE id = ?";
    const [result] = await db.query(sql, [id]);
>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "News introuvable" });
    }

<<<<<<< HEAD
    res.json({ success: true, message: "Actualité supprimée" });
  } catch (error) {
    console.error("❌ Erreur Delete News:", error.message);
=======
    res.json({ message: "Actualité supprimée" });
  } catch (error) {
    console.error("Erreur Delete:", error);
    res.status(500).json({ error: error.message });
  }
};

const uploadService = require("../services/uploadService");

exports.createNews = async (req, res) => {
  const { title, content } = req.body;

  let imageUrl = null;

  if (req.file) {
    const ext = "jpg"; // ou req.file.mimetype.replace('image/', '')
    const baseName = `news_${Date.now()}`;
    imageUrl = await uploadService.uploadToMega(req.file.buffer, baseName, ext);
  }

  try {
    const sql = "INSERT INTO news (title, content, image_url) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [title, content, imageUrl]);
    res
      .status(201)
      .json({ message: "Actualité créée", id: result.insertId, imageUrl });
  } catch (error) {
    console.error("Erreur Create:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllNews = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM news ORDER BY created_at DESC",
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Erreur SQL:", error);
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};

exports.deleteNews = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = "DELETE FROM news WHERE id = ?";
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "News introuvable" });
    }

    res.json({ message: "Actualité supprimée" });
  } catch (error) {
    console.error("Erreur Delete:", error);
>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1
    res.status(500).json({ error: error.message });
  }
};
