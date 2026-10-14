const mongoose = require("mongoose");
const Song = require("../models/Song");

async function repartition() {
  await mongoose.connect("mongodb://127.0.0.1:27017/focus_music");
  console.log("Connected to MongoDB");

  // Fetch all 104 songs currently in 9d
  const songs9D = await Song.find({ audioMode: "9d" }).sort({ _id: 1 });
  console.log(`Found ${songs9D.length} songs in 9d mode.`);

  if (songs9D.length !== 104) {
    console.log(`Warning: expected 104 songs in 9D, found ${songs9D.length}`);
  }

  // First 52 go to 'normal'
  const toNormal = songs9D.slice(0, 52);
  // Remaining 52 go to '8d'
  const to8D = songs9D.slice(52);

  console.log(`Assigning ${toNormal.length} songs to 'normal'...`);
  for (const song of toNormal) {
    song.audioMode = "normal";
    song.is8D = false;
    song.title = song.title
      .replace(/\s*\((?:8D|8d|9D|9d)[^)]*\)/g, "")
      .replace(/\s*(?:8D|8d|9D|9d)\s*/g, " ")
      .trim();
    song.category = song.category
      .replace(/\s*9D/g, "")
      .replace(/\s*8D/g, "")
      .trim();
    await song.save();
  }

  console.log(`Assigning ${to8D.length} songs to '8d'...`);
  const suffixes8D = ["(8D Spatial)", "(8D Orbit)", "(8D Audio)", "(8D Binaural)", "(8D Panning)"];
  for (let i = 0; i < to8D.length; i++) {
    const song = to8D[i];
    song.audioMode = "8d";
    song.is8D = true;
    let baseTitle = song.title
      .replace(/\s*\((?:8D|8d|9D|9d)[^)]*\)/g, "")
      .replace(/\s*(?:8D|8d|9D|9d)\s*/g, " ")
      .trim();
    song.title = `${baseTitle} ${suffixes8D[i % suffixes8D.length]}`;
    if (song.category.includes("9D")) {
      song.category = song.category.replace("9D", "8D");
    } else if (!song.category.includes("8D")) {
      song.category = `${song.category} 8D`;
    }
    await song.save();
  }

  // Also clean up any existing normal and 8d songs to make sure no 9d references linger
  const normalSongs = await Song.find({ audioMode: "normal" });
  for (const song of normalSongs) {
    song.title = song.title
      .replace(/\s*\((?:8D|8d|9D|9d)[^)]*\)/g, "")
      .replace(/\s*(?:8D|8d|9D|9d)\s*/g, " ")
      .trim();
    song.category = song.category
      .replace(/\s*9D/g, "")
      .replace(/\s*8D/g, "")
      .trim();
    song.is8D = false;
    await song.save();
  }

  const eightDSongs = await Song.find({ audioMode: "8d" });
  for (let i = 0; i < eightDSongs.length; i++) {
    const song = eightDSongs[i];
    if (song.category.includes("9D")) {
      song.category = song.category.replace("9D", "8D");
      await song.save();
    }
  }

  // Final count verification
  const countNormal = await Song.countDocuments({ audioMode: "normal" });
  const count8D = await Song.countDocuments({ audioMode: "8d" });
  const count9D = await Song.countDocuments({ audioMode: "9d" });
  const total = await Song.countDocuments();

  console.log("\n=================================");
  console.log("REPARTITION RESULTS:");
  console.log(`Normal Music: ${countNormal}`);
  console.log(`8D Audio:     ${count8D}`);
  console.log(`9D Audio:     ${count9D}`);
  console.log(`Total:        ${total}`);
  console.log("=================================\n");

  await mongoose.disconnect();
}

repartition().catch(console.error);
