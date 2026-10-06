const Favorite = require("../models/Favorite");
const Song = require("../models/Song");

// @desc    Get all favorites of logged-in user
// @route   GET /api/favorites
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate("song")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Add song to favorites
// @route   POST /api/favorites/:songId
const addFavorite = async (req, res) => {
  try {
    const { songId } = req.params;

    // Verify song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      song: songId,
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: "Song is already in favorites",
      });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      song: songId,
    });

    const populatedFavorite = await Favorite.findById(favorite._id).populate("song");

    res.status(201).json({
      success: true,
      message: "Song added to favorites",
      data: populatedFavorite,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Remove song from favorites
// @route   DELETE /api/favorites/:songId
const removeFavorite = async (req, res) => {
  try {
    const { songId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      song: songId,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Song is not in favorites",
      });
    }

    res.status(200).json({
      success: true,
      message: "Song removed from favorites",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Check if a specific song is favorited
// @route   GET /api/favorites/check/:songId
const checkFavoriteStatus = async (req, res) => {
  try {
    const { songId } = req.params;

    const favorite = await Favorite.findOne({
      user: req.user._id,
      song: songId,
    });

    res.status(200).json({
      success: true,
      isFavorite: !!favorite,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavoriteStatus,
};
