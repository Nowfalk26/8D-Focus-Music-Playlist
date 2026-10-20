import React from "react";
import { usePlayer } from "../context/PlayerContext";

export default function RightSidebarPanel({ onNavigate }) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playSong,
    playNext,
    playPrev,
    seek,
    is8DActive,
    setIs8DActive,
    audioMode,
    openModeSelector,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    playlist,
    queue,
  } = usePlayer();

  const DEFAULT_COVER =
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

  // Fallback GreenWave showcase playlist matching the reference UI
  const showcasePlaylist = [
    {
      id: "gw-1",
      title: "Ocean Eyes",
      artist: "Billie Eilish",
      role: "Musician",
      duration: "3:20",
      imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80",
      audioUrl: "https://aac.saavncdn.com/932/7cf7f8a9d9c3faa2633d1605e97ba4a5_160.mp4",
      audioMode: "8d",
    },
    {
      id: "gw-2",
      title: "Lo Vas a Olvidar",
      artist: "Billie Eilish, Rosalía",
      role: "Musician",
      duration: "3:23",
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80",
      audioUrl: "https://aac.saavncdn.com/001/cf795c655325785055b410f9e9cfda3a_160.mp4",
      audioMode: "8d",
    },
    {
      id: "gw-3",
      title: "No Time to Die",
      artist: "Billie Eilish",
      role: "Musician",
      duration: "4:02",
      imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&q=80",
      audioUrl: "https://aac.saavncdn.com/267/35e80dc0e599d4db2f8d8b9d6a36f94b_160.mp4",
      audioMode: "8d",
    },
    {
      id: "gw-4",
      title: "Six Feet Under",
      artist: "Billie Eilish",
      role: "Musician",
      duration: "3:10",
      imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&q=80",
      audioUrl: "https://aac.saavncdn.com/932/7cf7f8a9d9c3faa2633d1605e97ba4a5_160.mp4",
      audioMode: "8d",
    },
    {
      id: "gw-5",
      title: "Bury a Friend",
      artist: "Billie Eilish",
      role: "Musician",
      duration: "3:13",
      imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80",
      audioUrl: "https://aac.saavncdn.com/001/cf795c655325785055b410f9e9cfda3a_160.mp4",
      audioMode: "8d",
    },
    {
      id: "gw-6",
      title: "Bad Guy",
      artist: "Billie Eilish",
      role: "Musician",
      duration: "3:14",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80",
      audioUrl: "https://aac.saavncdn.com/267/35e80dc0e599d4db2f8d8b9d6a36f94b_160.mp4",
      audioMode: "8d",
    },
    {
      id: "gw-7",
      title: "Wish You Were Gay",
      artist: "Billie Eilish",
      role: "Musician",
      duration: "3:41",
      imageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&q=80",
      audioUrl: "https://aac.saavncdn.com/932/7cf7f8a9d9c3faa2633d1605e97ba4a5_160.mp4",
      audioMode: "8d",
    },
  ];

  // Active track list: prefer current queue or playlist, fall back to showcase
  const activeTrackList =
    (queue && queue.length > 0)
      ? queue
      : (playlist && playlist.length > 0)
      ? playlist
      : showcasePlaylist;

  const isCurrent = (song) =>
    song &&
    currentSong &&
    (currentSong._id || currentSong.id) === (song._id || song.id);

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === Infinity) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const activeTrack = currentSong || showcasePlaylist[2]; // Default to "No Time to Die"

  return (
    <aside className="w-80 lg:w-[330px] xl:w-[350px] shrink-0 h-full flex flex-col bg-[#121614] rounded-2xl border border-white/5 p-4 shadow-2xl overflow-hidden select-none font-sans">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <h3 className="text-base font-bold text-white tracking-tight">Play List</h3>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate("library")}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs text-neutral-300 hover:text-white transition-colors"
        >
          <span>See All</span>
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </button>
      </div>

      {/* Itemized Track List */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-1.5 pr-0.5">
        {activeTrackList.slice(0, 7).map((song, idx) => {
          const isThisActive = isCurrent(song);
          return (
            <div
              key={song._id || song.id || idx}
              onClick={() => playSong(song, activeTrackList)}
              className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                isThisActive
                  ? "bg-[#10b981]/15 border border-[#10b981]/30"
                  : "hover:bg-[#18201b] border border-transparent"
              }`}
            >
              {/* Thumbnail & Title */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#1c2420]">
                  <img
                    src={song.imageUrl || DEFAULT_COVER}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_COVER;
                    }}
                  />
                  {isThisActive && isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                      <span className="w-0.5 bg-[#10b981] rounded-full animate-[bounce_1s_infinite_100ms] h-3" />
                      <span className="w-0.5 bg-[#10b981] rounded-full animate-[bounce_1s_infinite_300ms] h-4" />
                      <span className="w-0.5 bg-[#10b981] rounded-full animate-[bounce_1s_infinite_200ms] h-2.5" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4
                    className={`text-xs font-bold truncate leading-snug ${
                      isThisActive ? "text-[#10b981]" : "text-white group-hover:text-white"
                    }`}
                  >
                    {song.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                    {song.role || song.artist || "Musician"}
                  </p>
                </div>
              </div>

              {/* Play Trigger */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isThisActive) {
                    togglePlay();
                  } else {
                    playSong(song, activeTrackList);
                  }
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  isThisActive
                    ? "bg-[#10b981] text-black shadow-md shadow-[#10b981]/30"
                    : "border border-white/20 text-neutral-300 hover:border-white hover:text-white hover:scale-105"
                }`}
                title={isThisActive && isPlaying ? "Pause" : "Play"}
              >
                <span
                  className="material-symbols-outlined text-base font-bold"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isThisActive && isPlaying ? "pause" : "play_arrow"}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Sticky Now Playing Module (Matching Image Bottom Right) */}
      <div className="mt-auto pt-3 border-t border-white/5">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-t from-black via-black/80 to-transparent p-3 border border-white/5 shadow-2xl">
          {/* Full-width Album Art Backdrop */}
          <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3 bg-[#18201a]">
            <img
              src={activeTrack?.imageUrl || DEFAULT_COVER}
              alt={activeTrack?.title || "Now Playing"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_COVER;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            {/* 8D Spatial Audio Badge */}
            <button
              onClick={openModeSelector}
              className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur border border-[#10b981]/40 text-[#10b981] text-[9px] font-mono font-bold uppercase tracking-wider hover:scale-105 transition-transform"
            >
              {audioMode?.toUpperCase() || "8D SPATIAL"}
            </button>
          </div>

          {/* Frosted Playback Controller Module */}
          <div className="bg-[#161c18]/90 backdrop-blur-md rounded-xl p-3 border border-white/5">
            {/* Title & Subtitle */}
            <div className="text-center mb-2">
              <h4 className="text-xs font-bold text-white truncate">
                {activeTrack?.title || "No Time to Die"}
              </h4>
              <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                {activeTrack?.artist || "Moonlight"}
              </p>
            </div>

            {/* Scrubber Slider */}
            <div
              onClick={(e) => {
                if (!duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                seek(pct * duration);
              }}
              className="w-full h-1 bg-white/10 hover:h-1.5 rounded-full cursor-pointer relative transition-all mb-3"
            >
              <div
                className="h-full bg-[#10b981] rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
              </div>
            </div>

            {/* Playback Control Icons */}
            <div className="flex items-center justify-between text-neutral-400 px-1">
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                className={`hover:text-white transition-colors ${
                  isShuffle ? "text-[#10b981]" : ""
                }`}
                title="Shuffle"
              >
                <span className="material-symbols-outlined text-base">shuffle</span>
              </button>

              {/* Prev */}
              <button
                onClick={playPrev}
                className="hover:text-white transition-colors"
                title="Previous"
              >
                <span className="material-symbols-outlined text-lg">skip_previous</span>
              </button>

              {/* Play / Pause Circular FAB */}
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-[#10b981] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md shadow-[#10b981]/30"
                title={isPlaying ? "Pause" : "Play"}
              >
                <span
                  className="material-symbols-outlined text-lg font-bold"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isPlaying ? "pause" : "play_arrow"}
                </span>
              </button>

              {/* Next */}
              <button
                onClick={playNext}
                className="hover:text-white transition-colors"
                title="Next"
              >
                <span className="material-symbols-outlined text-lg">skip_next</span>
              </button>

              {/* Repeat */}
              <button
                onClick={toggleRepeat}
                className={`hover:text-white transition-colors ${
                  repeatMode !== "off" ? "text-[#10b981]" : ""
                }`}
                title="Repeat"
              >
                <span className="material-symbols-outlined text-base">
                  {repeatMode === "one" ? "repeat_one" : "repeat"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
