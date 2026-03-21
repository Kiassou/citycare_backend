const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  // Utilise les variables de Render, sinon utilise des valeurs par défaut
  host: process.env.DB_HOST, 
  user: process.env.DB_USER || "avnadmin",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "defaultdb",
  port: process.env.DB_PORT || 15825, 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false, // OBLIGATOIRE pour Aiven
  },
});

const db = pool.promise();

db.getConnection()
  .then((conn) => {
    console.log("Connexion MySQL réussie (Aiven Cloud) ✅");
    conn.release();
  })
  .catch((err) => {
    // Si tu vois ENOTFOUND ici, c'est que DB_HOST est mal écrit sur Render
    console.error("Erreur de connexion MySQL ❌ :", err.message);
  });

module.exports = db;
