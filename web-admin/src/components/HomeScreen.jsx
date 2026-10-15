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
    loadingRecs,
    refreshRecommendations,
    showMiloChat,
    setShowMiloChat,
    miloInitialQuery,
    setMiloInitialQuery,
    offlineNotice,
    setOfflineNotice,
    startOfflineSynth,
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
  const [selectedChip, setSelectedChip] = useState("All");

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

  // Mode header gradient
  const gradientStyles = {
    normal: "from-[#0d3b66]/70 via-[#121212]/90 to-[#121212]",
    "8d": "from-[#1DB954]/20 via-[#181818]/90 to-[#121212]",
    "9d": "from-[#831843]/60 via-[#121212]/90 to-[#121212]",
  }[audioMode || "8d"] || "from-[#1DB954]/20 via-[#181818]/90 to-[#121212]";

  // Top 6 Quick Cards for Spotify 2x3 Grid
  const quickCards = [
    {
      title: "Liked Songs",
      subtitle: `${favorites.size} songs`,
      isLiked: true,
      onClick: () => onNavigate("library"),
    },
    ...songs.slice(0, 5).map((s) => ({
      title: s.title,
      subtitle: s.artist,
      song: s,
      imageUrl: s.imageUrl,
      onClick: () => playSong(s, songs),
    })),
  ];

  // Key Tamil Music Directors & Artists
  const featuredArtists = [
    { name: "Anirudh Ravichander", role: "Rockstar Composer", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiczsZzVgrgqYyrdIAiKEzTYTD24N-A1X7vSr1QWp-QIiT1z32jd9Y_RbcNgncekE8Wj4-eMWoZAj8rXCXcGmtkyQ2w8J_fw1sH2tP1QUInToHVRoSe2qjGabX0AUe48Z63E7XUi9QIgXXIcYp9FRmY9oNzX5Qk1FWGeSQUmUdxDzd88RoX7HgMoy77AsZ4dtH0eJrBoWlPRJ9ZYNAqYuyuCTE9rxzHlgJYjJ6a9-dBgu_1cLJ8fqT" },
    { name: "A. R. Rahman", role: "Mozart of Madras", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2Uxl4CxFbO6z6H3HvzGuLP9Qzgd7fEeVFmJK6ZK3rI6vT3KLTa9P-uG1v0zrwYdcIKnQKTkE6FEd46U67EB6jyNllubA6zewVHDIZWwWNNIcwi4TtP5Mv4evwh9tgX5dVjWYlklbNvbj0nt_guWh62Sj36Ke9I59DwfFC8Emjc2AWVnTNa0LLypq048ITiU0_bCeX14Vyx9ZgxCF6U7YD-mL-WgyA3BedjTwbEy1dbAJTnpJcWapa" },
    { name: "Yuvan Shankar Raja", role: "U1 Drug Dealer", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2uK2P-spDtoLvgyfW6h92vSOM11YqF4FDh6_uPwOLvWwGbSld231Yq4WcEzIW8AHjuOF4Qppq84ff1GqIvS8roQL5_-hjTpUJguVg4BVQt95GRisjjG01rGWSUmBZOCIhrFzE0UerqHyQeGG1syM4i2S8jBIn15mFjCrS5Mv7aT2hydtT5dBHlH687T7MgKahQoi-x5VH-yW_41eC3bAhOr_OkV_GQ6AWxO53F6Bqv6BQzSKcmEpi" },
    { name: "Sai Abhyankkar", role: "Gen-Z Hitmaker", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNcCzasQc3Fq9D-fZRB3efPk-vqkYF_0XP7_TFpGBohJBCjju_a_NoBCggz5fr_gd6IcezlMx2OmGe7l-oXgpYLVpGcVxjaC7eu6q6sHoyIiIu2vTfcMZDj3pTh0CQglYtRCIlDnH2n_J21Ohhcw24-cszhrLBmgLqh6SMyzDWipJyh6IudGx0TYyb_mZ_GcD9JUVtqTHCiLwZGNqavr2Rnq32wNs0tYobarKgZjM_UGSV6v4VLTa6" },
    { name: "Sid Sriram", role: "Melody King", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcnkGgKcVt9oaUTALyDFJUsVQVXBu-_N8Of-Dr2fX0HQrGCxcFUl0DUpHd1ayvSobbIPlAFG5HkdaC2t0mePSiEhm1soUW8kL9xFKd5NDGFR6621GtQzO_vPORaMCTtUj4xe5XOomAM8VxtIfZEvduQWZPxbh87RL-euyPyQb2EL7d0PPKWLupfXca9ycOPa5XwG7AR72xVAUfUpJZcsJGEdmNaiNbTi5graEjPMUli7bw6wAWkGCA" },
    { name: "Ilaiyaraaja", role: "The Maestro", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWUKAZQ1Z4SXtiZHAuwd9xlCf_CQ9AHpEbV0qCWqI-p3pmto2ZPZWqZVQaXh8B4eEipmVefEbj4EhTmhTryQACKXXeSaAnHD9gtogB3zjxUXIrLGuinWKrFzQVv0NI2OaNs1h9Xhrc9u-Px66Qx3skOaDoSktKAHJ9TxcmNSbxm143HKbop7GpaouLCS9mo7IUMKMFj_HWjgtXR1Wk4ScojRVNEm_FrAKSxNTvH8kRexwxHGnuyiWF" },
  ];

  return (
    <div className="w-full flex flex-col font-sans text-slate-200 select-none pb-28 md:pb-16">
      {/* Dynamic Spotify Top Gradient Header */}
      <div className={`p-4 sm:p-6 pb-4 bg-gradient-to-b ${gradientStyles} transition-colors duration-700`}>
        {/* Top Category Filter Chips from Stitch Screen 4aec864f5a6542bfbfcc524f0bbc1de8 */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth mb-5">
          {["All", "Music", "Podcasts", "Audiobooks", "Tamil Hits", "Spatial 8D"].map((chip) => {
            const isActive = selectedChip === chip;
            return (
              <button
                key={chip}
                onClick={() => setSelectedChip(chip)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-transform active:scale-95 shadow-sm ${
                  isActive
                    ? "bg-[#1DB954] text-black font-bold"
                    : "bg-[#282828] text-white hover:bg-[#323232]"
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>

        {/* Top Notification / Cycle Status HUD */}
        {cycleStatus && (
          <div className="flex items-center justify-between px-3.5 py-1.5 rounded-full bg-black/40 border border-[#1DB954]/30 backdrop-blur-md mb-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
              <span className="text-white font-bold">
                Smart No-Repeat Cycle #{cycleStatus.cycleId}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-[#1DB954]">
                {cycleStatus.playedCount} of {cycleStatus.totalEligible || songs.length} Played
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetPlaybackCycle}
                className="text-[10px] text-[#1DB954] hover:underline font-bold"
              >
                Reset ↻
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Spotify Greeting */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {getGreeting()}
          </h1>
          <button
            onClick={() => onNavigate("library")}
            aria-label="Listening History"
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-white active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-2xl">history</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* 🟩 SPOTIFY ICONIC 2x3 TOP QUICK-ACCESS BENTO GRID */}
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
                className="group relative flex items-center bg-[#242424]/80 hover:bg-[#2a2a2a] rounded-lg overflow-hidden cursor-pointer transition-all duration-200 shadow-md active:scale-[0.98]"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 relative bg-[#181818]">
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
                <div className="flex-1 px-2.5 min-w-0 pr-10">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">
                    {card.title}
                  </h4>
                  {card.subtitle && (
                    <p className="text-[10px] sm:text-[11px] text-neutral-400 truncate mt-0.5">
                      {card.subtitle}
                    </p>
                  )}
                </div>

                {/* Spotify Floating Circular Play Button on Hover */}
                <div className="absolute right-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 transition-all duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (card.song) playSong(card.song, songs);
                      else onNavigate("library");
                    }}
                    className="w-9 h-9 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-90 transition-transform"
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

      {/* Main Content Sections (Spotify Body) */}
      <div className="px-4 sm:px-6 space-y-7 mt-2">
        {/* ============================================================== */}
        {/* 🎙️ INTERACTIVE DAILY SOUND CAPSULE BANNER (Stitch Screen 4aec864f) */}
        {/* ============================================================== */}
        <section>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#181818] via-[#242424] to-[#181818] p-4 shadow-lg border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#1DB954]/20 flex items-center justify-center text-[#1DB954] shrink-0 relative">
                <span className="material-symbols-outlined text-2xl">equalizer</span>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1DB954] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1DB954]" />
                </span>
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <span className="text-[10px] font-bold text-[#1DB954] uppercase tracking-wider block">
                  Live Session • 312 Songs
                </span>
                <p className="text-sm font-bold text-white truncate">Your Sound Capsule is ready</p>
                <p className="text-xs text-neutral-400 truncate">
                  312 curated Tamil love songs, melodies & 8D spatial vibes
                </p>
              </div>
              <button
                onClick={() => {
                  if (songs.length > 0) playSong(songs[0], songs);
                }}
                className="w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-lg active:scale-90 transition-transform shrink-0"
              >
                <span
                  className="material-symbols-outlined text-2xl ml-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  play_arrow
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 🌟 SECTION 1: MADE FOR YOU • ML RECOMMENDATIONS */}
        {/* ============================================================== */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block">
                Uniquely yours
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Made For You</span>
                <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
              </h2>
            </div>
            <button
              onClick={() => onNavigate("taste")}
              className="text-xs font-bold text-neutral-400 hover:text-white transition-colors"
            >
              Show all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {(recommendations.length > 0 ? recommendations : songs.slice(0, 6).map((s) => ({ song: s, matchScore: 95 }))).slice(0, 6).map((item, idx) => {
              const song = item.song || item;
              const isThisPlaying =
                currentSong &&
                (currentSong._id || currentSong.id) === (song._id || song.id) &&
                isPlaying;

              return (
                <div
                  key={song._id || song.id || idx}
                  onClick={() => playSong(song, null, true)}
                  className="group p-2.5 rounded-xl bg-[#181818]/90 hover:bg-[#242424] cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-md border border-white/5 active:scale-95"
                >
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-2.5 bg-[#242424] shadow-md">
                    <img
                      src={song.imageUrl || DEFAULT_COVER}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={handleImgError}
                    />

                    {/* Floating Circular Play Button */}
                    <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSong(song, null, true);
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

                    {item.matchScore && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/75 text-[#1DB954] border border-[#1DB954]/30">
                        {item.matchScore}% MATCH
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate group-hover:underline">
                      {song.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {song.artist}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 🎧 SECTION 2: JUMP BACK IN • 8D FOCUS MUSIC */}
        {/* ============================================================== */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block">
                360° Binaural Audio
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Jump Back In • {audioMode?.toUpperCase() || "8D"} Spatial
              </h2>
            </div>
            <button
              onClick={() => onNavigate("library")}
              className="text-xs font-bold text-neutral-400 hover:text-white transition-colors"
            >
              Show all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {songs.slice(6, 12).map((song, idx) => {
              const isThisPlaying =
                currentSong &&
                (currentSong._id || currentSong.id) === (song._id || song.id) &&
                isPlaying;

              return (
                <div
                  key={song._id || song.id || idx}
                  onClick={() => playSong(song, songs)}
                  className="group p-2.5 rounded-xl bg-[#181818]/90 hover:bg-[#242424] cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-md border border-white/5 active:scale-95"
                >
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-2.5 bg-[#242424] shadow-md">
                    <img
                      src={song.imageUrl || DEFAULT_COVER}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={handleImgError}
                    />

                    <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-200">
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

                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate group-hover:underline">
                      {song.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {song.artist}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 🌟 SECTION 3: POPULAR ARTISTS (Spotify Round Artist Avatars) */}
        {/* ============================================================== */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block">
                Top Creators
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Artists You Love
              </h2>
            </div>
            <button
              onClick={() => onNavigate("library")}
              className="text-xs font-bold text-neutral-400 hover:text-white transition-colors"
            >
              Show all
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {featuredArtists.map((artist, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate("library")}
                className="group flex flex-col items-center text-center p-2 rounded-xl hover:bg-[#181818] cursor-pointer transition-colors active:scale-95"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-2 bg-[#242424] shadow-lg group-hover:shadow-[#1DB954]/20 border border-white/5 transition-all">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate w-full group-hover:text-[#1DB954] transition-colors">
                  {artist.name}
                </h4>
                <p className="text-[10px] text-neutral-400 truncate w-full mt-0.5">
                  {artist.role}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 📊 SECTION 4: SPOTIFY CANONICAL TRACK TABLE */}
        {/* ============================================================== */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Today's Top Tracks
            </h2>
            <span className="text-xs font-mono text-neutral-400">
              {songs.length} Tracks Available
            </span>
          </div>

          <div className="w-full">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-3 py-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-white/10">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-8 md:col-span-5">Title</div>
              <div className="hidden md:block md:col-span-3">Category</div>
              <div className="col-span-3 md:col-span-3 text-right pr-2">Duration</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-transparent mt-1">
              {songs.slice(0, 15).map((song, idx) => {
                const isThisPlaying =
                  currentSong &&
                  (currentSong._id || currentSong.id) === (song._id || song.id) &&
                  isPlaying;
                const isFav = favorites.has(song._id || song.id);

                return (
                  <div
                    key={song._id || song.id || idx}
                    onClick={() => playSong(song, songs)}
                    className={`grid grid-cols-12 items-center px-3 py-2.5 rounded-lg hover:bg-[#242424] cursor-pointer group transition-colors text-xs ${
                      isThisPlaying ? "bg-[#242424] text-[#1DB954]" : "text-neutral-300"
                    }`}
                  >
                    {/* # or Play button */}
                    <div className="col-span-1 flex items-center justify-center font-mono text-neutral-400 group-hover:hidden">
                      {isThisPlaying ? (
                        <span className="material-symbols-outlined text-[#1DB954] text-base animate-pulse">
                          equalizer
                        </span>
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className="col-span-1 hidden items-center justify-center group-hover:flex">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSong(song, songs);
                        }}
                        className="text-white hover:text-[#1DB954] transition-colors"
                      >
                        <span
                          className="material-symbols-outlined text-xl"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {isThisPlaying ? "pause" : "play_arrow"}
                        </span>
                      </button>
                    </div>

                    {/* Title + Artist + Thumbnail */}
                    <div className="col-span-8 md:col-span-5 flex items-center gap-3 min-w-0 pr-3">
                      <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-black shadow-sm">
                        <img
                          src={song.imageUrl || DEFAULT_COVER}
                          alt={song.title}
                          className="w-full h-full object-cover"
                          onError={handleImgError}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4
                          className={`font-semibold truncate text-xs sm:text-sm ${
                            isThisPlaying ? "text-[#1DB954]" : "text-white group-hover:text-white"
                          }`}
                        >
                          {song.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    {/* Category & Mood */}
                    <div className="hidden md:flex md:col-span-3 items-center gap-2 text-neutral-400 text-xs truncate">
                      <span className="truncate">{song.category || "Tamil Melodies"}</span>
                      {song.genre && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#1DB954] shrink-0">
                          {song.genre}
                        </span>
                      )}
                    </div>

                    {/* Duration & Favorite */}
                    <div className="col-span-3 md:col-span-3 flex items-center justify-end gap-3 text-neutral-400 font-mono text-xs pr-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(song._id || song.id);
                        }}
                        className="transition-opacity hover:text-white p-1"
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
                      <span>{song.duration || "4:15"}</span>
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
