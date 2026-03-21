const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,      // Sera remplacé par la valeur de Render
  user: process.env.DB_USER,      // Souvent 'avnadmin'
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,  // Souvent 'defaultdb'
  port: process.env.DB_PORT || 15825,
  ssl: {
    rejectUnauthorized: false,    // OBLIGATOIRE pour Aiven
  },
});

const db = pool.promise();

db.getConnection()
  .then((conn) => {
    console.log("Connexion MySQL réussie (Aiven Cloud) ✅");
    conn.release();
  })
  .catch((err) => {
    console.error("Erreur de connexion MySQL ❌ :", err.message);
  });

module.exports = db;
