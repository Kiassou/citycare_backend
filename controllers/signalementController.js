const db = require("../config/db");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

// --- 1. CRÉER UN SIGNALEMENT (AVEC IMGBB) ---
exports.createSignalement = async (req, res) => {
    console.log("📥 Requête reçue pour un nouveau signalement !");

    try {
        const { user_id, titre, type_signalement, description, lieu } = req.body;
        let photo_url = null;

        // Si une photo est reçue par Multer, on l'envoie sur ImgBB
        if (req.file) {
            console.log("📸 Envoi de l'image vers ImgBB...");
            
            try {
                const form = new FormData();
                // On lit le fichier temporaire sauvegardé par Multer
                form.append("image", fs.createReadStream(req.file.path));

                const response = await axios.post(
                    `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
                    form,
                    { headers: form.getHeaders() }
                );

                // On récupère l'URL permanente générée par ImgBB
                photo_url = response.data.data.url;
                console.log("✅ Image hébergée avec succès :", photo_url);

                // On supprime le fichier local pour ne pas encombrer Render
                fs.unlinkSync(req.file.path);
            } catch (imgError) {
                console.error("❌ Erreur ImgBB :", imgError.message);
                // Si l'envoi ImgBB échoue, on continue sans photo ou on renvoie une erreur
            }
        }

        const sql = `INSERT INTO signalements (user_id, titre, type_signalement, description, photo_url, lieu, statut) 
                     VALUES (?, ?, ?, ?, ?, ?, 'en_attente')`;

        console.log("🛠 Enregistrement en base de données...");

        const [result] = await db.query(sql, [
            parseInt(user_id) || 1,
            titre,
            type_signalement,
            description,
            photo_url,
            lieu,
        ]);

        console.log("💾 Succès ! ID inséré :", result.insertId);

        return res.status(201).json({
            success: true,
            message: "Signalement enregistré sur le Cloud",
            id: result.insertId,
            url: photo_url
        });

    } catch (error) {
        console.error("❌ ERREUR TECHNIQUE :", error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// --- 2. RÉCUPÉRER LES SIGNALEMENTS D'UN UTILISATEUR ---
exports.getUserSignalements = async (req, res) => {
    try {
        const userId = req.params.userId;
        const limit = req.query.limit ? parseInt(req.query.limit) : 100;

        const sql = `SELECT * FROM signalements WHERE user_id = ? ORDER BY date_signalement DESC LIMIT ?`;
        const [rows] = await db.query(sql, [userId, limit]);

        res.status(200).json(rows);
    } catch (error) {
        console.error("❌ Erreur GET signalements:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// --- 3. SUPPRIMER UN SIGNALEMENT ---
exports.deleteSignalement = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("🗑 Tentative de suppression du signalement ID:", id);

        const [result] = await db.query("DELETE FROM signalements WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Signalement non trouvé" });
        }

        console.log("✅ Signalement supprimé avec succès !");
        return res.status(200).json({ success: true, message: "Supprimé" });
    } catch (error) {
        console.error("❌ Erreur suppression:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

// --- 4. RÉCUPÉRER TOUS LES SIGNALEMENTS (DASHBOARD) ---
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

// --- 5. VALIDER UN SIGNALEMENT (VOTE) ---
exports.validateSignalement = async (req, res) => {
    try {
        const { signalement_id, user_id } = req.body;
        const sql = `INSERT INTO validations (signalement_id, user_id) VALUES (?, ?)`;
        
        await db.query(sql, [signalement_id, user_id]);
        res.status(201).json({ success: true, message: "Validation enregistrée" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Vous avez déjà validé ce signalement" });
        }
        res.status(500).json({ error: error.message });
    }
};
