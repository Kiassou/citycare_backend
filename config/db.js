const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER || "avnadmin",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "defaultdb",
  port: parseInt(process.env.DB_PORT) || 15825,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // SSL est obligatoire pour Aiven
  ssl: {
    rejectUnauthorized: false
  },
  // On force IPv4 pour éviter les soucis réseau de Render
  family: 4 
});

const db = pool.promise();

db.getConnection()
  .then((conn) => {
    console.log("🚀 Nouvelle connexion MySQL réussie ! ✅");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion :", err.message);
  });

module.exports = db;
