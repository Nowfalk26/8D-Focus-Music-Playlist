import React, { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import { songsApi, categoriesApi } from "../api/api";
import staticSongs from "../data/songsData.json";

export default function MusicLibrary({ onNavigate, initialCategory = "All" }) {
  const { currentSong, isPlaying, playSong, togglePlay, favorites, toggleFavorite, audioMode } = usePlayer();

  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState(() => staticSongs);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const [recentSearches, setRecentSearches] = useState([
    {
      id: "anirudh",
      name: "anirudh",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDZ3IFDM0X8KsrPoVeC1Mr5OiKcVoOblGmQ74PZCegXkRwQ3WnqkA8QYjqX89UksoQeSdvw4zM6S8nDimn5HRAfhL4BhtxY3SMFGgJmnEHuBKSx7gx4qOgxtCh3G5dP0q7Xx9oDW6kpKalFLT9Jp47oMcgxleF23RWSaG_FGBwHW02N00N589O_Sc-b4Jgn9FZFfTIMKylc8WCIcYV9Lurl3HenFukVdVHHmqsYO-nO83ky-Iayzc53MQ",
    },
    {
      id: "kendrick",
      name: "Kendrick Lamar",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCW8Ekq2LwLxE6Yrh1HJoZLalqBPBnmHQppTquPDXO6KM4F04xhiMHm6zPvvZsse0yL3W701_3EdlvR2vZJtyclu8jrSIjuVkLgELLkGEFzrkGheeEsvyQ3JG6n6Pml1Ch822RzegJBvm7yLP-o7v7e9EIqKL4396HDSHvygP6vGKOCaGm5vviKw0XT8-qfdtU3S_j52J1hNlXRmL5UDaq8pGI64HHyaKPt8nA58OQzKRTZRiT9e_wTFg",
    },
    {
      id: "lofi",
      name: "Chill Lo-Fi Beats",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCI4Qm029Cox4CDjSDwUwE9W5VzhbRjeE0Shw5TBm4_0vlfR-eE5o6NmhtzwLH8TVDeEBSUFUUaQpXBEsgSFTAaTTQivmj7_3JtePINMkcr03H6V5YFw12Cha_TuPOFfVkjhv89UCAqkcncqjMeoogPtpKz3PM0ETRfcCkhUlWO72UHS0ID_CvZcYsnTUGunb2yMKq5-xlBn8rwAcCZ_xoRPnd3CkXbLgFtKFwuOZU_G5EUXKv9JOu1-Q",
    },
    {
      id: "dua",
      name: "Dua Lipa",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuABgiWcQ9CQMGcYnFnj_FWgdFTBWCf2pFXIy2UzeQiX9AN9Y3WiigT30jxKmY1IKAgC5aLZ-Voarz87etQcTwwKyYDp5P8ebehqbZ3TLV-sG0Dk6x416X8ihDHxYlCoEafdRwG5-Y2bShsDuyqousWzY1FrZjHqBBSjHlCYf637qq7P0JdgnTRVlzrQJJF_5TvCJjEREOBgiduWQebw5l6UkPQsYZGA1LTuAO8eZ4Eru9XKHZAbRfd-iw",
    },
    {
      id: "arrahman",
      name: "A.R. Rahman",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC0QVtWxuncirdopTzR3WIxNkKqsarfuf8m8t0qRsqly4Vuw1KtNA0GduwUEdAc0ijqpd6rydDOigc2KsquR7YgV4Frh5gJ065rF720hpOj0trBmo3mP0bEoA1uOmlTu-HOWbNvsBs2l03fGb4ijM9_kkqviym2UZsftZNegYuHb4TdEHX1kFOo0bvdoCRWNjuQRIPDznlmgLhxAz6wqv6ATnm3VkuWrefa1bDIUvIbJ7_XIcVe7aOPfQ",
    },
    {
      id: "binaural-hits",
      name: "Binaural 360 Hits",
      isIcon: true,
      icon: "spatial_audio",
    },
  ]);

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

  const genres = [
    {
      id: "hip-hop",
      title: "#Hip-Hop Pulse",
      badge: "TRENDING NOW",
      badgeColor: "text-secondary",
      tracksCount: "128 Spatial Tracks",
      gradient: "from-surface-container-high/60 via-transparent to-primary-container/10",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuARykSAzQ0DenaJQrEb7Awn-8aAnqMO4sED6NXXw0JEL7tq_6q7iA9oYaWuwTP0o_kSmth46c1WUPmiPfuqaRTy07phFiQbxGfkYhLMZj01VeboKZ91B8HFy_hNZMWF9g3MWKMOz5pCXwPlNzCWiyh2-DBtWet01__m9mauoQGCr3C43WfSqi0vi_7FGR3kkFaKLMTIqqJfpglITR9QKK3Orsef62Q4OwDNL0grNTxgeJyF_1Hd5h1tTg",
      filterTerm: "Hip-Hop",
    },
    {
      id: "synth",
      title: "#Late Night Synth",
      badge: "RECOMMENDED",
      badgeColor: "text-tertiary-fixed-dim",
      tracksCount: "94 Spatial Tracks",
      gradient: "from-surface-container-high/60 via-transparent to-tertiary-container/10",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBnu3s81aKMSnKRcnRp3IdZXU6I2dm5IlISPIRUtj4tW7S4jnUyJEagkzlWy8Z5KXLdM4CTUp2enXuUfCB_RjUpsdqHXums-cLIU4jI1ww2BJWUYL_fMaWzmpYUiFQdE8J-oeYha8SHLbkJmnbB00gz0ATMX9ksOC2FK6trHmlj9h-NHBEIlwOXFgU2XVw1Cq7yZfT_4CKHBONkZ0UoXMCHWpKdS-CZjgzwC7dQrmGnOXIdCFf4c2nS",
      filterTerm: "Synth",
    },
    {
      id: "chill-lofi",
      title: "#Chill Lo-Fi Beats",
      badge: "DEEP FOCUS",
      badgeColor: "text-secondary",
      tracksCount: "210 Spatial Tracks",
      gradient: "from-surface-container-high/60 via-transparent to-primary-container/10",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCI4Qm029Cox4CDjSDwUwE9W5VzhbRjeE0Shw5TBm4_0vlfR-eE5o6NmhtzwLH8TVDeEBSUFUUaQpXBEsgSFTAaTTQivmj7_3JtePINMkcr03H6V5YFw12Cha_TuPOFfVkjhv89UCAqkcncqjMeoogPtpKz3PM0ETRfcCkhUlWO72UHS0ID_CvZcYsnTUGunb2yMKq5-xlBn8rwAcCZ_xoRPnd3CkXbLgFtKFwuOZU_G5EUXKv9JOu1-Q",
      filterTerm: "Lo-Fi",
    },
    {
      id: "tamil-8d",
      title: "#Tamil 8D Melodies",
      badge: "REGIONAL MASTER",
      badgeColor: "text-secondary",
      tracksCount: "45 Spatial Tracks",
      gradient: "from-surface-container-high/60 via-transparent to-secondary-container/10",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCwIyKHQinWa7qaDI9Ko2kG935OnLAGU_to4xvfCVT3elXB932su5NaAZ5Z_o_g0RkW5lFKGgQuiVZBmL4yLrAoyGUpcqmVJyiIkV2LS0eltzkfAVd-nT3O5y4hYZtlhSeHE_hb8cnktKiAyB-QzQbXxtMKnwdvGEA3zSiIFLcYd8LgvGN8O8AfcOavosx9V6RaCuPb2ZET8vVY2O2XhZYy8cP2B15EJ2NjcSbHW_pr41OSeOoGRk1a3w",
      filterTerm: "Tamil",
    },
  ];

  const browseTiles = [
    { id: "pop", title: "Pop Hits 8D", color: "from-pink-600 to-rose-900", count: "140 tracks" },
    { id: "rock", title: "Rock & Alt", color: "from-red-600 to-amber-900", count: "88 tracks" },
    { id: "electronic", title: "EDM & Club", color: "from-emerald-600 to-teal-900", count: "165 tracks" },
    { id: "ambient", title: "Ambient Flow", color: "from-cyan-600 to-blue-900", count: "72 tracks" },
    { id: "classical", title: "Orchestral 360", color: "from-purple-600 to-indigo-900", count: "54 tracks" },
    { id: "hiphop", title: "Hip-Hop & Trap", color: "from-orange-600 to-red-900", count: "112 tracks" },
  ];

  const filteredSongs = songs.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title?.toLowerCase().includes(q) ||
      s.artist?.toLowerCase().includes(q) ||
      s.album?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q)
    );
  });

  const removeSearchChip = (id, e) => {
    e.stopPropagation();
    setRecentSearches((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="w-full min-w-0 flex flex-col font-sans text-on-surface select-none p-5 sm:p-7 space-y-7 pb-28 max-w-[1400px] mx-auto box-border">
      {/* Search Bar Section */}
      <section className="flex flex-col gap-4">
        <div className="relative w-full rounded-2xl bg-surface-container-low shadow-lg group focus-within:ring-1 focus-within:ring-primary-container transition-all border border-white/5">
          <div className="flex items-center px-4 py-3 gap-3">
            <span className="material-symbols-outlined text-outline text-2xl group-focus-within:text-primary-container transition-colors">
              search
            </span>
            <input
              className="w-full bg-transparent font-headline-sm text-base sm:text-lg text-on-surface placeholder:text-outline focus:outline-none tracking-tight"
              placeholder="What do you want to listen to?"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchQuery("");
              }}
            />
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                aria-label="Audio Visual Search"
                className="p-2 rounded-full hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors flex items-center justify-center cursor-pointer"
                title="Acoustic Fingerprint Search"
              >
                <span className="material-symbols-outlined text-xl">mic</span>
              </button>
              <button
                aria-label="Visual Tag Identifier"
                className="p-2 rounded-full hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors flex items-center justify-center cursor-pointer"
                title="Camera Lens Recognition"
              >
                <span className="material-symbols-outlined text-xl">photo_camera</span>
              </button>
              <span className="text-outline/40 font-thin text-base mx-0.5">|</span>
              <kbd
                onClick={() => setSearchQuery("")}
                className="px-2 py-0.5 rounded bg-surface-container-lowest text-outline font-label-caps text-[10px] cursor-pointer hover:text-white"
              >
                ESC to clear
              </kbd>
            </div>
          </div>
        </div>

        {/* Recent Searches Row */}
        {recentSearches.length > 0 && !searchQuery && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-xs text-outline uppercase tracking-wider font-bold">
                Recent searches
              </span>
              <button
                onClick={() => setRecentSearches([])}
                className="font-label-md text-xs text-outline hover:text-primary-container transition-colors cursor-pointer"
              >
                Clear all
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {recentSearches.map((chip) => (
                <div
                  key={chip.id}
                  onClick={() => setSearchQuery(chip.name)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high transition-all group cursor-pointer shadow-sm border border-white/5"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-surface-container-highest shrink-0 flex items-center justify-center">
                    {chip.isIcon ? (
                      <span className="material-symbols-outlined text-sm text-secondary">
                        {chip.icon}
                      </span>
                    ) : (
                      <img className="w-full h-full object-cover" src={chip.avatar} alt={chip.name} />
                    )}
                  </div>
                  <span className="font-label-md text-xs text-on-surface group-hover:text-primary-container transition-colors">
                    {chip.name}
                  </span>
                  <button
                    onClick={(e) => removeSearchChip(chip.id, e)}
                    className="text-outline hover:text-error transition-colors flex items-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* When searching: display search results */}
      {searchQuery && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-on-surface tracking-tight font-headline-md">
              Search Results for "{searchQuery}"
            </h2>
            <span className="text-xs text-outline font-mono">({filteredSongs.length} songs)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredSongs.map((song) => {
              const isPlayingThis =
                currentSong && (currentSong._id === song._id || currentSong.title === song.title) && isPlaying;

              return (
                <div
                  key={song._id || song.id}
                  onClick={() => playSong(song, filteredSongs)}
                  className={`flex items-center justify-between p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-white/5 transition-all cursor-pointer group ${
                    isPlayingThis ? "border-primary-container/40 bg-surface-container" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={song.imageUrl || song.cover}
                      alt={song.title}
                      className="w-12 h-12 rounded-xl object-cover bg-surface-container shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className={`text-xs sm:text-sm font-semibold truncate ${isPlayingThis ? "text-primary-container font-bold" : "text-on-surface"}`}>
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
                      <span className="material-symbols-outlined text-lg">
                        {favorites.has(song._id || song.id) ? "favorite" : "favorite_border"}
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isPlayingThis) togglePlay();
                        else playSong(song, filteredSongs);
                      }}
                      className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-md hover:scale-105 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isPlayingThis ? "pause" : "play_arrow"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Explore your genres (Curated 8D) */}
      {!searchQuery && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="font-headline-md text-lg sm:text-xl text-on-surface font-bold tracking-tight">
                Explore your genres
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary-container font-label-caps text-[10px] uppercase font-bold border border-primary-container/20">
                Curated 8D
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <div
                key={genre.id}
                onClick={() => setSearchQuery(genre.filterTerm)}
                className="relative overflow-hidden rounded-2xl bg-surface-container-low p-5 min-h-[170px] flex flex-col justify-between group cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/5"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${genre.gradient} pointer-events-none`} />
                <div className="relative z-10 flex flex-col gap-1">
                  <span className="font-headline-sm text-base text-on-surface group-hover:text-primary-container transition-colors font-bold">
                    {genre.title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                    <span className={`font-label-caps text-[10px] ${genre.badgeColor} font-bold tracking-wider`}>
                      {genre.badge}
                    </span>
                  </div>
                </div>

                {/* Peeking 3D Album Cover */}
                <div className="absolute -right-4 -bottom-4 w-28 h-28 rounded-xl overflow-hidden shadow-2xl rotate-12 group-hover:rotate-6 group-hover:scale-105 transition-all duration-300 bg-surface-container-highest border border-white/10">
                  <img className="w-full h-full object-cover" src={genre.image} alt={genre.title} />
                </div>

                <div className="relative z-10 flex items-center gap-1 text-outline font-body-sm text-xs">
                  <span className="material-symbols-outlined text-base text-secondary">graphic_eq</span>
                  <span>{genre.tracksCount}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Browse All Section */}
      {!searchQuery && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-lg sm:text-xl text-on-surface font-bold tracking-tight">
              Browse All
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {browseTiles.map((tile) => (
              <div
                key={tile.id}
                onClick={() => setSearchQuery(tile.title.replace(" 8D", "").replace(" 360", ""))}
                className={`relative overflow-hidden rounded-2xl p-4 min-h-[120px] flex flex-col justify-between bg-gradient-to-br ${tile.color} shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border border-white/10`}
              >
                <span className="font-headline-sm text-sm font-bold text-white tracking-tight leading-snug">
                  {tile.title}
                </span>
                <span className="font-label-caps text-[10px] text-white/70 font-mono">
                  {tile.count}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
