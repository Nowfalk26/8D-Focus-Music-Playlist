import React from "react";
import { usePlayer } from "../context/PlayerContext";

export default function RightSidebarPanel({ onNavigate }) {
  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    currentTime,
    duration,
    seek,
    volume,
    isMuted,
    toggleMute,
    audioMode,
    openModeSelector,
    playlist,
    queue,
  } = usePlayer();

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === Infinity) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const DEFAULT_COVER = "/billie-nowplaying.png";

  // Showcase playlist matching GreenWave
  const showcasePlaylist = [
    {
      id: "gw-1",
      title: "Ocean Eyes",
      artist: "Billie Eilish",
      role: "Musician",
      duration: "3:20",
      imageUrl: "/album-dontsmile.png",
      audioUrl: "https://aac.saavncdn.com/932/7cf7f8a9d9c3faa2633d1605e97ba4a5_160.mp4",
      audioMode: "8d",
    },
    {
      id: "gw-2",
      title: "Lo Vas a Olvidar",
      artist: "Billie Eilish, Rosalía",
      role: "Musician",
      duration: "3:23",
      imageUrl: "/album-happier.png",
      audioUrl: "https://aac.saavncdn.com/001/cf795c655325785055b410f9e9cfda3a_160.mp4",
      audioMode: "8d",
    },
    {
      id: "gw-3",
      title: "No Time to Die",
      artist: "Billie Eilish",
      role: "Musician",
      duration: "4:02",
      imageUrl: "/billie-nowplaying.png",
      audioUrl: "https://aac.saavncdn.com/267/35e80dc0e599d4db2f8d8b9d6a36f94b_160.mp4",
      audioMode: "8d",
    },
    {
      id: "gw-4",
      title: "Six Feet Under",
      artist: "Billie Eilish",
      role: "Musician",
      duration: "3:10",
      imageUrl: "/album-hitmehard.png",
      audioUrl: "https://aac.saavncdn.com/932/7cf7f8a9d9c3faa2633d1605e97ba4a5_160.mp4",
      audioMode: "8d",
    },
    {
      id: "gw-5",
      title: "Bury a Friend",
      artist: "Billie Eilish",
      role: "Musician",
      duration: "3:13",
      imageUrl: "/album-dontsmile.png",
      audioUrl: "https://aac.saavncdn.com/001/cf795c655325785055b410f9e9cfda3a_160.mp4",
      audioMode: "8d",
    },
    {
      id: "gw-6",
      title: "Bad Guy",
      artist: "Billie Eilish",
      role: "Musician",
      duration: "3:14",
      imageUrl: "/album-hitmehard.png",
      audioUrl: "https://aac.saavncdn.com/267/35e80dc0e599d4db2f8d8b9d6a36f94b_160.mp4",
      audioMode: "8d",
    },
    {
      id: "gw-7",
      title: "Wish You Were Gay",
      artist: "Billie Eilish",
      role: "Musician",
      duration: "3:41",
      imageUrl: "/album-happier.png",
      audioUrl: "https://aac.saavncdn.com/932/7cf7f8a9d9c3faa2633d1605e97ba4a5_160.mp4",
      audioMode: "8d",
    },
  ];

  const activeTrackList =
    queue && queue.length > 0
      ? queue
      : playlist && playlist.length > 0
      ? playlist
      : showcasePlaylist;

  const isCurrent = (song) =>
    song &&
    currentSong &&
    (currentSong._id || currentSong.id) === (song._id || song.id);

  return (
    <aside className="w-80 lg:w-[320px] xl:w-[340px] shrink-0 h-full flex flex-col bg-[#121212] rounded-2xl border border-[#282828] p-4 shadow-xl overflow-hidden select-none font-sans">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <h3 className="text-base font-bold text-white tracking-tight">Play List</h3>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate("library")}
          className="h-[30px] px-3 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 hover:text-white inline-flex items-center justify-center gap-1 transition-colors whitespace-nowrap"
        >
          <span>See All</span>
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </button>
      </div>

      {/* Itemized Track List with increased breathing room */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-1.5 pr-0.5">
        {activeTrackList.slice(0, 7).map((song, idx) => {
          const isThisActive = isCurrent(song);
          return (
            <div
              key={song._id || song.id || idx}
              onClick={() => {
                if (isThisActive) {
                  togglePlay();
                } else {
                  playSong(song, activeTrackList);
                }
              }}
              className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                isThisActive
                  ? "bg-[#181818] border border-[#10b981]/30 shadow-sm"
                  : "hover:bg-[#181818] border border-transparent"
              }`}
            >
              {/* Thumbnail & Title with generous gap */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-[#1e1e1e]">
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
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-0.5">
                      <span className="w-0.5 bg-[#10b981] rounded-full animate-[bounce_1s_infinite_100ms] h-3.5" />
                      <span className="w-0.5 bg-[#10b981] rounded-full animate-[bounce_1s_infinite_300ms] h-4.5" />
                      <span className="w-0.5 bg-[#10b981] rounded-full animate-[bounce_1s_infinite_200ms] h-3" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4
                    className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                      isThisActive ? "text-[#10b981]" : "text-white group-hover:text-white"
                    }`}
                  >
                    {song.title}
                  </h4>
                  <p className="text-[11px] text-[#a1a1aa] truncate mt-1">
                    {song.role || song.artist || "Musician"}
                  </p>
                </div>
              </div>

              {/* Inline Quick Play Trigger Synced With Global Player State */}
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
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ml-2 ${
                  isThisActive
                    ? "bg-[#10b981] text-black shadow-md shadow-[#10b981]/25"
                    : "border border-white/10 text-neutral-400 group-hover:border-white/30 group-hover:text-white"
                }`}
                title={isThisActive && isPlaying ? "Pause" : "Play"}
              >
                <span
                  className="material-symbols-outlined text-sm font-bold"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isThisActive && isPlaying ? "pause" : "play_arrow"}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Compact Synchronized Now Playing Artwork Showcase */}
      <div className="mt-auto pt-2 border-t border-white/5">
        {currentSong ? (
          <div className="relative rounded-2xl overflow-hidden bg-[#181818] border border-[#262626] p-2.5 shadow-md">
            {/* Compact 16:9 Artwork Backdrop */}
            <div className="relative w-full h-24 sm:h-28 rounded-xl overflow-hidden mb-2 bg-[#202020] group">
              <img
                src={currentSong.imageUrl || currentSong.cover || DEFAULT_COVER}
                alt={currentSong.title || "Now Playing"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_COVER;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Spatial Audio Mode Tag (Preserved) */}
              <button
                onClick={openModeSelector}
                className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur border border-white/15 text-neutral-300 hover:text-[#10b981] hover:border-[#10b981]/50 text-[9px] font-mono font-bold uppercase tracking-wider transition-colors"
                title="Change Spatial Audio Mode"
              >
                {audioMode?.toUpperCase() || "8D"} SPATIAL
              </button>

              {/* Now Playing Live Badge */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur border border-white/10 text-[10px] text-neutral-300">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isPlaying ? "bg-[#10b981] animate-pulse" : "bg-neutral-500"
                  }`}
                />
                <span className="font-mono text-[9px] uppercase tracking-wide">
                  {isPlaying ? "Live Audio" : "Paused"}
                </span>
              </div>
            </div>

            {/* Compact Song Metadata Row with Synced Global Play Action */}
            <div className="flex items-center justify-between px-0.5">
              <div className="min-w-0 flex-1 pr-2">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                  {currentSong.title}
                </h4>
                <p className="text-[11px] text-[#a1a1aa] truncate mt-0.5">
                  {currentSong.artist || "Flow 8D Artist"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => togglePlay()}
                  className="w-8 h-8 rounded-full bg-[#10b981] text-black inline-flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  <span
                    className="material-symbols-outlined text-base font-bold"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {isPlaying ? "pause" : "play_arrow"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate("orbit")}
                  className="h-7 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-[11px] font-semibold border border-white/10 inline-flex items-center justify-center transition-colors whitespace-nowrap"
                  title="Open 360° Binaural Stage"
                >
                  360°
                </button>
              </div>
            </div>

            {/* Synchronized Progress & Volume Indicator */}
            <div className="mt-2 pt-1.5 border-t border-white/5">
              <div className="flex items-center justify-between text-[9px] font-mono text-[#a1a1aa] mb-1">
                <span>{formatTime(currentTime)}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="text-neutral-400 hover:text-white transition-colors"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    <span className="material-symbols-outlined text-xs">
                      {isMuted || volume === 0 ? "volume_off" : volume < 0.5 ? "volume_down" : "volume_up"}
                    </span>
                  </button>
                  <span className="text-[9px] text-[#10b981] font-mono">
                    {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
                  </span>
                </div>
                <span>{formatTime(duration)}</span>
              </div>
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newPercent = clickX / rect.width;
                  if (duration > 0 && seek) {
                    seek(newPercent * duration);
                  }
                }}
                className="w-full h-1 bg-white/10 hover:h-1.5 rounded-full overflow-hidden cursor-pointer group/progress transition-all relative"
                title="Seek progress"
              >
                <div
                  className="h-full bg-[#10b981] transition-all duration-150 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#181818] border border-[#262626] p-3 text-center shadow-sm">
            <div className="w-10 h-10 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 mb-2">
              <span className="material-symbols-outlined text-xl">music_note</span>
            </div>
            <h4 className="text-xs font-bold text-white leading-snug">No track playing</h4>
            <p className="text-[10px] text-[#a1a1aa] mt-0.5 leading-tight">
              Select a song to start listening
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
