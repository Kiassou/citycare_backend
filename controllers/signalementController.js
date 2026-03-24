const db = require("../config/db");
const uploadService = require("../services/uploadService");

exports.createSignalement = async (req, res) => {
  try {
    const { user_id, titre, type_signalement, description, lieu } = req.body;

    let photo_url = null;

    if (req.file) {
      const ext = "jpg"; // ou req.file.mimetype.replace('image/', '')
      const baseName = `signalement_${user_id || "anonymous"}`;
      photo_url = await uploadService.uploadToMega(
        req.file.buffer,
        baseName,
        ext,
      );
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

    res.status(201).json({
      success: true,
      message: "Signalement enregistré",
      id: result.insertId,
      photo_url, // ce sera l'URL MEGA
    });
  } catch (error) {
    console.error("❌ ERREUR TECHNIQUE :", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

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
    const [rows] = await db.query(sql);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

};
