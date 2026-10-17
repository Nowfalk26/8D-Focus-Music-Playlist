import axios from "axios";
import staticSongs from "../data/songsData.json";

// Dynamically determine API Base URL
const isClient = typeof window !== "undefined";
const isLocalhost =
  isClient &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || (isLocalhost ? "http://localhost:5000/api" : "/api");
export const SERVER_BASE_URL =
  import.meta.env.VITE_SERVER_URL || (isLocalhost ? "http://localhost:5000" : "");

// Create Axios Instance with reasonable timeout to prevent hanging on mobile
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3500,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT Token if available
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {}
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized request or session expired");
    }
    return Promise.reject(error);
  }
);

// Backend Health Check
export const checkBackendHealth = async () => {
  try {
    const res = await axios.get(SERVER_BASE_URL || "/api", { timeout: 2500 });
    return { online: true, message: res.data };
  } catch (error) {
    return { online: false, error: error.message };
  }
};

// Auth APIs
export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
};

// Persistent Storage for User Added Songs
const USER_SONGS_STORAGE_KEY = "flow8d_user_added_songs";

export const getUserAddedSongs = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_SONGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to read user added songs:", e);
    return [];
  }
};

export const saveUserAddedSong = (songData) => {
  if (typeof window === "undefined") return songData;
  try {
    const existing = getUserAddedSongs();
    const songId =
      songData._id ||
      songData.id ||
      `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const completeSong = {
      ...songData,
      _id: songId,
      id: songId,
      isCustomAdded: true,
      createdAt: songData.createdAt || new Date().toISOString(),
    };

    // Filter out if duplicate ID exists, prepend newest first
    const updated = [
      completeSong,
      ...existing.filter((s) => String(s._id || s.id) !== String(songId)),
    ];
    localStorage.setItem(USER_SONGS_STORAGE_KEY, JSON.stringify(updated));

    // Dispatch global event so all open views immediately refresh
    window.dispatchEvent(
      new CustomEvent("flow8d_songs_updated", { detail: completeSong })
    );

    return completeSong;
  } catch (e) {
    console.error("Failed to persist user added song:", e);
    return songData;
  }
};

// Production-Resilient Songs API: Tries network API, merges user added songs, gracefully falls back to embedded catalog
export const songsApi = {
  getAll: async (params = {}) => {
    const userSongs = getUserAddedSongs();
    try {
      const res = await api.get("/songs", { params, timeout: 2500 });
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        // Merge user added songs at top so custom added songs are always available
        const mergedApi = [...userSongs, ...res.data.data];
        return {
          ...res,
          data: {
            ...res.data,
            data: mergedApi,
            count: mergedApi.length,
          },
        };
      }
    } catch (err) {
      // Graceful fallback to production catalog when on Vercel or offline
    }

    // Filter embedded production songs merged with user added songs
    let filtered = [...userSongs, ...staticSongs];
    const targetMode = params.mode || params.audioMode;
    if (targetMode) {
      const m = targetMode.toLowerCase();
      if (m === "9d") {
        // 9D Spatial Dimension uses 8D spatial audio tracks with 9D DSP binaural processing
        filtered = filtered.filter(
          (s) => (s.audioMode || "8d").toLowerCase() === "8d" || (s.audioMode || "").toLowerCase() === "9d"
        );
      } else {
        filtered = filtered.filter((s) => (s.audioMode || "8d").toLowerCase() === m);
      }
    }
    if (params.category && params.category !== "All") {
      const cat = params.category.toLowerCase();
      filtered = filtered.filter((s) => s.category?.toLowerCase() === cat);
    }
    if (params.genre && params.genre !== "All") {
      const gen = params.genre.toLowerCase();
      filtered = filtered.filter((s) => s.genre?.toLowerCase() === gen);
    }
    if (params.search) {
      const q = params.search.toLowerCase().trim();
      const qNorm = q.replace(/[.\-_]/g, " ").replace(/\s+/g, " ").trim();
      const qWords = qNorm.split(/\s+/).filter(Boolean);

      filtered = filtered.filter((s) => {
        const title = (s.title || "").toLowerCase();
        const artist = (s.artist || "").toLowerCase();
        const composer = (s.composer || "").toLowerCase();
        const album = (s.album || "").toLowerCase();
        const category = (s.category || "").toLowerCase();
        const genre = (s.genre || "").toLowerCase();

        const combined = `${title} ${artist} ${composer} ${album} ${category} ${genre}`;
        if (combined.includes(q)) return true;

        const combinedNorm = combined.replace(/[.\-_]/g, " ").replace(/\s+/g, " ");
        if (combinedNorm.includes(qNorm)) return true;

        return qWords.length > 0 && qWords.every((w) => combinedNorm.includes(w));
      });
    }

    return {
      status: 200,
      data: {
        success: true,
        count: filtered.length,
        data: filtered,
      },
    };
  },

  getById: async (id) => {
    const userSongs = getUserAddedSongs();
    const userSong = userSongs.find((s) => String(s._id || s.id) === String(id));
    if (userSong) {
      return {
        status: 200,
        data: {
          success: true,
          data: userSong,
        },
      };
    }

    try {
      const res = await api.get(`/songs/${id}`, { timeout: 2500 });
      if (res.data?.data) return res;
    } catch (e) {}

    const song = staticSongs.find((s) => String(s._id || s.id) === String(id));
    return {
      status: song ? 200 : 404,
      data: {
        success: Boolean(song),
        data: song || null,
      },
    };
  },

  create: async (songData) => {
    // 1. Permanently save locally so it's guaranteed to persist across refreshes
    const savedSong = saveUserAddedSong(songData);

    // 2. Also attempt backend API call if online / MongoDB is active
    try {
      const res = await api.post("/songs", savedSong);
      if (res.data?.data) {
        return res;
      }
    } catch (e) {
      // Backend may be offline or static hosting; localStorage backup is already preserved
    }

    return {
      status: 201,
      data: {
        success: true,
        data: savedSong,
      },
    };
  },
  update: (id, songData) => api.put(`/songs/${id}`, songData),
  delete: (id) => {
    // Also delete from local storage if present
    if (typeof window !== "undefined") {
      try {
        const existing = getUserAddedSongs();
        const updated = existing.filter((s) => String(s._id || s.id) !== String(id));
        localStorage.setItem(USER_SONGS_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("flow8d_songs_updated"));
      } catch (e) {}
    }
    return api.delete(`/songs/${id}`).catch(() => ({ status: 200, data: { success: true } }));
  },
};

// Production-Resilient Categories API
export const categoriesApi = {
  getAll: async () => {
    try {
      const res = await api.get("/categories", { timeout: 2500 });
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res;
      }
    } catch (e) {}

    // Extract unique categories from static songs
    const uniqueCats = Array.from(
      new Set(staticSongs.map((s) => s.category).filter(Boolean))
    ).map((name, idx) => ({ _id: `cat_${idx}`, name }));

    return {
      status: 200,
      data: {
        success: true,
        count: uniqueCats.length,
        data: uniqueCats,
      },
    };
  },
  getById: (id) => api.get(`/categories/${id}`),
  create: (categoryData) => api.post("/categories", categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Users APIs (Admin only)
export const usersApi = {
  getAll: () => api.get("/auth/users"),
  delete: (id) => api.delete(`/auth/users/${id}`),
  create: (userData) => api.post("/auth/register", userData),
};

// Production-Resilient Machine Learning Recommendation Engine APIs
export const recommendationsApi = {
  getRecommendations: async (params = {}) => {
    // Only attempt network requests on localhost or when explicit API_URL is set,
    // avoiding 405 Method Not Allowed on static Vercel rewrites
    if (isLocalhost && !SERVER_BASE_URL.startsWith("/")) {
      try {
        const res =
          params && params.excludeSongIds && params.excludeSongIds.length > 5
            ? await api.post("/recommendations", params, { timeout: 2500 })
            : await api.get("/recommendations", { params, timeout: 2500 });
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          return res;
        }
      } catch (e) {
        // Fallback to instant client-side vector recommendations
      }
    }

    // Client-side 10-Dimensional vector similarity ranking
    const targetMode = (params.mode || "8d").toLowerCase();
    const excludeSet = new Set((params.excludeSongIds || []).map(String));
    let candidates = staticSongs.filter((s) => {
      const mode = (s.audioMode || "8d").toLowerCase();
      if (targetMode === "9d") return mode === "8d" || mode === "9d";
      return mode === targetMode;
    });
    candidates = candidates.filter((s) => !excludeSet.has(String(s._id || s.id)));

    if (candidates.length === 0) {
      candidates = staticSongs.filter((s) => {
        const mode = (s.audioMode || "8d").toLowerCase();
        if (targetMode === "9d") return mode === "8d" || mode === "9d";
        return mode === targetMode;
      });
    }

    const baselineVector = [0.38, 0.5, 0.5, 0.5, 0.5, 0.35, 0.5, 0.5, 0.85, 0.5];
    const ranked = candidates.map((song) => {
      const vec = song.audioFeatures?.vector || baselineVector;
      let dot = 0,
        normA = 0,
        normB = 0;
      for (let i = 0; i < vec.length; i++) {
        dot += vec[i] * baselineVector[i];
        normA += vec[i] * vec[i];
        normB += baselineVector[i] * baselineVector[i];
      }
      const sim =
        normA > 0 && normB > 0
          ? dot / (Math.sqrt(normA) * Math.sqrt(normB))
          : 0.85;
      const matchScore = Math.min(99, Math.max(76, Math.round(sim * 100)));
      return {
        song,
        matchScore,
        similarity: Math.round(sim * 100) / 100,
        reason: `Harmonically matched for ${targetMode.toUpperCase()} acoustic orbit`,
        audioFeatures: song.audioFeatures,
      };
    });

    ranked.sort((a, b) => b.matchScore - a.matchScore);
    const limit = params.limit || 5;

    return {
      status: 200,
      data: {
        success: true,
        data: ranked.slice(0, limit),
        totalEligible: candidates.length,
        remainingUnplayed: candidates.length,
      },
    };
  },

  recordInteraction: async (data) => {
    // Only dispatch network POST if running on a real backend (localhost or custom server),
    // preventing 405 Method Not Allowed on static Vercel single-page rewrites
    if (isLocalhost && !SERVER_BASE_URL.startsWith("/")) {
      try {
        return await api.post("/recommendations/interaction", data, { timeout: 2000 });
      } catch (e) {
        // Ignored in fallback
      }
    }
    return { data: { success: true } };
  },

  getProfile: async (params) => {
    if (isLocalhost && !SERVER_BASE_URL.startsWith("/")) {
      try {
        const res = await api.get("/recommendations/profile", { params, timeout: 2000 });
        if (res.data?.data) return res;
      } catch (e) {}
    }

    return {
      status: 200,
      data: {
        success: true,
        data: {
          currentProfile: [0.38, 0.5, 0.5, 0.5, 0.5, 0.35, 0.5, 0.5, 0.85, 0.5],
          interactionCounts: { play: 10, completed: 6 },
          dominantVibe: "Deep Focus Flow",
        },
      },
    };
  },

  resetProfile: async (data) => {
    if (isLocalhost && !SERVER_BASE_URL.startsWith("/")) {
      try {
        return await api.post("/recommendations/reset", data, { timeout: 2000 });
      } catch (e) {}
    }
    return { data: { success: true } };
  },

  getSimilarSongs: async (id, params) => {
    if (isLocalhost && !SERVER_BASE_URL.startsWith("/")) {
      try {
        const res = await api.get(`/recommendations/similar/${id}`, { params, timeout: 2500 });
        if (res.data?.data) return res;
      } catch (e) {}
    }

    const pool = staticSongs.filter((s) => String(s._id || s.id) !== String(id));
    return { data: { success: true, data: pool.slice(0, 5) } };
  },
};

// Production-Resilient Milo AI Assistant
export const aiChatApi = {
  sendMessage: async (data) => {
    try {
      const res = await api.post("/ai-chat/message", data, { timeout: 4000 });
      if (res.data?.success) return res;
    } catch (e) {}

    const userText = (data.message || "").toLowerCase();
    const mode = (data.audioMode || "8d").toLowerCase();
    const modeSongs = staticSongs.filter(
      (s) => (s.audioMode || "8d").toLowerCase() === mode
    );

    let messages = [];
    let recSongs = [];

    if (
      userText.includes("sad") ||
      userText.includes("crying") ||
      userText.includes("heartbreak") ||
      userText.includes("alone") ||
      userText.includes("pain")
    ) {
      messages = [
        "Hey... I can sense you're carrying a lot right now. 💙",
        "It's completely okay to feel this way. Take a slow, deep breath with me.",
        "I picked out these soulful tracks to sit with you through this. Put your headphones on and let the sound comfort you.",
      ];
      recSongs = modeSongs.slice(0, 3);
    } else if (
      userText.includes("stress") ||
      userText.includes("anxious") ||
      userText.includes("tired") ||
      userText.includes("overwhelm")
    ) {
      messages = [
        "I hear you. The pressure can feel so heavy sometimes. 🌿",
        "Let's quiet the noise around you for a few moments. You've been trying so hard.",
        "Here are calming acoustic tracks to soothe your mind and slow your heart down.",
      ];
      recSongs = modeSongs.slice(3, 6);
    } else if (
      userText.includes("focus") ||
      userText.includes("study") ||
      userText.includes("code") ||
      userText.includes("work")
    ) {
      messages = [
        "Time to get locked in! 🎯",
        "Setting up your binaural soundstage now. Let's block out every single distraction.",
        "Here are deep flow-state tracks to help you dial in and conquer your session.",
      ];
      recSongs = modeSongs.slice(6, 9);
    } else if (
      userText.includes("gym") ||
      userText.includes("workout") ||
      userText.includes("hype") ||
      userText.includes("kuthu") ||
      userText.includes("energy")
    ) {
      messages = [
        "LET'S GOOO! 🔥 The energy is through the roof!",
        "Crank up the volume on these high-voltage Tamil beats and let's crush it!",
      ];
      recSongs = modeSongs.slice(9, 12);
    } else {
      messages = [
        "I'm right here with you! 😊 What's on your mind today?",
        "I tuned your soundstage with these trending hits to keep your vibe just right.",
      ];
      recSongs = modeSongs.slice(0, 3);
    }

    return {
      status: 200,
      data: {
        success: true,
        messages,
        reply: messages.join("\n\n"),
        recommendedSongs: recSongs,
        detectedEmotion: "Understood & Supported",
        catMood: "comforting_cuddle",
      },
    };
  },

  getPrompts: async () => {
    try {
      const res = await api.get("/ai-chat/prompts", { timeout: 2000 });
      if (res.data?.prompts) return res;
    } catch (e) {}

    return {
      status: 200,
      data: {
        success: true,
        prompts: [
          "I'm feeling heartbroken and exhausted 💔",
          "Need deep focus for coding and studying 💻",
          "Feeling stressed, play something calming 🌿",
          "High energy workout & hype beats 🔥",
          "Recommend something soulful for a late drive 🌙",
        ],
      },
    };
  },
};

export default api;
