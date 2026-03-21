const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 15825,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // --- CONFIGURATION SSL OBLIGATOIRE POUR AIVEN ---
  ssl: {
    rejectUnauthorized: false
  }
});

const db = pool.promise();

// Test de connexion
db.getConnection()
  .then((conn) => {
    console.log("Connexion MySQL réussie (Aiven Cloud) ✅");
    conn.release();
  })
  .catch((err) => {
    console.error("Erreur de connexion MySQL ❌ :", err.message);
  });

module.exports = db;
