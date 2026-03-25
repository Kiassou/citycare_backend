const db = require("../config/db");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

// 1. Récupérer toutes les news
exports.getAllNews = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM news ORDER BY created_at DESC",
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Erreur Récupération News:", error.message);
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};

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
    res.status(500).json({ error: error.message });
  }
};

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
    const [result] = await db.query(sql, [title, content, imageUrl, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "News introuvable" });
    }

    res.json({ success: true, message: "Actualité mise à jour", imageUrl });
  } catch (error) {
    console.error("❌ Erreur Update News:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 4. Supprimer une news
exports.deleteNews = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM news WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "News introuvable" });
    }

    res.json({ success: true, message: "Actualité supprimée" });
  } catch (error) {
    console.error("❌ Erreur Delete News:", error.message);
    res.status(500).json({ error: error.message });
  }
};
