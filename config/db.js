const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: "mysql-23d58072-citycare.c.aivencloud.com",
  user: "avnadmin",
  password: "AVNS_tEEbVJZ7TmkBkDuTEHC",
  database: "defaultdb",
  port: 15825,
  ssl: { rejectUnauthorized: false }
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
