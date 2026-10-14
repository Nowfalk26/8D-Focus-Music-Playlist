const Song = require("../models/Song");

// @desc    Get all songs
// @route   GET /api/songs
const getAllSongs = async (req, res) => {
  try {
    const { category, search, mode, audioMode } = req.query;
    let query = {};

    const targetMode = mode || audioMode;
    if (targetMode && ["normal", "8d", "9d"].includes(targetMode.toLowerCase())) {
      query.audioMode = targetMode.toLowerCase();
    }

    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { artist: { $regex: search, $options: "i" } },
      ];
    }

    const songs = await Song.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: songs.length,
      data: songs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get single song by ID
// @route   GET /api/songs/:id
const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    res.status(200).json({
      success: true,
      data: song,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create a new song
// @route   POST /api/songs
const createSong = async (req, res) => {
  try {
    const { title, artist, category, audioUrl, imageUrl, duration, is8D, audioMode } = req.body;

    if (!title || !artist || !category || !audioUrl) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: title, artist, category, audioUrl",
      });
    }

    const newSong = await Song.create({
      title,
      artist,
      category,
      audioUrl,
      imageUrl: imageUrl || "",
      duration: duration || "",
      is8D: is8D !== undefined ? is8D : true,
      audioMode: audioMode || (is8D === false ? "normal" : "8d"),
    });

    res.status(201).json({
      success: true,
      message: "Song created successfully",
      data: newSong,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update a song
// @route   PUT /api/songs/:id
const updateSong = async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      new: true,
      runValidators: true,
    });

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Song updated successfully",
      data: song,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete a song
// @route   DELETE /api/songs/:id
const deleteSong = async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Song deleted successfully",
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
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
};
