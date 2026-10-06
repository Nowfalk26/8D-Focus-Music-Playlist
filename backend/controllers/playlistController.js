const Playlist = require("../models/Playlist");
const Song = require("../models/Song");

// @desc    Get all playlists of logged-in user
// @route   GET /api/playlists
const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id })
      .populate("songs")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: playlists.length,
      data: playlists,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get single playlist by ID
// @route   GET /api/playlists/:id
const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("songs");

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    res.status(200).json({
      success: true,
      data: playlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create a new playlist
// @route   POST /api/playlists
const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Playlist name is required",
      });
    }

    const playlist = await Playlist.create({
      name: name.trim(),
      description: description || "",
      user: req.user._id,
      songs: [],
    });

    res.status(201).json({
      success: true,
      message: "Playlist created successfully",
      data: playlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update a playlist
// @route   PUT /api/playlists/:id
const updatePlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    if (name) playlist.name = name.trim();
    if (description !== undefined) playlist.description = description;

    await playlist.save();

    res.status(200).json({
      success: true,
      message: "Playlist updated successfully",
      data: playlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete a playlist
// @route   DELETE /api/playlists/:id
const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Playlist deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Add song to playlist
// @route   POST /api/playlists/:id/songs
const addSongToPlaylist = async (req, res) => {
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

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // Check if song already exists in playlist
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({
        success: false,
        message: "Song is already in this playlist",
      });
    }

    playlist.songs.push(songId);
    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlist._id).populate("songs");

    res.status(200).json({
      success: true,
      message: "Song added to playlist successfully",
      data: updatedPlaylist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Remove song from playlist
// @route   DELETE /api/playlists/:id/songs/:songId
const removeSongFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    playlist.songs = playlist.songs.filter(
      (song) => song.toString() !== req.params.songId
    );

    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlist._id).populate("songs");

    res.status(200).json({
      success: true,
      message: "Song removed from playlist successfully",
      data: updatedPlaylist,
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
  getUserPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
};
