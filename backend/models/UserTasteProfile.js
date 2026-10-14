const mongoose = require("mongoose");

const interactionEventSchema = new mongoose.Schema(
  {
    songId: { type: String, required: true },
    songTitle: { type: String, default: "" },
    category: { type: String, default: "" },
    eventType: {
      type: String,
      enum: ["select", "play", "completed", "partial", "skip", "favorite", "replay", "recommendation_click"],
      required: true,
    },
    weight: { type: Number, default: 1.0 },
    featureVector: { type: [Number], default: [] },
    durationSec: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userTasteProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    longTermProfile: {
      type: [Number],
      default: [0.38, 0.5, 0.5, 0.5, 0.5, 0.35, 0.5, 0.5, 0.85, 0.5],
    },
    shortTermProfile: {
      type: [Number],
      default: [0.38, 0.5, 0.5, 0.5, 0.5, 0.35, 0.5, 0.5, 0.85, 0.5],
    },
    currentProfile: {
      type: [Number],
      default: [0.38, 0.5, 0.5, 0.5, 0.5, 0.35, 0.5, 0.5, 0.85, 0.5],
    },
    recentInteractions: {
      type: [interactionEventSchema],
      default: [],
    },
    lastShiftDetected: {
      type: Boolean,
      default: false,
    },
    shiftMagnitude: {
      type: Number,
      default: 0.0,
    },
    totalInteractions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const UserTasteProfile = mongoose.model("UserTasteProfile", userTasteProfileSchema);

module.exports = UserTasteProfile;
