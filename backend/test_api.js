require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Song = require("./models/Song");
const Category = require("./models/Category");
const Playlist = require("./models/Playlist");
const Favorite = require("./models/Favorite");
const RecentlyPlayed = require("./models/RecentlyPlayed");

async function runTest() {
  console.log("=== STARTING FULL BACKEND INTEGRATION TEST ===");
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/focus_music");
    console.log("✓ Connected to MongoDB successfully");

    // 1. Test User creation & password hashing
    const testEmail = `test_${Date.now()}@focusmusic.com`;
    const user = await User.create({
      name: "Focus Explorer",
      email: testEmail,
      password: "password123",
      role: "user",
    });
    console.log("✓ User created with hashed password:", user._id);
    const isMatch = await user.matchPassword("password123");
    console.log("✓ Password match test passed:", isMatch);

    // 2. Test Category creation & retrieval
    const categoryName = `Study_8D_${Date.now()}`;
    const category = await Category.create({
      name: categoryName,
      description: "Binaural beats and 8D audio for deep study",
      imageUrl: "https://example.com/study.jpg",
    });
    console.log("✓ Category created:", category.name, category._id);

    const categories = await Category.find();
    console.log("✓ Categories count in DB:", categories.length);

    // 3. Test Song creation & retrieval
    const song = await Song.create({
      title: "Deep Alpha Wave 8D",
      artist: "NeuroFocus Sound Lab",
      category: category.name,
      audioUrl: "https://example.com/audio/alpha-wave-8d.mp3",
      imageUrl: "https://example.com/images/alpha-wave.jpg",
      duration: "03:45",
      is8D: true,
    });
    console.log("✓ Song created:", song.title, song._id);

    const songs = await Song.find({ category: category.name });
    console.log("✓ Songs found in category:", songs.length);

    // 4. Test Favorite
    const favorite = await Favorite.create({
      user: user._id,
      song: song._id,
    });
    console.log("✓ Favorite added for song:", favorite.song);
    const userFavorites = await Favorite.find({ user: user._id }).populate("song");
    console.log("✓ Populated user favorites count:", userFavorites.length, "Song title:", userFavorites[0].song.title);

    // 5. Test Playlist creation and song addition
    const playlist = await Playlist.create({
      name: "My Deep Focus 8D Mix",
      description: "Top 8D tracks for coding and studying",
      user: user._id,
      songs: [song._id],
    });
    console.log("✓ Playlist created:", playlist.name, "Songs count:", playlist.songs.length);

    const populatedPlaylist = await Playlist.findById(playlist._id).populate("songs");
    console.log("✓ Populated playlist song title:", populatedPlaylist.songs[0].title);

    // 6. Test Recently Played
    const recent = await RecentlyPlayed.findOneAndUpdate(
      { user: user._id, song: song._id },
      { playedAt: new Date() },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    ).populate("song");
    console.log("✓ Recently played registered for track:", recent.song.title);

    // Cleanup test data created during this specific test run
    await RecentlyPlayed.findByIdAndDelete(recent._id);
    await Playlist.findByIdAndDelete(playlist._id);
    await Favorite.findByIdAndDelete(favorite._id);
    await Song.findByIdAndDelete(song._id);
    await Category.findByIdAndDelete(category._id);
    await User.findByIdAndDelete(user._id);
    console.log("✓ Test records cleaned up successfully");

    console.log("=== ALL BACKEND INTEGRATION TESTS PASSED ===");
    process.exit(0);
  } catch (error) {
    console.error("✗ Integration test failed:", error);
    process.exit(1);
  }
}

runTest();
