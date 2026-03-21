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

// --- STATS POUR LE DASHBOARD ADMIN ---
exports.getAdminStats = async (req, res) => {
  try {
    // 1. Nombre total de signalements
    const [reports] = await db.query(
      "SELECT COUNT(*) as total FROM signalements",
    );

    // 2. Nombre total de citoyens
    const [citizens] = await db.query(
      "SELECT COUNT(*) as total FROM users WHERE role = 'citoyen'",
    );

    // 3. Nombre d'urgences (Signalements ayant au moins 50 validations)
    const [emergencies] = await db.query(`
      SELECT COUNT(*) as total FROM (
        SELECT signalement_id 
        FROM validations 
        GROUP BY signalement_id 
        HAVING COUNT(*) >= 50
      ) as urgent_list
    `);

    res.json({
      totalReports: reports[0].total || 0,
      totalCitizens: citizens[0].total || 0,
      totalEmergencies: emergencies[0].total || 0,
    });
  } catch (err) {
    console.error("Erreur SQL Stats Admin:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM signalements ORDER BY date_signalement DESC",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  const { reportId } = req.params;
  const { statut, userId, title, message } = req.body;

  // Log pour voir si les données arrivent bien
  console.log(
    "Update demandée pour report:",
    reportId,
    "Nouveau statut:",
    statut,
  );

  try {
    // 1. Mise à jour du signalement
    const [result] = await db.query(
      "UPDATE signalements SET statut = ? WHERE id = ?",
      [statut, reportId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Signalement non trouvé" });
    }

    // 2. Création de l'activité/notification
    // On met admin_id = 1 par défaut pour l'instant
    await db.query(
      "INSERT INTO notifications (user_id, report_id, admin_id, titre, description) VALUES (?, ?, ?, ?, ?)",
      [userId, reportId, 1, title, message],
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erreur SQL:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getRecentActivities = async (req, res) => {
  const sql = `
        (SELECT 
            'report' as type, 
            CONCAT('Signalement: ', titre) as description, 
            date_signalement as date 
         FROM signalements 
         ORDER BY date_signalement DESC LIMIT 5)
        UNION ALL
        (SELECT 
            'work' as type, 
            CONCAT('Intervention: ', description) as description, 
            created_at as date 
         FROM interventions 
         ORDER BY created_at DESC LIMIT 5)
        ORDER BY date DESC LIMIT 10`;

  try {
    // Utilisation de await au lieu du callback (err, results)
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error("Erreur SQL getRecentActivities:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getUserNotifications = async (req, res) => {
  const userId = req.params.userId; // On passera l'ID de l'utilisateur
  try {
    const [rows] = await db.query(
      `
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 50
        `,
      [userId],
    );

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  const notifId = req.params.id;
  try {
    await db.query("UPDATE notifications SET is_read = 1 WHERE id = ?", [
      notifId,
    ]);
    res.status(200).json({ message: "Notification marquée comme lue" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- SUPPRIMER UN UTILISATEUR ---
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    // 1. On supprime d'abord ses notifications/activités pour éviter le blocage SQL
    await db.query("DELETE FROM notifications WHERE user_id = ?", [userId]);

    // 2. On supprime enfin l'utilisateur
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({
      success: true,
      message: "Utilisateur et ses données supprimés",
    });
  } catch (err) {
    console.error("🔥 Erreur SQL Delete:", err.message);
    res.status(500).json({
      error:
        "Impossible de supprimer : cet utilisateur a des signalements actifs.",
    });
  }
};

// --- CHANGER LE RÔLE ---
exports.toggleRole = async (req, res) => {
  const id = req.body.id || req.body.userId;
  try {
    // 1. On cherche le rôle RÉEL en base de données
    const [rows] = await db.query("SELECT role FROM users WHERE id = ?", [id]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    const actualRole = rows[0].role;
    // 2. On inverse
    const newRole = actualRole === "admin" ? "citoyen" : "admin";

    await db.query("UPDATE users SET role = ? WHERE id = ?", [newRole, id]);
    console.log(`✅ ID ${id} passé de ${actualRole} à ${newRole}`);
    res.json({ success: true, newRole });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- ACTIVER / DÉSACTIVER COMPTE ---
exports.toggleUserStatus = async (req, res) => {
  const id = req.body.id || req.body.userId;
  try {
    const [rows] = await db.query("SELECT is_active FROM users WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    const actualStatus = rows[0].is_active;
    // On inverse (si 1 devient 0, si 0 devient 1)
    const newStatus = actualStatus === 1 ? 0 : 1;

    await db.query("UPDATE users SET is_active = ? WHERE id = ?", [
      newStatus,
      id,
    ]);
    console.log(`🔌 ID ${id} : Status passé de ${actualStatus} à ${newStatus}`);
    res.json({ success: true, is_active: newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  // <-- Vérifie l'orthographe ici
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 1. Répartition par Catégorie (Pie Chart) ---
exports.getCategoryStats = async (req, res) => {
  try {
    const [rows] = await db.query(`
            SELECT c.name AS category, COUNT(s.id) AS count 
            FROM categories c 
            LEFT JOIN signalements s ON c.id = s.category_id 
            GROUP BY c.id, c.name
        `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 2. Performance Maintenance (Bar Chart) ---
exports.getMaintenanceStats = async (req, res) => {
  try {
    const [rows] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%d/%m') AS label,
                COUNT(*) AS total, 
                SUM(CASE WHEN statut = 'TERMINE' THEN 1 ELSE 0 END) AS resolved 
            FROM interventions 
            GROUP BY label 
            ORDER BY created_at DESC LIMIT 5
        `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 3. Évolution des Signalements (Line Chart) ---
exports.getReportEvolutionStats = async (req, res) => {
  try {
    const [rows] = await db.query(`
            SELECT COUNT(*) AS count 
            FROM signalements 
            GROUP BY DATE(date_signalement) 
            ORDER BY DATE(date_signalement) ASC LIMIT 7
        `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecentActivities = (req, res) => {
  const sql = `
        (SELECT 
            'report' as type, 
            CONCAT('Signalement: ', titre) as description, 
            date_signalement as date 
         FROM signalements 
         ORDER BY date_signalement DESC LIMIT 5)
        UNION ALL
        (SELECT 
            'work' as type, 
            CONCAT('Intervention: ', description) as description, 
            created_at as date 
         FROM interventions 
         ORDER BY created_at DESC LIMIT 5)
        ORDER BY date DESC LIMIT 10`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};
