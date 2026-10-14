const mongoose = require("mongoose");
const Song = require("../models/Song");

async function partition() {
  await mongoose.connect("mongodb://127.0.0.1:27017/focus_music");
  const songs = await Song.find().sort({ _id: 1 });
  console.log(`Found ${songs.length} songs to partition...`);

  // We have 312 songs. We will partition them in round-robin fashion or interleaved across categories
  // so that every mode ('normal', '8d', '9d') receives an equal distribution of high energy, melodies,
  // ambient, indie, and retro tracks!
  const modes = ["normal", "8d", "9d"];
  let counts = { normal: 0, "8d": 0, "9d": 0 };

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    const mode = modes[i % 3];
    counts[mode]++;

    // Clean base title by removing 8D / 9D tags
    let cleanBaseTitle = song.title
      .replace(/\s*\((?:8D|8d|9D|9d)[^)]*\)/g, "")
      .replace(/\s*(?:8D|8d|9D|9d)\s*/g, " ")
      .trim();

    if (mode === "normal") {
      song.audioMode = "normal";
      song.is8D = false;
      song.title = cleanBaseTitle;
      // Strip 8D from category if present
      song.category = song.category.replace(/\s*8D/g, "");
    } else if (mode === "8d") {
      song.audioMode = "8d";
      song.is8D = true;
      const suffixes = ["(8D Spatial)", "(8D Orbit)", "(8D Audio)", "(8D Binaural)", "(8D Panning)"];
      const sfx = suffixes[i % suffixes.length];
      song.title = `${cleanBaseTitle} ${sfx}`;
      if (!song.category.includes("8D") && !song.category.includes("Focus") && !song.category.includes("Meditation")) {
        song.category = `${song.category} 8D`;
      }
    } else {
      // 9d
      song.audioMode = "9d";
      song.is8D = true;
      const suffixes9D = [
        "(9D Multi-Dimensional Portal)",
        "(9D Holographic Spatial)",
        "(9D Concentric Orbit)",
        "(9D Cosmic Vortex)",
        "(9D Hyper-Spatial Audio)"
      ];
      const sfx = suffixes9D[i % suffixes9D.length];
      song.title = `${cleanBaseTitle} ${sfx}`;
      if (song.category.includes("8D")) {
        song.category = song.category.replace("8D", "9D");
      } else if (!song.category.includes("9D") && !song.category.includes("Focus")) {
        song.category = `${song.category} 9D`;
      }
    }

    await song.save();
  }

  console.log("Partition completed successfully!");
  console.log("Mode counts:", counts);

  // Verification samples
  for (const m of ["normal", "8d", "9d"]) {
    const sample = await Song.find({ audioMode: m }).limit(3).select("title artist category audioMode is8D");
    console.log(`\nSample for ${m}:`, sample);
  }

  await mongoose.disconnect();
}

partition().catch(console.error);
