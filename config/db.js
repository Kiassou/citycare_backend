const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 15825, // Port par défaut d'Aiven
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // --- AJOUT CRUCIAL POUR AIVEN/RENDER ---
  ssl: {
    rejectUnauthorized: false, // Permet la connexion sécurisée sur le Cloud
  },
});

const db = pool.promise();

// Test de connexion amélioré pour voir les erreurs réelles
db.getConnection()
  .then((conn) => {
    console.log("Connexion MySQL réussie (Mode Promise) ✅");
    conn.release(); // Libère la connexion immédiatement
  })
  .catch((err) => {
    console.error("Erreur de connexion MySQL ❌ :", err.message);
  });

module.exports = db;
