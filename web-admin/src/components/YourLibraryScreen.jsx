import React, { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import { songsApi } from "../api/api";

const DEFAULT_COVER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCYHY4hp0r-GSzPdesFf5Z5mHQjlDX8zkLIjOdCA_IqUU_uw_nFr73ANifvOdaM2Q0NTsbK9ZB4CakHGH5fOSwA-_HynlD80C-hNL1oquc1m9K6gETHr9tKwpVJsxr8i3yXt8MxzxgSfUOhVYLQ8IqgfrlSGKs-61qE80eejtCqn6bE6dEiNbaAVFjYTn5bXQizoK0XcGh2VyyPyVMbGgVbr-Vnz7APr5Vg8HSuKiI1D50YhAVg3lfgaQ";

export default function YourLibraryScreen({ onNavigate }) {
  const {
    currentSong,
    isPlaying,
    playSong,
    favorites,
    toggleFavorite,
    audioMode,
    openModeSelector,
  } = usePlayer();

  const [activeFilter, setActiveFilter] = useState("Playlists"); // 'Playlists' | 'Podcasts' | 'Albums' | 'Artists' | 'Downloaded'
  const [sortOption, setSortOption] = useState("Recents"); // 'Recents' | 'Recently Added' | 'Alphabetical' | 'Creator'
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'grid'
  const [librarySearch, setLibrarySearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [songs, setSongs] = useState([]);
  const [selectedPlaylistSongs, setSelectedPlaylistSongs] = useState(null); // when user clicks a playlist/item
  const [selectedPlaylistTitle, setSelectedPlaylistTitle] = useState("");

  useEffect(() => {
    songsApi
      .getAll({ mode: audioMode })
      .then((res) => setSongs(res.data?.data || []))
      .catch(() => setSongs([]));
  }, [audioMode]);

  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_COVER;
  };

  // Base library items matching exact Stitch screen bbacfd9e2b104c74841c39314f790dcf
  const libraryEntries = [
    {
      id: "liked-songs",
      title: "Liked Songs",
      type: "Playlist",
      categoryType: "Playlists",
      subtitle: `Playlist • ${favorites.size > 0 ? favorites.size : 104} songs`,
      isPinned: true,
      isDownloaded: true,
      isSpecialLiked: true,
      image: null,
      filterAction: () => {
        const favSongs = songs.filter((s) => favorites.has(s._id || s.id));
        return favSongs.length > 0 ? favSongs : songs.slice(0, 10);
      },
    },
    {
      id: "your-episodes",
      title: "Your Episodes",
      type: "Podcast",
      categoryType: "Podcasts & Shows",
      subtitle: "Saved & downloaded • 14 episodes",
      isPinned: false,
      isDownloaded: true,
      isSpecialEpisodes: true,
      image: null,
      filterAction: () => songs.filter((s) => s.category?.toLowerCase().includes("vibe")).slice(0, 14),
    },
    {
      id: "tamil-love-playlist",
      title: "Tamil Love 8D Masterpiece",
      type: "Playlist",
      categoryType: "Playlists",
      subtitle: "Playlist • Flow 8D Spatial",
      isPinned: true,
      isDownloaded: true,
      image:
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80",
      filterAction: () => songs.filter((s) => s.category === "Tamil Love" || s.genre === "Love"),
    },
    {
      id: "tamil-melodies-playlist",
      title: "Tamil Melodies Collection",
      type: "Playlist",
      categoryType: "Playlists",
      subtitle: "Playlist • 104 songs",
      isPinned: false,
      isDownloaded: true,
      image:
        "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=300&q=80",
      filterAction: () => songs.filter((s) => s.category === "Tamil Melodies" || s.genre === "Melody"),
    },
    {
      id: "tamil-vibe-playlist",
      title: "Tamil Vibe & Energy 8D",
      type: "Playlist",
      categoryType: "Playlists",
      subtitle: "Playlist • 104 songs",
      isPinned: false,
      isDownloaded: true,
      image:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=300&q=80",
      filterAction: () => songs.filter((s) => s.category === "Tamil Vibe" || s.genre === "Vibe"),
    },
    {
      id: "night-drive",
      title: "Night Drive Synthwave",
      type: "Playlist",
      categoryType: "Playlists",
      subtitle: "Playlist • Alex Vance",
      isPinned: false,
      isDownloaded: true,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCpXhx6z655TP0xUNlwtaHAQJqmw4_akPwjnF4r_WTViJcHt5jcCBcg8qUPsIvVYRV3bSmjhG9OxTvYu65LemNkZRUlDCWZQMlC35sLDwaCbQpZ89bqU30PskXOxK37FQZwmMkiYAYnqD1QcPwuc-Q5lXLCKXvoZusq8vbqVbfGiqL6lxw0MwiakzV_asRNcgM-UuSWck9wgTpVwjfic450z1DV3UB8KQ0YIlhxACndsQ1SFqajDAt5",
      filterAction: () => songs.slice(0, 20),
    },
    {
      id: "anirudh",
      title: "Anirudh Ravichander",
      type: "Artist",
      categoryType: "Artists",
      subtitle: "Artist • 5.2M Monthly Listeners",
      isArtist: true,
      isDownloaded: false,
      image:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80",
      filterAction: () => songs.filter((s) => s.artist?.toLowerCase().includes("anirudh")),
    },
    {
      id: "kendrick-lamar",
      title: "Kendrick Lamar",
      type: "Artist",
      categoryType: "Artists",
      subtitle: "Artist",
      isArtist: true,
      isDownloaded: false,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCHx6rXeWEY-skSLf6ypeIa_VRAP3kUyp5MYX1nmZaf9cItakvi76LMiYwm2Rr7DVaxs7GIwa783ddggAZT2bq20FVldvBZ6XPFp1i1AONh_6b50rq7fW5FkjsxrO_V-Y0vTBK5aFN6s3DlMjrQrd6VjUo4Fj0r5fzjrnV76grOPkRWkWqunsZg6xGFMeFkPFHnG3HWFaxu8LN9zlPo8ErAg5ojqkZw541WK-jMN_rdF02L-7hP2gJF",
      filterAction: () => songs.slice(10, 25),
    },
    {
      id: "after-hours",
      title: "After Hours (Deluxe)",
      type: "Album",
      categoryType: "Albums",
      subtitle: "Album • The Weeknd",
      isDownloaded: false,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCUbASltRFh9VGNBtS-cHDUP2uWSx1wEdEmvGIz8rhCkYwSuZ0zXyev9pw5JFW4YNWbSS24jAoOtmHrOtca24bU-CS1g8K0q5E9K5BEjHqsLVy_l1RVNXyLMGT6Ldml-ZQmjLUp9p4mwGAxd-Kc6bMDh38RKhlKLZK4wpz1Y2YLxEdzEYGITEh3wNpWbE8DcjRRhFoxQWBBaqWoIU7A5TY4vUT7IHPw3lsvI7OvWEo08jzvjAEU13xR",
      filterAction: () => songs.slice(25, 40),
    },
    {
      id: "ar-rahman",
      title: "A.R. Rahman",
      type: "Artist",
      categoryType: "Artists",
      subtitle: "Artist • Oscar Winning Maestro",
      isArtist: true,
      isDownloaded: false,
      image:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80",
      filterAction: () => songs.filter((s) => s.artist?.toLowerCase().includes("rahman")),
    },
    {
      id: "lofi-study",
      title: "Lo-Fi Study Session",
      type: "Playlist",
      categoryType: "Playlists",
      subtitle: "Playlist • 94 songs",
      isDownloaded: true,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA3iXH5LZ-GO6hVq6et5mLyKt8CqrzOpIYBprYJTVHAXE7seiDVmO5iPkE-nv6clNSXzK2tZhR1_jfq3C42IXA71cnpExbIz0NNKcQMrms1A1ibfdW10iKrjjRf0D1h-8nU3t--Eh7coaZ0BSbKphq5GYDJ4MSZMFfD_74zwd7aE9l8OfdNXbV-86SX9YMeoINCWbMNz1M3yr72M9kY6Ggf0ue-TUIKOZdV8v2vGFRY54dZ2Ceq3MV5",
      filterAction: () => songs.slice(30, 50),
    },
    {
      id: "huberman-lab",
      title: "Huberman Lab",
      type: "Podcast",
      categoryType: "Podcasts & Shows",
      subtitle: "Podcast • Scicomm Media",
      isDownloaded: false,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCtGtw9NvJMnvjkYEkoXxHN8EDBdVSjL37Uz1KpXL1uRKnMV-VRg2YUA6dN3XT6-EGQ4I-Vmymu2PLG5SmGXr5qh5n_v_kTm8HCtYYR-inABeHSebeoV5A2bpOEIUhq78XgoRjeTT3-eM7zIgpB670n_bdNX_Fr7vjOEQdOHWYmYj7XLfbN7w9CpU_S8mAAjy70YOGjv7eMz99DJUq0mSRzNa_dewDDEf-fjvNrhbMR3gZAyN3oQUkC",
      filterAction: () => songs.slice(5, 15),
    },
    {
      id: "billie-eilish",
      title: "Billie Eilish",
      type: "Artist",
      categoryType: "Artists",
      subtitle: "Artist",
      isArtist: true,
      isDownloaded: false,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBlz085Zu9BpiN0wpluXseI_4JEiDIHdNdE-55kosmAM7UDLBk3k6R6vreYn8OFSk1ec-GNUra7RSGhiBYg9LdH13RYKD2lqGAf2LqmGWz7Wz9thhEGYSY4rFovSYQdTrGUCwE8mJke74oo80rqfGmro2DJ-Do-GmFaIEwm4WH0zwx1pROBnBD8MGxSaBxjLRr_ZP_nT5lW6Mx8BNyHa4HteVVGHIqZlE9qWoPYTy5gopT2IexQkvTs",
      filterAction: () => songs.slice(40, 55),
    },
  ];

  const filterTabs = ["Playlists", "Podcasts & Shows", "Albums", "Artists", "Downloaded"];

  // Filter items based on active pill and search query
  const filteredEntries = libraryEntries.filter((item) => {
    const matchesFilter =
      activeFilter === "Playlists"
        ? item.categoryType === "Playlists"
        : activeFilter === "Podcasts & Shows"
        ? item.categoryType === "Podcasts & Shows"
        : activeFilter === "Albums"
        ? item.categoryType === "Albums"
        : activeFilter === "Artists"
        ? item.categoryType === "Artists"
        : activeFilter === "Downloaded"
        ? item.isDownloaded
        : true;

    const matchesSearch =
      !librarySearch.trim() ||
      item.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(librarySearch.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleEntryClick = (entry) => {
    const matchedSongs = entry.filterAction();
    if (matchedSongs.length > 0) {
      setSelectedPlaylistSongs(matchedSongs);
      setSelectedPlaylistTitle(entry.title);
    }
  };

  const handlePlayEntry = (entry, e) => {
    e.stopPropagation();
    const matchedSongs = entry.filterAction();
    if (matchedSongs.length > 0) {
      playSong(matchedSongs[0], matchedSongs);
    }
  };

  const handleCycleSort = () => {
    const options = ["Recents", "Recently Added", "Alphabetical", "Creator"];
    const nextIdx = (options.indexOf(sortOption) + 1) % options.length;
    setSortOption(options[nextIdx]);
  };

  return (
    <div className="w-full flex flex-col font-sans text-white select-none pb-32 md:pb-24 bg-[#121212] min-h-full">
      {/* ============================================================== */}
      {/* 📱 1. STITCH ANDROID YOUR LIBRARY TOP HEADER (Mobile View) */}
      {/* ============================================================== */}
      <div className="md:hidden flex items-center justify-between px-4 pt-4 pb-2 bg-[#121212]">
        <div className="flex items-center gap-2.5">
          <img
            src="https://lh3.googleusercontent.com/aida/AEtjO1XoGmMbJ4lRqhALz_oICNd7N_sJDwjfsGxmDR3yFTJPnbbPbucsize5x7dBTYwBCtGPxDVxTpLbXKqIdL9xnCgL9114bHGeKl2V3x3w-dNiZzZIdRcTzVd1Xlf40emRClBwaGJsXHKD2bPcd7gfh7O_wTbF_TzF6FlPr3oehFoGCeW-s_9D8tq5QPb4gceZS1yPLwWzyQnH24-gq9ebYzHnxaPk4bUK9TAMgYRt7_VN9jXRc6E2GmwsvO8"
            alt="Flow 8D"
            className="h-8 w-auto object-contain shrink-0"
          />
          <h1 className="text-xl font-black text-white tracking-tight">Your Library</h1>
        </div>

        <div className="flex items-center gap-1 text-neutral-400">
          <button
            onClick={() => onNavigate && onNavigate("orbit")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:text-white hover:bg-white/5 active:scale-95 transition-all"
            title="Spatial Orbit"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
          </button>
          <button
            onClick={openModeSelector}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:text-white hover:bg-white/5 active:scale-95 transition-all"
            title="Audio Universe Settings"
          >
            <span className="material-symbols-outlined text-[24px]">settings</span>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 ml-1 shrink-0">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiczsZzVgrgqYyrdIAiKEzTYTD24N-A1X7vSr1QWp-QIiT1z32jd9Y_RbcNgncekE8Wj4-eMWoZAj8rXCXcGmtkyQ2w8J_fw1sH2tP1QUInToHVRoSe2qjGabX0AUe48Z63E7XUi9QIgXXIcYp9FRmY9oNzX5Qk1FWGeSQUmUdxDzd88RoX7HgMoy77AsZ4dtH0eJrBoWlPRJ9ZYNAqYuyuCTE9rxzHlgJYjJ6a9-dBgu_1cLJ8fqT"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SUB-HEADER: Large Title & Action Buttons (Search & Add) */}
      {/* ============================================================== */}
      <div className="px-4 sm:px-6 pt-3 pb-2 flex items-center justify-between max-w-7xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Your Library
        </h2>

        <div className="flex items-center gap-1 text-neutral-300">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`w-10 h-10 flex items-center justify-center rounded-full hover:text-white hover:bg-white/5 active:scale-95 transition-all ${
              isSearchOpen ? "text-[#1DB954]" : ""
            }`}
            title="Search your library"
          >
            <span className="material-symbols-outlined text-[24px]">search</span>
          </button>
          <button
            onClick={() => onNavigate && onNavigate("search")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:text-white hover:bg-white/5 active:scale-95 transition-all"
            title="Create playlist or add music"
          >
            <span className="material-symbols-outlined text-[26px]">add</span>
          </button>
        </div>
      </div>

      {/* Optional Search bar dropdown */}
      {isSearchOpen && (
        <div className="px-4 sm:px-6 max-w-7xl mx-auto w-full pb-2 animate-fadeIn">
          <div className="flex items-center w-full bg-[#242424] rounded-xl px-3.5 py-2 border border-white/10 gap-2">
            <span className="material-symbols-outlined text-neutral-400 text-lg">search</span>
            <input
              type="text"
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              placeholder="Find in Your Library..."
              className="bg-transparent border-0 text-white placeholder-neutral-400 text-xs sm:text-sm focus:outline-none w-full"
              autoFocus
            />
            {librarySearch && (
              <button
                onClick={() => setLibrarySearch("")}
                className="text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. FILTER PILLS SCROLLER (Exact Stitch Spec) */}
      {/* ============================================================== */}
      <div className="px-4 sm:px-6 py-2 overflow-x-auto no-scrollbar flex items-center gap-2 max-w-7xl mx-auto w-full">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`shrink-0 px-4 py-1.5 rounded-full font-semibold text-xs transition-all active:scale-95 shadow-sm ${
                isActive
                  ? "bg-[#1DB954] text-black font-bold shadow-[0_2px_8px_rgba(29,185,84,0.3)]"
                  : "bg-[#242424] text-neutral-300 hover:bg-[#2e2e2e] hover:text-white border border-white/5"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 4. SORT ROW & LIST/GRID TOGGLE */}
      {/* ============================================================== */}
      <div className="px-4 sm:px-6 pt-3 pb-2 flex items-center justify-between max-w-7xl mx-auto w-full">
        <button
          onClick={handleCycleSort}
          className="flex items-center gap-1.5 text-neutral-300 hover:text-white group py-1 active:opacity-75 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px] text-neutral-400 group-hover:text-[#1DB954] transition-colors">
            swap_vert
          </span>
          <span className="text-xs font-semibold">{sortOption}</span>
        </button>

        <button
          onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
          className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-white active:scale-90 transition-transform"
          title={`Switch to ${viewMode === "list" ? "Grid" : "List"} View`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {viewMode === "list" ? "grid_view" : "view_list"}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 5. MAIN CONTENT: PLAYLIST TRACKS OR LIBRARY LIST */}
      {/* ============================================================== */}
      <div className="px-4 sm:px-6 max-w-7xl mx-auto w-full mt-2">
        {selectedPlaylistSongs ? (
          /* Sub-view: Showing songs of the selected playlist */
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#1e1e24] border border-white/5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedPlaylistSongs(null)}
                  className="w-9 h-9 rounded-full bg-[#2a2a32] hover:bg-white hover:text-black flex items-center justify-center text-white transition-all active:scale-95"
                  title="Back to Library"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {selectedPlaylistTitle}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {selectedPlaylistSongs.length} songs • {audioMode?.toUpperCase()} Spatial
                  </p>
                </div>
              </div>

              <button
                onClick={() => playSong(selectedPlaylistSongs[0], selectedPlaylistSongs)}
                className="px-4 py-2 rounded-full bg-[#1DB954] text-black font-bold text-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-base">play_arrow</span>
                <span>Play</span>
              </button>
            </div>

            {/* Song rows */}
            <div className="divide-y divide-white/5 rounded-2xl bg-[#181818]/60 border border-white/5 p-2">
              {selectedPlaylistSongs.map((song, idx) => {
                const isThisPlaying =
                  currentSong &&
                  (currentSong._id || currentSong.id) === (song._id || song.id) &&
                  isPlaying;
                const isFav = favorites.has(song._id || song.id);

                return (
                  <div
                    key={song._id || song.id || idx}
                    onClick={() => playSong(song, selectedPlaylistSongs)}
                    className={`grid grid-cols-12 items-center px-4 py-3 rounded-xl hover:bg-[#242424] cursor-pointer group transition-colors text-xs ${
                      isThisPlaying ? "bg-[#242424] text-[#1DB954]" : "text-neutral-300"
                    }`}
                  >
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
                      <span className="material-symbols-outlined text-xl text-white">
                        {isThisPlaying ? "pause" : "play_arrow"}
                      </span>
                    </div>

                    <div className="col-span-8 md:col-span-6 flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-neutral-900">
                        <img
                          src={song.imageUrl || DEFAULT_COVER}
                          alt={song.title}
                          className="w-full h-full object-cover"
                          onError={handleImgError}
                        />
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <h4
                          className={`font-bold truncate text-xs sm:text-sm ${
                            isThisPlaying ? "text-[#1DB954]" : "text-white group-hover:text-[#1DB954]"
                          }`}
                        >
                          {song.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:flex md:col-span-3 items-center gap-2 text-neutral-400">
                      <span className="truncate">{song.category || "Tamil Melodies"}</span>
                      {song.audioMode && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#1DB954] uppercase">
                          {song.audioMode}
                        </span>
                      )}
                    </div>

                    <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-3 pr-2 text-right">
                      <span className="font-mono text-neutral-400 text-[11px]">
                        {song.duration || "4:15"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(song._id || song.id);
                        }}
                        className="text-neutral-400 hover:text-white"
                      >
                        <span
                          className={`material-symbols-outlined text-sm ${
                            isFav ? "text-[#1DB954]" : ""
                          }`}
                          style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          favorite
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View Mode */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => handleEntryClick(entry)}
                className="group p-3 rounded-2xl bg-[#181818] hover:bg-[#242424] cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-md border border-white/5 hover:border-white/10 active:scale-[0.98]"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#202020] shadow-md flex items-center justify-center">
                  {entry.isSpecialLiked ? (
                    <div className="w-full h-full bg-gradient-to-br from-[#450af5] via-[#8e8ee5] to-[#c4efd9] flex items-center justify-center shadow-lg">
                      <span
                        className="material-symbols-outlined text-white text-4xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        favorite
                      </span>
                    </div>
                  ) : entry.isSpecialEpisodes ? (
                    <div className="w-full h-full bg-gradient-to-br from-[#006450] to-[#05382b] flex items-center justify-center shadow-lg">
                      <span
                        className="material-symbols-outlined text-[#1DB954] text-4xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        bookmark
                      </span>
                    </div>
                  ) : (
                    <img
                      src={entry.image || DEFAULT_COVER}
                      alt={entry.title}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                        entry.isArtist ? "rounded-full" : "rounded-xl"
                      }`}
                      onError={handleImgError}
                    />
                  )}

                  {/* Play Hover Button */}
                  <div className="absolute right-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-3 transition-all duration-200">
                    <button
                      onClick={(e) => handlePlayEntry(entry, e)}
                      className="w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-90 transition-transform"
                    >
                      <span
                        className="material-symbols-outlined text-2xl font-bold ml-0.5"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        play_arrow
                      </span>
                    </button>
                  </div>
                </div>

                <div className="min-w-0 flex flex-col">
                  <h3
                    className={`text-xs sm:text-sm font-bold truncate leading-snug pb-0.5 ${
                      entry.isPinned ? "text-[#1DB954]" : "text-white"
                    } group-hover:text-[#1DB954] transition-colors`}
                  >
                    {entry.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-neutral-400 truncate">
                    {entry.isPinned && (
                      <span
                        className="material-symbols-outlined text-[#1DB954] text-[13px] shrink-0"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        push_pin
                      </span>
                    )}
                    <span className="truncate">{entry.subtitle}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View Mode (Exact Stitch Spec) */
          <div className="flex flex-col gap-1">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => handleEntryClick(entry)}
                className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1f1f26] active:bg-[#282733] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Artwork / Icon Box */}
                  {entry.isSpecialLiked ? (
                    <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-[#450af5] via-[#8e8ee5] to-[#c4efd9] shrink-0 flex items-center justify-center shadow-[0_6px_20px_rgba(69,10,245,0.35)] overflow-hidden">
                      <span
                        className="material-symbols-outlined text-white text-[28px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        favorite
                      </span>
                    </div>
                  ) : entry.isSpecialEpisodes ? (
                    <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-[#006450] to-[#05382b] shrink-0 flex items-center justify-center shadow-[0_6px_16px_rgba(0,100,80,0.3)] overflow-hidden">
                      <span
                        className="material-symbols-outlined text-[#1DB954] text-[28px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        bookmark
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`relative w-16 h-16 shrink-0 overflow-hidden shadow-md bg-[#242424] ${
                        entry.isArtist ? "rounded-full" : "rounded-xl"
                      }`}
                    >
                      <img
                        src={entry.image || DEFAULT_COVER}
                        alt={entry.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={handleImgError}
                      />
                    </div>
                  )}

                  {/* Title & Subtitle */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span
                      className={`font-semibold text-sm truncate ${
                        entry.isPinned
                          ? "text-[#1DB954] font-bold"
                          : "text-white group-hover:text-[#1DB954]"
                      } transition-colors`}
                    >
                      {entry.title}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5 min-w-0 text-neutral-400 text-xs">
                      {entry.isPinned && (
                        <span
                          className="material-symbols-outlined text-[#1DB954] text-[14px] shrink-0"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          push_pin
                        </span>
                      )}
                      <span className="truncate">{entry.subtitle}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Download indicator / Play button */}
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  {entry.isDownloaded && (
                    <span
                      className="material-symbols-outlined text-[#1DB954] text-[17px] shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                      title="Downloaded"
                    >
                      download_done
                    </span>
                  )}
                  <button
                    onClick={(e) => handlePlayEntry(entry, e)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#1DB954] hover:text-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                    title="Play"
                  >
                    <span
                      className="material-symbols-outlined text-lg"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      play_arrow
                    </span>
                  </button>
                </div>
              </div>
            ))}

            {/* Add Artists & Podcasts Shortcut Tile from Stitch */}
            <div
              onClick={() => onNavigate && onNavigate("search")}
              className="group flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-[#1f1f26] active:bg-[#282733] transition-colors cursor-pointer mt-2"
            >
              <div className="w-16 h-16 rounded-xl bg-[#242424] border-dashed border-2 border-white/20 flex items-center justify-center shrink-0 group-hover:border-[#1DB954] group-hover:bg-[#2a2930] transition-all">
                <span className="material-symbols-outlined text-neutral-400 group-hover:text-[#1DB954] text-[28px] transition-colors">
                  add
                </span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-white group-hover:text-[#1DB954] transition-colors">
                  Add Artists &amp; Podcasts
                </span>
                <span className="text-xs text-neutral-400 truncate mt-0.5">
                  Personalize your library recommendations
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
