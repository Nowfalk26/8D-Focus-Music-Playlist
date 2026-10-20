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
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'music' | 'podcasts'
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

  // Compact Trending Albums matching reference image with 4 evenly distributed cards
  const trendingAlbums = [
    {
      id: "alb-1",
      title: "Hit Me Hard and Soft",
      plays: "1.5M Plays",
      cover: "/album-hitmehard.png",
      imageUrl: "/album-hitmehard.png",
      artist: "Billie Eilish",
      audioUrl: "https://aac.saavncdn.com/932/7cf7f8a9d9c3faa2633d1605e97ba4a5_160.mp4",
      audioMode: "8d",
    },
    {
      id: "alb-2",
      title: "Happier Than Ever",
      plays: "982K Plays",
      cover: "/album-happier.png",
      imageUrl: "/album-happier.png",
      artist: "Billie Eilish",
      audioUrl: "https://aac.saavncdn.com/001/cf795c655325785055b410f9e9cfda3a_160.mp4",
      audioMode: "8d",
    },
    {
      id: "alb-3",
      title: "Don't Smile at Me",
      plays: "1.2M Plays",
      cover: "/album-dontsmile.png",
      imageUrl: "/album-dontsmile.png",
      artist: "Billie Eilish",
      audioUrl: "https://aac.saavncdn.com/267/35e80dc0e599d4db2f8d8b9d6a36f94b_160.mp4",
      audioMode: "8d",
    },
    {
      id: "alb-4",
      title: "When We All Fall Asleep",
      plays: "2.4M Plays",
      cover: "/album-whenwefall.png",
      imageUrl: "/album-whenwefall.png",
      artist: "Billie Eilish",
      audioUrl: "https://aac.saavncdn.com/932/7cf7f8a9d9c3faa2633d1605e97ba4a5_160.mp4",
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
    cover: "/billie-nowplaying.png",
    audioMode: "8d",
  };

  const isHeroPlaying =
    currentSong &&
    (currentSong.title?.includes("Billie") ||
      (currentSong.artist && currentSong.artist.includes("Billie"))) &&
    isPlaying;

  return (
    <div className="w-full min-w-0 flex flex-col font-sans text-neutral-100 select-none p-4 sm:p-5 lg:p-6 space-y-6 sm:space-y-7 pb-36 max-w-[1300px] mx-auto box-border">
      {/* ============================================================== */}
      {/* 🔘 TOP FILTER PILL BUTTONS (All, Music, Podcasts)              */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 shrink-0 pt-0.5 pb-0.5">
        {[
          { id: "all", label: "All" },
          { id: "music", label: "Music" },
          { id: "podcasts", label: "Podcasts" },
        ].map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`h-8 px-4 rounded-full text-xs font-bold transition-all duration-150 inline-flex items-center justify-center text-center leading-none whitespace-nowrap shadow-sm select-none ${
                isActive
                  ? "bg-white text-black font-extrabold shadow-md"
                  : "bg-[#222222] hover:bg-[#2c2c2c] text-neutral-200 hover:text-white border border-white/5"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 🌟 1. REDESIGNED HERO BANNER (Compact & Balanced Alignment)     */}
      {/* ============================================================== */}
      {activeFilter !== "podcasts" && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#141b17] via-[#111613] to-[#151a17] border border-[#262626] p-5 sm:p-6 lg:p-7 shadow-xl">
          {/* Subtle dark ambient aura */}
          <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-[#10b981]/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-5 lg:gap-8">
            {/* Left Metadata & Actions */}
            <div className="flex-1 min-w-0 text-left py-0.5">
              {/* Verified Artist Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-neutral-300 border border-white/10 text-xs font-semibold mb-2.5">
                <span className="material-symbols-outlined text-sm text-[#10b981]">verified</span>
                <span>Verified Artist</span>
              </div>

              {/* Oversized Bold Artist Name */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Billie Eilish
              </h1>

              {/* Monthly Listeners / Metadata */}
              <p className="mt-1.5 text-xs sm:text-sm text-[#a1a1aa] font-medium">
                109,482,631 monthly listeners
              </p>

              {/* Action Buttons: Standard "Listen now" Stadium Pill + Following Pill */}
              <div className="mt-5 flex items-center gap-3 shrink-0">
                {/* Primary "Listen now" CTA matching user reference */}
                <button
                  type="button"
                  onClick={() => {
                    if (currentSong && isHeroPlaying) {
                      togglePlay();
                    } else {
                      playSong(heroTrack, trendingAlbums);
                    }
                  }}
                  className="h-10 px-6 rounded-full bg-[#10b981] hover:bg-[#059669] text-black font-extrabold text-sm inline-flex items-center justify-center text-center leading-none gap-2 transition-all active:scale-95 shadow-md shadow-[#10b981]/25 shrink-0 select-none whitespace-nowrap"
                  title={isHeroPlaying ? "Pause" : "Listen now to Billie Eilish"}
                >
                  <span
                    className="material-symbols-outlined text-xl font-bold"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {isHeroPlaying ? "pause" : "play_arrow"}
                  </span>
                  <span>{isHeroPlaying ? "Pause" : "Listen now"}</span>
                </button>

                {/* Following Pill Button */}
                <button
                  type="button"
                  onClick={() => setIsFollowingHero(!isFollowingHero)}
                  className={`h-10 px-5 rounded-full text-xs sm:text-[13px] font-bold inline-flex items-center justify-center text-center leading-none gap-1.5 transition-all active:scale-95 shadow-sm shrink-0 whitespace-nowrap select-none border ${
                    isFollowingHero
                      ? "bg-[#dcfce7] text-[#064e3b] border-transparent hover:bg-[#bbf7d0]"
                      : "bg-white/10 text-white border-white/10 hover:bg-white/15"
                  }`}
                >
                  <span>{isFollowingHero ? "Following" : "+ Follow"}</span>
                  <span className="material-symbols-outlined text-sm font-bold">north_east</span>
                </button>
              </div>
            </div>

            {/* Right Featured Artist Cut-Out Artwork (Proportionate & Sleek) */}
            <div className="relative shrink-0 flex items-center justify-center w-full md:w-auto">
              <div className="relative w-full max-w-[240px] sm:max-w-[280px] md:w-64 md:h-48 lg:w-72 lg:h-52 h-44 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group bg-[#0e1712]">
                <img
                  src="/billie-hero.png"
                  alt="Billie Eilish"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 💿 2. TRENDING ALBUMS (Full-Width Even Distribution & Uniform)  */}
      {/* ============================================================== */}
      {activeFilter !== "podcasts" && (
        <section className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Trending Albums
            </h2>
            <button
              type="button"
              onClick={() => onNavigate("library")}
              className="h-8 px-4 rounded-full bg-[#181818] hover:bg-[#242424] text-neutral-200 hover:text-white text-xs font-bold border border-[#262626] inline-flex items-center justify-center text-center leading-none transition-colors whitespace-nowrap select-none"
            >
              See All
            </button>
          </div>

          {/* 4 Cards evenly distributed across full width with 1:1 Aspect Ratio */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 w-full">
            {trendingAlbums.map((album) => {
              const isPlayingThis =
                currentSong &&
                (currentSong.title === album.title || currentSong._id === album.id) &&
                isPlaying;

              return (
                <div
                  key={album.id}
                  onClick={() => playSong(album, trendingAlbums)}
                  className="group flex flex-col justify-between bg-[#181818] border border-[#262626] hover:border-white/20 rounded-2xl p-3 transition-all duration-200 cursor-pointer shadow-md hover:-translate-y-0.5 w-full h-full"
                >
                  {/* 1:1 Square Aspect Ratio Cover */}
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#202020] mb-2.5 shrink-0">
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

                  {/* Song/Album Title with Truncation to prevent clipping */}
                  <div className="flex flex-col min-w-0 w-full">
                    <h3
                      className="text-xs sm:text-sm font-bold text-white truncate leading-snug group-hover:text-[#10b981] transition-colors"
                      title={album.title}
                    >
                      {album.title}
                    </h3>

                    {/* Muted Play Count Label Directly Beneath */}
                    <p className="text-[11px] text-[#a1a1aa] font-medium mt-1 truncate">
                      {album.plays}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 🎤 3. TOP ARTISTS (Full-Width Responsive Grid)                 */}
      {/* ============================================================== */}
      {activeFilter !== "podcasts" && (
        <section className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Top Artist
            </h2>
            <button
              type="button"
              onClick={() => onNavigate("library")}
              className="h-8 px-4 rounded-full bg-[#181818] hover:bg-[#242424] text-neutral-200 hover:text-white text-xs font-bold border border-[#262626] inline-flex items-center justify-center text-center leading-none gap-1 transition-colors whitespace-nowrap select-none"
            >
              <span>See All</span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
          </div>

          {/* 2x2 Grid spanning full width */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5 w-full">
            {topArtists.map((art) => {
              const isFollowing = followingArtists.has(art.name);

              return (
                <div
                  key={art.name}
                  onClick={() => onNavigate("library", art.name)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#181818] border border-[#262626] hover:border-white/15 transition-all cursor-pointer group"
                >
                  {/* Avatar & Metadata */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={art.avatar}
                      alt={art.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/5 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex flex-col justify-center">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#10b981] transition-colors">
                        {art.name}
                      </h4>
                      <p className="text-[11px] text-[#a1a1aa] mt-0.5">{art.role}</p>
                    </div>
                  </div>

                  {/* Follow Button: Standardized 32px height with centered text and pill shape */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleArtistFollow(art.name);
                    }}
                    className={`h-8 min-w-[92px] px-4 rounded-full text-xs font-bold inline-flex items-center justify-center text-center leading-none gap-1.5 transition-all active:scale-95 shrink-0 whitespace-nowrap select-none ${
                      isFollowing
                        ? "bg-white/5 hover:bg-white/10 text-neutral-300 border border-[#262626]"
                        : "bg-[#10b981] hover:bg-[#059669] text-black shadow-sm"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm font-bold">
                      {isFollowing ? "check" : "add"}
                    </span>
                    <span>{isFollowing ? "Following" : "Follow"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 🎙️ 4. PODCAST SHOWS (Visible when Podcasts filter is active)     */}
      {/* ============================================================== */}
      {activeFilter === "podcasts" && (
        <section className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Podcasts & Spatial Audio Shows
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {[
              {
                id: "pod-1",
                title: "8D Binaural Science & Spatial Audio",
                host: "GreenWave Sound Labs",
                episodes: "Episode 14 • 28 mins",
                cover: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=240&q=80",
                desc: "An exploration of how 8D audio interacts with neural oscillation and deep focus.",
              },
              {
                id: "pod-2",
                title: "Studio Deconstructions",
                host: "Billie Eilish & FINNEAS",
                episodes: "Episode 06 • 42 mins",
                cover: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=240&q=80",
                desc: "Behind the mixes of Hit Me Hard and Soft and spatial production techniques.",
              },
              {
                id: "pod-3",
                title: "Neuro-Acoustic States",
                host: "Dr. Alistair Vance",
                episodes: "Episode 21 • 35 mins",
                cover: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=240&q=80",
                desc: "Using theta waves and binaural motion to enter creative flow states.",
              },
            ].map((pod) => (
              <div
                key={pod.id}
                className="p-4 rounded-2xl bg-[#181818] border border-[#262626] hover:border-white/20 transition-all flex flex-col justify-between group cursor-pointer shadow-md"
              >
                <div className="flex gap-3 mb-3">
                  <img
                    src={pod.cover}
                    alt={pod.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-[#10b981] uppercase font-bold">
                      Podcast Show
                    </span>
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-[#10b981] transition-colors mt-0.5">
                      {pod.title}
                    </h3>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">{pod.host}</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 line-clamp-2 mb-3 leading-relaxed">
                  {pod.desc}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-neutral-400 font-mono">
                  <span>{pod.episodes}</span>
                  <button
                    type="button"
                    className="h-8 px-4 rounded-full bg-[#10b981] hover:bg-[#059669] text-black font-sans font-extrabold text-xs inline-flex items-center justify-center text-center leading-none gap-1 hover:scale-105 active:scale-95 transition-transform select-none"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">play_arrow</span>
                    <span>Listen now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add Custom Songs Affordance */}
      <section className="pt-1">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#181818] border border-[#262626]">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">Upload Your Own Audio</h4>
            <p className="text-[11px] text-[#a1a1aa] mt-0.5">
              Add MP3 songs from your system and listen in 8D Spatial Audio.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("search")}
            className="h-9 px-5 rounded-full bg-[#10b981] hover:bg-[#059669] text-black text-xs sm:text-[13px] font-extrabold inline-flex items-center justify-center text-center leading-none gap-1.5 transition-all active:scale-95 shrink-0 whitespace-nowrap shadow-sm select-none"
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
