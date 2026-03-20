const mysql = require("mysql2");
require("dotenv").config();

// On crée le pool de connexion
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "gkt2004",
  database: process.env.DB_NAME || "cityCare",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}); 

// CETTE LIGNE EST LA PLUS IMPORTANTE
// Elle transforme les callbacks en Promises pour autoriser le 'await'
const db = pool.promise();

// Petit test de connexion pour être sûr
db.getConnection()
  .then(() => console.log("Connexion MySQL réussie (Mode Promise) ✅"))
  .catch((err) => console.log("Erreur de connexion MySQL ❌ :", err));

module.exports = db;
