const mongoose = require("mongoose");

const audioFeaturesSchema = new mongoose.Schema(
  {
    tempo: { type: Number, default: 100 },
    energy: { type: Number, default: 0.5 },
    danceability: { type: Number, default: 0.5 },
    valence: { type: Number, default: 0.5 },
    acousticness: { type: Number, default: 0.5 },
    spectralCentroid: { type: Number, default: 1800 },
    spectralRolloff: { type: Number, default: 2800 },
    spectralContrast: { type: Number, default: 0.5 },
    zeroCrossingRate: { type: Number, default: 0.045 },
    calmness: { type: Number, default: 0.5 },
    vector: { type: [Number], default: [0.38, 0.5, 0.5, 0.5, 0.5, 0.35, 0.5, 0.5, 0.85, 0.5] },
  },
  { _id: false }
);

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
    audioMode: {
      type: String,
      enum: ["normal", "8d"],
      default: "8d",
      index: true,
    },
    audioFeatures: {
      type: audioFeaturesSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

const Song = mongoose.model("Song", songSchema);

module.exports = Song;