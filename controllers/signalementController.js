const db = require("../config/db");
const axios = require("axios");
const FormData = require("form-data");

// --- 1. CRÉER UN SIGNALEMENT (MIS À JOUR AVEC GPS) ---
exports.createSignalement = async (req, res) => {
  console.log("📥 Requête reçue pour un nouveau signalement !");
  
  try {
    // 1. Récupération des données (On ajoute latitude et longitude ici)
    const { user_id, titre, type_signalement, description, lieu, latitude, longitude } = req.body;
    let photo_url = null;

    // --- LOGIQUE IMGBB (Inchangée) ---
    if (req.file) {
      console.log("📸 Image détectée (Buffer), envoi vers ImgBB...");
      try {
        const form = new FormData();
        form.append("image", req.file.buffer, {
          filename: req.file.originalname || "upload.jpg",
          contentType: req.file.mimetype,
        });

        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
          form,
          { headers: form.getHeaders() }
        );

        photo_url = response.data.data.url;
        console.log("✅ Image hébergée avec succès :", photo_url);
      } catch (imgError) {
        console.error("❌ Erreur lors de l'upload ImgBB :", imgError.response?.data || imgError.message);
      }
    }

    // --- ENREGISTREMENT MYSQL (Mis à jour avec GPS) ---
    // On ajoute latitude et longitude dans le INSERT
    const sql = `INSERT INTO signalements (user_id, titre, type_signalement, description, photo_url, lieu, latitude, longitude, statut) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'en_attente')`;

    console.log("🛠 Enregistrement dans MySQL avec coordonnées GPS...");

    const [result] = await db.query(sql, [
      parseInt(user_id) || null,
      titre || null, // On accepte NULL si tu ne forces pas le titre
      type_signalement,
      description,
      photo_url,
      lieu,
      latitude || null,  // Nouvelle valeur
      longitude || null, // Nouvelle valeur
    ]);

    console.log("💾 Signalement créé avec succès (ID: ${result.insertId})");

    res.status(201).json({
      success: true,
      message: "Signalement enregistré avec position GPS",
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
