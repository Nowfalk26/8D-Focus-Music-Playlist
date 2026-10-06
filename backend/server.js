require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const songRoutes = require("./routes/songRoutes");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const recentlyPlayedRoutes = require("./routes/recentlyPlayedRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Connect MongoDB
connectDB();

// Enable CORS
app.use(cors());

// Body parser middleware
app.use(express.json());

// Serve static uploaded files (music & images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/songs", songRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/recently-played", recentlyPlayedRoutes);

app.get("/", (req, res) => {
    res.send("8D Focus Music Playlist Backend is Running!");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});