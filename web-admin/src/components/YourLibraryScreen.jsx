import React, { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import { songsApi } from "../api/api";
import staticSongs from "../data/songsData.json";

export default function YourLibraryScreen({ onNavigate }) {
  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    favorites,
    toggleFavorite,
    audioMode,
  } = usePlayer();

  const [activeFilter, setActiveFilter] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState(() => staticSongs);
  const [selectedCollection, setSelectedCollection] = useState(null);

  useEffect(() => {
    songsApi
      .getAll({ mode: audioMode })
      .then((res) => {
        if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
          setSongs(res.data.data);
        }
      })
      .catch(() => {});
  }, [audioMode]);

  const collections = [
    {
      id: "liked",
      title: "Liked Songs",
      type: "Playlist",
      category: "Playlists",
      subtitle: `${favorites.size} songs • Auto-synced in 8D`,
      isPinned: true,
      isSpecialLiked: true,
      songsCount: favorites.size,
      duration: `${favorites.size * 3} min`,
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuCL7oW54sB68_m0dEHGYCtexZMfxjQZgIJ4zlb3HCyBhoUYWGqIQ4vwczxL0CM7hHMtbfOFTiDiHliTAHZnTV1lwxfhz7RVKbKAiB9ymEiWYJkldVSO55zCzN-FC-ZOTRwfnCce8sdaPY8uTFviwnlXLaOhiIyxvbG5jSA0GE5UR9gHS5mn2_1taMYIZgw44RCN9QVvuZKPTtvXag594zIGQ0l1eLh5xeRQvyZYBxdeTghgchKhnvfK8w",
      getSongs: () => songs.filter((s) => favorites.has(s._id || s.id)),
    },
    {
      id: "hit-me-hard",
      title: "Hit Me Hard and Soft",
      type: "Playlist",
      category: "Playlists",
      subtitle: "Playlist • Billie Eilish",
      tag: "8D Spatial",
      songsCount: 10,
      duration: "34 min",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3PmWuBQuugO5tL_bWf1H7s08_HJto4A1R01JtOlUTvy1lWJhNUO8EyI3PnTjdNzvKtn9R2EXB93xkY0CMZB3q05dNQMK30HRS_eGw8pyq2WLyq3Bz59F6EvSACjkzaxhVcCYQSWYeP4ybKCDrlj2Oo62wJTYwQ4YBdDg3q4e5OvltmFa8x1nB_y2ODQeuW6_faNYsPmQnbjnu9JTw2Nh9qPvj2SQJbcp-GEsTCj8Am8v8sb5okerNOw",
      getSongs: () => songs.filter((s) => s.artist?.includes("Billie") || s.album?.includes("Soft")),
    },
    {
      id: "happier-than-ever",
      title: "Happier Than Ever",
      type: "Playlist",
      category: "Playlists",
      subtitle: "Playlist • Billie Eilish",
      tag: "8D Spatial",
      songsCount: 16,
      duration: "56 min",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_wl6Svdg4abRX3dbTT3EXYeC75IvYj_WeQ3FUja9tqO-8a3jbGar0wQa7B1gfGILu7dFbfk6q9tGhhgMrl7IOJQipBEnANp_Rx95b9_DDhLYoZt8WwLE1I8o5FxnOiV1yyUXvKfiHV5VGwWj8qOh1f2F64dZg6yEjmDEe28k5XnZIwKpnVy9LilX88vKRJELHoCKmgDGkSWfCEMuCztbig3wAkueHV7sTjGhhViNp7y3UTlhmpw_4wg",
      getSongs: () => songs.filter((s) => s.artist?.includes("Billie")),
    },
    {
      id: "dont-smile",
      title: "Don't Smile at Me",
      type: "Playlist",
      category: "Playlists",
      subtitle: "Playlist • Billie Eilish",
      tag: "8D Spatial",
      songsCount: 9,
      duration: "29 min",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkXqDM0Tld3Emz4fGerlQq4bF-0kVMp4b41f0i8tvHaMKnOD49SaOZCj4gaTskayOXA4dyd1aRVu34Qs2il623YN5FjSTX_5_7SwqnSzO-KkksGhau90XwG-jmpmoUbBfYAkujOuzOH1_uRFjj1B_tk4Su8qok2ybGBso7HNlp1SL4oCOJAp40FdL38yP4iyzA102r7pdsJNld_VPyaHjdBa_RnYvedSg_1Jl8Lm60bc8ITwViZYlVzg",
      getSongs: () => songs.filter((s) => s.artist?.includes("Billie")),
    },
    {
      id: "tamil-8d",
      title: "Tamil 8D Melodies",
      type: "Playlist",
      category: "Playlists",
      subtitle: "Playlist • Flow 8D Master",
      tag: "Binaural Mix",
      songsCount: 45,
      duration: "2 hr 40 min",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwIyKHQinWa7qaDI9Ko2kG935OnLAGU_to4xvfCVT3elXB932su5NaAZ5Z_o_g0RkW5lFKGgQuiVZBmL4yLrAoyGUpcqmVJyiIkV2LS0eltzkfAVd-nT3O5y4hYZtlhSeHE_hb8cnktKiAyB-QzQbXxtMKnwdvGEA3zSiIFLcYd8LgvGN8O8AfcOavosx9V6RaCuPb2ZET8vVY2O2XhZYy8cP2B15EJ2NjcSbHW_pr41OSeOoGRk1a3w",
      getSongs: () => songs.filter((s) => s.category?.includes("Tamil") || s.language === "Tamil"),
    },
    {
      id: "billie-artist",
      title: "Billie Eilish",
      type: "Artist",
      category: "Artists",
      subtitle: "Artist • 109M Listeners",
      tag: "Spatial Headliner",
      isArtist: true,
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuAU74Hnn7FjMlmptuSN8M0SajceQMDgzKZh6Ib_OWUkTZMT1Ie2wWM5Mw4Lj66LMsUfmXxhS5jTZ_67ts9rxukObMTvnK0s3_T8NJnnnjYH0D2qLMN4qEjND3FhrD8iNwG3cpQLi2sK3hc_86wedGT2IkRNu5rhfLEq1Dk-hjMDH3TX9L_s5ebG2o7kbK4yr_y40ImYZIXPdhFzB8P2FDfpm3XEHs5Z5H6dlRSSmZORD-ezuMEf_nYurw",
      getSongs: () => songs.filter((s) => s.artist?.includes("Billie")),
    },
    {
      id: "leonard-cohen",
      title: "Leonard Cohen",
      type: "Artist",
      category: "Artists",
      subtitle: "Artist • Folk & Poetry",
      tag: "Acoustic 360°",
      isArtist: true,
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuBdJxx7pZb1VEoztPmLeS01-bs7tSXUhh4oI6Rc1iHZGT23dVXHbGWVhKQaPB2Z3RaUZB12pYXN6Kn859HQN7UqSJRLgSjepNd8JaSyKo9A1LEb5L-49jjc5u_Nlm4D-K3WRhelw9WbSNo5ZQ7z8JIoo9T8UXbvZptydasEaddqBdv2e_90fXlW2IMhkbQlimM_RQeHY9czqS9Ic4_INKImF08cyz0tIH-HXCqMse5IqrvUAUpyGKwqEw",
      getSongs: () => songs.filter((s) => s.artist?.includes("Leonard")),
    },
    {
      id: "binaural-lofi",
      title: "Late Night Binaural Lo-Fi",
      type: "Playlist",
      category: "Playlists",
      subtitle: "Playlist • Flow 8D Lab",
      tag: "Curated 8D",
      songsCount: 62,
      duration: "3 hr 15 min",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqKdhYl8MGUf7wTT8FIx6eWJkVCihRQgaUS703JS-UDHkqn6YSThOvsow6w_VOI4Y1vJase3svPpI-XQKWuGFt2d8IsLzjm9AHfnWE8D1sPwuGpQZvXz4yHRaKUVMQaxfKDF0ukUQylfYXu6hNsuuwK41M-r9YTLAZjTAZ3fMy8kqAFSEygXSgP-ceKEdqdwM9Txg5CGya_A0h2hV2Dtg6fh2k2yOZ7XXlFvjdjyR7nY6SolXxbd8CDw",
      getSongs: () => songs,
    },
  ];

  const filterTabs = ["All", "Playlists", "Artists", "Albums", "Podcasts", "Downloaded (Offline 8D)"];

  const filteredCollections = collections.filter((item) => {
    const matchesFilter =
      activeFilter === "All"
        ? true
        : activeFilter === "Playlists"
        ? item.category === "Playlists"
        : activeFilter === "Artists"
        ? item.category === "Artists"
        : activeFilter === "Albums"
        ? item.category === "Albums"
        : true;

    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handlePlayCollection = (coll, e) => {
    if (e) e.stopPropagation();
    const matched = coll.getSongs();
    if (matched.length > 0) {
      playSong(matched[0], matched);
    }
  };

  return (
    <div className="w-full min-w-0 flex flex-col font-sans text-on-surface select-none p-5 sm:p-7 space-y-7 pb-28 max-w-[1400px] mx-auto box-border">
      {/* Header of Library Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight font-display-hero">
              Your Library
            </h1>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary-container/15 text-primary-container border border-primary-container/30">
              Spatial Archive
            </span>
          </div>
          <p className="text-xs text-outline mt-1 font-body-sm">
            Manage, curate and synthesize your 8D spatial soundscapes and personal playlists.
          </p>
        </div>

        {/* Secondary Controls: Search, Sort, View Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative w-48 sm:w-56">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in library..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-surface-container-high border border-white/5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container"
            />
          </div>

          <div className="h-9 flex items-center bg-surface-container-high border border-white/5 rounded-xl p-0.5 text-outline">
            <button
              onClick={() => setViewMode("grid")}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-surface-container-lowest text-primary-container shadow-sm"
                  : "hover:text-on-surface"
              }`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-sm">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-surface-container-lowest text-primary-container shadow-sm"
                  : "hover:text-on-surface"
              }`}
              title="List View"
            >
              <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded-full font-label-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-primary-container text-on-primary-container font-bold shadow-[0_0_12px_rgba(0,245,155,0.35)]"
                  : "bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Spotlight Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Liked Songs Spotlight Card */}
        <div
          onClick={() => {
            const likedList = songs.filter((s) => favorites.has(s._id || s.id));
            if (likedList.length > 0) setSelectedCollection({ title: "Liked Songs", songs: likedList });
          }}
          className="group relative rounded-2xl p-5 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-surface-container-low border border-purple-500/30 overflow-hidden shadow-xl hover:border-purple-400/50 transition-all cursor-pointer"
        >
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-600/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-lg">
              <span className="material-symbols-outlined text-3xl">favorite</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-container/20 text-primary-container border border-primary-container/30">
              <span className="material-symbols-outlined text-[13px]">push_pin</span>
              <span>Pinned</span>
            </div>
          </div>
          <div className="mt-6 relative z-10">
            <h3 className="text-xl font-bold text-on-surface group-hover:text-purple-300 transition-colors">
              Liked Songs
            </h3>
            <p className="text-xs text-outline mt-1 flex items-center gap-2">
              <span>{favorites.size} songs</span>
              <span className="w-1 h-1 rounded-full bg-outline" />
              <span className="text-secondary font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">sync</span>
                Auto-synced in 8D
              </span>
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const likedList = songs.filter((s) => favorites.has(s._id || s.id));
              if (likedList.length > 0) playSong(likedList[0], likedList);
            }}
            className="absolute right-5 bottom-5 w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-[0_0_16px_rgba(0,245,155,0.4)] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              play_arrow
            </span>
          </button>
        </div>

        {/* 8D Converted Masters Card */}
        <div
          onClick={() => onNavigate("orbit")}
          className="group relative rounded-2xl p-5 bg-gradient-to-br from-surface-container-low via-surface-container to-secondary-container/10 border border-primary-container/20 hover:border-primary-container/50 transition-all cursor-pointer shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="w-14 h-14 rounded-2xl bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container group-hover:shadow-[0_0_16px_rgba(0,245,155,0.3)] transition-all">
              <span className="material-symbols-outlined text-3xl">headphones</span>
            </div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-primary-container bg-primary-container/10 px-2 py-0.5 rounded border border-primary-container/30">
              96kHz Stems
            </span>
          </div>
          <div className="mt-6">
            <h3 className="text-base font-bold text-on-surface group-hover:text-primary-container transition-colors">
              8D Converted Masters
            </h3>
            <p className="text-xs text-outline mt-1 font-body-sm">
              Rendered with dynamic 360° orbital spatialization and binaural HRTF curves.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-outline font-mono">Total size: 1.84 GB</span>
            <span className="text-primary-container font-semibold flex items-center gap-1 group-hover:underline">
              Open Stage <span className="material-symbols-outlined text-sm">chevron_right</span>
            </span>
          </div>
        </div>

        {/* Music Taste DNA Spotlight */}
        <div
          onClick={() => onNavigate("taste")}
          className="group relative rounded-2xl p-5 bg-surface-container-low border border-white/10 hover:border-secondary/60 flex flex-col justify-between transition-all cursor-pointer shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-white/5 flex items-center justify-center text-secondary group-hover:scale-105 transition-all">
              <span className="material-symbols-outlined text-3xl">bubble_chart</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-outline bg-surface-container-high px-2.5 py-1 rounded-md border border-white/5 font-mono">
              AI Latent
            </span>
          </div>
          <div className="mt-6">
            <h3 className="text-base font-bold text-on-surface group-hover:text-secondary transition-colors">
              Music Taste DNA
            </h3>
            <p className="text-xs text-outline mt-1 font-body-sm">
              Vector embeddings, acoustic fingerprint radar, and spatial affinity clusters.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-secondary">
            <span>Inspect Vector Graph</span>
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </div>
        </div>
      </section>

      {/* Selected Collection View if Active */}
      {selectedCollection && (
        <section className="p-5 rounded-2xl bg-surface-container-low border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedCollection(null)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-bright flex items-center justify-center text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
              </button>
              <h2 className="text-xl font-bold text-on-surface">{selectedCollection.title}</h2>
              <span className="text-xs text-outline font-mono">({selectedCollection.songs.length} tracks)</span>
            </div>
            <button
              onClick={() => {
                if (selectedCollection.songs.length > 0) {
                  playSong(selectedCollection.songs[0], selectedCollection.songs);
                }
              }}
              className="px-4 py-1.5 rounded-full bg-primary-container text-on-primary-container font-label-md text-xs font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              <span>Play All</span>
            </button>
          </div>

          <div className="space-y-1">
            {selectedCollection.songs.map((song, idx) => {
              const isPlayingThis = currentSong && (currentSong._id === song._id || currentSong.title === song.title) && isPlaying;
              return (
                <div
                  key={song._id || song.id || idx}
                  onClick={() => playSong(song, selectedCollection.songs)}
                  className={`flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container cursor-pointer transition-colors ${
                    isPlayingThis ? "bg-surface-container border border-primary-container/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 text-xs text-outline font-mono text-center">{idx + 1}</span>
                    <img
                      src={song.imageUrl || song.cover || DEFAULT_COVER}
                      alt={song.title}
                      className="w-10 h-10 rounded-lg object-cover bg-surface-container-high"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className={`text-xs font-semibold truncate ${isPlayingThis ? "text-primary-container" : "text-on-surface"}`}>
                        {song.title}
                      </span>
                      <span className="text-[11px] text-outline truncate">{song.artist}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-outline font-mono">{song.duration || "3:20"}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(song._id || song.id);
                      }}
                      className="text-outline hover:text-primary-container"
                    >
                      <span className="material-symbols-outlined text-base">
                        {favorites.has(song._id || song.id) ? "favorite" : "favorite_border"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Library Collections Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-on-surface tracking-tight font-headline-md">
              Personal & Curated Collections
            </h2>
            <span className="text-xs font-mono text-outline">({filteredCollections.length} items)</span>
          </div>
          <span className="text-xs text-outline font-body-sm">
            Sorted by: <span className="text-primary-container font-semibold">Recently Added</span>
          </span>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredCollections.map((item) => (
              <article
                key={item.id}
                onClick={() => {
                  const matched = item.getSongs();
                  if (matched.length > 0) {
                    setSelectedCollection({ title: item.title, songs: matched });
                  }
                }}
                className={`group bg-surface-container-low rounded-2xl p-3.5 border border-white/5 hover:border-primary-container/40 hover:bg-surface-container transition-all duration-300 relative shadow-xl cursor-pointer ${
                  item.isArtist ? "flex flex-col items-center text-center" : ""
                }`}
              >
                <div
                  className={`relative overflow-hidden mb-3.5 bg-surface-container-high ${
                    item.isArtist
                      ? "w-32 h-32 rounded-full border-2 border-primary-container/30 group-hover:border-primary-container shadow-md"
                      : "w-full aspect-square rounded-xl"
                  }`}
                >
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {item.tag && !item.isArtist && (
                    <span className="absolute top-2.5 left-2.5 bg-surface-container-lowest/80 backdrop-blur-md text-[9px] font-bold text-primary-container px-2 py-0.5 rounded border border-primary-container/30">
                      {item.tag}
                    </span>
                  )}
                  <button
                    onClick={(e) => handlePlayCollection(item, e)}
                    className="absolute right-3 bottom-3 w-11 h-11 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-base shadow-[0_0_16px_rgba(0,245,155,0.45)] opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95"
                  >
                    <span
                      className="material-symbols-outlined text-2xl font-bold ml-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      play_arrow
                    </span>
                  </button>
                </div>

                <div className={`space-y-1 ${item.isArtist ? "w-full" : ""}`}>
                  <h4 className="text-sm font-bold text-on-surface group-hover:text-primary-container truncate transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-outline truncate">{item.subtitle}</p>
                  {!item.isArtist && (
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-outline">
                      <span>{item.songsCount} Songs</span>
                      <span className="text-secondary font-mono">{item.duration}</span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCollections.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  const matched = item.getSongs();
                  if (matched.length > 0) {
                    setSelectedCollection({ title: item.title, songs: matched });
                  }
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-white/5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className={`w-12 h-12 object-cover shrink-0 ${item.isArtist ? "rounded-full" : "rounded-xl"}`}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-on-surface group-hover:text-primary-container truncate">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-outline truncate">{item.subtitle}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {!item.isArtist && (
                    <span className="text-xs font-mono text-secondary">{item.duration}</span>
                  )}
                  <button
                    onClick={(e) => handlePlayCollection(item, e)}
                    className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_arrow
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
