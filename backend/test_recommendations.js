/**
 * Comprehensive Test Suite for Flow 8D ML Recommendation Engine
 * Validates:
 * 1. Initial Content-Based Recommendations
 * 2. Sequential Preference Profile Updates
 * 3. Mood Shift Detection (Fast Energetic -> Slow Calm Melody)
 * 4. Early Skip Negative Signal Penalty
 * 5. Diversity / MMR Ranking (No Duplicates)
 * 6. "Because You Selected This" Content-Based Similarity
 * 7. History Reset & Graceful Fallback
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Song = require("./models/Song");
const UserTasteProfile = require("./models/UserTasteProfile");
const recommendationService = require("./services/recommendationService");

async function runTests() {
  console.log("============================================================");
  console.log("🧪 Running Flow 8D ML Recommendation Engine Test Suite...");
  console.log("============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/focus_music");
    const testUserId = `test_user_${Date.now()}`;

    // Clean up test profile if exists
    await UserTasteProfile.deleteMany({ userId: testUserId });

    // Find sample test songs
    const energeticSong1 = await Song.findOne({ title: "Cyber Flow Overdrive 8D" });
    const energeticSong2 = await Song.findOne({ title: "Quantum Sprint Velocity" });
    const calmSong = await Song.findOne({ title: "Midnight Rain Panning 8D" });
    const zenSong = await Song.findOne({ title: "Serenade in Zen Orbit" });

    if (!energeticSong1 || !energeticSong2 || !calmSong) {
      throw new Error("Required seed songs not found in database. Run seed.js first.");
    }

    // -------------------------------------------------------------
    // TEST 1: Initial Cold Start Recommendations
    // -------------------------------------------------------------
    console.log("Test 1: Cold Start Recommendations");
    const initialRecs = await recommendationService.getRecommendations(testUserId, { limit: 4 });
    assert(initialRecs.length > 0, "Initial recommendations generated successfully");
    assert(initialRecs[0].matchScore >= 50, "Recommendations have valid match scores");
    assert(typeof initialRecs[0].reason === "string", "Recommendations have explainable reasons");

    // -------------------------------------------------------------
    // TEST 2: Sequential Listening - Energetic Focus Track 1
    // -------------------------------------------------------------
    console.log("\nTest 2: Sequential Selection 1 - Energetic Song (132 BPM)");
    const step1 = await recommendationService.recordInteraction(testUserId, {
      songId: energeticSong1._id.toString(),
      eventType: "play",
      durationSec: 180,
    });
    assert(step1.success === true, "Interaction recorded for energetic song 1");

    const profileAfter1 = await recommendationService.getOrCreateProfile(testUserId);
    // Tempo dimension is at index 0, Energy is at index 1
    assert(profileAfter1.currentProfile[1] > 0.55, "Energy preference increased following energetic selection");

    // -------------------------------------------------------------
    // TEST 3: Sequential Selection 2 - Second Energetic Track
    // -------------------------------------------------------------
    console.log("\nTest 3: Sequential Selection 2 - Second Energetic Song (128 BPM)");
    await recommendationService.recordInteraction(testUserId, {
      songId: energeticSong2._id.toString(),
      eventType: "completed",
      durationSec: 360,
    });

    const recsEnergetic = await recommendationService.getRecommendations(testUserId, { limit: 4 });
    const topRecCat = recsEnergetic[0].song.category;
    assert(
      topRecCat === "Energetic Focus" || topRecCat === "Deep Focus",
      `Top recommended category aligns with energetic pattern: ${topRecCat} (${recsEnergetic[0].matchScore}%)`
    );

    // -------------------------------------------------------------
    // TEST 4: Intelligent Shift Detection (Switch from Energetic to Slow Calm Melody)
    // -------------------------------------------------------------
    console.log("\nTest 4: Preference Shift Detection (User switches to 65 BPM Midnight Rain)");
    const shiftResult = await recommendationService.recordInteraction(testUserId, {
      songId: calmSong._id.toString(),
      eventType: "select",
      durationSec: 60,
    });

    assert(shiftResult.shiftDetected === true, "Shift Detector recognized abrupt mood/tempo switch!");
    assert(shiftResult.shiftMagnitude > 0.30, `Shift magnitude calculated accurately: ${shiftResult.shiftMagnitude}`);

    // Fetch recommendations immediately following shift
    const recsAfterShift = await recommendationService.getRecommendations(testUserId, { limit: 4 });
    const postShiftCategories = recsAfterShift.map((r) => r.song.category);
    assert(
      postShiftCategories.includes("Nature 8D") ||
      postShiftCategories.includes("Meditation") ||
      postShiftCategories.includes("Relaxation") ||
      postShiftCategories.includes("Ambient Noise") ||
      postShiftCategories.includes("Tamil Melodies 8D") ||
      postShiftCategories.includes("Tamil Ambient Relax") ||
      postShiftCategories.includes("Tamil Indie & Pop"),
      `Recommendations adapted to calm direction: [${postShiftCategories.join(", ")}]`
    );
    assert(
      recsAfterShift[0].reason.toLowerCase().includes("switch") ||
      recsAfterShift[0].reason.toLowerCase().includes("calm") ||
      recsAfterShift[0].reason.toLowerCase().includes("relax") ||
      recsAfterShift[0].reason.toLowerCase().includes("adapted") ||
      recsAfterShift[0].reason.toLowerCase().includes("melod"),
      `Explanation reflects adapted shift: "${recsAfterShift[0].reason}"`
    );

    // -------------------------------------------------------------
    // TEST 5: Early Skip Negative Feedback
    // -------------------------------------------------------------
    console.log("\nTest 5: Early Skip Penalty Handling (<20s skip)");
    const preSkipProfile = await recommendationService.getOrCreateProfile(testUserId);
    const preSkipEnergy = preSkipProfile.currentProfile[1];

    await recommendationService.recordInteraction(testUserId, {
      songId: energeticSong1._id.toString(),
      eventType: "skip",
      durationSec: 8,
    });

    const postSkipProfile = await recommendationService.getOrCreateProfile(testUserId);
    assert(
      postSkipProfile.recentInteractions[0].weight < 0,
      "Skip event recorded with negative feedback weight (-1.2)"
    );

    // -------------------------------------------------------------
    // TEST 6: Candidate Diversity & No Duplicates (MMR)
    // -------------------------------------------------------------
    console.log("\nTest 6: MMR Diversity & Exclusion");
    const recsList = await recommendationService.getRecommendations(testUserId, { limit: 5 });
    const songIds = recsList.map((r) => r.song._id.toString());
    const uniqueSongIds = new Set(songIds);
    assert(songIds.length === uniqueSongIds.size, "MMR ensures zero duplicate recommendations");

    // -------------------------------------------------------------
    // TEST 7: 'Because You Selected This' (Content-Based Neighbors)
    // -------------------------------------------------------------
    console.log("\nTest 7: Similar Songs Content-Based Filtering");
    const similar = await recommendationService.getSimilarSongs(calmSong._id.toString(), 3);
    assert(similar.length > 0, "Similar songs found for target track");
    assert(
      similar[0].song.category === "Meditation" ||
      similar[0].song.category === "Ambient Noise" ||
      similar[0].song.category === "Relaxation",
      `Acoustically closest match to Midnight Rain is: ${similar[0].song.title} [${similar[0].song.category}]`
    );

    // -------------------------------------------------------------
    // TEST 8: Reset Taste Profile & History
    // -------------------------------------------------------------
    console.log("\nTest 8: Reset Learned Preferences");
    const resetRes = await recommendationService.resetProfile(testUserId);
    assert(resetRes.success === true, "Reset profile executed successfully");

    const cleanProfile = await recommendationService.getOrCreateProfile(testUserId);
    assert(cleanProfile.recentInteractions.length === 0, "Interaction history cleared");
    assert(cleanProfile.totalInteractions === 0, "Interaction counter reset to 0");

    // Cleanup
    await UserTasteProfile.deleteMany({ userId: testUserId });

    console.log("\n============================================================");
    console.log(`Results: ${passed} passed, ${failed} failed.`);
    console.log("============================================================");

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  }
}

runTests();
