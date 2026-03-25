const db = require("../config/db");

// 1. Récupérer toutes les news
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
    res.status(500).json({ error: error.message });
  }
};

// --- 3. MODIFIER UNE NEWS (UPDATE) ---
exports.updateNews = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  let imageUrl = req.body.image_url; // Garder l'ancienne image par défaut

  try {
    const sql =
      "UPDATE news SET title = ?, content = ?, image_url = ? WHERE id = ?";
    const [result] = await db.query(sql, [title, content, imageUrl, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "News introuvable" });
    }

    res.json({ message: "Actualité mise à jour", url: imageUrl });
  } catch (error) {
    console.error("Erreur UpdateNews:", error);
    res.status(500).json({ error: error.message });
  }
};

// 4. Supprimer une news (CORRIGÉ : passage en async/await)
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
    res.status(500).json({ error: error.message });
  }
};
