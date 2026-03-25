require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Routes
const authRoutes = require("./routes/authRoutes");
const signalementRoutes = require("./routes/signalementRoutes");
const newsRoutes = require("./routes/newsRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dossier statique pour les uploads temporaires
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Utilisation des routes
app.use("/api/auth", authRoutes);
app.use("/api/signalements", signalementRoutes);
app.use("/api/news", newsRoutes);

app.get("/", (req, res) => res.send("CITYCARE API is running avec ImgBB 🔥"));

const PORT = process.env.PORT || 10000; // Render utilise souvent le port 10000

app.listen(PORT, () => {
  console.log(`🚀 Server CityCare running on port ${PORT}`);
});
