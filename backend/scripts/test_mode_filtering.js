const mongoose = require("mongoose");
const Song = require("../models/Song");
const recommendationService = require("../services/recommendationService");

async function testModes() {
  await mongoose.connect("mongodb://127.0.0.1:27017/focus_music");
  console.log("Connected to MongoDB");

  for (const mode of ["normal", "8d", "9d"]) {
    const songs = await Song.find({ audioMode: mode });
    console.log(`\n--- Testing Mode: ${mode} ---`);
    console.log(`Count in DB: ${songs.length}`);
    console.log(`Sample: "${songs[0].title}" by ${songs[0].artist} (${songs[0].category}) - is8D: ${songs[0].is8D}`);

    const recs = await recommendationService.getRecommendations("test_user_mode", {
      limit: 3,
      audioMode: mode,
    });
    console.log(`Recommendations for ${mode}:`, recs.map((r) => `${r.song.title} [${r.song.audioMode}]`));
    
    // Verify strict filtering - not a single song should have a mismatched audioMode!
    const mismatched = recs.filter((r) => r.song.audioMode !== mode);
    if (mismatched.length > 0) {
      console.error(`ERROR: Found mismatched recommendation in ${mode} mode!`, mismatched);
      process.exit(1);
    }
  }

  console.log("\n✅ ALL MODES STRICT FILTERING VERIFIED 100% SUCCESSFUL!");
  await mongoose.disconnect();
}

testModes().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
