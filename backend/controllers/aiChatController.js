const aiMoodService = require("../services/aiMoodService");

// Handle AI Cat message & mood song recommendations
exports.sendMessage = async (req, res) => {
  try {
    const { message, history, mode, audioMode } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required."
      });
    }

    const currentMode = mode || audioMode || null;
    const result = await aiMoodService.processChatMessage(message, history || [], currentMode);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("AI Chat Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Milo had a momentary nap! Please try again.",
      error: error.message
    });
  }
};

// Get pre-defined mood prompts for quick treats
exports.getMoodPrompts = async (req, res) => {
  try {
    const prompts = [
      { id: "stress", emoji: "🍃", label: "Stressed & Overthinking", query: "I'm feeling really stressed out and overwhelmed today, need peace" },
      { id: "coding", emoji: "💻", label: "Late Night Code Flow", query: "Late night coding session, need focus and rhythmic 8D flow" },
      { id: "hype", emoji: "⚡", label: "Maximum Zoomies / Hype", query: "Gym workout time! Need heavy bass kuthu and high energy" },
      { id: "heartbreak", emoji: "💔", label: "In My Feels / Crying", query: "Heartbroken and feeling down today, need comforting melodies" },
      { id: "sunset", emoji: "🚗", label: "Sunset Highway Drive", query: "Long drive with friends during sunset, need feel good breezy songs" },
      { id: "retro", emoji: "📻", label: "Nostalgic 90s Memories", query: "Missing old days, play some vintage Ilaiyaraaja nostalgia" },
      { id: "love", emoji: "💖", label: "Butterflies & Romance", query: "Thinking about someone special, need sweet romantic vibes" },
      { id: "gana", emoji: "🥁", label: "Local Gana Street Beat", query: "Local Chennai Gana beat venum thalaiva!" }
    ];

    return res.status(200).json({
      success: true,
      data: prompts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
