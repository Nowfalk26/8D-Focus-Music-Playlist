import React, { useEffect, useMemo, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { songsApi, categoriesApi } from "../api/api";
import TasteProfileModal from "./TasteProfileModal";
import MiloCatChat from "./MiloCatChat";
import LiveSearchAutocomplete from "./LiveSearchAutocomplete";
import staticSongs from "../data/songsData.json";

/**
 * Flow 8D HomeScreen — redesigned to match the supplied premium dark UI reference.
 * Keeps the existing PlayerContext, song/category APIs, navigation callbacks,
 * favorites, audio mode, cycle controls, and modal integrations.
 */
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

  const [songs, setSongs] = useState(() => staticSongs);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTasteModal, setShowTasteModal] = useState(false);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const DEFAULT_COVER =
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=900&q=85";

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
      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, [audioMode]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const filteredSongs = useMemo(() => {
    let list = songs;
    if (activeFilter === "Tamil Hits") {
      list = list.filter((song) => /tamil|love|melody/i.test(`${song.category || ""} ${song.genre || ""}`));
    } else if (activeFilter === "Spatial 8D") {
      list = list.filter((song) => /8d/i.test(song.audioMode || ""));
    }
    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      list = list.filter((song) =>
        `${song.title || ""} ${song.artist || ""} ${song.category || ""} ${song.genre || ""}`
          .toLowerCase()
          .includes(needle)
      );
    }
    return list;
  }, [songs, activeFilter, query]);

  const featuredSong = filteredSongs[0] || songs[0] || null;
  const trendingSongs = filteredSongs.slice(0, 6);
  const jumpBackInSongs = filteredSongs.slice(6, 12);
  const loveSongs = filteredSongs.filter((song) =>
    /love|kaadhal|kadhal|romance/i.test(`${song.category || ""} ${song.genre || ""} ${song.title || ""}`)
  ).slice(0, 6);
  const melodySongs = filteredSongs.filter((song) =>
    /melody|melod/i.test(`${song.category || ""} ${song.genre || ""}`)
  ).slice(0, 6);

  const collections = [
    {
      id: "love-vibes",
      title: "Love Vibes Mix",
      subtitle: "Your daily dose of love songs",
      cover: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=700&q=85",
      category: "Tamil Love",
      tone: "from-rose-950/20",
    },
    {
      id: "melody",
      title: "Melody Essentials",
      subtitle: "Soulful Tamil melodies",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700&q=85",
      category: "Tamil Melodies",
      tone: "from-amber-950/20",
    },
    {
      id: "8d",
      title: "8D Spatial Hits",
      subtitle: "Feel music around you",
      cover: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=85",
      category: "8D",
      tone: "from-cyan-950/20",
    },
    {
      id: "9d",
      title: "9D Immersive Mix",
      subtitle: "A deeper listening experience",
      cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=700&q=85",
      category: "9D",
      tone: "from-purple-950/20",
    },
    {
      id: "anirudh",
      title: "Anirudh Special",
      subtitle: "Hits and fan favourites",
      cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=700&q=85",
      filter: "Anirudh",
      tone: "from-emerald-950/20",
    },
    {
      id: "u1",
      title: "U1 Melodies",
      subtitle: "Timeless love songs",
      cover: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=700&q=85",
      filter: "Yuvan",
      tone: "from-indigo-950/20",
    },
  ];

  const artists = [
    { name: "Anirudh Ravichander", role: "Rockstar", cover: collections[4].cover },
    { name: "Hiphop Tamizha", role: "Pioneer", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80" },
    { name: "A. R. Rahman", role: "Mozart of Madras", cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&q=80" },
    { name: "Yuvan Shankar Raja", role: "Melody maker", cover: collections[5].cover },
    { name: "Sid Sriram", role: "Vocalist", cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&q=80" },
    { name: "Ilaiyaraaja", role: "Maestro", cover: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&q=80" },
  ];

  const isCurrent = (song) =>
    song && currentSong &&
    (currentSong._id || currentSong.id) === (song._id || song.id);
  const play = (song, list = songs) => song && playSong(song, list);

  const SongCard = ({ song, index = 0, compact = false }) => (
    <button
      key={song._id || song.id || `${song.title}-${index}`}
      type="button"
      onClick={() => play(song, filteredSongs)}
      className={`group min-w-0 text-left rounded-2xl border border-white/5 bg-[#181818] hover:bg-[#222222] hover:border-white/10 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954] shadow-md ${
        compact ? "p-2.5" : "p-3"
      }`}
    >
      <div className={`relative overflow-hidden rounded-xl bg-[#202020] shadow-md ${compact ? "aspect-[1.15/1]" : "aspect-square"}`}>
        <img
          src={song.imageUrl || DEFAULT_COVER}
          alt={song.title || "Song artwork"}
          onError={handleImgError}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded-md border border-[#1DB954]/40 bg-black/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1DB954] backdrop-blur inline-flex items-center justify-center text-center leading-none">
          {song.audioMode || audioMode || "8D"}
        </span>
        <span
          className={`absolute bottom-2.5 right-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-[#1DB954] text-black shadow-xl shadow-black/60 transition-all duration-200 ${
            isCurrent(song) && isPlaying
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95"
          }`}
        >
          <span className="material-symbols-outlined text-2xl font-bold ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isCurrent(song) && isPlaying ? "pause" : "play_arrow"}
          </span>
        </span>
      </div>
      <div className="mt-3 min-w-0">
        <p className={`truncate text-sm font-bold leading-snug ${isCurrent(song) ? "text-[#1DB954]" : "text-white group-hover:text-white"}`}>
          {song.title}
        </p>
        <p className="mt-1 truncate text-xs text-neutral-400 group-hover:text-neutral-300">
          {song.artist || "Flow 8D Artist"}
        </p>
        <div className="mt-2.5 flex items-center justify-between gap-2 pt-1 border-t border-white/5">
          <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-neutral-400">
            <span className={`h-1.5 w-1.5 rounded-full ${isCurrent(song) && isPlaying ? "bg-[#1DB954] animate-pulse" : "bg-neutral-600"}`} />
            <span className="truncate">{song.category || song.genre || "Tamil"}</span>
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              toggleFavorite(song._id || song.id);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                toggleFavorite(song._id || song.id);
              }
            }}
            className={`material-symbols-outlined text-base transition-colors ${
              favorites.has(song._id || song.id) ? "text-[#1DB954]" : "text-neutral-500 hover:text-white"
            }`}
            style={{ fontVariationSettings: favorites.has(song._id || song.id) ? "'FILL' 1" : "'FILL' 0" }}
            aria-label="Toggle favorite"
          >
            favorite
          </span>
        </div>
      </div>
    </button>
  );

  const SectionHeading = ({ eyebrow, title, subtitle, onSeeAll }) => (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">{eyebrow}</p>}
        <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-slate-400 sm:text-sm">{subtitle}</p>}
      </div>
      {onSeeAll && (
        <button type="button" onClick={onSeeAll} className="shrink-0 text-xs font-semibold text-slate-400 transition hover:text-emerald-300">
          See all <span aria-hidden="true">→</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-full select-none bg-transparent p-4 sm:p-6 lg:p-8 space-y-8 pb-36 font-sans text-slate-100 max-w-[1700px] mx-auto">
      {/* Category Filter Pills (Matching Spotify Reference) */}
      <nav className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pt-1" aria-label="Music categories">
        {["All", "Music", "Podcasts", "Audiobooks", "Tamil Hits", "Spatial 8D"].map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`spotify-cat-btn !text-xs !min-h-[32px] !py-1.5 !px-4 ${
              activeFilter === filter ? "spotify-cat-btn-active font-bold" : "spotify-cat-btn-inactive font-bold"
            }`}
          >
            <span className="inline-flex items-center justify-center text-center leading-none px-0.5">
              {filter}
            </span>
          </button>
        ))}
        {cycleStatus && (
          <button
            type="button"
            onClick={resetPlaybackCycle}
            title="Reset playback cycle"
            className="spotify-cat-btn spotify-cat-btn-inactive ml-auto text-emerald-300 !border-emerald-400/25 !gap-2 hover:!bg-emerald-400/10 !text-xs !min-h-[32px] !py-1.5 !px-4"
          >
            <span className="inline-flex items-center justify-center text-center leading-none px-0.5">
              Cycle #{cycleStatus.cycleId || 1} · {cycleStatus.playedCount}/{cycleStatus.totalEligible || songs.length} played ↻
            </span>
          </button>
        )}
      </nav>

      {/* Main Content Area */}
      <div className="space-y-8">
        {/* Greeting + featured track */}
        <section className="grid gap-4 xl:grid-cols-[0.85fr_1.5fr]">
          <div className="flex min-h-[200px] flex-col items-center justify-center text-center rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#101a1c] to-[#0b1014] p-6 sm:p-8 shadow-xl">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
              Flow 8D · Spatial Audio Experience
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl xl:text-5xl">
              {greeting.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="text-emerald-400">{greeting.split(" ").slice(-1)}</span>
            </h1>
            <p className="mt-2.5 max-w-md text-sm leading-6 text-slate-300">
              Feel the music in a whole new dimension.
            </p>
            <div className="mt-4 inline-flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span>{(songs.length || staticSongs.length).toLocaleString()} tracks in your music library</span>
            </div>
          </div>

          {featuredSong ? (
            <div className="group relative isolate flex min-h-[180px] overflow-hidden rounded-3xl border border-white/10 bg-[#11151b]">
              <img src={featuredSong.imageUrl || DEFAULT_COVER} alt="" onError={handleImgError} className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45 transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#080d10] via-[#080d10]/80 to-[#080d10]/25" />
              <div className="flex w-full items-center gap-4 p-5 sm:gap-6 sm:p-7">
                <img src={featuredSong.imageUrl || DEFAULT_COVER} alt={featuredSong.title} onError={handleImgError} className="hidden h-28 w-28 shrink-0 rounded-2xl border border-white/10 object-cover shadow-2xl sm:block md:h-36 md:w-36" />
                <div className="min-w-0 flex-1">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">Featured track · Now discover</p>
                  <h2 className="line-clamp-2 text-2xl font-black tracking-tight text-white sm:text-3xl">{featuredSong.title}</h2>
                  <p className="mt-2 truncate text-sm text-slate-300">{featuredSong.artist}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => play(featuredSong, filteredSongs)} className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-bold text-[#04100a] transition hover:bg-emerald-300">
                      <span className="material-symbols-outlined">{isCurrent(featuredSong) && isPlaying ? "pause" : "play_arrow"}</span>
                      {isCurrent(featuredSong) && isPlaying ? "Pause" : "Play now"}
                    </button>
                    <button type="button" onClick={() => toggleFavorite(featuredSong._id || featuredSong.id)} className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${favorites.has(featuredSong._id || featuredSong.id) ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-white/15 bg-white/5 text-white hover:bg-white/10"}`} aria-label="Favorite featured song">
                      <span className="material-symbols-outlined">{favorites.has(featuredSong._id || featuredSong.id) ? "favorite" : "favorite_border"}</span>
                    </button>
                    <button type="button" onClick={() => onNavigate("orbit")} className="rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10">360° Stage</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-3xl border border-white/[0.06] bg-[#10161a] p-6 text-center text-sm text-slate-400">
              <span className="material-symbols-outlined mb-2 text-3xl text-slate-600">music_off</span>
              <p className="font-semibold text-slate-300">Your playlist is empty</p>
              <p className="mt-1 text-xs text-slate-500">All songs have been removed. Add or upload new tracks to start listening.</p>
            </div>
          )}
        </section>

        {/* Quick library shortcuts */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <button type="button" onClick={() => onNavigate("library", "Favorites")} className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#11171b] p-3 text-left transition hover:border-emerald-400/30 hover:bg-[#151e22]">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-400 text-white"><span className="material-symbols-outlined text-2xl">favorite</span></span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-white">Liked Songs</span><span className="mt-1 block text-xs text-slate-400">{favorites.size} songs saved</span></span>
            <span className="material-symbols-outlined text-slate-500 transition group-hover:text-emerald-300">arrow_forward</span>
          </button>
          <button type="button" onClick={() => onNavigate("library", "Tamil Love")} className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#11171b] p-3 text-left transition hover:border-emerald-400/30 hover:bg-[#151e22]">
            <img src={collections[0].cover} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-white">Tamil Love</span><span className="mt-1 block text-xs text-slate-400">Romantic favourites</span></span>
            <span className="material-symbols-outlined text-slate-500 transition group-hover:text-emerald-300">arrow_forward</span>
          </button>
          <button type="button" onClick={() => onNavigate("library", "Tamil Melodies")} className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#11171b] p-3 text-left transition hover:border-emerald-400/30 hover:bg-[#151e22]">
            <img src={collections[1].cover} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-white">Tamil Melodies</span><span className="mt-1 block text-xs text-slate-400">Soulful listening</span></span>
            <span className="material-symbols-outlined text-slate-500 transition group-hover:text-emerald-300">arrow_forward</span>
          </button>
        </section>

        {/* Trending songs */}
        <section>
          <SectionHeading eyebrow="Popular right now" title="Trending Now 🔥" subtitle="Tamil hits, love songs and spatial listening" onSeeAll={() => onNavigate("library")} />
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[0.82/1] animate-pulse rounded-2xl bg-white/[0.05]" />)}</div>
          ) : trendingSongs.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {trendingSongs.map((song, index) => <SongCard key={song._id || song.id || index} song={song} index={index} />)}
            </div>
          ) : <p className="rounded-2xl border border-white/[0.06] p-6 text-sm text-slate-400">No tracks match your search.</p>}
        </section>

        {/* Curated collections */}
        <section>
          <SectionHeading eyebrow="Made for your mood" title="Made For You" subtitle="Explore playlists for every listening moment" onSeeAll={() => onNavigate("library")} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {collections.map((collection) => (
              <button key={collection.id} type="button" onClick={() => collection.category ? onNavigate("library", collection.category) : onNavigate("library", collection.filter)} className="group relative min-h-[190px] overflow-hidden rounded-2xl border border-white/10 bg-[#11171b] text-left transition hover:-translate-y-0.5 hover:border-emerald-400/30 sm:min-h-[220px]">
                <img src={collection.cover} alt="" onError={handleImgError} className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-85" />
                <div className={`absolute inset-0 bg-gradient-to-t ${collection.tone} via-black/35 to-black/10`} />
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                  <h3 className="text-sm font-bold leading-snug text-white sm:text-base text-center">{collection.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-slate-200 text-center">{collection.subtitle}</p>
                  <span className="mt-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-black shadow-lg transition group-hover:scale-110"><span className="material-symbols-outlined">play_arrow</span></span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Continue listening */}
        <section>
          <SectionHeading eyebrow="Continue listening" title={`Jump Back In · ${audioMode || "Spatial"}`} subtitle="Pick up where your music journey continues" onSeeAll={() => onNavigate("library")} />
          {jumpBackInSongs.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {jumpBackInSongs.slice(0, 6).map((song, index) => <SongCard key={song._id || song.id || index} song={song} index={index} compact />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.07] bg-[#10161a] p-5 text-sm text-slate-400">More tracks will appear here as you explore the library.</div>
          )}
        </section>

        {/* Mood categories */}
        {loveSongs.length > 0 && (
          <section>
            <SectionHeading eyebrow="Pure romance" title="Tamil Love Melodies" onSeeAll={() => onNavigate("library", "Tamil Love")} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {loveSongs.map((song, index) => <SongCard key={song._id || song.id || index} song={song} index={index} />)}
            </div>
          </section>
        )}
        {melodySongs.length > 0 && (
          <section>
            <SectionHeading eyebrow="Soulful listening" title="Tamil Melodies" onSeeAll={() => onNavigate("library", "Tamil Melodies")} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {melodySongs.map((song, index) => <SongCard key={song._id || song.id || index} song={song} index={index} />)}
            </div>
          </section>
        )}

        {/* Artist shortcuts */}
        <section>
          <SectionHeading eyebrow="Legends & hitmakers" title="Artists You Love" onSeeAll={() => onNavigate("library")} />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {artists.map((artist) => (
              <button key={artist.name} type="button" onClick={() => onNavigate("library", artist.name)} className="group rounded-2xl border border-transparent p-3 text-center transition hover:border-white/[0.07] hover:bg-white/[0.03]">
                <img src={artist.cover} alt={artist.name} onError={handleImgError} className="mx-auto aspect-square w-full max-w-28 rounded-full border-2 border-white/10 object-cover shadow-lg transition group-hover:border-emerald-400/60 group-hover:shadow-emerald-500/10" />
                <span className="mt-3 block truncate text-xs font-bold text-white sm:text-sm">{artist.name}</span>
                <span className="mt-1 block truncate text-[11px] text-slate-400">{artist.role}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Top tracks table */}
        <section>
          <SectionHeading eyebrow="Your music library" title="Top Tracks" subtitle={`${filteredSongs.length} tracks available`} onSeeAll={() => onNavigate("library")} />
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0e1418]">
            <div className="hidden grid-cols-[42px_minmax(0,1fr)_160px_70px] gap-3 border-b border-white/[0.07] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:grid">
              <span>#</span><span>Title / Artist</span><span>Category</span><span className="text-right">Time</span>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {filteredSongs.length > 0 ? (
                filteredSongs.slice(0, 10).map((song, index) => (
                  <div key={song._id || song.id || index} onClick={() => play(song, filteredSongs)} className={`grid cursor-pointer grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 transition hover:bg-white/[0.04] sm:grid-cols-[42px_minmax(0,1fr)_160px_70px] sm:px-4 ${isCurrent(song) ? "bg-emerald-400/[0.05]" : ""}`}>
                    <button type="button" onClick={(event) => { event.stopPropagation(); play(song, filteredSongs); }} className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs ${isCurrent(song) ? "text-emerald-300" : "text-slate-500 hover:text-white"}`} aria-label={`Play ${song.title}`}>
                      <span className="material-symbols-outlined">{isCurrent(song) && isPlaying ? "equalizer" : "play_arrow"}</span>
                    </button>
                    <div className="flex min-w-0 items-center gap-3">
                      <img src={song.imageUrl || DEFAULT_COVER} alt="" onError={handleImgError} className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-semibold ${isCurrent(song) ? "text-emerald-300" : "text-white"}`}>{song.title}</p>
                        <p className="mt-1 truncate text-xs text-slate-400">{song.artist}</p>
                      </div>
                    </div>
                    <span className="hidden truncate text-xs text-slate-400 sm:block">{song.category || song.genre || song.audioMode || "Tamil"}</span>
                    <div className="flex items-center justify-end gap-3 text-xs text-slate-400">
                      <button type="button" onClick={(event) => { event.stopPropagation(); toggleFavorite(song._id || song.id); }} aria-label="Toggle favorite" className={favorites.has(song._id || song.id) ? "text-emerald-300" : "text-slate-500 hover:text-white"}>
                        <span className="material-symbols-outlined text-lg">{favorites.has(song._id || song.id) ? "favorite" : "favorite_border"}</span>
                      </button>
                      <span className="hidden sm:inline">{song.duration || "—"}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-slate-400">
                  <p className="font-semibold text-slate-300">No tracks in your playlist</p>
                  <p className="mt-1 text-xs text-slate-500">All songs have been removed. Add or upload new tracks to begin.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>



      {showMiloChat && <MiloCatChat initialQuery={miloInitialQuery} onClose={() => setShowMiloChat(false)} />}
      {showTasteModal && <TasteProfileModal onClose={() => setShowTasteModal(false)} />}
    </div>
  );
}
