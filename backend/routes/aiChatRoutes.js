const express = require("express");
const router = express.Router();
const aiChatController = require("../controllers/aiChatController");

// POST /api/ai-chat/message - Send message to Milo & receive mood-tailored recommendations
router.post("/message", aiChatController.sendMessage);

// GET /api/ai-chat/prompts - Get quick mood starter treats
router.get("/prompts", aiChatController.getMoodPrompts);

module.exports = router;
