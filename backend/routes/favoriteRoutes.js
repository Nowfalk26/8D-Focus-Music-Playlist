const express = require("express");
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavoriteStatus,
} = require("../controllers/favoriteController");
const { protect } = require("../middleware/authMiddleware");

// All favorite routes require authentication
router.use(protect);

router.get("/", getFavorites);
router.post("/:songId", addFavorite);
router.delete("/:songId", removeFavorite);
router.get("/check/:songId", checkFavoriteStatus);

module.exports = router;
