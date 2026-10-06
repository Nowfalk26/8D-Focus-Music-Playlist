const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    audioUrl: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "",
    },
    is8D: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Song = mongoose.model("Song", songSchema);

module.exports = Song;