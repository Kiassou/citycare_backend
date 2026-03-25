const db = require("../config/db");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

exports.createSignalement = async (req, res) => {
  try {
    const { user_id, titre, type_signalement, description, lieu } = req.body;
    let photo_url = null;

    // Si Multer a reçu un fichier
    if (req.file) {
      console.log("📸 Envoi vers ImgBB...");
      const form = new FormData();
      form.append("image", fs.createReadStream(req.file.path));

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        form,
        { headers: form.getHeaders() },
      );

      photo_url = response.data.data.url;
      console.log("✅ Image ImgBB :", photo_url);

      // Supprimer le fichier temporaire du serveur Render
      fs.unlinkSync(req.file.path);
    }

    const sql = `INSERT INTO signalements (user_id, titre, type_signalement, description, photo_url, lieu, statut) 
                 VALUES (?, ?, ?, ?, ?, ?, 'en_attente')`;

    const [result] = await db.query(sql, [
      parseInt(user_id) || 1,
      titre,
      type_signalement,
      description,
      photo_url,
      lieu,
    ]);

    res.status(201).json({ success: true, id: result.insertId, photo_url });
  } catch (error) {
    console.error("❌ Erreur Signalement :", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserSignalements = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM signalements WHERE user_id = ? ORDER BY date_signalement DESC",
      [userId],
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllSignalements = async (req, res) => {
  try {
    const sql = `SELECT s.*, COUNT(v.id) as nb_validations FROM signalements s 
                 LEFT JOIN validations v ON s.id = v.signalement_id 
                 GROUP BY s.id ORDER BY s.date_signalement DESC`;
    const [rows] = await db.query(sql);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSignalement = async (req, res) => {
  try {
    await db.query("DELETE FROM signalements WHERE id = ?", [req.params.id]);
    res.status(200).json({ success: true, message: "Supprimé" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.validateSignalement = async (req, res) => {
  try {
    const { signalement_id, user_id } = req.body;
    await db.query(
      "INSERT INTO validations (signalement_id, user_id) VALUES (?, ?)",
      [signalement_id, user_id],
    );
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
