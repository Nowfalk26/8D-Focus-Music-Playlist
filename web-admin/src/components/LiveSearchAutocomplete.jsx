import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { usePlayer } from "../context/PlayerContext";
import staticSongs from "../data/songsData.json";
import { getUserAddedSongs } from "../api/api";
import QuickAddSongModal from "./QuickAddSongModal";

/**
 * Escapes regex special characters safely
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Highlights matching query characters in a string
 */
function HighlightMatch({ text = "", query = "" }) {
  if (!text || !query.trim()) {
    return <span>{text}</span>;
  }

  const trimmed = query.trim();
  const words = trimmed.replace(/[.\-_]/g, " ").split(/\s+/).filter((w) => w.length > 1);
  const patterns = Array.from(new Set([trimmed, ...words].map(escapeRegExp))).filter(Boolean);
  const regex = new RegExp(`(${patterns.join("|")})`, "gi");
  const parts = String(text).split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-emerald-500/30 text-emerald-300 font-semibold px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&q=80";

export default function LiveSearchAutocomplete({
  value,
  onChange,
  onNavigate,
  catalog = null,
  placeholder = "What do you want to play?",
  variant = "default", // 'default' (home) | 'topbar' (sticky bar)
  className = "",
  autoFocus = false,
  onSongSelect = null,
}) {
  const { currentSong, isPlaying, playSong, audioMode } = usePlayer();

  // Internal query state if uncontrolled, or sync with controlled prop
  const [internalQuery, setInternalQuery] = useState(value ?? "");
  const query = value !== undefined ? value : internalQuery;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customSongs, setCustomSongs] = useState(() => getUserAddedSongs());

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Sync internal state when external value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalQuery(value);
    }
  }, [value]);

  // Listen for dynamic song additions across components
  useEffect(() => {
    const handleSongsUpdated = () => {
      setCustomSongs(getUserAddedSongs());
    };
    window.addEventListener("flow8d_songs_updated", handleSongsUpdated);
    return () => window.removeEventListener("flow8d_songs_updated", handleSongsUpdated);
  }, []);

  // Use provided catalog merged with user added songs, or default static catalog
  const allSongs = useMemo(() => {
    const base = Array.isArray(catalog) && catalog.length > 0 ? catalog : staticSongs;
    // Prepend user added songs
    const custom = customSongs || [];
    const customIds = new Set(custom.map((s) => String(s._id || s.id)));
    return [...custom, ...base.filter((s) => !customIds.has(String(s._id || s.id)))];
  }, [catalog, customSongs]);

  // Handle Input Change
  const handleInputChange = (e) => {
    const val = e.target.value;
    if (onChange) {
      onChange(val);
    } else {
      setInternalQuery(val);
    }
    setSelectedIndex(-1);
    setIsOpen(val.trim().length > 0);
  };

  // Handle Clear Search
  const handleClear = (e) => {
    e?.stopPropagation();
    if (onChange) {
      onChange("");
    } else {
      setInternalQuery("");
    }
    setSelectedIndex(-1);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Fast in-memory scoring & filtering algorithm
  const { suggestions, totalMatchCount } = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return { suggestions: [], totalMatchCount: 0 };
    }

    const trimmedNorm = trimmed.replace(/[.\-_]/g, " ").replace(/\s+/g, " ").trim();
    const queryWords = (trimmedNorm || trimmed).split(/\s+/).filter(Boolean);
    const scored = [];

    for (let i = 0; i < allSongs.length; i++) {
      const s = allSongs[i];
      const title = (s.title || "").toLowerCase();
      const artist = (s.artist || "").toLowerCase();
      const composer = (s.composer || "").toLowerCase();
      const album = (s.album || "").toLowerCase();
      const category = (s.category || "").toLowerCase();
      const genre = (s.genre || "").toLowerCase();

      const titleNorm = title.replace(/[.\-_]/g, " ").replace(/\s+/g, " ");
      const artistNorm = artist.replace(/[.\-_]/g, " ").replace(/\s+/g, " ");
      const composerNorm = composer.replace(/[.\-_]/g, " ").replace(/\s+/g, " ");
      const albumNorm = album.replace(/[.\-_]/g, " ").replace(/\s+/g, " ");

      let score = 0;

      // 1. Title Scoring
      if (title === trimmed || titleNorm === trimmedNorm) {
        score += 1200;
      } else if (title.startsWith(trimmed) || titleNorm.startsWith(trimmedNorm)) {
        score += 900;
      } else if (title.includes(trimmed) || titleNorm.includes(trimmedNorm)) {
        score += 600;
      } else if (queryWords.every((w) => titleNorm.includes(w))) {
        score += 500;
      }

      // 2. Artist Scoring
      if (artist === trimmed || artistNorm === trimmedNorm) {
        score += 800;
      } else if (artist.startsWith(trimmed) || artistNorm.startsWith(trimmedNorm)) {
        score += 550;
      } else if (artist.includes(trimmed) || artistNorm.includes(trimmedNorm)) {
        score += 400;
      } else if (queryWords.every((w) => artistNorm.includes(w))) {
        score += 350;
      }

      // 3. Composer Scoring
      if ((composer && composer.includes(trimmed)) || composerNorm.includes(trimmedNorm)) {
        score += 300;
      } else if (queryWords.every((w) => composerNorm.includes(w))) {
        score += 250;
      }

      // 4. Album Scoring
      if ((album && album.includes(trimmed)) || albumNorm.includes(trimmedNorm)) {
        score += 200;
      }

      // 5. Category / Genre
      if (category.includes(trimmed) || genre.includes(trimmed)) {
        score += 150;
      }

      // Bonus if song matches active audio mode
      const isModeMatch =
        audioMode === "9d"
          ? (s.audioMode || "8d").toLowerCase() === "8d" || (s.audioMode || "").toLowerCase() === "9d"
          : s.audioMode === audioMode;
      if (audioMode && isModeMatch) {
        score += 30;
      }

      if (score > 0) {
        scored.push({ song: s, score });
      }
    }

    // Sort by relevance score descending
    scored.sort((a, b) => b.score - a.score);

    const totalMatchCount = scored.length;
    // Top 7 suggestions for compact & clean display
    const suggestions = scored.slice(0, 7).map((item) => item.song);

    return { suggestions, totalMatchCount };
  }, [query, allSongs, audioMode]);

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Scroll active keyboard item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-result-item]");
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  // Song selection handler
  const handleSelectSong = useCallback(
    (song) => {
      if (!song) return;
      // Play selected song, setting upcoming queue from remaining suggestions
      const upcoming = suggestions.filter(
        (s) => (s._id || s.id) !== (song._id || song.id)
      );
      playSong(song, [song, ...upcoming]);

      if (onSongSelect) {
        onSongSelect(song);
      }

      setIsOpen(false);
    },
    [suggestions, playSong, onSongSelect]
  );

  // Navigate to full results view
  const handleSeeAllResults = useCallback(() => {
    setIsOpen(false);
    if (onNavigate) {
      onNavigate("search", query.trim());
    }
  }, [onNavigate, query]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    // If dropdown not open, open on ArrowDown if there's query
    if (!isOpen) {
      if (e.key === "ArrowDown" && query.trim()) {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    const maxItems = suggestions.length + (totalMatchCount > suggestions.length ? 1 : 0);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < maxItems - 1 ? prev + 1 : 0));
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxItems - 1));
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSong(suggestions[selectedIndex]);
        } else if (
          selectedIndex === suggestions.length &&
          totalMatchCount > suggestions.length
        ) {
          handleSeeAllResults();
        } else if (suggestions.length > 0) {
          // Default to first match if user pressed Enter without navigating
          handleSelectSong(suggestions[0]);
        }
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;

      case "Tab":
        setIsOpen(false);
        break;

      default:
        break;
    }
  };

  // Helper for mode badge
  const renderModeBadge = (mode) => {
    const m = (mode || "").toLowerCase();
    if (m === "8d") {
      return (
        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center justify-center text-center leading-none">
          8D
        </span>
      );
    }
    if (m === "9d") {
      return (
        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 inline-flex items-center justify-center text-center leading-none">
          9D
        </span>
      );
    }
    return (
      <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-neutral-300 border border-white/10 inline-flex items-center justify-center text-center leading-none">
        Normal
      </span>
    );
  };

  const isTopBar = variant === "topbar";

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
    >
      {/* Search Input Bar */}
      <div
        className={`flex items-center w-full transition-all duration-200 ${
          isTopBar
            ? "h-11 px-4 rounded-full bg-[#242424] hover:bg-[#2a2a2a] focus-within:bg-[#2a2a2a] border border-white/10 focus-within:border-[#1DB954] shadow-inner"
            : "min-h-[48px] px-5 py-3 rounded-full bg-[#151b21] hover:bg-[#1a222a] border border-white/10 focus-within:border-emerald-400/80 shadow-inner"
        }`}
      >
        <span
          className={`material-symbols-outlined shrink-0 select-none pointer-events-none transition-colors ${
            isTopBar
              ? "text-neutral-400 text-xl mr-3"
              : "text-slate-400 text-2xl mr-3.5 group-focus-within:text-emerald-400"
          }`}
        >
          search
        </span>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            setIsInputFocused(true);
            if (query.trim()) setIsOpen(true);
          }}
          onBlur={() => setIsInputFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search songs and artists"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck="false"
          className={`w-full min-w-0 bg-transparent text-white outline-none placeholder:text-neutral-400 leading-normal ${
            isTopBar ? "text-xs sm:text-sm" : "text-sm sm:text-base"
          }`}
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center justify-center p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
            title="Clear search"
            aria-label="Clear search query"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        )}
      </div>

      {/* Live Autocomplete Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#121820]/95 backdrop-blur-2xl shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95 duration-150"
          style={{ maxHeight: "min(460px, 75vh)" }}
        >
          {suggestions.length > 0 ? (
            <div className="flex flex-col p-1.5 divide-y divide-white/[0.04]">
              {/* Dropdown Header */}
              <div className="flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 select-none">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-emerald-400">
                    bolt
                  </span>
                  Instant Matches
                </span>
                <span className="text-[10px] text-neutral-400">
                  {totalMatchCount} {totalMatchCount === 1 ? "track" : "tracks"} found
                </span>
              </div>

              {/* Suggestions List */}
              <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[340px] pr-0.5 custom-scrollbar">
                {suggestions.map((song, idx) => {
                  const isSelected = selectedIndex === idx;
                  const isCurPlaying =
                    (currentSong?._id || currentSong?.id) === (song._id || song.id);

                  return (
                    <div
                      key={song._id || song.id || idx}
                      data-result-item
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectSong(song)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 select-none ${
                        isSelected
                          ? "bg-emerald-500/20 text-white shadow-sm ring-1 ring-emerald-500/30"
                          : "hover:bg-white/[0.06] text-neutral-200"
                      }`}
                    >
                      {/* Thumbnail with overlay play icon */}
                      <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden shrink-0 bg-neutral-800 border border-white/10 shadow-sm">
                        <img
                          src={song.imageUrl || DEFAULT_COVER}
                          alt={song.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_COVER;
                          }}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div
                          className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                            isCurPlaying
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-base ${
                              isCurPlaying && isPlaying
                                ? "text-emerald-400 animate-pulse"
                                : "text-white"
                            }`}
                          >
                            {isCurPlaying && isPlaying ? "graphic_eq" : "play_arrow"}
                          </span>
                        </div>
                      </div>

                      {/* Song Title & Artist with Live Highlights */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold truncate leading-tight ${
                              isCurPlaying ? "text-emerald-400 font-bold" : "text-white"
                            }`}
                          >
                            <HighlightMatch text={song.title} query={query} />
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 truncate mt-0.5">
                          <span className="truncate">
                            <HighlightMatch text={song.artist} query={query} />
                          </span>
                          {song.album && (
                            <>
                              <span className="text-neutral-400">•</span>
                              <span className="truncate text-neutral-400">
                                {song.album}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Audio Mode Badge */}
                      <div className="flex items-center gap-2 shrink-0">
                        {renderModeBadge(song.audioMode)}
                        {song.duration && (
                          <span className="hidden sm:inline text-[11px] text-neutral-400 tabular-nums">
                            {song.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer: "See all results" or "Add song to library" */}
              <div className="flex flex-col gap-1 mt-1 border-t border-white/5 pt-1.5">
                {totalMatchCount > suggestions.length && (
                  <div
                    data-result-item
                    role="option"
                    aria-selected={selectedIndex === suggestions.length}
                    onClick={handleSeeAllResults}
                    onMouseEnter={() => setSelectedIndex(suggestions.length)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all ${
                      selectedIndex === suggestions.length
                        ? "bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-500/40"
                        : "text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">manage_search</span>
                      <span>See all {totalMatchCount} matching songs in library</span>
                    </span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsAddModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-left"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-emerald-400">add_circle</span>
                    <span>Don't see what you want? <strong className="text-emerald-400 font-semibold">+ Add &ldquo;{query}&rdquo;</strong></span>
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Add Song
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* No Results State with Dynamic Add Button */
            <div className="flex flex-col items-center justify-center p-6 text-center select-none">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-neutral-400">
                <span className="material-symbols-outlined text-2xl">search_off</span>
              </div>
              <p className="text-sm font-semibold text-white">
                No songs found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                This song is not in the app yet. You can add it directly to the music library right now!
              </p>

              {/* Dynamic Add Button */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsAddModalOpen(true);
                }}
                className="mt-4 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-base">library_add</span>
                <span>+ Add &ldquo;{query}&rdquo; to Music Library</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Add Song Modal */}
      <QuickAddSongModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialTitle={query}
        onSongAdded={(newSong) => {
          // Keep query updated so the new song immediately appears
          if (newSong && newSong.title) {
            if (onChange) onChange(newSong.title);
            else setInternalQuery(newSong.title);
            setIsOpen(true);
          }
        }}
      />
    </div>
  );
}
