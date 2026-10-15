import React from "react";
import { usePlayer } from "../context/PlayerContext";

export default function MobilePlayQueueModal({ isOpen, onClose }) {
  const {
    currentSong,
    playlist,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playSong,
    playNext,
    favorites,
    toggleFavorite,
    cycleStatus,
    resetPlaybackCycle,
    audioMode,
  } = usePlayer();

  if (!isOpen) return null;

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === Infinity) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const DEFAULT_COVER =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCYHY4hp0r-GSzPdesFf5Z5mHQjlDX8zkLIjOdCA_IqUU_uw_nFr73ANifvOdaM2Q0NTsbK9ZB4CakHGH5fOSwA-_HynlD80C-hNL1oquc1m9K6gETHr9tKwpVJsxr8i3yXt8MxzxgSfUOhVYLQ8IqgfrlSGKs-61qE80eejtCqn6bE6dEiNbaAVFjYTn5bXQizoK0XcGh2VyyPyVMbGgVbr-Vnz7APr5Vg8HSuKiI1D50YhAVg3lfgaQ";

  // Upcoming tracks in current playlist
  const upcomingTracks = playlist.slice(currentIndex + 1, currentIndex + 16);

  // Recommendations for queue
  const queueRecommendations = playlist
    .filter((s) => s._id !== currentSong?._id)
    .slice(0, 6);

  const isCurrentFav = currentSong ? favorites.has(currentSong._id || currentSong.id) : false;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#121212] text-white overflow-hidden select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <header className="sticky top-0 w-full z-40 bg-[#121212]/95 backdrop-blur-xl border-b border-white/5 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors active:scale-95"
            aria-label="Close Queue"
          >
            <span className="material-symbols-outlined text-2xl">expand_more</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight">Queue</h1>
            <span className="text-[11px] bg-[#242424] text-neutral-400 font-semibold px-2 py-0.5 rounded-full">
              {playlist.length} tracks
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetPlaybackCycle}
            className="text-xs font-semibold text-neutral-400 hover:text-[#1DB954] transition-colors flex items-center gap-1 px-2 py-1 rounded-full hover:bg-white/5 active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>Reset Cycle</span>
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-neutral-300 hover:text-white"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </header>

      {/* Main Queue Scroll Area */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-6 pb-28">
        {/* Now Playing Section */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Now Playing</span>
            <span className="flex items-center gap-1.5 text-xs text-[#1DB954] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse" />
              Playing from {audioMode?.toUpperCase() || "8D"} Mode
            </span>
          </div>

          {currentSong ? (
            <div className="bg-[#242424] p-3 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden border border-white/5">
              {/* Dynamic subtle glow */}
              <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-[#1DB954]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 shadow-md bg-black">
                  <img
                    src={currentSong.imageUrl || DEFAULT_COVER}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_COVER;
                    }}
                  />
                  {/* Active Equalizer Overlay when playing */}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-0.5">
                      <span className="w-1 bg-[#1DB954] rounded-full animate-[bounce_1s_infinite_100ms] h-4" />
                      <span className="w-1 bg-[#1DB954] rounded-full animate-[bounce_1s_infinite_300ms] h-6" />
                      <span className="w-1 bg-[#1DB954] rounded-full animate-[bounce_1s_infinite_200ms] h-3" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-sm font-bold text-[#1DB954] truncate">{currentSong.title}</span>
                  <span className="text-xs text-neutral-400 truncate">{currentSong.artist || "Flow 8D Artist"}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-white/10 text-neutral-300 text-[10px] px-1.5 py-0.5 rounded font-mono font-medium">
                      Lossless
                    </span>
                    <span className="bg-[#1DB954]/20 text-[#1DB954] text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                      {audioMode?.toUpperCase() || "8D"}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleFavorite(currentSong._id || currentSong.id)}
                  className="w-10 h-10 flex items-center justify-center text-[#1DB954] active:scale-90 transition-transform"
                >
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: isCurrentFav ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#242424] text-center text-sm text-neutral-400">
              No track currently active. Select a track below to start queue.
            </div>
          )}
        </section>

        {/* Next In Queue / Upcoming from Playlist */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-neutral-400">Up Next</span>
              <h2 className="text-base font-bold text-white tracking-tight">From: Trending Tamil Playlist</h2>
            </div>
            <button
              onClick={playNext}
              className="text-xs font-semibold text-[#1DB954] hover:underline flex items-center gap-1 active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">skip_next</span>
              <span>Skip Track</span>
            </button>
          </div>

          <div className="flex flex-col gap-1 bg-[#181818] p-2 rounded-2xl border border-white/5">
            {upcomingTracks.length > 0 ? (
              upcomingTracks.map((song, idx) => (
                <div
                  key={song._id || song.id || idx}
                  onClick={() => playSong(song, playlist)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#242424] active:bg-[#282828] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-5 text-center text-xs font-mono text-neutral-500 group-hover:text-white">
                      {idx + 1}
                    </span>
                    <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-black shadow-sm">
                      <img
                        src={song.imageUrl || DEFAULT_COVER}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_COVER;
                        }}
                      />
                    </div>
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-sm font-semibold text-neutral-200 truncate group-hover:text-[#1DB954] transition-colors">
                        {song.title}
                      </span>
                      <span className="text-xs text-neutral-400 truncate">{song.artist || "Flow 8D Artist"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-neutral-400 group-hover:text-white">
                    <span className="material-symbols-outlined text-xl">drag_indicator</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-neutral-400">
                End of current queue cycle reached. Auto-repeating next batch!
              </div>
            )}
          </div>
        </section>

        {/* Recommended for this Queue */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#1DB954] text-lg">auto_awesome</span>
              <h3 className="text-sm font-bold text-white">Recommended for this queue</h3>
            </div>
            <span className="text-xs text-neutral-400">Based on vibe</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
            {queueRecommendations.map((song, idx) => (
              <div
                key={song._id || song.id || idx}
                className="shrink-0 w-36 bg-[#181818] p-2.5 rounded-xl flex flex-col justify-between border border-white/5 hover:border-white/10 transition-colors"
              >
                <div>
                  <div className="w-full aspect-square rounded-lg overflow-hidden mb-2 bg-black">
                    <img
                      src={song.imageUrl || DEFAULT_COVER}
                      alt={song.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_COVER;
                      }}
                    />
                  </div>
                  <p className="text-xs font-bold text-white truncate">{song.title}</p>
                  <p className="text-[11px] text-neutral-400 truncate">{song.artist}</p>
                </div>

                <button
                  onClick={() => playSong(song, playlist)}
                  className="mt-3 w-full py-1.5 px-2 bg-white/10 hover:bg-[#1DB954] hover:text-black text-white font-semibold text-xs rounded-full flex items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">play_arrow</span>
                  <span>Play</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
