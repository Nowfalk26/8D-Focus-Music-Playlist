const express = require("express");
const router = express.Router();
const {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
} = require("../controllers/songController");

// Routes for /api/songs
router.route("/").get(getAllSongs).post(createSong);

// Routes for /api/songs/:id
router.route("/:id").get(getSongById).put(updateSong).delete(deleteSong);

module.exports = router;
