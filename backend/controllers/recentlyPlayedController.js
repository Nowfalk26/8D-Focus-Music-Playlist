const RecentlyPlayed = require("../models/RecentlyPlayed");
const Song = require("../models/Song");

// @desc    Get recently played tracks of logged-in user
// @route   GET /api/recently-played
const getRecentlyPlayed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 30;

    const list = await RecentlyPlayed.find({ user: req.user._id })
      .populate("song")
      .sort({ playedAt: -1 })
      .limit(limit);

    // Filter out records where the referenced song might have been deleted
    const validList = list.filter((item) => item.song !== null);

    res.status(200).json({
      success: true,
      count: validList.length,
      data: validList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Record or update a recently played track
// @route   POST /api/recently-played
const addRecentlyPlayed = async (req, res) => {
  try {
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({
        success: false,
        message: "Song ID is required",
      });
    }

    // Verify song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    // Upsert record: if already played, refresh playedAt to bring it to the top
    const record = await RecentlyPlayed.findOneAndUpdate(
      { user: req.user._id, song: songId },
      { playedAt: new Date() },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    ).populate("song");

    res.status(200).json({
      success: true,
      message: "Recently played updated",
      data: record,
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
  getRecentlyPlayed,
  addRecentlyPlayed,
};
