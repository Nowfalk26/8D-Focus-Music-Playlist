import React from "react";
import { usePlayer } from "../context/PlayerContext";

export default function RightSidebarPanel({ onNavigate }) {
  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    queue,
    playlist,
    currentTime,
    duration,
  } = usePlayer();

  const showcasePlaylist = [
    {
      id: "track-1",
      title: "Ocean Eyes",
      artist: "Billie Eilish",
      duration: "3:20",
      audioUrl: "https://aac.saavncdn.com/932/7cf7f8a9d9c3faa2633d1605e97ba4a5_160.mp4",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWByWvdnUZaWSyHWRuiUAof9rGDUkaXD0hDAykUqTaQA_p_GH-PIHsoDBJlXPsmxAkgp2fE1h7uI8vbFX6SKL-_yqYcCR3vScUyvaCskQv3W2_53DwvuccO3gSuoWU08yyJD6MzSeR1JNFG71eD3VUjlfCTFKI0ImoEE00r75DhLiPNwojNa9Vy6UUfYhA_9YJ3Xtfd4VE3bcfOHoXCBuVKg6Kg1s5YXb0t_bw_sjqb22HowHDEiQHEg",
      audioMode: "8d",
    },
    {
      id: "track-2",
      title: "Lo Vas A Olvidar",
      artist: "Billie Eilish & Rosalía",
      duration: "3:23",
      audioUrl: "https://aac.saavncdn.com/001/cf795c655325785055b410f9e9cfda3a_160.mp4",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYOFacibrY2TY432yOuPgY5_38m7t0nLQPmAiPqcML9vT30Dlgx1poPsnfqiHl11l9qwsezKwcTM5Bd87rcTIN8FFHiugju5nfLmQ3HRNBjh9R3SIjwZTYNlSM-9YCfKzgagAQbcxiUZ2xgq31Rhq7hSA-2Qr_KYQgAhXZ8bnF9CtLzte-0hEDC_Nlb2rjFUhx4Xq-kZE0Eav26Bijv0GJcy20mtBy1DDZN77D4nCWtIFvLDXqW-8SBA",
      audioMode: "8d",
    },
    {
      id: "track-3",
      title: "No Time to Die",
      artist: "Billie Eilish",
      duration: "4:02",
      audioUrl: "https://aac.saavncdn.com/267/35e80dc0e599d4db2f8d8b9d6a36f94b_160.mp4",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcoCM6X9BeYwVFxdvBOpIP4R-1kPSsURPoXVqh1oHaCVvyzYq7Hesj3mG7I7rroJ9kgbX1XrXMpvwrsaMhpmf2jYHk5UI0-ZQiwoIhYsDswvljP8h2T-AMvxZGPMJlzHt3Fv4fQIR3RdHKyL_jcZdVFXV9aF8Ews_Db9F61ZGRMLC20QOD_sKkoIA1l3PgmSbDlLxrqSu4pHSfMLQUlzjgA48ialb5QfPOb3SOy7aNN2Kq7kGwIv1SXA",
      audioMode: "8d",
    },
    {
      id: "track-4",
      title: "Six Feet Under",
      artist: "Billie Eilish",
      duration: "3:09",
      audioUrl: "https://aac.saavncdn.com/932/7cf7f8a9d9c3faa2633d1605e97ba4a5_160.mp4",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_k_6KkxwYbap9wW2x23Dn3VQYeKJs9itz6dzsiqUtfbEpf2PTBbnPhSNNSoufEwT0l8lRo8nwFlrXhWknKVp1PLe42p-UkCbZnV2H-bpGDxqmhIu8g7ey6ZZ_qLnzuJcNOt7ulJbG3u9fFS5Mk_IuLMZJajdfsUWHRrlvjH2kfudFv3c3pBEoghbW8Mq6utSx8wIX1Lyqsb875pjOl9Z-F1_boeOMlXpcRF8_SDxsmAH8MKfLokdh2A",
      audioMode: "8d",
    },
    {
      id: "track-5",
      title: "Bury a Friend",
      artist: "Billie Eilish",
      duration: "3:13",
      audioUrl: "https://aac.saavncdn.com/001/cf795c655325785055b410f9e9cfda3a_160.mp4",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8IOGZNT5KPCl_ln7PczM603_rXgOSkUxEBZ-9WwVqvbbs8YEWStGTxV_xdKOPDU8YtXBdvHydiXrdQdqjrI2M_ignhtvJtFyJDVHHRPq6INfKmJF2U4fFqB4Lj6iAiLoN4EBo2yYK-sgZiR0L266437M3DaneJk6ZIwk-fC84HQHgIIAJg0ICdmkm70-70__d8omjbip32bRTpt07GWlRKuiQQYnYDtoOmYl-L8VDO5zGhti8BVevnQ",
      audioMode: "8d",
    },
    {
      id: "track-6",
      title: "Bad Guy",
      artist: "Billie Eilish",
      duration: "3:14",
      audioUrl: "https://aac.saavncdn.com/267/35e80dc0e599d4db2f8d8b9d6a36f94b_160.mp4",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZA93wzZ_sfgwxDxUi6IOIckYtUwehrv-lM6lLlLCxS9BeR8a7lIUHI2hukDIrdz4hYizvctGzavQvMX0std5GoReHDvciJFc6WTHkhcJgUMkbl7JGponhKumellmLzbYqzF-gPRsITX6wM9CmPP2BGjlz0SNfcGOlrUUZhW-fh3p0C7UR7-bzkIbcZ9XiU950Hsarxd-fevssUZZE3zIi7hCbeNbzSedIrJKhTJ4H_186QwwJDtUTlg",
      audioMode: "8d",
    },
    {
      id: "track-7",
      title: "Wish You Were Gay",
      artist: "Billie Eilish",
      duration: "3:41",
      audioUrl: "https://aac.saavncdn.com/932/7cf7f8a9d9c3faa2633d1605e97ba4a5_160.mp4",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKO09V1CXYUHuwlQsuor3B4VAFZRMTQty4ISNGQj6g-iQvadqzRmnS2FYdW_gnVkKyVTkyuqbbEMV238ABS87mx_oLfWyjhgwwKd_XEAQ-0ljsQSdSI5bIhNy_oPNW2c0ThNYYR8Sg8lRBO8eiz5qG5K3qzU7Hrdyp0xEleQTXuwvw7htpLJgjhrlbapOSFqIYwrKG1ERASLJyY3TiD583D3xAOgonObpZFW8qxPntVGeWbvmvw-syFg",
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
    (currentSong._id === song._id ||
      currentSong.id === song.id ||
      currentSong.title === song.title);

  return (
    <aside className="w-80 xl:w-[320px] 2xl:w-[340px] shrink-0 h-full flex flex-col justify-between bg-surface-container-lowest p-4 rounded-2xl shadow-xl border border-white/5 overflow-hidden select-none font-sans">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-1 pb-2 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container text-xl">
            graphic_eq
          </span>
          <h3 className="font-headline-sm text-base text-on-surface font-bold tracking-tight">
            Play List
          </h3>
        </div>
        <button
          onClick={() => onNavigate && onNavigate("library")}
          className="flex items-center gap-1 font-label-md text-xs text-outline hover:text-on-surface transition-colors cursor-pointer"
        >
          <span>See All</span>
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </button>
      </div>

      {/* Track List Items */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-1 pr-0.5">
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
              className={`group relative flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                isThisActive
                  ? "bg-surface-container shadow-md border border-white/5"
                  : "hover:bg-surface-container border border-transparent"
              }`}
            >
              {/* Active left indicator line */}
              {isThisActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary-container rounded-r-full shadow-[0_0_8px_rgba(0,245,155,0.7)]" />
              )}

              <div className="flex items-center gap-2.5 min-w-0 pl-1">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-container-high">
                  <img
                    className="w-full h-full object-cover"
                    src={song.cover || song.imageUrl}
                    alt={song.title}
                  />

                  {/* Equalizer Wave / Hover Play Icon */}
                  {isThisActive && isPlaying ? (
                    <div className="absolute inset-0 bg-surface-container-lowest/60 flex items-center justify-center">
                      <div className="flex items-end gap-[2px] h-3.5">
                        <div
                          className="w-0.5 bg-primary-container rounded-full animate-bounce"
                          style={{ animationDuration: "450ms", height: "12px" }}
                        />
                        <div
                          className="w-0.5 bg-primary-container rounded-full animate-bounce"
                          style={{ animationDuration: "300ms", height: "7px" }}
                        />
                        <div
                          className="w-0.5 bg-primary-container rounded-full animate-bounce"
                          style={{ animationDuration: "550ms", height: "14px" }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-surface-container-lowest/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span
                        className="material-symbols-outlined text-primary text-lg"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        play_arrow
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-label-lg text-xs font-semibold truncate ${
                        isThisActive
                          ? "text-primary-container"
                          : "text-on-surface group-hover:text-primary-container transition-colors"
                      }`}
                    >
                      {song.title}
                    </span>
                    <span className="px-1 py-0.2 rounded bg-primary-container/20 text-primary-container font-label-caps text-[8px] font-extrabold uppercase">
                      8D
                    </span>
                  </div>
                  <span className="font-body-sm text-[11px] text-outline truncate">
                    {song.artist}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`font-body-sm text-[11px] font-mono ${
                    isThisActive ? "text-secondary" : "text-outline"
                  }`}
                >
                  {song.duration || "3:20"}
                </span>
                <button
                  aria-label={isThisActive && isPlaying ? "Pause" : "Play"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isThisActive) {
                      togglePlay();
                    } else {
                      playSong(song, activeTrackList);
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isThisActive && isPlaying
                      ? "bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,245,155,0.4)]"
                      : "bg-surface-container-high text-on-surface-variant group-hover:text-primary-container group-hover:bg-surface-bright opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {isThisActive && isPlaying ? "pause" : "play_arrow"}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CURRENT SPATIAL SOUNDSTAGE MONITOR WIDGET */}
      <div className="mt-2 p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-2 relative overflow-hidden border border-white/5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-ping" />
            <span className="font-label-caps text-[10px] text-on-surface font-bold uppercase tracking-wider">
              Spatial Soundstage
            </span>
          </div>
          <span className="font-label-caps text-[9px] text-secondary font-mono tracking-widest font-bold">
            BINAURAL 8D
          </span>
        </div>

        {/* Radar / Orbit Soundstage Canvas Simulation */}
        <div className="relative w-full h-28 rounded-lg bg-surface-container-lowest flex items-center justify-center overflow-hidden border border-white/5">
          {/* Concentric Orbit Range Rings */}
          <div className="absolute w-24 h-24 rounded-full border border-outline-variant/40" />
          <div className="absolute w-16 h-16 rounded-full border border-outline-variant/60" />
          <div className="absolute w-10 h-10 rounded-full border border-secondary/30" />

          {/* Crosshairs */}
          <div className="absolute inset-x-0 h-[1px] bg-outline-variant/20" />
          <div className="absolute inset-y-0 w-[1px] bg-outline-variant/20" />

          {/* Listener Center Head Icon */}
          <div className="relative z-10 w-7 h-7 rounded-full bg-surface-container-high text-primary-container flex items-center justify-center shadow-lg border border-primary-container/30">
            <span className="material-symbols-outlined text-sm">headphones</span>
          </div>

          {/* Revolving 8D Orbit Sound Node */}
          <div
            className="absolute w-full h-full animate-spin"
            style={{
              animationDuration: isPlaying ? "8s" : "24s",
              animationTimingFunction: "linear",
            }}
          >
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-full bg-primary-container shadow-[0_0_12px_rgba(0,245,155,0.9)] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-on-primary-container" />
              </span>
            </div>
          </div>

          {/* Secondary Audio Node */}
          <div
            className="absolute w-full h-full animate-spin"
            style={{
              animationDuration: isPlaying ? "12s" : "36s",
              animationTimingFunction: "linear",
              animationDirection: "reverse",
            }}
          >
            <div className="absolute bottom-3 right-6 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.8)]" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-outline font-body-sm text-[10px] pt-0.5">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-secondary">explore</span>
            <span>Azimuth: 142° Orbit</span>
          </div>
          <span className="text-on-surface-variant font-mono">Elevation: +14°</span>
        </div>
      </div>
    </aside>
  );
}
