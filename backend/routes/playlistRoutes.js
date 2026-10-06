const express = require("express");
const router = express.Router();
const {
  getUserPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
} = require("../controllers/playlistController");
const { protect } = require("../middleware/authMiddleware");

// All playlist routes require authentication
router.use(protect);

router.route("/").get(getUserPlaylists).post(createPlaylist);

router
  .route("/:id")
  .get(getPlaylistById)
  .put(updatePlaylist)
  .delete(deletePlaylist);

router.route("/:id/songs").post(addSongToPlaylist);
router.route("/:id/songs/:songId").delete(removeSongFromPlaylist);

module.exports = router;
