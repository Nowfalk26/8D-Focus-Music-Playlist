const express = require("express");
const router = express.Router();
const {
  getRecentlyPlayed,
  addRecentlyPlayed,
} = require("../controllers/recentlyPlayedController");
const { protect } = require("../middleware/authMiddleware");

// All recently played routes require authentication
router.use(protect);

router.route("/").get(getRecentlyPlayed).post(addRecentlyPlayed);

module.exports = router;
