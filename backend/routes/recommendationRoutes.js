const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");

// Get personalized recommendations (GET or POST for large exclusion bodies)
router.get("/", recommendationController.getRecommendations);
router.post("/", recommendationController.getRecommendations);

// Record user interaction (selection, playback, duration, skip, favorite)
router.post("/interaction", recommendationController.recordInteraction);

// Get current learned taste profile & dimension metrics
router.get("/profile", recommendationController.getProfile);

// Reset learned preferences and history
router.post("/reset", recommendationController.resetProfile);

// Get content-based similar songs ("Because You Selected This")
router.get("/similar/:id", recommendationController.getSimilarSongs);

module.exports = router;
