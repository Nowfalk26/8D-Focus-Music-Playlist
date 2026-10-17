import React, { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import { songsApi, categoriesApi } from "../api/api";
import staticSongs from "../data/songsData.json";
import QuickAddSongModal from "./QuickAddSongModal";

const DEFAULT_COVER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCYHY4hp0r-GSzPdesFf5Z5mHQjlDX8zkLIjOdCA_IqUU_uw_nFr73ANifvOdaM2Q0NTsbK9ZB4CakHGH5fOSwA-_HynlD80C-hNL1oquc1m9K6gETHr9tKwpVJsxr8i3yXt8MxzxgSfUOhVYLQ8IqgfrlSGKs-61qE80eejtCqn6bE6dEiNbaAVFjYTn5bXQizoK0XcGh2VyyPyVMbGgVbr-Vnz7APr5Vg8HSuKiI1D50YhAVg3lfgaQ";

// Stitch Initial Recent Searches
const INITIAL_RECENT_SEARCHES = [
  {
    id: "kendrick",
    name: "Kendrick Lamar",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBQFFBWaiik6T73UbxndP7lXo9KiZWHmTDcyASiKWq_P0nnXJB4-UDbuZllGfJ8zTNhTVMhuajowkTQIh7C4fQdwKwvnoEI6aqu9R37PfqiJUo3elAnZc3ERAKzUf1zMVOincHn6Pp_uleVH_PBhXi5LuVvqrP1gXkaG3FJrtGePRyRJTJnFtEl3vT6q7SL7uH2ow2eENRXLrGnr7QSxMd68wNza2uz0yhl85d0GDB-M0CqfU8x63_j",
  },
  {
    id: "lofi",
    name: "Chill Lo-Fi Beats",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDa-8GsjP-F6oAn3UFMTCq2p7j3fVcw5_1rr-LNPEQCmwJf85p41yt2qR_141c7SRx3IzdpR7bg-_VDYrfNHmpVJpenonCq5sSfGX3Bx2jvO4YcIuctL-Q1N9GQ2iCeqQwupIw8XFNV-L1V5psCudgrtdXMGVfa7Avbst_0ZFMlGSVSaOFGPeeSy0GiGWyb-ICohZe7kPLPLuWVqJZ6hhy6Zhbkp0oTYzGZU1Qg1ihVRQX3BsyvxdwO",
  },
  {
    id: "dua",
    name: "Dua Lipa",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAmYStpeU0rJZrOeoJR3ZFtWW8Pd0QyhhKg8aSabO4AW4C0MZwxbMA8CWBYK69fFUjO_JEYuwSCxahax42tStlMNE1_IcicIItrRfVP6UaIDYYHEZUyeyT-nIi6T3_hZd8EHAOXiQxlFYmY1H7MzZfRa8JP39wN7EvB4l4CWLqbC36vRW4ZYY1B-KD6iTaeq-rtAMCMncDNoE9uvVSkEFYG7kxaYnb3433M1p0K6nVGLoNBREqLguLJ",
  },
  {
    id: "anirudh",
    name: "Anirudh Ravichander",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "arrahman",
    name: "A.R. Rahman",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80",
  },
];

// Stitch Explore Your Genres Bento Cards
const GENRE_CARDS = [
  {
    id: "hiphop",
    title: "#Hip-Hop Pulse",
    badge: "Trending Now",
    gradient: "from-[#1a1c2e] via-[#121320] to-[#0d0e17]",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDjFglTAJSDIAKuIQVh-D8KulH-XT-SigMv0cpuqQzfxCfVByPXH7kN_9mE6iLBi0Umdzj7Q2iDXobEG3tOk-AsCx72UqLpNCJhyai6NoNoZKylY8bXj0PE1k6WQvTxSn7jzkn90fnukU-pD0R3H2SnxdX-0bNFWGrZafOh2N6OE20elvPklmcYJMyFu4m75CDQVZWz3NvVYadrf4jYK0t3tQT_zMcWDJa8bRz4tBS1skDkYeKyT9yu",
    query: "Vibe",
  },
  {
    id: "synth",
    title: "#Late Night Synth",
    badge: "Recommended",
    gradient: "from-[#231834] via-[#171226] to-[#0e0b17]",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBnu3s81aKMSnKRcnRp3IdZXU6I2dm5IlISPIRUtj4tW7S4jnUyJEagkzlWy8Z5KXLdM4CTUp2enXuUfCB_RjUpsdqHXums-cLIU4jI1ww2BJWUYL_fMaWzmpYUiFQdE8J-oeYha8SHLbkJmnbB00gz0ATMX9ksOC2FK6trHmlj9h-NHBEIlwOXFgU2XVw1Cq7yZfT_4CKHBONkZ0UoXMCHWpKdS-CZjgzwC7dQrmGnOXIdCFf4c2nS",
    query: "Melody",
  },
  {
    id: "tamil-melodies",
    title: "#Tamil Melodies",
    badge: "Top Rated",
    gradient: "from-[#0c2e28] via-[#091e1a] to-[#061412]",
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80",
    query: "Tamil Melodies",
  },
  {
    id: "spatial-8d",
    title: "#8D Spatial Hits",
    badge: "360° Binaural",
    gradient: "from-[#33111f] via-[#200b14] to-[#12060c]",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80",
    query: "8D",
  },
];

// Custom Requested Folders & Category Tiles
const BROWSE_CATEGORIES = [
  {
    id: "all-time-trending",
    title: "🔥 All Time Trending",
    color: "#E8115B",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80",
    filter: "All Time Trending",
  },
  {
    id: "2026-trending",
    title: "⚡ 2026 Trending",
    color: "#8400E7",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80",
    filter: "2026 Trending",
  },
  {
    id: "pure-melody",
    title: "🎶 Pure Melody",
    color: "#1E3264",
    image:
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=500&q=80",
    filter: "Melody",
  },
  {
    id: "vibe-kuthu",
    title: "🎉 Party & Vibe",
    color: "#148A08",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=500&q=80",
    filter: "Vibe",
  },
  {
    id: "sad-heartbreak",
    title: "💔 Sad & Heartbreak",
    color: "#2E4156",
    image:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=500&q=80",
    filter: "Sad",
  },
  {
    id: "romantic-love",
    title: "❤️ Romantic Love",
    color: "#E91429",
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80",
    filter: "Love",
  },
  {
    id: "love-failure",
    title: "🥀 Love Failure Special",
    color: "#BC5900",
    image:
      "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=500&q=80",
    filter: "Love Failure",
  },
  {
    id: "all-songs",
    title: "🌐 All Songs Master Archive",
    color: "#006450",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80",
    filter: "All",
  },
];

export default function MusicLibrary({ onNavigate, initialCategory = "All" }) {
  const {
    currentSong,
    isPlaying,
    playSong,
    toggleFavorite,
    favorites,
    audioMode,
    openModeSelector,
  } = usePlayer();

  const [songs, setSongs] = useState(() => staticSongs);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "All");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'grid'
  const [loading, setLoading] = useState(false);
  const [showCameraLens, setShowCameraLens] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Recent searches state persisted in localStorage
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem("flow8d_recent_searches");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_RECENT_SEARCHES;
  });

  const saveRecentSearches = (items) => {
    setRecentSearches(items);
    try {
      localStorage.setItem("flow8d_recent_searches", JSON.stringify(items));
    } catch (e) {
      // ignore
    }
  };

  const handleDismissChip = (id, e) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item.id !== id);
    saveRecentSearches(updated);
  };

  const handleClearAllRecents = () => {
    saveRecentSearches([]);
  };

  const handleSelectRecent = (term) => {
    setSearchQuery(term);
  };

  const addSearchToRecents = (term) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    const exists = recentSearches.find(
      (r) => r.name.toLowerCase() === clean.toLowerCase()
    );
    if (!exists) {
      const newEntry = {
        id: `search_${Date.now()}`,
        name: clean,
        image: DEFAULT_COVER,
      };
      saveRecentSearches([newEntry, ...recentSearches.slice(0, 9)]);
    }
  };

  useEffect(() => {
    if (initialCategory && initialCategory !== "All") {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_COVER;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [songsRes, catsRes] = await Promise.all([
          songsApi.getAll({ mode: audioMode }).catch(() => ({ data: { data: [] } })),
          categoriesApi.getAll().catch(() => ({ data: { data: [] } })),
        ]);
        const loaded = songsRes.data?.data;
        setSongs(Array.isArray(loaded) && loaded.length > 0 ? loaded : staticSongs);
        setCategories(catsRes.data?.data || []);
      } catch (err) {
        console.error("Error loading library data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Listen for custom song additions
    const handleUpdate = () => {
      fetchData();
    };
    window.addEventListener("flow8d_songs_updated", handleUpdate);
    return () => window.removeEventListener("flow8d_songs_updated", handleUpdate);
  }, [audioMode]);

  // Determine if user is in Active Search/Filter Results view
  const isBrowsingResults =
    Boolean(searchQuery.trim()) ||
    (selectedCategory !== "All" && selectedCategory !== "All Categories") ||
    selectedGenre !== "All";

  const filteredSongs = songs.filter((song) => {
    const rawQuery = searchQuery.toLowerCase().trim();
    const queryNorm = rawQuery.replace(/[.\-_]/g, " ").replace(/\s+/g, " ").trim();
    const queryWords = queryNorm.split(/\s+/).filter(Boolean);

    let matchesSearch = true;
    if (rawQuery) {
      const title = (song.title || "").toLowerCase();
      const artist = (song.artist || "").toLowerCase();
      const composer = (song.composer || "").toLowerCase();
      const album = (song.album || "").toLowerCase();
      const category = (song.category || "").toLowerCase();
      const genre = (song.genre || "").toLowerCase();

      const combined = `${title} ${artist} ${composer} ${album} ${category} ${genre}`;
      const combinedNorm = combined.replace(/[.\-_]/g, " ").replace(/\s+/g, " ");

      matchesSearch =
        combined.includes(rawQuery) ||
        combinedNorm.includes(queryNorm) ||
        (queryWords.length > 0 && queryWords.every((w) => combinedNorm.includes(w)));
    }

    const matchesCategory =
      selectedCategory === "All" ||
      selectedCategory === "All Categories" ||
      song.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === "8D" && (song.audioMode === "8d" || song.is8D));

    const matchesGenre =
      selectedGenre === "All" ||
      selectedGenre === "All Categories" ||
      song.genre?.toLowerCase() === selectedGenre.toLowerCase() ||
      song.category?.toLowerCase() === selectedGenre.toLowerCase();

    return matchesSearch && matchesCategory && matchesGenre;
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addSearchToRecents(searchQuery.trim());
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedGenre("All");
  };

  return (
    <div className="w-full flex flex-col font-sans text-white select-none pb-32 md:pb-24 bg-[#121212] min-h-full">
      {/* ============================================================== */}
      {/* 📱 1. STITCH ANDROID SEARCH HEADER (Visible on Mobile / Small screens) */}
      {/* ============================================================== */}
      <div className="md:hidden flex items-center justify-between px-4 pt-4 pb-2 bg-[#121212]">
        <div className="flex items-center gap-2.5">
          <img
            src="https://lh3.googleusercontent.com/aida/AEtjO1XoGmMbJ4lRqhALz_oICNd7N_sJDwjfsGxmDR3yFTJPnbbPbucsize5x7dBTYwBCtGPxDVxTpLbXKqIdL9xnCgL9114bHGeKl2V3x3w-dNiZzZIdRcTzVd1Xlf40emRClBwaGJsXHKD2bPcd7gfh7O_wTbF_TzF6FlPr3oehFoGCeW-s_9D8tq5QPb4gceZS1yPLwWzyQnH24-gq9ebYzHnxaPk4bUK9TAMgYRt7_VN9jXRc6E2GmwsvO8"
            alt="Flow 8D"
            className="h-8 w-auto object-contain shrink-0"
          />
          <h1 className="text-xl font-black text-white tracking-tight">Search</h1>
        </div>

        <div className="flex items-center gap-1 text-neutral-400">
          <button
            onClick={() => onNavigate && onNavigate("orbit")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:text-white hover:bg-white/5 active:scale-95 transition-all"
            title="Spatial Orbit Stage"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
          </button>
          <button
            onClick={openModeSelector}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:text-white hover:bg-white/5 active:scale-95 transition-all"
            title="Audio Settings"
          >
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 ml-1 shrink-0">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiczsZzVgrgqYyrdIAiKEzTYTD24N-A1X7vSr1QWp-QIiT1z32jd9Y_RbcNgncekE8Wj4-eMWoZAj8rXCXcGmtkyQ2w8J_fw1sH2tP1QUInToHVRoSe2qjGabX0AUe48Z63E7XUi9QIgXXIcYp9FRmY9oNzX5Qk1FWGeSQUmUdxDzd88RoX7HgMoy77AsZ4dtH0eJrBoWlPRJ9ZYNAqYuyuCTE9rxzHlgJYjJ6a9-dBgu_1cLJ8fqT"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 🔍 2. STITCH EXACT SEARCH INPUT BAR (Mobile & Desktop Responsive) */}
      {/* ============================================================== */}
      <div className="sticky top-0 z-20 px-4 sm:px-8 py-2.5 bg-[#121212]/95 backdrop-blur-md transition-all border-b border-white/5">
        <form onSubmit={handleSearchSubmit} className="max-w-4xl mx-auto w-full">
          <div className="relative flex items-center w-full h-12 rounded-xl bg-[#242424] hover:bg-[#282828] focus-within:bg-[#282828] focus-within:ring-2 focus-within:ring-[#1DB954] border border-white/10 shadow-md transition-all duration-200">
            {/* Search Icon */}
            <div className="flex items-center justify-center pl-3.5 pr-2 pointer-events-none text-neutral-300">
              <span className="material-symbols-outlined text-[24px] flex items-center justify-center leading-none">search</span>
            </div>

            {/* Main Input Text */}
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to listen to?"
              className="w-full h-full bg-transparent text-white placeholder:text-neutral-400 font-medium text-sm outline-none pr-2 leading-none flex items-center"
            />

            {/* Clear Input Button (when text entered) */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white mr-1 active:scale-90 transition-transform leading-none"
                title="Clear input"
              >
                <span className="material-symbols-outlined text-base flex items-center justify-center leading-none">close</span>
              </button>
            )}

            {/* Camera / Audio Lens Button from Stitch */}
            <button
              type="button"
              onClick={() => setShowCameraLens(true)}
              aria-label="Scan audio or Flow 8D code"
              className="flex items-center justify-center w-11 h-11 text-neutral-300 mr-1 hover:text-[#1DB954] transition-colors active:scale-95 leading-none"
              title="Flow 8D Camera Lens"
            >
              <span className="material-symbols-outlined text-[22px] flex items-center justify-center leading-none">photo_camera</span>
            </button>
          </div>
        </form>
      </div>

      {/* ============================================================== */}
      {/* 🎯 MAIN CONTENT AREA: DISCOVER & BROWSE vs SEARCH RESULTS */}
      {/* ============================================================== */}
      <div className="flex-1 px-4 sm:px-8 max-w-7xl mx-auto w-full pt-4">
        {/* ============================================================ */}
        {/* VIEW A: REAL-TIME SEARCH RESULTS OR CATEGORY PLAYLIST */}
        {/* ============================================================ */}
        {isBrowsingResults ? (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Results Header Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-neutral-900 via-[#181818] to-neutral-900 border border-white/5 shadow-xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClearFilters}
                  className="w-9 h-9 rounded-full bg-[#242424] hover:bg-white hover:text-black flex items-center justify-center text-white transition-all active:scale-95 shadow-sm"
                  title="Back to Browse & Discover"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    {searchQuery ? (
                      <>
                        <span>Results for</span>
                        <span className="text-[#1DB954]">"{searchQuery}"</span>
                      </>
                    ) : (
                      <span>{selectedCategory} Songs</span>
                    )}
                  </h2>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                    {filteredSongs.length} tracks • {audioMode?.toUpperCase()} Spatial Master
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2">
                {filteredSongs.length > 0 && (
                  <button
                    onClick={() => playSong(filteredSongs[0], filteredSongs)}
                    className="inline-flex items-center justify-center text-center gap-1.5 px-4 py-2 rounded-full bg-[#1DB954] text-black text-xs font-bold hover:scale-105 active:scale-95 transition-transform shadow-lg leading-none min-h-[34px]"
                  >
                    <span className="material-symbols-outlined text-base font-black flex items-center justify-center leading-none">play_arrow</span>
                    <span className="inline-flex items-center justify-center leading-none">Play All</span>
                  </button>
                )}

                {/* View Mode Toggle */}
                <div className="flex items-center justify-center bg-[#242424] rounded-full p-0.5 border border-white/5">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors leading-none ${
                      viewMode === "list" ? "bg-white/20 text-white" : "text-neutral-400 hover:text-white"
                    }`}
                    title="List View"
                  >
                    <span className="material-symbols-outlined text-lg flex items-center justify-center leading-none">view_list</span>
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors leading-none ${
                      viewMode === "grid" ? "bg-white/20 text-white" : "text-neutral-400 hover:text-white"
                    }`}
                    title="Grid View"
                  >
                    <span className="material-symbols-outlined text-lg flex items-center justify-center leading-none">grid_view</span>
                  </button>
                </div>

                <button
                  onClick={handleClearFilters}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-neutral-300 hover:text-white transition-colors inline-flex items-center justify-center text-center leading-none min-h-[34px]"
                >
                  <span className="inline-flex items-center justify-center leading-none">Clear All</span>
                </button>
              </div>
            </div>

            {/* Mood Pills Strip with All Requested Playlists */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {[
                { id: "All", label: "🌐 All Songs" },
                { id: "2026 Trending", label: "⚡ 2026 Trending" },
                { id: "All Time Trending", label: "🔥 All Time Trending" },
                { id: "Melody", label: "🎵 Pure Melody" },
                { id: "Vibe", label: "🎉 Party & Vibe" },
                { id: "Sad", label: "💔 Sad" },
                { id: "Love", label: "❤️ Love" },
                { id: "Love Failure", label: "🥀 Love Failure" },
              ].map((m) => {
                const isSelected = selectedGenre === m.id || selectedCategory === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (m.id === "2026 Trending" || m.id === "All Time Trending") {
                        setSelectedCategory(m.id);
                        setSelectedGenre("All");
                      } else {
                        setSelectedGenre(m.id);
                      }
                    }}
                    className={`inline-flex items-center justify-center text-center px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all select-none leading-none min-h-[36px] ${
                      isSelected
                        ? "bg-[#1DB954] text-black font-bold shadow-md"
                        : "bg-[#1f1f1f] hover:bg-[#282828] text-neutral-300 border border-white/5"
                    }`}
                  >
                    <span className="inline-flex items-center justify-center text-center leading-none">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Results Grid / List */}
            {filteredSongs.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-1 text-neutral-400">
                  <span className="material-symbols-outlined text-3xl">search_off</span>
                </div>
                <h3 className="text-base font-bold text-white text-center">
                  No matching tracks found {searchQuery ? `for "${searchQuery}"` : ""}
                </h3>
                <p className="text-neutral-400 text-xs max-w-sm text-center">
                  {searchQuery
                    ? `"${searchQuery}" is not in the library yet. You can add it directly to Flow 8D right now!`
                    : "No songs match the current category or genre filters."}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs inline-flex items-center justify-center text-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all min-h-[38px] leading-none"
                    >
                      <span className="material-symbols-outlined text-base">library_add</span>
                      <span className="inline-flex items-center justify-center text-center leading-none">+ Add &ldquo;{searchQuery}&rdquo; to Music Library</span>
                    </button>
                  )}
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center justify-center text-center transition-all min-h-[38px] leading-none"
                  >
                    <span className="inline-flex items-center justify-center text-center leading-none">Browse All Categories</span>
                  </button>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
                {filteredSongs.map((song, idx) => {
                  const isThisPlaying =
                    currentSong &&
                    (currentSong._id || currentSong.id) === (song._id || song.id) &&
                    isPlaying;
                  const isFav = favorites.has(song._id || song.id);

                  return (
                    <div
                      key={song._id || song.id || idx}
                      onClick={() => playSong(song, filteredSongs)}
                      className="group p-3 rounded-2xl bg-[#181818] hover:bg-[#242424] cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-md border border-white/5 hover:border-white/10 active:scale-[0.98]"
                    >
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#202020] shadow-md">
                        <img
                          src={song.imageUrl || DEFAULT_COVER}
                          alt={song.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={handleImgError}
                        />

                        {song.audioMode && (
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/75 text-[#1DB954] border border-[#1DB954]/30 uppercase">
                            {song.audioMode}
                          </div>
                        )}

                        <div className="absolute right-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-3 transition-all duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playSong(song, filteredSongs);
                            }}
                            className="w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-90 transition-transform"
                          >
                            <span
                              className="material-symbols-outlined text-2xl font-bold ml-0.5"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              {isThisPlaying ? "pause" : "play_arrow"}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="min-w-0 flex flex-col">
                        <h3 className="text-xs sm:text-sm font-bold text-white truncate leading-snug group-hover:text-[#1DB954] transition-colors pb-0.5">
                          {song.title}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-neutral-400 truncate mt-1 leading-normal">
                          {song.artist}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-neutral-500 font-mono leading-none">
                          <span className="leading-none">{song.duration || "4:15"}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(song._id || song.id);
                            }}
                            className="hover:text-white p-1 inline-flex items-center justify-center leading-none"
                          >
                            <span
                              className={`material-symbols-outlined text-sm ${
                                isFav ? "text-[#1DB954]" : ""
                              }`}
                              style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              favorite
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="divide-y divide-white/5 rounded-2xl bg-[#181818]/50 border border-white/5 p-2">
                {filteredSongs.map((song, idx) => {
                  const isThisPlaying =
                    currentSong &&
                    (currentSong._id || currentSong.id) === (song._id || song.id) &&
                    isPlaying;
                  const isFav = favorites.has(song._id || song.id);

                  return (
                    <div
                      key={song._id || song.id || idx}
                      onClick={() => playSong(song, filteredSongs)}
                      className={`grid grid-cols-12 items-center px-4 py-3 rounded-xl hover:bg-[#242424] cursor-pointer group transition-colors text-xs ${
                        isThisPlaying ? "bg-[#242424] text-[#1DB954]" : "text-neutral-300"
                      }`}
                    >
                      {/* Play indicator */}
                      <div className="col-span-1 flex items-center justify-center font-mono text-neutral-400 group-hover:hidden leading-none">
                        {isThisPlaying ? (
                          <span className="material-symbols-outlined text-[#1DB954] text-base animate-pulse">
                            equalizer
                          </span>
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <div className="col-span-1 hidden items-center justify-center group-hover:flex leading-none">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playSong(song, filteredSongs);
                          }}
                          className="text-white hover:text-[#1DB954] transition-colors inline-flex items-center justify-center"
                        >
                          <span
                            className="material-symbols-outlined text-xl"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            {isThisPlaying ? "pause" : "play_arrow"}
                          </span>
                        </button>
                      </div>

                      {/* Title & Artist */}
                      <div className="col-span-8 md:col-span-5 flex items-center gap-3.5 min-w-0 pr-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black shadow-sm">
                          <img
                            src={song.imageUrl || DEFAULT_COVER}
                            alt={song.title}
                            className="w-full h-full object-cover"
                            onError={handleImgError}
                          />
                        </div>
                        <div className="min-w-0 flex flex-col justify-center">
                          <h4
                            className={`font-bold truncate text-xs sm:text-sm leading-snug pb-0.5 ${
                              isThisPlaying
                                ? "text-[#1DB954]"
                                : "text-white group-hover:text-[#1DB954] transition-colors"
                            }`}
                          >
                            {song.title}
                          </h4>
                          <p className="text-[11px] text-neutral-400 truncate mt-0.5 leading-normal">
                            {song.artist}
                          </p>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className="hidden md:flex md:col-span-3 items-center gap-2 text-neutral-400 text-xs truncate leading-none">
                        <span className="truncate leading-none">{song.category || "Tamil Melodies"}</span>
                        {song.audioMode && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#1DB954] shrink-0 uppercase leading-none inline-flex items-center">
                            {song.audioMode}
                          </span>
                        )}
                      </div>

                      {/* Duration & Favorite */}
                      <div className="col-span-3 md:col-span-3 flex items-center justify-end gap-3 text-right pr-2">
                        <span className="font-mono text-neutral-400 text-[11px] leading-none">
                          {song.duration || "4:15"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(song._id || song.id);
                          }}
                          className="text-neutral-400 hover:text-white p-1 inline-flex items-center justify-center leading-none"
                        >
                          <span
                            className={`material-symbols-outlined text-sm ${
                              isFav ? "text-[#1DB954]" : ""
                            }`}
                            style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            favorite
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ============================================================ */
          /* VIEW B: EXACT STITCH SEARCH & DISCOVER SCREEN */
          /* ============================================================ */
          <div className="flex flex-col gap-8 animate-fadeIn">
            {/* ---------------------------------------------------------- */}
            {/* SECTION 1: RECENT SEARCHES (Exact Stitch Spec) */}
            {/* ---------------------------------------------------------- */}
            {recentSearches.length > 0 && (
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Recent searches
                  </h2>
                  <button
                    onClick={handleClearAllRecents}
                    className="text-xs text-neutral-400 hover:text-[#1DB954] font-semibold transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                {/* Horizontal scrolling chips list */}
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                  {recentSearches.map((chip) => (
                    <div
                      key={chip.id}
                      onClick={() => handleSelectRecent(chip.name)}
                      className="inline-flex items-center justify-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#201f26] hover:bg-[#2a2930] border border-white/5 shadow-sm shrink-0 cursor-pointer transition-all active:scale-95 group text-center"
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-neutral-800 shrink-0">
                        <img
                          src={chip.image}
                          alt={chip.name}
                          className="w-full h-full object-cover"
                          onError={handleImgError}
                        />
                      </div>
                      <span className="text-xs font-semibold text-white group-hover:text-[#1DB954] transition-colors whitespace-nowrap">
                        {chip.name}
                      </span>
                      <button
                        onClick={(e) => handleDismissChip(chip.id, e)}
                        className="flex items-center justify-center w-4 h-4 rounded-full text-neutral-400 hover:text-white transition-colors"
                        title="Remove"
                      >
                        <span className="material-symbols-outlined text-[15px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ---------------------------------------------------------- */}
            {/* SECTION 2: EXPLORE YOUR GENRES (Exact Stitch Bento Cards) */}
            {/* ---------------------------------------------------------- */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Explore your genres
              </h2>

              {/* Responsive Grid: 2 columns on mobile, 4 columns on desktop */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {GENRE_CARDS.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => {
                      setSelectedGenre(card.query);
                      setSearchQuery("");
                    }}
                    className={`relative overflow-hidden h-28 sm:h-32 rounded-2xl bg-gradient-to-br ${card.gradient} border border-white/10 shadow-lg p-3.5 flex flex-col items-center justify-center text-center cursor-pointer active:scale-[0.98] hover:border-white/20 transition-all group`}
                  >
                    <span className="text-sm sm:text-base font-black text-white z-10 tracking-tight group-hover:text-[#1DB954] transition-colors leading-snug text-center">
                      {card.title}
                    </span>

                    <div className="flex items-center justify-center gap-1.5 z-10 mt-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse"></span>
                      <span className="text-[11px] font-bold text-[#1DB954] uppercase tracking-wider">
                        {card.badge}
                      </span>
                    </div>

                    {/* Rotated peeking album art bottom-right */}
                    <div className="absolute -right-3 -bottom-3 w-16 h-16 sm:w-20 sm:h-20 rounded-xl rotate-12 shadow-2xl overflow-hidden group-hover:rotate-6 group-hover:scale-105 transition-all duration-300 border border-white/10">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover"
                        onError={handleImgError}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ---------------------------------------------------------- */}
            {/* SECTION 3: BROWSE ALL (Spotify/Stitch Category Tiles) */}
            {/* ---------------------------------------------------------- */}
            <section className="flex flex-col gap-3 pb-8">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Browse all
              </h2>

              {/* 2 columns on Mobile (Android), 3-4 columns on Tablet, 5-6 columns on Desktop (Windows) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {BROWSE_CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      if (cat.filter === "All") {
                        setSelectedCategory("All");
                        setSearchQuery("");
                      } else {
                        setSelectedCategory(cat.filter);
                        setSearchQuery("");
                      }
                    }}
                    style={{ backgroundColor: cat.color }}
                    className="relative h-28 sm:h-32 rounded-2xl p-3.5 overflow-hidden shadow-lg select-none cursor-pointer active:scale-[0.97] hover:scale-[1.02] transition-all group flex flex-col items-center justify-center text-center"
                  >
                    <span className="text-base sm:text-lg font-black text-white tracking-tight leading-tight drop-shadow-sm text-center z-10">
                      {cat.title}
                    </span>

                    {/* Angled album cover peeking out from bottom-right (25deg rotate) */}
                    <div className="absolute -right-3 -bottom-3 w-16 h-16 sm:w-20 sm:h-20 rounded-lg shadow-2xl rotate-[25deg] overflow-hidden group-hover:rotate-[20deg] group-hover:scale-105 transition-all duration-300 border border-white/10">
                      <img
                        src={cat.image}
                        alt={cat.title}
                        className="w-full h-full object-cover"
                        onError={handleImgError}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 📷 STITCH AUDIO LENS MODAL */}
      {/* ============================================================== */}
      {showCameraLens && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#181818] border border-white/10 p-6 flex flex-col items-center text-center shadow-2xl">
            <button
              onClick={() => setShowCameraLens(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="w-16 h-16 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1DB954] mb-4">
              <span className="material-symbols-outlined text-3xl">photo_camera</span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Flow 8D Audio Lens</h3>
            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              Point your camera at Flow 8D code, song artwork, or album vinyl to recognize and play in full spatial 8D soundstage.
            </p>

            <div className="w-full h-44 rounded-2xl bg-black border-2 border-dashed border-[#1DB954]/40 flex flex-col items-center justify-center gap-2 relative overflow-hidden mb-6">
              <span className="material-symbols-outlined text-3xl text-neutral-500 animate-pulse">
                center_focus_strong
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                Scanning for Flow 8D sound code...
              </span>
              <div className="absolute inset-x-0 h-0.5 bg-[#1DB954] shadow-[0_0_8px_#1DB954] animate-bounce" />
            </div>

            <button
              onClick={() => {
                setShowCameraLens(false);
                setSelectedCategory("Tamil Love");
              }}
              className="w-full py-3 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs shadow-lg active:scale-95 transition-all"
            >
              Simulate Match (Tamil Love 8D)
            </button>
          </div>
        </div>
      )}

      {/* Quick Add Song Modal */}
      <QuickAddSongModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialTitle={searchQuery}
        onSongAdded={(newSong) => {
          if (newSong && newSong.title) {
            setSearchQuery(newSong.title);
          }
        }}
      />
    </div>
  );
}
