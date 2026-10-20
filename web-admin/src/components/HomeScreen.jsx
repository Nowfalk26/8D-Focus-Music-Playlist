import React, { useEffect, useMemo, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { songsApi, categoriesApi } from "../api/api";
import TasteProfileModal from "./TasteProfileModal";
import MiloCatChat from "./MiloCatChat";
import staticSongs from "../data/songsData.json";

export default function HomeScreen({ onNavigate }) {
  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    playNext,
    setShowFullPlayer,
    showMiloChat,
    setShowMiloChat,
    miloInitialQuery,
    audioMode,
    openModeSelector,
    favorites,
    toggleFavorite,
  } = usePlayer();

  const [songs, setSongs] = useState(() => staticSongs);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTasteModal, setShowTasteModal] = useState(false);
  const [isFollowingHero, setIsFollowingHero] = useState(true);
  const [followingArtists, setFollowingArtists] = useState(
    new Set(["Leonard Cohen.", "Dazara Wilde", "Jackson Wang", "Billie Eilish"])
  );

  const DEFAULT_COVER =
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&q=85";

  const handleImgError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = DEFAULT_COVER;
  };

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [songsRes, catsRes] = await Promise.all([
          songsApi.getAll({ mode: audioMode }).catch(() => ({ data: { data: [] } })),
          categoriesApi.getAll().catch(() => ({ data: { data: [] } })),
        ]);
        if (!mounted) return;
        const loaded = songsRes.data?.data;
        setSongs(Array.isArray(loaded) && loaded.length > 0 ? loaded : staticSongs);
        setCategories(catsRes.data?.data || []);
      } catch (err) {
        console.warn("Failed to load catalog data:", err);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, [audioMode]);

  const toggleArtistFollow = (name) => {
    setFollowingArtists((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // Showcase Billie Eilish Trending Albums matching reference image exactly
  const trendingAlbums = [
    {
      id: "alb-1",
      title: "Hit Me Hard and Soft",
      plays: "1.52 plays",
      likes: "3.2K",
      cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=85",
      artist: "Billie Eilish",
      audioUrl: "https://aac.saavncdn.com/932/7cf7f8a9d9c3faa2633d1605e97ba4a5_160.mp4",
      audioMode: "8d",
    },
    {
      id: "alb-2",
      title: "Happier Than Ever",
      plays: "982,120 plays",
      likes: "2.1K",
      cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&q=85",
      artist: "Billie Eilish",
      audioUrl: "https://aac.saavncdn.com/001/cf795c655325785055b410f9e9cfda3a_160.mp4",
      audioMode: "8d",
    },
    {
      id: "alb-3",
      title: "Don't Smile at Me",
      plays: "1.22 plays",
      likes: "3.2K",
      cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=85",
      artist: "Billie Eilish",
      audioUrl: "https://aac.saavncdn.com/267/35e80dc0e599d4db2f8d8b9d6a36f94b_160.mp4",
      audioMode: "8d",
    },
  ];

  // Top Artists matching reference image
  const topArtists = [
    {
      name: "Leonard Cohen.",
      role: "Musician",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    },
    {
      name: "Dazara Wilde",
      role: "Musician",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    },
    {
      name: "Jackson Wang",
      role: "Musician",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    },
    {
      name: "Billie Eilish",
      role: "Musician",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80",
    },
  ];

  const heroTrack = currentSong || {
    title: "Billie Eilish",
    artist: "Billie Eilish",
    audioUrl: "https://aac.saavncdn.com/267/35e80dc0e599d4db2f8d8b9d6a36f94b_160.mp4",
    imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&q=85",
    audioMode: "8d",
  };

  const isHeroPlaying =
    currentSong &&
    (currentSong.title?.includes("Billie") ||
      (currentSong.artist && currentSong.artist.includes("Billie"))) &&
    isPlaying;

  return (
    <div className="w-full flex flex-col font-sans text-neutral-100 select-none p-4 sm:p-6 lg:p-7 space-y-7 pb-32">
      {/* ============================================================== */}
      {/* 🌟 1. HERO SHOWCASE BANNER (Matching Reference Image)           */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d2a1a] via-[#091f13] to-[#12281c] border border-white/5 p-6 sm:p-8 lg:p-10 shadow-2xl">
        {/* Subtle decorative green aura / waves in background */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#10b981]/10 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-64 h-64 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-6">
          {/* Left Metadata & Actions */}
          <div className="flex-1 min-w-0 text-left">
            {/* Verified Artist Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25 text-xs font-semibold mb-3">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>Verified Artist</span>
            </div>

            {/* Oversized Bold Artist / Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {currentSong ? currentSong.artist || currentSong.title : "Billie Eilish"}
            </h1>

            {/* Monthly Listeners / Subtitle */}
            <p className="mt-2 text-xs sm:text-sm text-neutral-300 font-medium">
              109,482,631 monthly listeners • {audioMode?.toUpperCase() || "8D"} Spatial Sound
            </p>

            {/* Action Buttons: Mint Following + Circular Play Button */}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsFollowingHero(!isFollowingHero)}
                className={`inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95 shadow-md ${
                  isFollowingHero
                    ? "bg-[#dcfce7] text-[#064e3b] hover:bg-[#bbf7d0]"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <span>{isFollowingHero ? "Following" : "+ Follow"}</span>
                <span className="material-symbols-outlined text-sm font-bold">north_east</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentSong) {
                    togglePlay();
                  } else {
                    playSong(heroTrack, trendingAlbums);
                  }
                }}
                className="w-11 h-11 rounded-full bg-[#10b981] text-black flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-lg shadow-[#10b981]/30"
                title={isHeroPlaying ? "Pause" : "Play"}
              >
                <span
                  className="material-symbols-outlined text-2xl font-bold ml-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isHeroPlaying ? "pause" : "play_arrow"}
                </span>
              </button>
            </div>
          </div>

          {/* Right Featured Artist Cutout Image */}
          <div className="relative shrink-0">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 group">
              <img
                src={
                  currentSong?.imageUrl ||
                  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=700&q=85"
                }
                alt="Featured Artist"
                onError={handleImgError}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 💿 2. TRENDING ALBUMS (Horizontal Grid with 1:1 Aspect Ratio)  */}
      {/* ============================================================== */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Trending Albums
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("library")}
            className="text-xs text-[#10b981] hover:underline font-semibold"
          >
            See All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingAlbums.map((album) => {
            const isPlayingThis =
              currentSong &&
              (currentSong.title === album.title || currentSong._id === album.id) &&
              isPlaying;

            return (
              <div
                key={album.id}
                onClick={() => playSong(album, trendingAlbums)}
                className="group bg-[#161c18] border border-white/5 hover:border-white/10 rounded-2xl p-3.5 transition-all duration-300 cursor-pointer shadow-md hover:-translate-y-1 active:scale-[0.99]"
              >
                {/* 1:1 Aspect Ratio Cover with Floating Play Button on Hover */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#1c2420]">
                  <img
                    src={album.cover}
                    alt={album.title}
                    onError={handleImgError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Floating Play FAB */}
                  <div
                    className={`absolute right-3 bottom-3 transition-all duration-300 ${
                      isPlayingThis
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playSong(album, trendingAlbums);
                      }}
                      className="w-10 h-10 rounded-full bg-[#10b981] text-black flex items-center justify-center shadow-xl"
                    >
                      <span
                        className="material-symbols-outlined text-2xl font-bold ml-0.5"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {isPlayingThis ? "pause" : "play_arrow"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Album Title */}
                <h3 className="text-sm font-bold text-white truncate leading-snug group-hover:text-[#10b981] transition-colors">
                  {album.title}
                </h3>

                {/* Metadata Row: Plays & Likes */}
                <div className="flex items-center gap-4 mt-2 text-[11px] text-neutral-400 font-mono">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-neutral-500">
                      play_arrow
                    </span>
                    <span>{album.plays}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-neutral-500">
                      favorite
                    </span>
                    <span>{album.likes}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 🎤 3. TOP ARTIST (2x2 Grid with Following Buttons)            */}
      {/* ============================================================== */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Top Artist
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("library")}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#161c18] hover:bg-white/10 text-xs text-neutral-300 hover:text-white transition-colors"
          >
            <span>See All</span>
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {topArtists.map((art) => {
            const isFollowing = followingArtists.has(art.name);

            return (
              <div
                key={art.name}
                onClick={() => onNavigate("library", art.name)}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#161c18] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
              >
                {/* Avatar & Name */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={art.avatar}
                    alt={art.name}
                    onError={handleImgError}
                    className="w-12 h-12 rounded-xl object-cover border border-white/5 shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-[#10b981] transition-colors">
                      {art.name}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">{art.role}</p>
                  </div>
                </div>

                {/* Follow Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleArtistFollow(art.name);
                  }}
                  className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 shrink-0 ${
                    isFollowing
                      ? "bg-white/10 hover:bg-white/15 text-neutral-200 border border-white/10"
                      : "bg-[#10b981] hover:bg-[#1ed760] text-black font-bold shadow-md shadow-[#10b981]/20"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {isFollowing ? "person_check" : "person_add"}
                  </span>
                  <span>{isFollowing ? "Following" : "Follow"}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Add Song Affordance */}
      <section className="pt-2">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#10b981]/15 to-transparent border border-[#10b981]/25">
          <div>
            <h4 className="text-sm font-bold text-white">Add Songs From Your System</h4>
            <p className="text-xs text-neutral-400 mt-0.5">
              Upload MP3s, stream spatial audio, and listen across any device.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("search")}
            className="px-4 py-2 rounded-full bg-[#10b981] hover:bg-[#1ed760] text-black text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-[#10b981]/20 shrink-0"
          >
            <span className="material-symbols-outlined text-base font-bold">add</span>
            <span>+ Add Song</span>
          </button>
        </div>
      </section>

      {showMiloChat && (
        <MiloCatChat initialQuery={miloInitialQuery} onClose={() => setShowMiloChat(false)} />
      )}
      {showTasteModal && <TasteProfileModal onClose={() => setShowTasteModal(false)} />}
    </div>
  );
}
