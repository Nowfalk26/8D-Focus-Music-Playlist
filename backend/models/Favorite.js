const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Ensure a user cannot favorite the same song multiple times
favoriteSchema.index({ user: 1, song: 1 }, { unique: true });

const Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorite;
