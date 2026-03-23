const db = require("../config/db");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

// --- 1. RÉCUPÉRER TOUTES LES NEWS ---
exports.getAllNews = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM news ORDER BY created_at DESC");
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erreur SQL GetAllNews:", error);
        res.status(500).json({ message: "Erreur lors de la récupération" });
    }
};

// --- 2. CRÉER UNE NEWS (AVEC IMGBB) ---
exports.createNews = async (req, res) => {
    const { title, content } = req.body;
    let imageUrl = null;

    try {
        // Si une image est présente, on l'envoie sur ImgBB
        if (req.file) {
            const form = new FormData();
            form.append("image", fs.createReadStream(req.file.path));

            const response = await axios.post(
                `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
                form,
                { headers: form.getHeaders() }
            );

            imageUrl = response.data.data.url;
            fs.unlinkSync(req.file.path); // On nettoie le fichier local temporaire
        }

        const sql = "INSERT INTO news (title, content, image_url) VALUES (?, ?, ?)";
        const [result] = await db.query(sql, [title, content, imageUrl]);

        res.status(201).json({ 
            message: "Actualité créée avec succès", 
            id: result.insertId,
            url: imageUrl 
        });
    } catch (error) {
        console.error("Erreur CreateNews:", error);
        res.status(500).json({ error: error.message });
    }
};

// --- 3. MODIFIER UNE NEWS (UPDATE) ---
exports.updateNews = async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    let imageUrl = req.body.image_url; // Garder l'ancienne image par défaut

    try {
        // Si l'utilisateur envoie une NOUVELLE image
        if (req.file) {
            const form = new FormData();
            form.append("image", fs.createReadStream(req.file.path));

            const response = await axios.post(
                `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
                form,
                { headers: form.getHeaders() }
            );

            imageUrl = response.data.data.url;
            fs.unlinkSync(req.file.path);
        }

        const sql = "UPDATE news SET title = ?, content = ?, image_url = ? WHERE id = ?";
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

// --- 4. SUPPRIMER UNE NEWS ---
exports.deleteNews = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query("DELETE FROM news WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "News introuvable" });
        }

        res.json({ message: "Actualité supprimée" });
    } catch (error) {
        console.error("Erreur DeleteNews:", error);
        res.status(500).json({ error: error.message });
    }
};
