const Song = require("../models/Song");
const UserTasteProfile = require("../models/UserTasteProfile");
const path = require("path");
const fs = require("fs");

// Cache file path
const CACHE_FILE = path.join(__dirname, "../ml/features_cache.json");

/**
 * Reads local cached audio features if present.
 */
function getCachedFeatures() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
    } catch (e) {
      return {};
    }
  }
  return {};
}

/**
 * Cosine similarity between two vectors.
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Euclidean distance between two vectors.
 */
function euclideanDistance(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 1.0;
  let sum = 0;
  for (let i = 0; i < vecA.length; i++) {
    const diff = vecA[i] - vecB[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Generates an explanation for a song match against user profile and previous song.
 */
function generateExplanation(song, userProfile, lastSong, shiftDetected) {
  const songBpm = song.audioFeatures?.tempo || 100;
  const songEnergy = song.audioFeatures?.energy || 0.5;
  const songCalmness = song.audioFeatures?.calmness || 0.5;

  if (shiftDetected) {
    if (songEnergy < 0.45) {
      return "Adapted to your recent switch to calm soundscapes";
    }
    return "Adapted to your new listening direction";
  }

  if (lastSong && Math.abs(songBpm - (lastSong.audioFeatures?.tempo || 100)) <= 15) {
    return `Harmonic tempo flow with "${lastSong.title}" (~${Math.round(songBpm)} BPM)`;
  }

  if (songEnergy > 0.7) {
    return "High energy acoustic resonance for deep coding";
  }

  if (songCalmness > 0.75) {
    return `Relaxed focus profile (~${Math.round(songBpm)} BPM, calm harmonics)`;
  }

  if (song.category === "Binaural Beats") {
    return "Bilateral frequency synchronization matching your profile";
  }

  return "Matches your evolving listening pattern";
}

class RecommendationService {
  /**
   * Retrieves or initializes the user's taste profile.
   */
  async getOrCreateProfile(userId = "guest_default") {
    let profile = await UserTasteProfile.findOne({ userId });
    if (!profile) {
      // Neutral prior across 10 dimensions:
      // [norm_tempo, energy, danceability, valence, acousticness, centroid, contrast, binaural, spatial, calmness]
      const neutralVector = [0.42, 0.5, 0.5, 0.5, 0.5, 0.38, 0.5, 0.5, 0.85, 0.5];
      profile = await UserTasteProfile.create({
        userId,
        longTermProfile: neutralVector,
        shortTermProfile: neutralVector,
        currentProfile: neutralVector,
        recentInteractions: [],
        lastShiftDetected: false,
        shiftMagnitude: 0,
        totalInteractions: 0,
      });
    }
    return profile;
  }

  /**
   * Records a user interaction event and updates the sequential preference model.
   * Event types: 'select', 'play', 'completed', 'partial', 'skip', 'favorite', 'replay', 'recommendation_click'
   */
  async recordInteraction(userId, { songId, eventType, durationSec = 0 }) {
    const profile = await this.getOrCreateProfile(userId);
    const song = await Song.findById(songId);

    if (!song) {
      throw new Error(`Song with id ${songId} not found`);
    }

    const songVector = song.audioFeatures?.vector || [0.42, 0.5, 0.5, 0.5, 0.5, 0.38, 0.5, 0.5, 0.85, 0.5];

    // Interaction Weights
    const weightMap = {
      select: 1.0,
      play: 1.2,
      completed: 2.0,
      partial: 1.0,
      skip: -1.2, // Early skip penalizes the current feature direction
      favorite: 2.5,
      replay: 2.2,
      recommendation_click: 1.8,
    };

    const weight = weightMap[eventType] || 1.0;

    // Detect sudden preference shifts (e.g. from fast energetic to slow calm melody)
    const prevShortTerm = profile.shortTermProfile || profile.currentProfile;
    const distanceToShortTerm = euclideanDistance(songVector, prevShortTerm);

    // If Euclidean distance exceeds threshold, a preference shift occurred
    const SHIFT_THRESHOLD = 0.35;
    const isShift = distanceToShortTerm > SHIFT_THRESHOLD && weight > 0;

    // Push interaction event to recent history (keep last 20)
    profile.recentInteractions.unshift({
      songId: song._id.toString(),
      songTitle: song.title,
      category: song.category,
      eventType,
      weight,
      featureVector: songVector,
      durationSec,
      timestamp: new Date(),
    });

    if (profile.recentInteractions.length > 20) {
      profile.recentInteractions = profile.recentInteractions.slice(0, 20);
    }

    profile.totalInteractions += 1;
    profile.lastShiftDetected = isShift;
    profile.shiftMagnitude = Math.round(distanceToShortTerm * 100) / 100;

    // --- SEQUENTIAL PROFILE RE-CALCULATION ---
    // Recency decay weighting over the last 6 valid interactions
    const recent = profile.recentInteractions.filter((e) => e.weight > 0).slice(0, 6);

    if (recent.length > 0) {
      const DECAY = 0.72; // Recency decay factor (lambda)
      const numDims = songVector.length;
      let shortSum = new Array(numDims).fill(0);
      let totalShortWeight = 0;

      for (let i = 0; i < recent.length; i++) {
        const item = recent[i];
        const decayedWeight = Math.pow(DECAY, i) * item.weight;
        totalShortWeight += decayedWeight;
        for (let d = 0; d < numDims; d++) {
          shortSum[d] += (item.featureVector[d] || 0.5) * decayedWeight;
        }
      }

      if (totalShortWeight > 0) {
        profile.shortTermProfile = shortSum.map((v) => Math.min(1.0, Math.max(0.0, v / totalShortWeight)));
      }
    }

    // Update long-term profile with moving average
    if (weight > 0) {
      const numDims = songVector.length;
      const ALPHA_LONG = 0.08;
      profile.longTermProfile = profile.longTermProfile.map((oldVal, d) => {
        const newVal = songVector[d] || oldVal;
        return oldVal * (1 - ALPHA_LONG) + newVal * ALPHA_LONG;
      });
    }

    // Blend Short-term and Long-term into Current Target Profile
    // If a shift was detected, increase short-term alpha to quickly adapt!
    const shortTermAlpha = isShift ? 0.85 : 0.65;
    profile.currentProfile = profile.currentProfile.map((_, d) => {
      const st = profile.shortTermProfile[d] || 0.5;
      const lt = profile.longTermProfile[d] || 0.5;
      return st * shortTermAlpha + lt * (1 - shortTermAlpha);
    });

    await profile.save();

    return {
      success: true,
      shiftDetected: isShift,
      shiftMagnitude: profile.shiftMagnitude,
      currentProfile: profile.currentProfile,
      totalInteractions: profile.totalInteractions,
    };
  }

  /**
   * Ranks candidate songs using Content-Based Similarity, Transition Compatibility,
   * and Maximal Marginal Relevance (MMR) for diversity, enforcing strict no-repeat cycles.
   */
  async getRecommendations(
    userId = "guest_default",
    {
      limit = 5,
      excludeSongId = null,
      excludeSongIds = [],
      audioMode = null,
      playlistSongIds = null,
      resetIfExhausted = false,
      lastCompletedSongId = null,
    } = {}
  ) {
    const profile = await this.getOrCreateProfile(userId);
    const targetVector = profile.currentProfile;

    // Retrieve songs from the library filtered strictly by audioMode if provided
    const query = {};
    if (audioMode && ["normal", "8d"].includes(audioMode.toLowerCase())) {
      query.audioMode = audioMode.toLowerCase();
    }
    let allSongs = await Song.find(query);

    // If scoped to a playlist, restrict allSongs to playlistSongIds
    if (playlistSongIds && Array.isArray(playlistSongIds) && playlistSongIds.length > 0) {
      const pSet = new Set(playlistSongIds.map((id) => id.toString()));
      allSongs = allSongs.filter((s) => pSet.has(s._id.toString()));
    }

    const totalEligible = allSongs.length;
    if (totalEligible === 0) {
      const emptyRes = [];
      emptyRes.cycleExhausted = true;
      emptyRes.totalEligible = 0;
      emptyRes.remainingUnplayed = 0;
      emptyRes.cycleReset = false;
      return emptyRes;
    }

    // Build complete exclusion set for the current cycle
    const exclusionSet = new Set();
    if (Array.isArray(excludeSongIds)) {
      excludeSongIds.forEach((id) => id && exclusionSet.add(id.toString()));
    }
    if (excludeSongId) {
      exclusionSet.add(excludeSongId.toString());
    }

    // Get last played song for transition continuity
    const lastInteraction = profile.recentInteractions.find((i) => i.weight > 0);
    let lastSong = null;
    if (lastInteraction) {
      lastSong = allSongs.find((s) => s._id.toString() === lastInteraction.songId);
    }

    // Filter unplayed candidates in the active cycle
    let candidates = allSongs.filter((song) => !exclusionSet.has(song._id.toString()));
    let cycleReset = false;
    let cycleExhausted = candidates.length === 0;

    // If cycle is exhausted and reset is requested (or if candidate pool is empty)
    if (cycleExhausted) {
      if (resetIfExhausted) {
        cycleReset = true;
        // Reset: allow all eligible songs, but avoid immediately repeating the last completed song if > 1 song exists
        if (totalEligible > 1 && lastCompletedSongId) {
          candidates = allSongs.filter((s) => s._id.toString() !== lastCompletedSongId.toString());
        } else {
          candidates = [...allSongs];
        }
      } else {
        // Return empty without repeating until client/caller explicitly completes cycle
        const emptyCycleRes = [];
        emptyCycleRes.cycleExhausted = true;
        emptyCycleRes.totalEligible = totalEligible;
        emptyCycleRes.remainingUnplayed = 0;
        emptyCycleRes.cycleReset = false;
        return emptyCycleRes;
      }
    }

    const remainingUnplayed = candidates.length;
    const pool = candidates;

    // Step 1: Score each candidate
    const scoredCandidates = pool.map((song) => {
      const songVector = song.audioFeatures?.vector || [0.42, 0.5, 0.5, 0.5, 0.5, 0.38, 0.5, 0.5, 0.85, 0.5];
      const similarity = cosineSimilarity(targetVector, songVector);

      // Transition smoothness based on tempo difference from previous track
      let transitionScore = 0.7;
      if (lastSong) {
        const lastBpm = lastSong.audioFeatures?.tempo || 100;
        const currentBpm = song.audioFeatures?.tempo || 100;
        const bpmDiff = Math.abs(lastBpm - currentBpm);
        // Gaussian bell curve over BPM delta (sigma = 35)
        transitionScore = Math.exp(-Math.pow(bpmDiff, 2) / (2 * Math.pow(35, 2)));
      }

      // Hybrid relevance score (70% profile match + 30% transition smoothness)
      const relevanceScore = 0.70 * similarity + 0.30 * transitionScore;

      return {
        song,
        vector: songVector,
        relevanceScore,
        similarity,
      };
    });

    // Step 2: Maximal Marginal Relevance (MMR) for diversity
    const MMR_LAMBDA = 0.75;
    const selected = [];
    const remaining = [...scoredCandidates];

    while (selected.length < limit && remaining.length > 0) {
      let bestIdx = -1;
      let bestMMR = -Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];

        // Max similarity to already selected recommendations
        let maxSimToSelected = 0;
        for (const sel of selected) {
          const sim = cosineSimilarity(candidate.vector, sel.vector);
          if (sim > maxSimToSelected) maxSimToSelected = sim;
        }

        // MMR score
        const mmr = MMR_LAMBDA * candidate.relevanceScore - (1 - MMR_LAMBDA) * maxSimToSelected;

        if (mmr > bestMMR) {
          bestMMR = mmr;
          bestIdx = i;
        }
      }

      if (bestIdx !== -1) {
        selected.push(remaining[bestIdx]);
        remaining.splice(bestIdx, 1);
      } else {
        break;
      }
    }

    // Step 3: Format output with grounded explanations
    const formatted = selected.map((item) => {
      const explanation = generateExplanation(
        item.song,
        profile,
        lastSong,
        profile.lastShiftDetected
      );

      return {
        song: item.song,
        matchScore: Math.round(Math.min(99, Math.max(60, item.relevanceScore * 100))),
        similarity: Math.round(item.similarity * 100) / 100,
        reason: explanation,
        audioFeatures: item.song.audioFeatures,
      };
    });

    formatted.cycleExhausted = cycleExhausted;
    formatted.totalEligible = totalEligible;
    formatted.remainingUnplayed = remainingUnplayed;
    formatted.cycleReset = cycleReset;

    return formatted;
  }

  /**
   * Content-based similar songs for "Because You Selected This".
   */
  async getSimilarSongs(songId, limit = 4, audioMode = null, excludeSongIds = []) {
    const targetSong = await Song.findById(songId);
    if (!targetSong) return [];

    const targetVector = targetSong.audioFeatures?.vector || [0.42, 0.5, 0.5, 0.5, 0.5, 0.38, 0.5, 0.5, 0.85, 0.5];
    const modeToUse = audioMode || targetSong.audioMode || null;
    const excludeSet = new Set(Array.isArray(excludeSongIds) ? excludeSongIds.map((id) => id.toString()) : []);
    excludeSet.add(targetSong._id.toString());

    const query = { _id: { $nin: Array.from(excludeSet) } };
    if (modeToUse && ["normal", "8d", "9d"].includes(modeToUse.toLowerCase())) {
      query.audioMode = modeToUse.toLowerCase();
    }
    let allSongs = await Song.find(query);
    if (allSongs.length === 0) {
      allSongs = await Song.find({
        _id: { $ne: targetSong._id },
        ...(modeToUse ? { audioMode: modeToUse.toLowerCase() } : {}),
      });
    }

    const scored = allSongs.map((song) => {
      const vec = song.audioFeatures?.vector || [0.42, 0.5, 0.5, 0.5, 0.5, 0.38, 0.5, 0.5, 0.85, 0.5];
      const sim = cosineSimilarity(targetVector, vec);
      return { song, similarity: sim };
    });

    scored.sort((a, b) => b.similarity - a.similarity);

    return scored.slice(0, limit).map((item) => {
      const bpm = item.song.audioFeatures?.tempo || 100;
      const targetBpm = targetSong.audioFeatures?.tempo || 100;
      return {
        song: item.song,
        similarity: Math.round(item.similarity * 100) / 100,
        matchScore: Math.round(item.similarity * 100),
        reason: `Shared acoustic signature with "${targetSong.title}" (${Math.round(bpm)} vs ${Math.round(targetBpm)} BPM)`,
      };
    });
  }

  /**
   * Resets the learned preference profile for a user.
   */
  async resetProfile(userId = "guest_default") {
    const neutralVector = [0.42, 0.5, 0.5, 0.5, 0.5, 0.38, 0.5, 0.5, 0.85, 0.5];
    await UserTasteProfile.findOneAndUpdate(
      { userId },
      {
        longTermProfile: neutralVector,
        shortTermProfile: neutralVector,
        currentProfile: neutralVector,
        recentInteractions: [],
        lastShiftDetected: false,
        shiftMagnitude: 0,
        totalInteractions: 0,
      },
      { upsert: true, new: true }
    );
    return { success: true, message: "Taste profile and interaction history reset." };
  }
}

module.exports = new RecommendationService();
