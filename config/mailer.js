<<<<<<< HEAD

const axios = require("axios");
const axios = require('axios');
=======
const axios = require("axios");

>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1
require("dotenv").config();

const transporter = {
  sendMail: async (options) => {
    try {

      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { name: "CityCare", email: "gaoussouthiero04@gmail.com" },
          to: [{ email: options.to }],
          subject: options.subject,
          htmlContent: options.html || options.text,
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ Erreur Brevo :",
        error.response ? error.response.data : error.message,
      );

      const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { name: "CityCare", email: "gaoussouthiero04@gmail.com" },
        to: [{ email: options.to }],
        subject: options.subject,
        htmlContent: options.html || options.text
      }, {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } 
  },
  verify: (callback) => {
    if (process.env.BREVO_API_KEY) {
      console.log("✅ API Brevo prête pour l'envoi 📧");
      callback(null, true);
    } else {
      callback(new Error("Clé API Brevo manquante"), null);
    }
  },
}


// Vérification au démarrage
transporter.verify((error) => {
  if (error) console.log(error.message);
});

module.exports = transporter;
