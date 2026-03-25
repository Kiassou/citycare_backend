const db = require("../config/db");
const axios = require("axios");
const FormData = require("form-data");

// --- 1. CRÉER UN SIGNALEMENT (OPTIMISÉ POUR IMGBB & RENDER) ---
exports.createSignalement = async (req, res) => {
  console.log("📥 Requête reçue pour un nouveau signalement !");
  
  try {
    const { user_id, titre, type_signalement, description, lieu } = req.body;
    let photo_url = null;

    // Si Multer a bien reçu un fichier en mémoire (buffer)
    if (req.file) {
      console.log("📸 Image détectée (Buffer), envoi vers ImgBB...");

      try {
        const form = new FormData();
        // On envoie le buffer directement à ImgBB
        form.append("image", req.file.buffer, {
          filename: req.file.originalname || "upload.jpg",
          contentType: req.file.mimetype,
        });

        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
          form,
          { headers: form.getHeaders() }
        );

        // Récupération de l'URL directe
        photo_url = response.data.data.url;
        console.log("✅ Image hébergée avec succès :", photo_url);
      } catch (imgError) {
        console.error("❌ Erreur lors de l'upload ImgBB :", imgError.response?.data || imgError.message);
        // On continue l'insertion en base même si l'image échoue
      }
    } else {
      console.log("⚠️ Aucun fichier photo reçu dans la requête.");
    }

    const sql = `INSERT INTO signalements (user_id, titre, type_signalement, description, photo_url, lieu, statut) 
                 VALUES (?, ?, ?, ?, ?, ?, 'en_attente')`;

    console.log("🛠 Enregistrement dans MySQL...");

    const [result] = await db.query(sql, [
      parseInt(user_id) || null,
      titre,
      type_signalement,
      description,
      photo_url,
      lieu,
    ]);

    console.log("💾 Signalement créé avec l'ID :", result.insertId);

    res.status(201).json({
      success: true,
      message: "Signalement enregistré",
      id: result.insertId,
      photo_url: photo_url,
    });

  } catch (error) {
    console.error("❌ ERREUR TECHNIQUE :", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- 2. RÉCUPÉRER TOUS LES SIGNALEMENTS ---
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

// --- 3. RÉCUPÉRER LES SIGNALEMENTS D'UN UTILISATEUR ---
exports.getUserSignalements = async (req, res) => {
  try {
    const { userId } = req.params;
    const sql = `SELECT * FROM signalements WHERE user_id = ? ORDER BY date_signalement DESC`;
    const [rows] = await db.query(sql, [userId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Erreur getUserSignalements:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --- 4. SUPPRIMER UN SIGNALEMENT ---
exports.deleteSignalement = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM signalements WHERE id = ?", [id]);
    res.status(200).json({ success: true, message: "Signalement supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 5. VALIDER (VOTER) ---
exports.validateSignalement = async (req, res) => {
  try {
    const { signalement_id, user_id } = req.body;
    const sql = `INSERT INTO validations (signalement_id, user_id) VALUES (?, ?)`;
    await db.query(sql, [signalement_id, user_id]);
    res.status(201).json({ success: true, message: "Validation enregistrée" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Vous avez déjà validé ce signalement" });
    }
    res.status(500).json({ error: error.message });
  }
};
