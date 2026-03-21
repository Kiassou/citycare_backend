const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("../config/mailer");

// --- 1. INSCRIPTION ---
exports.register = async (req, res) => {
  const { nom, prenom, username, telephone, email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [email, username],
    );

    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ message: "L'email ou le nom d'utilisateur est déjà utilisé." });
    }

    // Cryptage du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insertion (rôle citoyen par défaut)
    const sql = `INSERT INTO users (nom, prenom, username, telephone, email, password, role) 
                     VALUES (?, ?, ?, ?, ?, ?, 'citoyen')`;

    await db.query(sql, [
      nom,
      prenom,
      username,
      telephone,
      email,
      hashedPassword,
    ]);

    // Envoi de l'email de bienvenue
    const msg = {
      to: email,
      subject: "Bienvenue sur CityCare ! 🏙️",
      html: `
      <div style="font-family: Arial, sans-serif; border: 1px solid #eee; padding: 20px; border-radius: 10px; max-width: 500px;">
          <h2 style="color: #1A73B8;">Bienvenue ${prenom} !</h2>
          <p>Merci de rejoindre <strong>CityCare</strong>. Ton compte a été créé avec succès.</p>
          <hr style="border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #777;">Équipe CityCare</p>
      </div>`,
    };

    // 1. Envoi bloquant avant la réponse (optionnel)
   mailer.sendMail(msg).catch((err) => console.error("Erreur email bienvenue:", err.message));

    res.status(201).json({ message: "Inscription réussie !" });

  } catch (err) {
    console.error("Erreur Inscription :", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Erreur serveur", details: err.message });
    }
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  console.log("🚀 Tentative de connexion pour :", username);

  try {
    const result = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    // On extrait les lignes (rows) selon la config de ton driver mysql2
    const rows = Array.isArray(result[0]) ? result[0] : result;

    if (!rows || rows.length === 0) {
      console.log("❌ Utilisateur non trouvé en BDD");
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // ON DÉFINIT 'user' ICI pour qu'il soit accessible partout dans le bloc try
    const user = rows[0];
    console.log(
      "✅ Utilisateur trouvé :",
      user.username,
      " | Rôle :",
      user.role,
    );

    // Comparaison du mot de passe
    const isMatch = await bcrypt.compare(password.trim(), user.password.trim());

    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" },
    );

    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        username: user.username,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("🔥 ERREUR SERVEUR :", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
};

// --- 3. MOT DE PASSE OUBLIÉ ---
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // 1. On récupère l'utilisateur pour avoir son PRÉNOM
    const [users] = await db.query("SELECT prenom FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(404).json({ message: "Cet email n'existe pas dans notre base." });
    }

    const userPrenom = users[0].prenom; // On stocke le prénom ici ✅

    // 2. Génération du nouveau mot de passe
    const newPassword = crypto.randomBytes(4).toString("hex").toUpperCase();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Mise à jour en base de données
    await db.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email],
    );

    // 4. Réponse immédiate au client
    res.json({ message: "Si cet email existe, un nouveau mot de passe a été envoyé." });

    // 5. Envoi de l'email avec le PRÉNOM
    const msg = {
      to: email,
      subject: "Nouveau mot de passe - CityCare 🔐",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h3>Bonjour ${userPrenom},</h3> 
          <p>Votre nouveau mot de passe temporaire est : <strong style="color: #1A73B8;">${newPassword}</strong></p>
          <p>Pensez à le modifier dès votre connexion.</p>
          <br>
          <p>L'équipe CityCare</p>
        </div>
      `,
    };

    mailer.sendMail(msg).catch((err) => {
      console.error("Erreur d'envoi d'email ForgotPassword :", err.message);
    });

  } catch (err) {
    console.error("Erreur ForgotPassword :", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Erreur technique." });
    }
  }
};

// --- 4. STATS ADMIN (CORRIGÉES POUR TOUS LES COMPTES) ---
exports.getAdminStats = async (req, res) => {
    try {
        // Stats Signalements
        const [[reports]] = await db.query("SELECT COUNT(*) as total FROM signalements");
        
        // Stats Utilisateurs par Rôles et Statut
        const [[citizens]] = await db.query("SELECT COUNT(*) as total FROM users WHERE role = 'citoyen'");
        const [[admins]] = await db.query("SELECT COUNT(*) as total FROM users WHERE role = 'admin'");
        const [[inactive]] = await db.query("SELECT COUNT(*) as total FROM users WHERE is_active = 0");
        const [[totalUsers]] = await db.query("SELECT COUNT(*) as total FROM users");

        // Stats Urgences
        const [[emergencies]] = await db.query(`
            SELECT COUNT(*) as total FROM (
                SELECT signalement_id FROM validations GROUP BY signalement_id HAVING COUNT(*) >= 50
            ) as urgent_list
        `);

        res.json({
            totalReports: reports.total || 0,
            totalCitizens: citizens.total || 0,
            totalAdmins: admins.total || 0,
            totalInactive: inactive.total || 0,
            totalUsers: totalUsers.total || 0,
            totalEmergencies: emergencies.total || 0,
        });
    } catch (err) {
        console.error("Erreur Stats:", err);
        res.status(500).json({ error: err.message });
    }
};

// --- 5. GESTION DES SIGNALEMENTS ---
exports.getAllReports = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM signalements ORDER BY date_signalement DESC");
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateReportStatus = async (req, res) => {
    const { reportId } = req.params;
    const { statut, userId, title, message } = req.body;
    try {
        const [result] = await db.query("UPDATE signalements SET statut = ? WHERE id = ?", [statut, reportId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Non trouvé" });

        await db.query(
            "INSERT INTO notifications (user_id, report_id, admin_id, titre, description) VALUES (?, ?, ?, ?, ?)",
            [userId, reportId, 1, title, message]
        );
        res.status(200).json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- 6. GESTION DES UTILISATEURS ---
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM users");
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
        await db.query("DELETE FROM notifications WHERE user_id = ?", [userId]);
        await db.query("DELETE FROM users WHERE id = ?", [userId]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Erreur suppression." }); }
};

exports.toggleRole = async (req, res) => {
    const id = req.body.id || req.body.userId;
    try {
        const [rows] = await db.query("SELECT role FROM users WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ error: "Non trouvé" });
        const newRole = rows[0].role === "admin" ? "citoyen" : "admin";
        await db.query("UPDATE users SET role = ? WHERE id = ?", [newRole, id]);
        res.json({ success: true, newRole });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.toggleUserStatus = async (req, res) => {
    const id = req.body.id || req.body.userId;
    try {
        const [rows] = await db.query("SELECT is_active FROM users WHERE id = ?", [id]);
        const newStatus = rows[0].is_active === 1 ? 0 : 1;
        await db.query("UPDATE users SET is_active = ? WHERE id = ?", [newStatus, id]);
        res.json({ success: true, is_active: newStatus });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- 7. NOTIFICATIONS ---
exports.getUserNotifications = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", [req.params.userId]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- 8. ACTIVITÉS RÉCENTES (SYNTAXE PROMISE FIXÉE) ---
exports.getRecentActivities = async (req, res) => {
    const sql = `
        (SELECT 'report' as type, CONCAT('Signalement: ', titre) as description, date_signalement as date FROM signalements ORDER BY date_signalement DESC LIMIT 5)
        UNION ALL
        (SELECT 'work' as type, CONCAT('Intervention: ', description) as description, created_at as date FROM interventions ORDER BY created_at DESC LIMIT 5)
        ORDER BY date DESC LIMIT 10`;
    try {
        const [results] = await db.query(sql);
        res.json(results);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- 9. GRAPHIQUES ---
exports.getCategoryStats = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT c.name AS category, COUNT(s.id) AS count FROM categories c LEFT JOIN signalements s ON c.id = s.category_id GROUP BY c.id, c.name");
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
