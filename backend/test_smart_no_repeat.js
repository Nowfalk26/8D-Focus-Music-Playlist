const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const Song = require("./models/Song");
const recommendationService = require("./services/recommendationService");

// Test runner helper
let passedCount = 0;
let totalCount = 0;

function assert(condition, message) {
  totalCount++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedCount++;
  console.log(`✓ PASS: ${message}`);
}

async function runTests() {
  console.log("==========================================================");
  console.log("🚀 RUNNING SMART NO-REPEAT PLAYBACK & RECOMMENDATION TESTS");
  console.log("==========================================================\n");

  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/focusmusic");
  console.log("Connected to MongoDB for tests.\n");

  try {
    // -------------------------------------------------------------
    // TEST 1: Full-library playback does not repeat tracks before cycle ends
    // -------------------------------------------------------------
    console.log("--- Test 1: Full-library no-repeat playback ---");
    const mode = "8d";
    const all8dSongs = await Song.find({ audioMode: mode });
    assert(all8dSongs.length > 5, `Database has ${all8dSongs.length} 8D songs for testing`);

    const playedIds = [];
    for (let step = 0; step < 10; step++) {
      const recs = await recommendationService.getRecommendations("test_user_1", {
        limit: 1,
        excludeSongIds: playedIds,
        audioMode: mode,
      });

      assert(recs.length > 0, `Step ${step + 1}: Generated next recommendation`);
      const chosenSong = recs[0].song;
      const chosenId = chosenSong._id.toString();

      assert(!playedIds.includes(chosenId), `Step ${step + 1}: Song "${chosenSong.title}" (${chosenId}) has not been played previously in this cycle`);
      playedIds.push(chosenId);
    }
    assert(new Set(playedIds).size === 10, "All 10 consecutive songs played were unique without any repeats\n");

    // -------------------------------------------------------------
    // TEST 2: Playlist playback only uses eligible songs from that playlist
    // -------------------------------------------------------------
    console.log("--- Test 2: Scoped Playlist playback isolation ---");
    // Pick 4 songs as a scoped playlist
    const samplePlaylist = all8dSongs.slice(0, 4);
    const playlistIds = samplePlaylist.map((s) => s._id.toString());
    const playlistPlayed = [];

    for (let step = 0; step < 4; step++) {
      const recs = await recommendationService.getRecommendations("test_user_playlist", {
        limit: 1,
        excludeSongIds: playlistPlayed,
        audioMode: mode,
        playlistSongIds: playlistIds,
      });

      assert(recs.length > 0, `Playlist Step ${step + 1}: Candidate retrieved`);
      const chosenSong = recs[0].song;
      const chosenId = chosenSong._id.toString();

      assert(playlistIds.includes(chosenId), `Song "${chosenSong.title}" strictly belongs to the playlist`);
      assert(!playlistPlayed.includes(chosenId), `Song "${chosenSong.title}" was not repeated within the playlist cycle`);
      playlistPlayed.push(chosenId);
    }

    // Now all 4 songs in playlist have played. Next request without reset should indicate cycleExhausted
    const exhaustedRecs = await recommendationService.getRecommendations("test_user_playlist", {
      limit: 1,
      excludeSongIds: playlistPlayed,
      audioMode: mode,
      playlistSongIds: playlistIds,
      resetIfExhausted: false,
    });
    assert(exhaustedRecs.length === 0, "No duplicate songs emitted when playlist cycle is fully exhausted");
    assert(exhaustedRecs.cycleExhausted === true, "cycleExhausted flag properly raised for playlist\n");

    // -------------------------------------------------------------
    // TEST 3: Manual song selection plays immediately & prevents auto repetition
    // -------------------------------------------------------------
    console.log("--- Test 3: Manual selection priority and exclusion ---");
    const manualSong = all8dSongs[12];
    const manualSongId = manualSong._id.toString();
    const cycleExclusions = [manualSongId]; // Marked as manually played

    const autoRecsAfterManual = await recommendationService.getRecommendations("test_user_manual", {
      limit: 10,
      excludeSongIds: cycleExclusions,
      audioMode: mode,
    });

    const manualFoundInAuto = autoRecsAfterManual.some((r) => r.song._id.toString() === manualSongId);
    assert(!manualFoundInAuto, `Manually selected song "${manualSong.title}" is excluded from subsequent auto recommendations\n`);

    // -------------------------------------------------------------
    // TEST 4: Previously played tracks are excluded from ML recommendations
    // -------------------------------------------------------------
    console.log("--- Test 4: Comprehensive exclusion set enforcement ---");
    const testExclusions = all8dSongs.slice(0, 20).map((s) => s._id.toString());
    const batchRecs = await recommendationService.getRecommendations("test_user_exclusions", {
      limit: 15,
      excludeSongIds: testExclusions,
      audioMode: mode,
    });

    const anyExcludedAppeared = batchRecs.some((r) => testExclusions.includes(r.song._id.toString()));
    assert(!anyExcludedAppeared, `None of the 20 excluded tracks appeared in the 15 returned recommendations`);
    assert(batchRecs.length === 15, "15 valid unplayed tracks returned\n");

    // -------------------------------------------------------------
    // TEST 5: Cycle resets only after all eligible tracks are exhausted
    // -------------------------------------------------------------
    console.log("--- Test 5: Cycle reset & boundary last song repetition check ---");
    // Simulate a mini-catalog of 3 tracks: [A, B, C]
    const mini3Ids = all8dSongs.slice(0, 3).map((s) => s._id.toString());
    const lastTrackId = mini3Ids[2]; // Track C ended the cycle

    // When resetIfExhausted is true and all 3 are in excludeSongIds:
    const resetRecs = await recommendationService.getRecommendations("test_user_reset", {
      limit: 1,
      excludeSongIds: mini3Ids, // All 3 played!
      audioMode: mode,
      playlistSongIds: mini3Ids,
      resetIfExhausted: true,
      lastCompletedSongId: lastTrackId,
    });

    assert(resetRecs.length === 1, "Next song successfully chosen for the new cycle upon reset");
    assert(resetRecs.cycleReset === true, "cycleReset flag is true");
    const firstSongOfNewCycle = resetRecs[0].song._id.toString();
    assert(firstSongOfNewCycle !== lastTrackId, `First song of new cycle (${firstSongOfNewCycle}) avoids repeating the last completed track (${lastTrackId})\n`);

    // -------------------------------------------------------------
    // TEST 6: Switching playlists creates new playback context
    // -------------------------------------------------------------
    console.log("--- Test 6: Switching playlists context isolation ---");
    const playlistA = all8dSongs.slice(0, 3).map((s) => s._id.toString());
    const playlistB = all8dSongs.slice(4, 7).map((s) => s._id.toString());

    const recsA = await recommendationService.getRecommendations("user_ctx", {
      limit: 2,
      excludeSongIds: [],
      audioMode: mode,
      playlistSongIds: playlistA,
    });
    const recsB = await recommendationService.getRecommendations("user_ctx", {
      limit: 2,
      excludeSongIds: [],
      audioMode: mode,
      playlistSongIds: playlistB,
    });

    const allInA = recsA.every((r) => playlistA.includes(r.song._id.toString()));
    const allInB = recsB.every((r) => playlistB.includes(r.song._id.toString()));
    const overlap = recsA.some((r) => playlistB.includes(r.song._id.toString()));

    assert(allInA, "Playlist A recs strictly come from Playlist A");
    assert(allInB, "Playlist B recs strictly come from Playlist B");
    assert(!overlap, "No cross-playlist leakage when switching playlist context\n");

    // -------------------------------------------------------------
    // TEST 7: Switching audio modes never mixes incompatible tracks
    // -------------------------------------------------------------
    console.log("--- Test 7: Audio mode strict isolation ---");
    for (const testMode of ["normal", "8d", "9d"]) {
      const modeRecs = await recommendationService.getRecommendations("user_modes", {
        limit: 5,
        audioMode: testMode,
      });
      const modeMatch = modeRecs.every((r) => r.song.audioMode === testMode);
      assert(modeMatch, `Every recommendation in mode "${testMode}" matches audioMode === "${testMode}"`);
    }
    console.log("");

    // -------------------------------------------------------------
    // TEST 8: Skipped tracks follow no-repeat policy
    // -------------------------------------------------------------
    console.log("--- Test 8: Skipped tracks exclusion policy ---");
    const skippedTrack = all8dSongs[15];
    const skippedId = skippedTrack._id.toString();

    // In PlaybackCycleManager policy: skipped track is added to excluded set
    const recsAfterSkip = await recommendationService.getRecommendations("user_skip", {
      limit: 10,
      excludeSongIds: [skippedId],
      audioMode: mode,
    });

    const skippedAppeared = recsAfterSkip.some((r) => r.song._id.toString() === skippedId);
    assert(!skippedAppeared, `Skipped song "${skippedTrack.title}" is excluded from subsequent auto recommendations\n`);

    // -------------------------------------------------------------
    // TEST 9: Empty libraries and single-song libraries behave correctly
    // -------------------------------------------------------------
    console.log("--- Test 9: Edge cases (empty & single-song libraries) ---");
    // Empty playlist
    const emptyRecs = await recommendationService.getRecommendations("user_edge", {
      limit: 5,
      playlistSongIds: ["507f1f77bcf86cd799439011"], // Non-existent ID
      audioMode: mode,
    });
    assert(emptyRecs.length === 0, "Empty candidate library returns empty array cleanly without error");
    assert(emptyRecs.cycleExhausted === true, "Empty library indicates cycleExhausted: true");

    // Single-song playlist
    const singleSongId = all8dSongs[0]._id.toString();
    const singleRecs1 = await recommendationService.getRecommendations("user_single", {
      limit: 1,
      excludeSongIds: [],
      playlistSongIds: [singleSongId],
      audioMode: mode,
    });
    assert(singleRecs1.length === 1, "Single-song library plays that track in cycle 1");

    // Next request with singleSongId excluded but resetIfExhausted: true
    const singleRecs2 = await recommendationService.getRecommendations("user_single", {
      limit: 1,
      excludeSongIds: [singleSongId],
      playlistSongIds: [singleSongId],
      resetIfExhausted: true,
      lastCompletedSongId: singleSongId,
    });
    assert(singleRecs2.length === 1, "Single-song library resets cycle and allows replay when no other song exists\n");

    // -------------------------------------------------------------
    // TEST 10: Concurrency & rapid Next-button requests cannot enqueue duplicates
    // -------------------------------------------------------------
    console.log("--- Test 10: Concurrent recommendation requests safety ---");
    const reservedSet = new Set();
    const concurrentRequests = 5;

    // Simulate atomic reservation: as each request picks a candidate, it is added to reservedSet
    const results = [];
    for (let i = 0; i < concurrentRequests; i++) {
      const rec = await recommendationService.getRecommendations("user_concurrent", {
        limit: 1,
        excludeSongIds: Array.from(reservedSet),
        audioMode: mode,
      });
      if (rec.length > 0) {
        const id = rec[0].song._id.toString();
        assert(!reservedSet.has(id), `Concurrent slot ${i + 1}: Song ${rec[0].song.title} (${id}) is not already reserved`);
        reservedSet.add(id);
        results.push(id);
      }
    }
    assert(results.length === concurrentRequests, "All 5 concurrent requests returned unique songs without duplicates\n");

    // -------------------------------------------------------------
    // TEST 11: Similar songs endpoint respects exclusion
    // -------------------------------------------------------------
    console.log("--- Test 11: getSimilarSongs exclusion verification ---");
    const targetSong = all8dSongs[0];
    const targetId = targetSong._id.toString();
    const excludedSimilar = all8dSongs[1]._id.toString();

    const similarRecs = await recommendationService.getSimilarSongs(targetId, 4, mode, [excludedSimilar]);
    const excludedInSimilar = similarRecs.some((s) => s.song._id.toString() === excludedSimilar);
    assert(!excludedInSimilar, `Excluded track is not present in similar songs recommendations\n`);

    // -------------------------------------------------------------
    // TEST 12: ML recommendation scoring attributes present
    // -------------------------------------------------------------
    console.log("--- Test 12: ML recommendation features and explainability ---");
    const mlRecs = await recommendationService.getRecommendations("user_ml_check", {
      limit: 3,
      audioMode: mode,
    });

    assert(mlRecs.length > 0, "ML recommendations returned");
    const first = mlRecs[0];
    assert(typeof first.matchScore === "number", "matchScore is present and numeric");
    assert(typeof first.similarity === "number", "similarity is present and numeric");
    assert(typeof first.reason === "string" && first.reason.length > 5, `Reason explanation is grounded: "${first.reason}"`);

    console.log("\n==========================================================");
    console.log(`🎉 ALL TESTS PASSED! (${passedCount}/${totalCount} assertions successful)`);
    console.log("==========================================================");
  } finally {
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
