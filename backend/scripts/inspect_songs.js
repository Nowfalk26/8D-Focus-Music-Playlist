const mongoose = require("mongoose");
const Song = require("../models/Song");

async function check() {
  await mongoose.connect("mongodb://127.0.0.1:27017/focus_music");
  const cats = await Song.distinct("category");
  console.log("Categories:", cats);
  const total = await Song.countDocuments();
  console.log("Total songs:", total);

  // Sample titles
  const samples = await Song.find().limit(20).select("title artist category audioMode");
  console.log("Sample songs:", samples);
  await mongoose.disconnect();
}

check().catch(console.error);
