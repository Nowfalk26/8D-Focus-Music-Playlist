const mongoose = require("mongoose");
const Song = require("../models/Song");

async function run() {
  await mongoose.connect("mongodb://127.0.0.1:27017/focus_music");
  const songs = await Song.find().select("title category");
  let has8D = 0;
  let no8D = 0;
  songs.forEach((s) => {
    if (s.title.includes("8D") || s.title.includes("8d")) has8D++;
    else no8D++;
  });
  console.log({ total: songs.length, has8D, no8D });
  await mongoose.disconnect();
}

run().catch(console.error);
