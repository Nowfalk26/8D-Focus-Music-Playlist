import React, { useEffect, useState } from "react";
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
    audioMode,
    showMiloChat,
    setShowMiloChat,
    miloInitialQuery,
  } = usePlayer();

  const [songs, setSongs] = useState(() => staticSongs);
  const [categories, setCategories] = useState([]);
  const [showTasteModal, setShowTasteModal] = useState(false);
  const [isFollowingHero, setIsFollowingHero] = useState(true);
  const [followingArtists, setFollowingArtists] = useState(
    new Set(["Leonard Cohen.", "Dazara Wilde", "Jackson Wang", "Billie Eilish"])
  );

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

  // Compact Trending Albums matching reference image exactly
  const trendingAlbums = [
    {
      id: "alb-1",
      title: "Hit Me Hard and Soft",
      plays: "1.5M Plays",
      cover: "/album-hitmehard.png",
      artist: "Billie Eilish",
      audioUrl: "https://aac.saavncdn.com/932/7cf7f8a9d9c3faa2633d1605e97ba4a5_160.mp4",
      audioMode: "8d",
    },
    {
      id: "alb-2",
      title: "Happier Than Ever",
      plays: "982K Plays",
      cover: "/album-happier.png",
      artist: "Billie Eilish",
      audioUrl: "https://aac.saavncdn.com/001/cf795c655325785055b410f9e9cfda3a_160.mp4",
      audioMode: "8d",
    },
    {
      id: "alb-3",
      title: "Don't Smile at Me",
      plays: "1.2M Plays",
      cover: "/album-dontsmile.png",
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
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&q=80",
    },
    {
      name: "Dazara Wilde",
      role: "Musician",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&q=80",
    },
    {
      name: "Jackson Wang",
      role: "Musician",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&q=80",
    },
    {
      name: "Billie Eilish",
      role: "Musician",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&q=80",
    },
  ];

  const heroTrack = {
    title: "No Time to Die",
    artist: "Billie Eilish",
    album: "Hit Me Hard and Soft",
    audioUrl: "https://aac.saavncdn.com/267/35e80dc0e599d4db2f8d8b9d6a36f94b_160.mp4",
    imageUrl: "/billie-nowplaying.png",
    audioMode: "8d",
  };

  const isHeroPlaying =
    currentSong &&
    (currentSong.title?.includes("Billie") ||
      (currentSong.artist && currentSong.artist.includes("Billie"))) &&
    isPlaying;

  return (
    <div className="w-full flex flex-col font-sans text-neutral-100 select-none p-5 sm:p-7 space-y-7 pb-32 max-w-[1250px] mx-auto">
      {/* ============================================================== */}
      {/* 🌟 1. REDESIGNED HERO BANNER (With High-Res Billie Cutout Art)  */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0c2417] via-[#0b1c12] to-[#111f17] border border-[#282828] p-6 sm:p-8 lg:p-9 shadow-xl">
        {/* Subtle organic green background aura */}
        <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-[#10b981]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-6">
          {/* Left Metadata & Actions */}
          <div className="flex-1 min-w-0 text-left">
            {/* Verified Artist Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 text-xs font-semibold mb-3">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>Verified Artist</span>
            </div>

            {/* Oversized Bold Artist Name */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Billie Eilish
            </h1>

            {/* Monthly Listeners / Metadata in Muted Gray */}
            <p className="mt-2 text-xs sm:text-sm text-[#a1a1aa] font-medium">
              109,482,631 monthly listeners
            </p>

            {/* Action Buttons: Mint Following + Circular Play Button */}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsFollowingHero(!isFollowingHero)}
                className={`inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm ${
                  isFollowingHero
                    ? "bg-[#dcfce7] text-[#064e3b] hover:bg-[#bbf7d0]"
                    : "bg-white/10 text-white hover:bg-white/15"
                }`}
              >
                <span>{isFollowingHero ? "Following" : "+ Follow"}</span>
                <span className="material-symbols-outlined text-sm font-bold">north_east</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentSong && isHeroPlaying) {
                    togglePlay();
                  } else {
                    playSong(heroTrack, trendingAlbums);
                  }
                }}
                className="w-11 h-11 rounded-full bg-[#10b981] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#10b981]/30"
                title={isHeroPlaying ? "Pause" : "Play Billie Eilish"}
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

          {/* Right Featured Artist Cut-Out Artwork (Exact Billie from Screenshot) */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="relative w-48 h-44 sm:w-56 sm:h-52 lg:w-64 lg:h-56 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group bg-[#0e1f15]">
              <img
                src="/billie-hero.png"
                alt="Billie Eilish"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 💿 2. COMPACT TRENDING ALBUMS (~140px-160px Uniform Size)       */}
      {/* ============================================================== */}
      <section>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Trending Albums
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("library")}
            className="text-xs text-[#a1a1aa] hover:text-[#10b981] font-semibold transition-colors"
          >
            See All
          </button>
        </div>

        {/* Scaled-down compact album card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3.5 sm:gap-4 max-w-xl">
          {trendingAlbums.map((album) => {
            const isPlayingThis =
              currentSong &&
              (currentSong.title === album.title || currentSong._id === album.id) &&
              isPlaying;

            return (
              <div
                key={album.id}
                onClick={() => playSong(album, trendingAlbums)}
                className="group bg-[#181818] border border-[#282828] hover:border-white/20 rounded-2xl p-2.5 transition-all duration-200 cursor-pointer shadow-md hover:-translate-y-0.5"
              >
                {/* 1:1 Square Aspect Ratio (~140px - 150px) */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#202020] mb-2">
                  <img
                    src={album.cover}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Floating Circular Play FAB */}
                  <div
                    className={`absolute right-2 bottom-2 transition-all duration-200 ${
                      isPlayingThis
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playSong(album, trendingAlbums);
                      }}
                      className="w-8 h-8 rounded-full bg-[#10b981] text-black flex items-center justify-center shadow-lg"
                    >
                      <span
                        className="material-symbols-outlined text-lg font-bold ml-0.5"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {isPlayingThis ? "pause" : "play_arrow"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Song/Album Title in Bold White */}
                <h3 className="text-xs font-bold text-white truncate leading-snug group-hover:text-[#10b981] transition-colors">
                  {album.title}
                </h3>

                {/* Muted Play Count Label Directly Beneath */}
                <p className="text-[11px] text-[#a1a1aa] font-mono mt-0.5 truncate">
                  {album.plays}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 🎤 3. TOP ARTIST (2x2 Grid with Following Buttons)            */}
      {/* ============================================================== */}
      <section>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Top Artist
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("library")}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#181818] hover:bg-white/10 text-xs text-[#a1a1aa] hover:text-white transition-colors border border-[#282828]"
          >
            <span>See All</span>
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
          {topArtists.map((art) => {
            const isFollowing = followingArtists.has(art.name);

            return (
              <div
                key={art.name}
                onClick={() => onNavigate("library", art.name)}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-[#181818] border border-[#282828] hover:border-white/15 transition-all cursor-pointer group"
              >
                {/* Avatar & Metadata */}
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={art.avatar}
                    alt={art.name}
                    className="w-11 h-11 rounded-xl object-cover border border-white/5 shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex flex-col justify-center">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#10b981] transition-colors">
                      {art.name}
                    </h4>
                    <p className="text-[11px] text-[#a1a1aa] mt-0.5">{art.role}</p>
                  </div>
                </div>

                {/* Follow Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleArtistFollow(art.name);
                  }}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 shrink-0 ${
                    isFollowing
                      ? "bg-white/5 hover:bg-white/10 text-[#a1a1aa] hover:text-white border border-[#282828]"
                      : "bg-[#10b981] hover:bg-[#059669] text-black font-bold shadow-sm"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {isFollowing ? "check" : "add"}
                  </span>
                  <span>{isFollowing ? "Following" : "Follow"}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Add Custom Songs Affordance */}
      <section className="pt-1">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#181818] border border-[#282828]">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">Upload Your Own Audio</h4>
            <p className="text-[11px] text-[#a1a1aa] mt-0.5">
              Add MP3 songs from your system and listen in 8D Spatial Audio.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("search")}
            className="px-4 py-2 rounded-full bg-[#10b981] hover:bg-[#059669] text-black text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
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
