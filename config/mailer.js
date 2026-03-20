const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Utilise SSL
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Ajoute ceci pour éviter les erreurs IPv6 et les problèmes de certificat
  tls: {
    rejectUnauthorized: false,
  },
});

// Vérification de la configuration au démarrage
transporter.verify((error, success) => {
  if (error) {
    console.log("Erreur de configuration Email : ", error);
  } else {
    console.log("Le serveur est prêt à envoyer des emails 📧");
  }
});

module.exports = transporter;
