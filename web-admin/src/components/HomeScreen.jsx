import React, { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import { songsApi, categoriesApi } from "../api/api";
import TasteProfileModal from "./TasteProfileModal";
import MiloCatChat from "./MiloCatChat";

export default function HomeScreen({ onNavigate }) {
  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    playNext,
    setShowFullPlayer,
    recommendations,
    tasteProfile,
    showMiloChat,
    setShowMiloChat,
    miloInitialQuery,
    audioMode,
    openModeSelector,
    cycleStatus,
    resetPlaybackCycle,
    favorites,
    toggleFavorite,
  } = usePlayer();

  const [songs, setSongs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTasteModal, setShowTasteModal] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const DEFAULT_COVER =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCYHY4hp0r-GSzPdesFf5Z5mHQjlDX8zkLIjOdCA_IqUU_uw_nFr73ANifvOdaM2Q0NTsbK9ZB4CakHGH5fOSwA-_HynlD80C-hNL1oquc1m9K6gETHr9tKwpVJsxr8i3yXt8MxzxgSfUOhVYLQ8IqgfrlSGKs-61qE80eejtCqn6bE6dEiNbaAVFjYTn5bXQizoK0XcGh2VyyPyVMbGgVbr-Vnz7APr5Vg8HSuKiI1D50YhAVg3lfgaQ";

  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_COVER;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [songsRes, catsRes] = await Promise.all([
          songsApi.getAll({ mode: audioMode }).catch(() => ({ data: { data: [] } })),
          categoriesApi.getAll().catch(() => ({ data: { data: [] } })),
        ]);
        setSongs(songsRes.data?.data || []);
        setCategories(catsRes.data?.data || []);
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [audioMode]);

  // Featured Hero Track from actual catalog
  const featuredSong = songs.length > 0 ? songs[0] : null;

  // Top 6 Quick Cards for 2x3 Bento Grid
  const quickCards = [
    {
      title: "Liked Songs",
      subtitle: `${favorites.size} songs saved`,
      isLiked: true,
      onClick: () => onNavigate("library", "Favorites"),
    },
    ...songs.slice(1, 6).map((s) => ({
      title: s.title,
      subtitle: s.artist,
      song: s,
      imageUrl: s.imageUrl,
      onClick: () => playSong(s, songs),
    })),
  ];

  // Curated Made For You Collections
  const madeForYouCollections = [
    {
      id: "love-vibes",
      title: "Love Vibes Mix",
      subtitle: "Soft romantic Tamil acoustics & melodies",
      cover: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500",
      categoryName: "Tamil Love",
    },
    {
      id: "melody-essentials",
      title: "Melody Essentials",
      subtitle: "Soulful vocals, strings & rich harmonies",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500",
      categoryName: "Tamil Melodies",
    },
    {
      id: "spatial-hits",
      title: "8D Spatial Hits",
      subtitle: "360° rotational panning & binaural audio",
      cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500",
      categoryName: "8D",
    },
    {
      id: "9d-immersive",
      title: "9D Immersive Mix",
      subtitle: "Dual harmonic depth & spatial isolation",
      cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500",
      categoryName: "9D",
    },
    {
      id: "anirudh-special",
      title: "Anirudh Special",
      subtitle: "Viral rockstar beats, synth bass & drops",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiczsZzVgrgqYyrdIAiKEzTYTD24N-A1X7vSr1QWp-QIiT1z32jd9Y_RbcNgncekE8Wj4-eMWoZAj8rXCXcGmtkyQ2w8J_fw1sH2tP1QUInToHVRoSe2qjGabX0AUe48Z63E7XUi9QIgXXIcYp9FRmY9oNzX5Qk1FWGeSQUmUdxDzd88RoX7HgMoy77AsZ4dtH0eJrBoWlPRJ9ZYNAqYuyuCTE9rxzHlgJYjJ6a9-dBgu_1cLJ8fqT",
      filterTerm: "Anirudh",
    },
    {
      id: "u1-melodies",
      title: "U1 Melodies",
      subtitle: "Heartfelt Yuvan anthems & midnight feelings",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2uK2P-spDtoLvgyfW6h92vSOM11YqF4FDh6_uPwOLvWwGbSld231Yq4WcEzIW8AHjuOF4Qppq84ff1GqIvS8roQL5_-hjTpUJguVg4BVQt95GRisjjG01rGWSUmBZOCIhrFzE0UerqHyQeGG1syM4i2S8jBIn15mFjCrS5Mv7aT2hydtT5dBHlH687T7MgKahQoi-x5VH-yW_41eC3bAhOr_OkV_GQ6AWxO53F6Bqv6BQzSKcmEpi",
      filterTerm: "Yuvan",
    },
  ];

  // Key Tamil Music Directors & Creators
  const featuredArtists = [
    { name: "Anirudh Ravichander", role: "Rockstar Composer", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiczsZzVgrgqYyrdIAiKEzTYTD24N-A1X7vSr1QWp-QIiT1z32jd9Y_RbcNgncekE8Wj4-eMWoZAj8rXCXcGmtkyQ2w8J_fw1sH2tP1QUInToHVRoSe2qjGabX0AUe48Z63E7XUi9QIgXXIcYp9FRmY9oNzX5Qk1FWGeSQUmUdxDzd88RoX7HgMoy77AsZ4dtH0eJrBoWlPRJ9ZYNAqYuyuCTE9rxzHlgJYjJ6a9-dBgu_1cLJ8fqT" },
    { name: "A. R. Rahman", role: "Mozart of Madras", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2Uxl4CxFbO6z6H3HvzGuLP9Qzgd7fEeVFmJK6ZK3rI6vT3KLTa9P-uG1v0zrwYdcIKnQKTkE6FEd46U67EB6jyNllubA6zewVHDIZWwWNNIcwi4TtP5Mv4evwh9tgX5dVjWYlklbNvbj0nt_guWh62Sj36Ke9I59DwfFC8Emjc2AWVnTNa0LLypq048ITiU0_bCeX14Vyx9ZgxCF6U7YD-mL-WgyA3BedjTwbEy1dbAJTnpJcWapa" },
    { name: "Yuvan Shankar Raja", role: "U1 Soul Healer", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2uK2P-spDtoLvgyfW6h92vSOM11YqF4FDh6_uPwOLvWwGbSld231Yq4WcEzIW8AHjuOF4Qppq84ff1GqIvS8roQL5_-hjTpUJguVg4BVQt95GRisjjG01rGWSUmBZOCIhrFzE0UerqHyQeGG1syM4i2S8jBIn15mFjCrS5Mv7aT2hydtT5dBHlH687T7MgKahQoi-x5VH-yW_41eC3bAhOr_OkV_GQ6AWxO53F6Bqv6BQzSKcmEpi" },
    { name: "Sai Abhyankkar", role: "Gen-Z Hitmaker", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNcCzasQc3Fq9D-fZRB3efPk-vqkYF_0XP7_TFpGBohJBCjju_a_NoBCggz5fr_gd6IcezlMx2OmGe7l-oXgpYLVpGcVxjaC7eu6q6sHoyIiIu2vTfcMZDj3pTh0CQglYtRCIlDnH2n_J21Ohhcw24-cszhrLBmgLqh6SMyzDWipJyh6IudGx0TYyb_mZ_GcD9JUVtqTHCiLwZGNqavr2Rnq32wNs0tYobarKgZjM_UGSV6v4VLTa6" },
    { name: "Sid Sriram", role: "Melody Sensation", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcnkGgKcVt9oaUTALyDFJUsVQVXBu-_N8Of-Dr2fX0HQrGCxcFUl0DUpHd1ayvSobbIPlAFG5HkdaC2t0mePSiEhm1soUW8kL9xFKd5NDGFR6621GtQzO_vPORaMCTtUj4xe5XOomAM8VxtIfZEvduQWZPxbh87RL-euyPyQb2EL7d0PPKWLupfXca9ycOPa5XwG7AR72xVAUfUpJZcsJGEdmNaiNbTi5graEjPMUli7bw6wAWkGCA" },
    { name: "Ilaiyaraaja", role: "The Maestro", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWUKAZQ1Z4SXtiZHAuwd9xlCf_CQ9AHpEbV0qCWqI-p3pmto2ZPZWqZVQaXh8B4eEipmVefEbj4EhTmhTryQACKXXeSaAnHD9gtogB3zjxUXIrLGuinWKrFzQVv0NI2OaNs1h9Xhrc9u-Px66Qx3skOaDoSktKAHJ9TxcmNSbxm143HKbop7GpaouLCS9mo7IUMKMFj_HWjgtXR1Wk4ScojRVNEm_FrAKSxNTvH8kRexwxHGnuyiWF" },
  ];

  // Specific categorized song slices
  const trendingSongs = songs.slice(0, 10);
  const jumpBackInSongs = songs.slice(10, 20);
  const tamilLoveSongs = songs.filter((s) =>
    s.category?.toLowerCase().includes("love") ||
    s.title?.toLowerCase().includes("kaadhal") ||
    s.genre?.toLowerCase().includes("love")
  ).slice(0, 8);
  const loveList = tamilLoveSongs.length > 0 ? tamilLoveSongs : songs.slice(20, 28);

  const tamilMelodySongs = songs.filter((s) =>
    s.category?.toLowerCase().includes("melody") ||
    s.genre?.toLowerCase().includes("melody")
  ).slice(0, 8);
  const melodyList = tamilMelodySongs.length > 0 ? tamilMelodySongs : songs.slice(28, 36);

  const topTracksTable = songs.slice(0, 15);

  return (
    <div className="w-full flex flex-col font-sans text-slate-200 select-none pb-28 md:pb-20">
      {/* Dynamic Top Ambient Header */}
      <div className="p-4 sm:p-6 pb-6 bg-gradient-to-b from-[#1DB954]/15 via-[#181818]/80 to-[#121212] transition-colors duration-700">
        {/* Dynamic Spotify Greeting & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-display leading-[1.2]">
              {getGreeting()}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-medium leading-normal">
              Feel the music in a whole new dimension • Flow 8D Spatial Audio
            </p>
          </div>

          {/* Smart Playback Cycle HUD */}
          {cycleStatus && (
            <div className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-black/60 border border-[#1DB954]/30 backdrop-blur-md text-xs font-mono shadow-sm leading-none">
              <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse shrink-0" />
              <span className="text-white font-bold leading-none">
                Cycle #{cycleStatus.cycleId}
              </span>
              <span className="text-neutral-500 leading-none">•</span>
              <span className="text-[#1DB954] leading-none">
                {cycleStatus.playedCount} of {cycleStatus.totalEligible || songs.length} Played
              </span>
              <button
                onClick={resetPlaybackCycle}
                className="text-[10px] text-[#1DB954] hover:underline font-bold ml-1 leading-none"
                title="Reset smart cycle"
              >
                Reset ↻
              </button>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 🌟 CINEMATIC FEATURED SONG HERO BANNER (Section 4) */}
        {/* ============================================================== */}
        {featuredSong && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e1e1e] via-[#242424] to-[#1a1a1a] p-5 sm:p-7 shadow-2xl border border-white/10 group mb-6">
            {/* Ambient Background Aura */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#1DB954]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              {/* Large Album Artwork */}
              <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-xl overflow-hidden shadow-2xl shrink-0 bg-black relative group/cover">
                <img
                  src={featuredSong.imageUrl || DEFAULT_COVER}
                  alt={featuredSong.title}
                  className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-500"
                  onError={handleImgError}
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/75 border border-[#1DB954]/40 text-[#1DB954] text-[10px] font-bold font-mono uppercase tracking-wider leading-none">
                  Featured 8D
                </div>
              </div>

              {/* Track Metadata & Action Controls */}
              <div className="flex-1 min-w-0 text-center sm:text-left flex flex-col items-center sm:items-start">
                <div className="flex items-center gap-2 mb-2 leading-none">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-[#1DB954] font-mono leading-none">
                    SPOTLIGHT STREAM
                  </span>
                  <span className="text-neutral-500 leading-none">•</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30 text-[10px] font-bold uppercase font-mono leading-none">
                    {featuredSong.audioMode?.toUpperCase() || "8D SPATIAL"}
                  </span>
                </div>

                <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-[1.15] line-clamp-2 pb-0.5">
                  {featuredSong.title}
                </h2>
                <p className="text-sm sm:text-base text-neutral-300 font-medium mt-1.5 leading-snug truncate max-w-xl">
                  {featuredSong.artist} • {featuredSong.category || "Tamil Melodies"}
                </p>
                <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-lg hidden sm:block leading-relaxed">
                  Immerse in rotating binaural acoustics calibrated for headphones. Experience spatial separation and pristine high fidelity.
                </p>

                {/* Hero Action Buttons */}
                <div className="flex items-center gap-3.5 mt-5">
                  <button
                    onClick={() => playSong(featuredSong, songs)}
                    className="px-6 py-3 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-sm inline-flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all leading-none"
                  >
                    <span
                      className="material-symbols-outlined text-2xl font-bold"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {currentSong && (currentSong._id || currentSong.id) === (featuredSong._id || featuredSong.id) && isPlaying ? "pause" : "play_arrow"}
                    </span>
                    <span className="leading-none">
                      {currentSong && (currentSong._id || currentSong.id) === (featuredSong._id || featuredSong.id) && isPlaying ? "Pause" : "Play Now"}
                    </span>
                  </button>

                  <button
                    onClick={() => toggleFavorite(featuredSong._id || featuredSong.id)}
                    className={`w-11 h-11 rounded-full border border-white/10 inline-flex items-center justify-center transition-all active:scale-90 leading-none ${
                      favorites.has(featuredSong._id || featuredSong.id)
                        ? "bg-[#1DB954]/15 text-[#1DB954] border-[#1DB954]/40"
                        : "bg-[#242424] text-neutral-300 hover:text-white"
                    }`}
                    title="Save to favorites"
                  >
                    <span
                      className="material-symbols-outlined text-xl"
                      style={{ fontVariationSettings: favorites.has(featuredSong._id || featuredSong.id) ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                  </button>

                  <button
                    onClick={() => onNavigate("orbit")}
                    className="px-4 py-2.5 rounded-full bg-[#242424] hover:bg-[#2c2c2c] border border-white/5 text-neutral-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors leading-none"
                  >
                    <span className="material-symbols-outlined text-base text-[#00f2fe]">spatial_audio_off</span>
                    <span className="leading-none">360° Stage</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 🟩 2x3 TOP QUICK-ACCESS BENTO GRID */}
        {/* ============================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
          {quickCards.map((card, idx) => {
            const isThisPlaying =
              card.song &&
              currentSong &&
              (currentSong._id || currentSong.id) === (card.song._id || card.song.id) &&
              isPlaying;

            return (
              <div
                key={idx}
                onClick={card.onClick}
                className="group relative flex items-center bg-[#242424]/90 hover:bg-[#2e2e2e] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 shadow-md border border-white/5 active:scale-[0.99]"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 relative bg-[#181818]">
                  {card.isLiked ? (
                    <div className="w-full h-full bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center shadow-md">
                      <span
                        className="material-symbols-outlined text-white text-2xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        favorite
                      </span>
                    </div>
                  ) : (
                    <img
                      src={card.imageUrl || DEFAULT_COVER}
                      alt={card.title}
                      className="w-full h-full object-cover"
                      onError={handleImgError}
                    />
                  )}
                </div>

                {/* Title */}
                <div className="flex-1 px-3 min-w-0 pr-12 flex flex-col justify-center">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-snug group-hover:text-[#1DB954] transition-colors pb-0.5">
                    {card.title}
                  </h4>
                  {card.subtitle && (
                    <p className="text-[10px] sm:text-[11px] text-neutral-400 truncate mt-0.5 leading-normal">
                      {card.subtitle}
                    </p>
                  )}
                </div>

                {/* Floating Play Button */}
                <div className="absolute right-2.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 transition-all duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (card.song) playSong(card.song, songs);
                      else onNavigate("library", "Favorites");
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
            );
          })}
        </div>
      </div>

      {/* Main Flow Sections Container */}
      <div className="px-4 sm:px-6 space-y-9 mt-4">
        {/* ============================================================== */}
        {/* 🔥 SECTION 5: TRENDING NOW (Horizontal & Responsive Grid) */}
        {/* ============================================================== */}
        <section className="space-y-3.5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1DB954] font-mono leading-none mb-1 block">
                Top Viral Tracks
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                Trending Now
              </h2>
            </div>
            <button
              onClick={() => onNavigate("library")}
              className="text-xs font-bold text-neutral-400 hover:text-white transition-colors leading-none pb-0.5"
            >
              See all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {trendingSongs.slice(0, 6).map((song, idx) => {
              const isThisPlaying =
                currentSong &&
                (currentSong._id || currentSong.id) === (song._id || song.id) &&
                isPlaying;
              const isFav = favorites.has(song._id || song.id);

              return (
                <div
                  key={song._id || song.id || idx}
                  onClick={() => playSong(song, songs)}
                  className="group p-3 rounded-2xl bg-[#181818] hover:bg-[#242424] cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-md border border-white/5 hover:border-white/10 hover:shadow-xl active:scale-[0.98]"
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#202020] shadow-md">
                    <img
                      src={song.imageUrl || DEFAULT_COVER}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={handleImgError}
                    />

                    {/* Mode Tag */}
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/75 text-[#1DB954] border border-[#1DB954]/30 uppercase leading-none inline-flex items-center">
                      {song.audioMode || "8D"}
                    </div>

                    {/* Trending Rank Tag */}
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/90 text-black shadow-sm leading-none inline-flex items-center">
                      #{idx + 1}
                    </div>

                    {/* Floating Play Button */}
                    <div className="absolute right-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-3 transition-all duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSong(song, songs);
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
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 🌟 SECTION 6: MADE FOR YOU (Curated Mixes) */}
        {/* ============================================================== */}
        <section className="space-y-3.5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1DB954] font-mono leading-none mb-1 block">
                Tailored Playlists
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                Made For You
              </h2>
            </div>
            <button
              onClick={() => onNavigate("library")}
              className="text-xs font-bold text-neutral-400 hover:text-white transition-colors leading-none pb-0.5"
            >
              See all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {madeForYouCollections.map((col) => (
              <div
                key={col.id}
                onClick={() => {
                  if (col.categoryName) onNavigate("library", col.categoryName);
                  else if (col.filterTerm) onNavigate("library", col.filterTerm);
                  else onNavigate("library");
                }}
                className="group p-3 rounded-2xl bg-[#181818] hover:bg-[#242424] cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-md border border-white/5 hover:border-white/10 active:scale-[0.98]"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#202020] shadow-md">
                  <img
                    src={col.cover}
                    alt={col.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={handleImgError}
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute right-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-3 transition-all duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (col.categoryName) onNavigate("library", col.categoryName);
                        else onNavigate("library");
                      }}
                      className="w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-90 transition-transform"
                    >
                      <span
                        className="material-symbols-outlined text-2xl font-bold ml-0.5"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        play_arrow
                      </span>
                    </button>
                  </div>
                </div>

                <div className="min-w-0 flex flex-col">
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate leading-snug group-hover:text-[#1DB954] transition-colors pb-0.5">
                    {col.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-snug">
                    {col.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 🎧 SECTION 7: JUMP BACK IN • RECENT & CONTINUE LISTENING */}
        {/* ============================================================== */}
        <section className="space-y-3.5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-mono leading-none mb-1 block">
                Continue Listening
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                Jump Back In
              </h2>
            </div>
            <button
              onClick={() => onNavigate("library")}
              className="text-xs font-bold text-neutral-400 hover:text-white transition-colors leading-none pb-0.5"
            >
              See all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {jumpBackInSongs.slice(0, 6).map((song, idx) => {
              const isThisPlaying =
                currentSong &&
                (currentSong._id || currentSong.id) === (song._id || song.id) &&
                isPlaying;

              return (
                <div
                  key={song._id || song.id || idx}
                  onClick={() => playSong(song, songs)}
                  className="group p-3 rounded-2xl bg-[#181818] hover:bg-[#242424] cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-md border border-white/5 active:scale-[0.98]"
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#202020] shadow-md">
                    <img
                      src={song.imageUrl || DEFAULT_COVER}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={handleImgError}
                    />

                    <div className="absolute right-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-3 transition-all duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSong(song, songs);
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
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 💖 SECTION 8: TAMIL LOVE SONGS */}
        {/* ============================================================== */}
        <section className="space-y-3.5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 font-mono leading-none mb-1 block">
                Pure Romance
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                Tamil Love Melodies
              </h2>
            </div>
            <button
              onClick={() => onNavigate("library", "Tamil Love")}
              className="text-xs font-bold text-neutral-400 hover:text-white transition-colors leading-none pb-0.5"
            >
              See all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {loveList.map((song, idx) => {
              const isThisPlaying =
                currentSong &&
                (currentSong._id || currentSong.id) === (song._id || song.id) &&
                isPlaying;

              return (
                <div
                  key={song._id || song.id || idx}
                  onClick={() => playSong(song, songs)}
                  className="group p-3 rounded-2xl bg-[#181818] hover:bg-[#242424] cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-md border border-white/5 active:scale-[0.98]"
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#202020] shadow-md">
                    <img
                      src={song.imageUrl || DEFAULT_COVER}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={handleImgError}
                    />

                    <div className="absolute right-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-3 transition-all duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSong(song, songs);
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
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 🌟 SECTION 9: ARTISTS YOU LOVE */}
        {/* ============================================================== */}
        <section className="space-y-3.5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-mono leading-none mb-1 block">
                Legends & Hitmakers
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                Artists You Love
              </h2>
            </div>
            <button
              onClick={() => onNavigate("library")}
              className="text-xs font-bold text-neutral-400 hover:text-white transition-colors leading-none pb-0.5"
            >
              See all
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3.5">
            {featuredArtists.map((artist, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate("library", artist.name)}
                className="group flex flex-col items-center text-center p-3 rounded-2xl hover:bg-[#1e1e1e] cursor-pointer transition-colors active:scale-95 border border-transparent hover:border-white/5"
              >
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-3 bg-[#242424] shadow-xl group-hover:shadow-[#1DB954]/25 border-2 border-white/5 group-hover:border-[#1DB954]/50 transition-all">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate w-full group-hover:text-[#1DB954] transition-colors leading-snug pb-0.5">
                  {artist.name}
                </h4>
                <p className="text-[10px] text-neutral-400 truncate w-full mt-0.5 font-medium leading-normal">
                  {artist.role}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 📊 SECTION 10: TODAY'S TOP TRACKS CANONICAL TABLE */}
        {/* ============================================================== */}
        <section className="space-y-3.5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1DB954] font-mono leading-none mb-1 block">
                Ranked Playlist
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                Today's Top Tracks
              </h2>
            </div>
            <span className="text-xs font-mono text-neutral-400 leading-none pb-0.5">
              {songs.length} Tracks Available
            </span>
          </div>

          <div className="w-full bg-[#181818]/60 rounded-2xl p-2 sm:p-4 border border-white/5">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-4 py-2.5 items-center text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-white/10 font-mono leading-none">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-8 md:col-span-5">Title</div>
              <div className="hidden md:block md:col-span-3">Category</div>
              <div className="col-span-3 md:col-span-3 text-right pr-2">Duration</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-white/5 mt-1">
              {topTracksTable.map((song, idx) => {
                const isThisPlaying =
                  currentSong &&
                  (currentSong._id || currentSong.id) === (song._id || song.id) &&
                  isPlaying;
                const isFav = favorites.has(song._id || song.id);

                return (
                  <div
                    key={song._id || song.id || idx}
                    onClick={() => playSong(song, songs)}
                    className={`grid grid-cols-12 items-center px-4 py-3 rounded-xl hover:bg-[#242424] cursor-pointer group transition-colors text-xs ${
                      isThisPlaying ? "bg-[#242424] text-[#1DB954]" : "text-neutral-300"
                    }`}
                  >
                    {/* Index / Play Indicator */}
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
                          playSong(song, songs);
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

                    {/* Artwork + Title + Artist */}
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
                            isThisPlaying ? "text-[#1DB954]" : "text-white group-hover:text-[#1DB954] transition-colors"
                          }`}
                        >
                          {song.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5 leading-normal">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    {/* Category Pill */}
                    <div className="hidden md:flex md:col-span-3 items-center gap-2 text-neutral-400 text-xs truncate leading-none">
                      <span className="truncate leading-none">{song.category || "Tamil Melodies"}</span>
                      {song.audioMode && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#1DB954] shrink-0 uppercase leading-none inline-flex items-center">
                          {song.audioMode}
                        </span>
                      )}
                    </div>

                    {/* Duration & Heart */}
                    <div className="col-span-3 md:col-span-3 flex items-center justify-end gap-3 text-neutral-400 font-mono text-xs pr-2 leading-none">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(song._id || song.id);
                        }}
                        className="transition-opacity hover:text-white p-1 inline-flex items-center justify-center"
                      >
                        <span
                          className={`material-symbols-outlined text-base ${
                            isFav ? "text-[#1DB954] opacity-100" : "text-neutral-400 opacity-0 group-hover:opacity-100"
                          }`}
                          style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          favorite
                        </span>
                      </button>
                      <span className="leading-none">{song.duration || "4:15"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Milo AI Chat Modal */}
      {showMiloChat && (
        <MiloCatChat
          initialQuery={miloInitialQuery}
          onClose={() => setShowMiloChat(false)}
        />
      )}

      {/* Taste Profile Modal */}
      {showTasteModal && (
        <TasteProfileModal onClose={() => setShowTasteModal(false)} />
      )}
    </div>
  );
}
