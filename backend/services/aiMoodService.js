require("dotenv").config();
const Song = require("../models/Song");

// 10-Dimensional Acoustic Profiles for mood ranking
const MOOD_PROFILES = {
  heartbreak_sad: {
    emotion: "Heartbroken & Healing",
    catMood: "comforting_cuddle",
    targetVector: [0.25, 0.35, 0.38, 0.32, 0.85, 0.28, 0.35, 0.35, 0.85, 0.88],
    preferredCategories: ["Tamil Melodies 8D", "Tamil Ambient Relax"]
  },
  stress_burnout_calm: {
    emotion: "Stressed & Seeking Peace",
    catMood: "peaceful_loaf",
    targetVector: [0.2, 0.28, 0.32, 0.42, 0.9, 0.22, 0.3, 0.3, 0.85, 0.94],
    preferredCategories: ["Tamil Ambient Relax", "Nature 8D", "Relaxation", "Tamil Melodies 8D"]
  },
  coding_focus_flow: {
    emotion: "Deep Coding & Focus Flow",
    catMood: "headphone_dj",
    targetVector: [0.45, 0.58, 0.62, 0.55, 0.45, 0.45, 0.55, 0.5, 0.85, 0.68],
    preferredCategories: ["Deep Focus", "Energetic Focus", "Tamil Melodies 8D", "Tamil Movie Hits"]
  },
  hype_workout_kuthu: {
    emotion: "High Energy & Beast Mode",
    catMood: "cat_zoomies",
    targetVector: [0.75, 0.95, 0.92, 0.88, 0.18, 0.75, 0.82, 0.78, 0.85, 0.12],
    preferredCategories: ["Tamil High Energy", "Tamil Gana & Folk", "Tamil Movie Hits"]
  },
  romantic_love: {
    emotion: "Sweet Romance & Butterflies",
    catMood: "lovestruck_paws",
    targetVector: [0.35, 0.55, 0.64, 0.78, 0.65, 0.45, 0.52, 0.45, 0.85, 0.72],
    preferredCategories: ["Tamil Melodies 8D", "Tamil Indie & Creators", "Tamil Indie & Pop"]
  },
  sunset_travel_drive: {
    emotion: "Breezy Drive & Adventure",
    catMood: "breezy_adventure",
    targetVector: [0.48, 0.72, 0.78, 0.8, 0.48, 0.52, 0.6, 0.55, 0.85, 0.58],
    preferredCategories: ["Tamil Melodies 8D", "Tamil Indie & Creators", "Tamil High Energy"]
  },
  nostalgia_retro: {
    emotion: "Warm Nostalgia & 90s Memories",
    catMood: "vintage_gramophone",
    targetVector: [0.3, 0.45, 0.5, 0.6, 0.78, 0.38, 0.45, 0.42, 0.85, 0.8],
    preferredCategories: ["Tamil Retro Classics", "Tamil Melodies 8D"]
  },
  gana_street_folk: {
    emotion: "Chennai Gana & Local Folk",
    catMood: "street_gana_cat",
    targetVector: [0.72, 0.92, 0.92, 0.88, 0.25, 0.68, 0.78, 0.75, 0.85, 0.16],
    preferredCategories: ["Tamil Gana & Folk", "Tamil High Energy"]
  },
  casual_friendly: {
    emotion: "Warm Friendship & Chill",
    catMood: "happy_pet",
    targetVector: [0.38, 0.52, 0.6, 0.68, 0.6, 0.4, 0.48, 0.45, 0.85, 0.75],
    preferredCategories: ["Tamil Melodies 8D", "Tamil Indie & Creators"]
  }
};

// Check if user explicitly asked for music recommendations
function checkIfUserAskedForMusic(text) {
  const lower = text.toLowerCase();
  const musicTriggers = [
    "suggest song", "suggest songs", "recommend song", "recommend songs",
    "play song", "play songs", "play music", "play something",
    "paatu podu", "paattu podu", "paatu kudu", "paattu kudu",
    "give me songs", "give me music", "song recommendation",
    "music recommendation", "what should i listen", "listen to music",
    "queue song", "put some music", "songs for this", "music for this",
    "suggest some", "recommend some", "playlist"
  ];
  return musicTriggers.some((trigger) => lower.includes(trigger));
}

// Cosine similarity
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Find top candidate songs matching the target vector
async function findSongsForMood(targetVector, preferredCategories, limit = 3, audioMode = null) {
  const query = {};
  if (audioMode && ["normal", "8d", "9d"].includes(audioMode.toLowerCase())) {
    query.audioMode = audioMode.toLowerCase();
  }
  const songs = await Song.find(query);
  if (!songs || songs.length === 0) return [];

  const scored = songs.map((s) => {
    const songVec = s.audioFeatures?.vector || [0.4, 0.5, 0.5, 0.5, 0.5, 0.4, 0.5, 0.5, 0.85, 0.5];
    let sim = cosineSimilarity(targetVector, songVec);

    if (preferredCategories && preferredCategories.includes(s.category)) {
      sim += 0.08;
    }

    return {
      song: s,
      matchScore: Math.min(99, Math.round(sim * 100)),
      similarity: sim
    };
  });

  scored.sort((a, b) => b.similarity - a.similarity);

  const seenTitles = new Set();
  const selected = [];
  for (const item of scored) {
    const key = item.song.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      selected.push(item);
      if (selected.length >= limit) break;
    }
  }

  return selected;
}

function safeJsonParse(rawText) {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Fallback regex field extractor if JSON has unescaped quotes
    const replyMatch = cleaned.match(/"reply"\s*:\s*"([\s\S]*?)(?<!\\)"\s*,/);
    const catMoodMatch = cleaned.match(/"catMood"\s*:\s*"([^"]+)"/);
    const emotionMatch = cleaned.match(/"emotion"\s*:\s*"([^"]+)"/);
    const wantsMatch = cleaned.match(/"wantsSongRecommendation"\s*:\s*(true|false)/);
    const acousticMatch = cleaned.match(/"acousticMood"\s*:\s*"([^"]+)"/);
    if (replyMatch) {
      return {
        reply: replyMatch[1].replace(/\\"/g, '"').replace(/\\n/g, "\n"),
        catMood: catMoodMatch ? catMoodMatch[1] : "comforting_cuddle",
        emotion: emotionMatch ? emotionMatch[1] : "Deep Conversation",
        wantsSongRecommendation: wantsMatch ? wantsMatch[1] === "true" : false,
        acousticMood: acousticMatch ? acousticMatch[1] : "casual_friendly"
      };
    }
    return null;
  }
}

// Primary AI: Google Gemini Generation with Resilient Model Failover
async function generateWithGemini(message, chatHistory = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const candidateModels = [
    process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.1-flash-lite"
  ];

  const systemPrompt = `You are a real, caring, ride-or-die best friend and personal emotional companion named Milo.

CRITICAL INSTRUCTIONS ON TONE & IDENTITY:
1. DO NOT ACT OR TALK LIKE A CAT. Never use feline words (no "meow", "purr", "paws", "hooman", "whiskers", "hops on lap", etc.). Do NOT do animal roleplay.
2. Talk 100% like a real human best friend: warm, grounded, compassionate, witty, and loyal.
3. Converse naturally in genuine English with friendly Tanglish/Tamil touches when fitting ("Macha", "Bro", "Nanba", "Dei", "Aiyooo", "Chill pannu", "Kavala padatha da", "Enna aachu bro?").
4. 70% EMOTIONAL UNDERSTANDING & CONVERSATION: Focus deeply on what the user says. Acknowledge their situation, validate their feelings, listen to their problems, share advice or encouragement, joke with them, or ask follow-up questions like a true buddy.
5. 30% SONG SUGGESTION RULE:
   - Set "wantsSongRecommendation": true ONLY IF the user explicitly asked for song or music recommendations (e.g. "suggest songs", "give me music", "play something").
   - If the user is just venting, talking about work, life, sadness, love, or chatting, set "wantsSongRecommendation": false. In this case, DO NOT talk about music at all; focus entirely on listening, comforting, and being a friend.
6. NEVER give generic, robotic, repetitive template answers! Each response must be uniquely tailored to their exact words and feelings.

Respond ONLY with valid JSON conforming to this schema:
{
  "reply": "Your warm, thoughtful, friendly response speaking directly as their real best friend",
  "companionMood": "caring_support | attentive_listen | hype_celebrate | chill_relax | thoughtful_deep",
  "emotion": "Brief label of their current emotional mindset (e.g. Work Stress, Heartbroken, Motivated, Casual)",
  "wantsSongRecommendation": boolean,
  "acousticMood": "heartbreak_sad | stress_burnout_calm | coding_focus_flow | hype_workout_kuthu | romantic_love | sunset_travel_drive | nostalgia_retro | gana_street_folk | casual_friendly"
}`;

  const contents = [];

  // Append up to last 6 chat history turns for true contextual awareness
  if (Array.isArray(chatHistory)) {
    for (const h of chatHistory.slice(-6)) {
      if (h.text && h.sender) {
        contents.push({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      }
    }
  }

  // Add current user prompt
  contents.push({
    role: "user",
    parts: [{ text: `${systemPrompt}\n\nUser message: "${message}"` }]
  });

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.8,
            maxOutputTokens: 1200
          }
        })
      });

      if (!res.ok) {
        console.warn(`Model ${model} returned ${res.status}, trying fallback...`);
        continue;
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = safeJsonParse(rawText);
        if (parsed && parsed.reply) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`Model ${model} encountered error:`, err.message);
    }
  }

  return null;
}

// Intelligent Secondary Engine (Ensures 70/30 ratio even if offline)
function generateContextualFallback(message) {
  const lower = message.toLowerCase();
  const explicitlyAskedForMusic = checkIfUserAskedForMusic(message);

  let reply = "";
  let companionMood = "attentive_listen";
  let emotion = "Casual Chat & Chill";
  let acousticMood = "casual_friendly";

  if (lower.includes("manager") || lower.includes("boss") || lower.includes("office") || lower.includes("work")) {
    companionMood = "caring_support";
    emotion = "Work Pressure & Stress";
    acousticMood = "stress_burnout_calm";
    reply = "Aiyooo, corporate stress ah macha? Look, managers often take out their frustration on good people, but that does NOT define who you are. Take a deep breath, step away from the screen for 5 minutes, and drink some water. I'm right here with you bro. You did your best today!";
  } else if (lower.includes("exam") || lower.includes("college") || lower.includes("arrear") || lower.includes("assignment")) {
    companionMood = "caring_support";
    emotion = "Academic Stress & Exams";
    acousticMood = "coding_focus_flow";
    reply = "Exams and college deadlines can be really overwhelming bro, I totally get it. But don't doubt yourself. Break things into smaller chunks, take breaks, and tackle it step by step. We're going to get through this together, nanba!";
  } else if (lower.includes("breakup") || lower.includes("she left") || lower.includes("he left") || lower.includes("crying") || lower.includes("heartbreak") || lower.includes("alone") || lower.includes("lonely")) {
    companionMood = "caring_support";
    emotion = "Heartbreak & Emotional Pain";
    acousticMood = "heartbreak_sad";
    reply = "Dei macha... I'm so sorry you're hurting right now. It is completely okay to cry and feel vulnerable. Don't bottle it up. You are loved, you matter, and I'm not leaving your side bro. Take it one breath at a time.";
  } else if (lower.includes("crush") || lower.includes("love") || lower.includes("butterflies") || lower.includes("propose")) {
    companionMood = "hype_celebrate";
    emotion = "Sweet Romance & Crushes";
    acousticMood = "romantic_love";
    reply = "Ohohooo! Love is in the air, macha! Tell me everything! Did you talk to them? Butterflies in the tummy are the most exciting feeling in the world, bro! I'm rooting for you 100%!";
  } else if (lower.includes("sapdiya") || lower.includes("eat") || lower.includes("dinner") || lower.includes("lunch") || lower.includes("food")) {
    companionMood = "chill_relax";
    emotion = "Daily Life & Food Check-in";
    acousticMood = "casual_friendly";
    reply = "Haha yes macha, I'm all set! Neenga saaptela? Please make sure to eat on time and stay hydrated, don't skip meals while working! What are you having today?";
  } else if (lower.includes("joke") || lower.includes("laugh") || lower.includes("funny")) {
    companionMood = "hype_celebrate";
    emotion = "Playful & Cheerful";
    acousticMood = "hype_workout_kuthu";
    reply = "Haha check this out macha: Why did the computer catch a cold? Because it left its Windows open! A bit silly, but hope that brought a smile to your face today, bro!";
  } else if (lower.includes("gym") || lower.includes("workout") || lower.includes("kuthu") || lower.includes("hype") || lower.includes("dance")) {
    companionMood = "hype_celebrate";
    emotion = "High Energy & Beast Mode";
    acousticMood = "hype_workout_kuthu";
    reply = "YES MACHA!! Time to crush that workout and leave zero regrets! Let's get that adrenaline pumping and dominate the day together, bro!";
  } else if (lower.includes("sleep") || lower.includes("tired") || lower.includes("exhausted") || lower.includes("peace")) {
    companionMood = "chill_relax";
    emotion = "Tired & Seeking Rest";
    acousticMood = "stress_burnout_calm";
    reply = "You've worked so hard today, macha. Let the world pause for a while. Close your eyes, let your shoulders drop, and just rest your mind. Sleep peacefully, bro.";
  } else {
    companionMood = "attentive_listen";
    emotion = "Attentive & Listening";
    acousticMood = "casual_friendly";
    reply = "I hear you completely, macha! Tell me more about what's on your mind. How are you really holding up today? I'm right here listening like a true buddy!";
  }

  // If user explicitly asked for songs, append friendly transition
  if (explicitlyAskedForMusic) {
    reply += " 🎧 I picked these special 8D songs that fit this exact mood—take a listen, it might help you unwind!";
  }

  return {
    reply,
    companionMood,
    emotion,
    wantsSongRecommendation: explicitlyAskedForMusic,
    acousticMood
  };
}

// Master Message Processor
async function processChatMessage(message, chatHistory = [], audioMode = null) {
  const explicitlyAsked = checkIfUserAskedForMusic(message);

  // 1. Try Google Gemini first for deep, dynamic, human-like empathy
  let aiResult = await generateWithGemini(message, chatHistory);

  // 2. Fall back to contextual engine if Gemini is unavailable
  if (!aiResult || !aiResult.reply) {
    aiResult = generateContextualFallback(message);
  }

  // Enforce strict 70/30 user rule:
  // If user did NOT ask for music, do NOT send songs! Focus 100% on friendly conversation!
  const shouldRecommendSongs = explicitlyAsked || aiResult.wantsSongRecommendation === true;

  let matchedSongs = [];
  if (shouldRecommendSongs) {
    const profileKey = aiResult.acousticMood || "casual_friendly";
    const profile = MOOD_PROFILES[profileKey] || MOOD_PROFILES.casual_friendly;

    const rawSongs = await findSongsForMood(
      profile.targetVector,
      profile.preferredCategories,
      3,
      audioMode
    );

    matchedSongs = rawSongs.map((m) => ({
      _id: m.song._id,
      title: m.song.title,
      artist: m.song.artist,
      category: m.song.category,
      audioUrl: m.song.audioUrl,
      imageUrl: m.song.imageUrl,
      duration: m.song.duration,
      matchScore: m.matchScore,
      reason: `Milo's pick for your ${aiResult.emotion?.toLowerCase() || "mindset"}`
    }));
  }

  return {
    reply: aiResult.reply,
    companionMood: aiResult.companionMood || aiResult.catMood || "caring_support",
    catMood: aiResult.catMood || aiResult.companionMood || "happy_pet",
    emotion: aiResult.emotion || "Listening with Care",
    wantsSongRecommendation: shouldRecommendSongs,
    songs: matchedSongs // Empty array when user is just chatting!
  };
}

module.exports = {
  processChatMessage,
  checkIfUserAskedForMusic,
  MOOD_PROFILES
};
