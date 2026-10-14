const recommendationService = require("../services/recommendationService");

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || req.body?.userId || "guest_default";
    const limit = parseInt(req.query.limit || req.body?.limit, 10) || 5;
    const excludeSongId = req.query.excludeSongId || req.body?.excludeSongId || null;
    const audioMode = req.query.mode || req.query.audioMode || req.body?.audioMode || req.body?.mode || null;

    // Parse excludeSongIds (support array, JSON string, or comma-separated string)
    let excludeSongIds = [];
    const rawExclude = req.query.excludeSongIds || req.body?.excludeSongIds;
    if (Array.isArray(rawExclude)) {
      excludeSongIds = rawExclude;
    } else if (typeof rawExclude === "string") {
      try {
        const parsed = JSON.parse(rawExclude);
        excludeSongIds = Array.isArray(parsed) ? parsed : [rawExclude];
      } catch (e) {
        excludeSongIds = rawExclude.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    // Parse playlistSongIds (if request is scoped to a playlist)
    let playlistSongIds = null;
    const rawPlaylist = req.query.playlistSongIds || req.body?.playlistSongIds;
    if (Array.isArray(rawPlaylist)) {
      playlistSongIds = rawPlaylist;
    } else if (typeof rawPlaylist === "string") {
      try {
        const parsed = JSON.parse(rawPlaylist);
        playlistSongIds = Array.isArray(parsed) ? parsed : [rawPlaylist];
      } catch (e) {
        playlistSongIds = rawPlaylist.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    const resetIfExhausted = req.query.resetIfExhausted === "true" || req.body?.resetIfExhausted === true;
    const lastCompletedSongId = req.query.lastCompletedSongId || req.body?.lastCompletedSongId || null;

    const recommendations = await recommendationService.getRecommendations(userId, {
      limit,
      excludeSongId,
      excludeSongIds,
      audioMode,
      playlistSongIds,
      resetIfExhausted,
      lastCompletedSongId,
    });

    res.status(200).json({
      success: true,
      data: recommendations,
      cycleExhausted: recommendations.cycleExhausted || false,
      cycleReset: recommendations.cycleReset || false,
      totalEligible: recommendations.totalEligible || 0,
      remainingUnplayed: recommendations.remainingUnplayed || 0,
    });
  } catch (error) {
    console.error("Error in getRecommendations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate recommendations",
      error: error.message,
    });
  }
};

exports.recordInteraction = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId || "guest_default";
    const { songId, eventType, durationSec } = req.body;

    if (!songId || !eventType) {
      return res.status(400).json({
        success: false,
        message: "songId and eventType are required",
      });
    }

    const result = await recommendationService.recordInteraction(userId, {
      songId,
      eventType,
      durationSec: durationSec || 0,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in recordInteraction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record interaction",
      error: error.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || "guest_default";
    const profile = await recommendationService.getOrCreateProfile(userId);

    // Map 10D vector to named feature dimensions for front-end charts:
    // [norm_tempo, energy, danceability, valence, acousticness, centroid, contrast, binaural, spatial, calmness]
    const labels = [
      "Tempo (BPM)",
      "Acoustic Energy",
      "Danceability / Rhythm",
      "Valence / Positivity",
      "Acousticness",
      "Spectral Brightness",
      "Harmonic Contrast",
      "Binaural Alignment",
      "8D Spatial Depth",
      "Calmness / Focus",
    ];

    const currentVector = profile.currentProfile || [];
    const dimensionBreakdown = labels.map((label, idx) => ({
      dimension: label,
      value: Math.round((currentVector[idx] || 0.5) * 100),
    }));

    res.status(200).json({
      success: true,
      data: {
        userId: profile.userId,
        currentProfile: profile.currentProfile,
        shortTermProfile: profile.shortTermProfile,
        longTermProfile: profile.longTermProfile,
        dimensionBreakdown,
        lastShiftDetected: profile.lastShiftDetected,
        shiftMagnitude: profile.shiftMagnitude,
        totalInteractions: profile.totalInteractions,
        recentInteractions: profile.recentInteractions.slice(0, 8),
      },
    });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user taste profile",
      error: error.message,
    });
  }
};

exports.resetProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId || "guest_default";
    const result = await recommendationService.resetProfile(userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in resetProfile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset taste profile",
      error: error.message,
    });
  }
};

exports.getSimilarSongs = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit, 10) || 4;
    const audioMode = req.query.mode || req.query.audioMode || null;

    let excludeSongIds = [];
    const rawExclude = req.query.excludeSongIds;
    if (Array.isArray(rawExclude)) {
      excludeSongIds = rawExclude;
    } else if (typeof rawExclude === "string") {
      try {
        const parsed = JSON.parse(rawExclude);
        excludeSongIds = Array.isArray(parsed) ? parsed : [rawExclude];
      } catch (e) {
        excludeSongIds = rawExclude.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    const similar = await recommendationService.getSimilarSongs(id, limit, audioMode, excludeSongIds);

    res.status(200).json({
      success: true,
      data: similar,
    });
  } catch (error) {
    console.error("Error in getSimilarSongs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve similar songs",
      error: error.message,
    });
  }
};
