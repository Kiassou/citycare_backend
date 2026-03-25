const db = require("../config/db");
<<<<<<< HEAD
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
=======
const uploadService = require("../services/uploadService");
>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1

exports.createSignalement = async (req, res) => {
  try {
    const { user_id, titre, type_signalement, description, lieu } = req.body;
<<<<<<< HEAD
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
=======

    let photo_url = null;

    if (req.file) {
      const ext = "jpg"; // ou req.file.mimetype.replace('image/', '')
      const baseName = `signalement_${user_id || "anonymous"}`;
      photo_url = await uploadService.uploadToMega(
        req.file.buffer,
        baseName,
        ext,
      );
>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1
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

<<<<<<< HEAD
    res.status(201).json({ success: true, id: result.insertId, photo_url });
  } catch (error) {
    console.error("❌ Erreur Signalement :", error.message);
=======
    res.status(201).json({
      success: true,
      message: "Signalement enregistré",
      id: result.insertId,
      photo_url, // ce sera l'URL MEGA
    });
  } catch (error) {
    console.error("❌ ERREUR TECHNIQUE :", error.message);
>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1
    res.status(500).json({ success: false, error: error.message });
  }
};

<<<<<<< HEAD
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
=======
// FONCTION DE SUPPRESSION (À AJOUTER)
exports.deleteSignalement = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🗑 Tentative de suppression du signalement ID:", id);

    const [result] = await db.query("DELETE FROM signalements WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Signalement non trouvé" });
    }

    console.log("✅ Signalement supprimé avec succès !");
    return res.status(200).json({ success: true, message: "Supprimé" });
  } catch (error) {
    console.error("❌ Erreur suppression:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// 1. Récupérer TOUS les signalements avec le compte des validations
exports.getAllSignalements = async (req, res) => {
  try {
    const sql = `
            SELECT s.*, COUNT(v.id) as nb_validations 
            FROM signalements s
            LEFT JOIN validations v ON s.id = v.signalement_id
            GROUP BY s.id
            ORDER BY s.date_signalement DESC`;
>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1
    const [rows] = await db.query(sql);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

<<<<<<< HEAD
exports.deleteSignalement = async (req, res) => {
  try {
    await db.query("DELETE FROM signalements WHERE id = ?", [req.params.id]);
    res.status(200).json({ success: true, message: "Supprimé" });
  } catch (error) {
=======
// --- FONCTION MANQUANTE : Récupérer les signalements d'un utilisateur ---
exports.getUserSignalements = async (req, res) => {
  try {
    const { userId } = req.params;
    const sql = `SELECT * FROM signalements WHERE user_id = ? ORDER BY date_signalement DESC`;
    const [rows] = await db.query(sql, [userId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Erreur getUserSignalements:", error.message);
>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1
    res.status(500).json({ error: error.message });
  }
};

<<<<<<< HEAD
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
=======
// 2. Ajouter une validation (Voter)
exports.validateSignalement = async (req, res) => {
  try {
    const { signalement_id, user_id } = req.body;
    const sql = `INSERT INTO validations (signalement_id, user_id) VALUES (?, ?)`;
    await db.query(sql, [signalement_id, user_id]);
    res.status(201).json({ success: true, message: "Validation enregistrée" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ message: "Vous avez déjà validé ce signalement" });
    }

    res.status(500).json({ error: error.message });
  }

>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1
};
