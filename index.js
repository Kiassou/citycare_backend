require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
<<<<<<< HEAD

// Routes
=======
const MegaService = require("./services/megaService");
>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1
const authRoutes = require("./routes/authRoutes");
const signalementRoutes = require("./routes/signalementRoutes");
const newsRoutes = require("./routes/newsRoutes");

const app = express();

<<<<<<< HEAD
// Middlewares
=======
const mega = new MegaService(process.env.MEGA_EMAIL, process.env.MEGA_PASSWORD);

mega
  .connect()
  .then(() => console.log("✅ Connexion MEGA réussie !"))
  .catch((err) => console.error("❌ Erreur connexion MEGA:", err));

>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

<<<<<<< HEAD
// Dossier statique pour les uploads temporaires
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Utilisation des routes
=======


// Routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1
app.use("/api/auth", authRoutes);
app.use("/api/signalements", signalementRoutes);
app.use("/api/news", newsRoutes);

<<<<<<< HEAD
app.get("/", (req, res) => res.send("CITYCARE API is running avec ImgBB 🔥"));

const PORT = process.env.PORT || 10000; // Render utilise souvent le port 10000

app.listen(PORT, () => {
  console.log(`🚀 Server CityCare running on port ${PORT}`);
});
=======
app.get("/", (req, res) => res.send("CITYCARE API is running 🔥"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server CityCare running on port ${PORT}`),
);

>>>>>>> 5807fb656214626c08593f8974dc42e9580ee6a1
