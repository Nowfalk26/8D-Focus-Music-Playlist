const mongoose = require("mongoose");
const Song = require("../models/Song");

async function run() {
  await mongoose.connect("mongodb://127.0.0.1:27017/focus_music");
  const songs = await Song.find();
  console.log(`Analyzing ${songs.length} songs...`);

  const categoryCounts = {};
  songs.forEach((s) => {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
  });
  console.log("Category counts:", categoryCounts);
  await mongoose.disconnect();
}

run().catch(console.error);
