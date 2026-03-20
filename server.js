require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const signalementRoutes = require("./routes/signalementRoutes");
const newsRoutes = require("./routes/newsRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/signalements", signalementRoutes);
app.use("/api/news", newsRoutes);

app.get("/", (req, res) => {
  res.send("CITYCARE API is running 🔥");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server CityCare running on port ${PORT}`);
});
