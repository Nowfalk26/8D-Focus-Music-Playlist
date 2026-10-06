const mongoose = require("mongoose");

const recentlyPlayedSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      required: true,
    },
    playedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find user's recently played songs ordered by playedAt
recentlyPlayedSchema.index({ user: 1, playedAt: -1 });
recentlyPlayedSchema.index({ user: 1, song: 1 });

const RecentlyPlayed = mongoose.model("RecentlyPlayed", recentlyPlayedSchema);

module.exports = RecentlyPlayed;
