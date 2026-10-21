import React, { useEffect, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { songsApi, categoriesApi } from "../api/api";
import staticSongs from "../data/songsData.json";

export default function HomeScreen({ onNavigate }) {
  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    audioMode,
    switchAudioMode,
  } = usePlayer();

  const [songs, setSongs] = useState(() => staticSongs);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isFollowingHero, setIsFollowingHero] = useState(true);
  const [followingArtists, setFollowingArtists] = useState(
    new Set(["Leonard Cohen", "Dazara Wilde"])
  );
  const [isOrbitModeActive, setIsOrbitModeActive] = useState(true);

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

  const toggleOrbitMode = () => {
    setIsOrbitModeActive((prev) => {
      const next = !prev;
      if (next && switchAudioMode) {
        switchAudioMode("8d");
      }
      return next;
    });
  };

  // Trending Albums from Stitch
  const trendingAlbums = [
    {
      id: "alb-1",
      title: "Hit Me Hard and Soft",
      artist: "Billie Eilish",
      plays: "1.5M Plays",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnaslHa2FSFcjXAvoD3JzMtw3Kap5ctJOUTDbnVHh_9V8FaVkKwQqjPwUX__aY74xYd98H_hxsOB2_tzDS7OiHR65bWafcaOWJ7yhXEUJ2T_vV65S_I9pp2GabJ6GCf4vCOkMXTXIx3zIUv7aKeFQbvSOWAA7gOyPeK_XHBYc17TMIgQwx8x_vj_0UWiJ_LTG455X-efEBTXlJTcc5g5kHZCF3kjP3HKNo5I3Zdn2jDvJkMG_ECE2lUg",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnaslHa2FSFcjXAvoD3JzMtw3Kap5ctJOUTDbnVHh_9V8FaVkKwQqjPwUX__aY74xYd98H_hxsOB2_tzDS7OiHR65bWafcaOWJ7yhXEUJ2T_vV65S_I9pp2GabJ6GCf4vCOkMXTXIx3zIUv7aKeFQbvSOWAA7gOyPeK_XHBYc17TMIgQwx8x_vj_0UWiJ_LTG455X-efEBTXlJTcc5g5kHZCF3kjP3HKNo5I3Zdn2jDvJkMG_ECE2lUg",
      audioUrl: "https://aac.saavncdn.com/932/7cf7f8a9d9c3faa2633d1605e97ba4a5_160.mp4",
      audioMode: "8d",
    },
    {
      id: "alb-2",
      title: "Happier Than Ever",
      artist: "Billie Eilish",
      plays: "982K Plays",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbYuxsAwSd5TL4K4vY9d_GBcZ0bQYUkE9tPSatl-W6uhA_kfNPm1axbRnZ0_ck0DHhw2mGm46aLEcRkF8rSbFGT9A_KibCRoLEhbrjXeTyluSNnh9pPojCJUpmBaYHfyA5xJB6mED0pRVI-YNBkV9Xwe-4mEoZ9XVOOpQIrAMUpDTBcf0IWorjoAEhePfDIxOkTayI4jHPAu4E6lzolAkefQLSwt0IcsyJKjUoTMfO01iXIt63cseC2g",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbYuxsAwSd5TL4K4vY9d_GBcZ0bQYUkE9tPSatl-W6uhA_kfNPm1axbRnZ0_ck0DHhw2mGm46aLEcRkF8rSbFGT9A_KibCRoLEhbrjXeTyluSNnh9pPojCJUpmBaYHfyA5xJB6mED0pRVI-YNBkV9Xwe-4mEoZ9XVOOpQIrAMUpDTBcf0IWorjoAEhePfDIxOkTayI4jHPAu4E6lzolAkefQLSwt0IcsyJKjUoTMfO01iXIt63cseC2g",
      audioUrl: "https://aac.saavncdn.com/001/cf795c655325785055b410f9e9cfda3a_160.mp4",
      audioMode: "8d",
    },
    {
      id: "alb-3",
      title: "Don't Smile at Me",
      artist: "Billie Eilish",
      plays: "1.2M Plays",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGbYMzdVlCGiGkSVcUSs3UBvxeHY2rzqJ1Tle2jDkJ8jGGGWBefwIPk8zzgIGC4BYRH7mrGPpZdSyf5rQdccj4mK8davDErW4nZvii6G5T3MgXKAjbeLQfA73RO1L9xbv3X-YfkRW2-IEy4sucYa-w7PlKzuF1JslDfPZb73RZQwMdryfd_vO5PL2KPPykxDe0UmjT6t97m5yxRFCk5h8YSvaR5fh_WnQ6DCZNaVWGInECdyZ578uZLw",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGbYMzdVlCGiGkSVcUSs3UBvxeHY2rzqJ1Tle2jDkJ8jGGGWBefwIPk8zzgIGC4BYRH7mrGPpZdSyf5rQdccj4mK8davDErW4nZvii6G5T3MgXKAjbeLQfA73RO1L9xbv3X-YfkRW2-IEy4sucYa-w7PlKzuF1JslDfPZb73RZQwMdryfd_vO5PL2KPPykxDe0UmjT6t97m5yxRFCk5h8YSvaR5fh_WnQ6DCZNaVWGInECdyZ578uZLw",
      audioUrl: "https://aac.saavncdn.com/267/35e80dc0e599d4db2f8d8b9d6a36f94b_160.mp4",
      audioMode: "8d",
    },
    {
      id: "alb-4",
      title: "When We All Fall Asleep",
      artist: "Billie Eilish",
      plays: "2.4M Plays",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuCA9IvSZDMg7yqr_IzlYp6If5o5VlIwFBQBx-wcfCfLjZQpkrxbyyUVWp1omyeyq42KV0yFLT02KOBZrVTTVa-7FOA_TkDZN9GAlDJ7eOsLhVcKwSAdUXf_BtADZjn4ZlUT9QR_e3SQX4yR4iaBHbXe8lhmG8TYtVlg_WNznIAKf9YA0YexWxhjBvYwDc1GW6l18zB8v_H31iceS2KKa5BffM8P4ronZ5DYXNPhRZDqZMJGil0e8u6i0w",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCA9IvSZDMg7yqr_IzlYp6If5o5VlIwFBQBx-wcfCfLjZQpkrxbyyUVWp1omyeyq42KV0yFLT02KOBZrVTTVa-7FOA_TkDZN9GAlDJ7eOsLhVcKwSAdUXf_BtADZjn4ZlUT9QR_e3SQX4yR4iaBHbXe8lhmG8TYtVlg_WNznIAKf9YA0YexWxhjBvYwDc1GW6l18zB8v_H31iceS2KKa5BffM8P4ronZ5DYXNPhRZDqZMJGil0e8u6i0w",
      audioUrl: "https://aac.saavncdn.com/932/7cf7f8a9d9c3faa2633d1605e97ba4a5_160.mp4",
      audioMode: "8d",
    },
  ];

  // Top Artists from Stitch
  const topArtists = [
    {
      name: "Leonard Cohen",
      role: "Musician",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZS9blfR1Zyk4-uxgRuElfhlzD__UeW-929XkBQN4wq_JjNCRPRuCgotLwGbXJYeDmzhUkYoVVLtuogUDee5p7rpKqjSroy2PPrMO_bd7ctUuJiHY5UmNuBECaBd-8eGzbOYjP5YxZfIXaoTTi6l1LhMEle0PvWbpgi18LmbWGFq2SFv9elj1iIGL6QR-_p7O9pRksx1pSuYmc3YWzs-oJoMRI3_HM4IA2pdn4Vd291rwN1uGbzsM8kw",
    },
    {
      name: "Dazara Wilde",
      role: "Musician",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyX9bYq17Z7RS3kkPkO7ngOv8rKaizsu7yQC_OKCeoXTYIZbRu8wEQYIqmD3TrM7EY02uAJoGjVib7urvwFnuWKr8EmqkA8YZ-9mYP3K35bt18T3drwul0yIjBTJjjRcUB5AHqmW8LXwhQWTVYB3Ptx6P2MYyzlg7Hhgxys-e9Jkk-m7C6EpWSbEOScyjLmUQO1kQ0dPougvZAyqXngGl34yoyx3qFhCXYOj_wwermGFIYN9ZFmCeNWw",
    },
    {
      name: "Finneas",
      role: "Producer / Artist",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGeXfxqQBmZyPHA5wMPguXe8fjI-2AU290NA3rDbGvyu3KyiVtHx7mMvQPnEDSxy21UjwxjeZKT--dIANs0vzub__G_e27OjsdMzg6t4y8aMts9KVlMULUflGRjZ8-MMuq1Lai5HPcXjtmDP2gDh7v_-APGmy1wVwfiLJVXdCGOH_DDLRKfU8jRR3bQYrD8AMYwWtCUQi35KQEi7FaJGVcs9Z81Py2QvlaGiAosqIRcdSI50J1LPa3mA",
    },
  ];

  const heroTrack = {
    id: "hero-track-1",
    title: "Ocean Eyes - 8D Audio Remaster",
    artist: "Billie Eilish",
    album: "Hit Me Hard and Soft",
    audioUrl: "https://aac.saavncdn.com/267/35e80dc0e599d4db2f8d8b9d6a36f94b_160.mp4",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWByWvdnUZaWSyHWRuiUAof9rGDUkaXD0hDAykUqTaQA_p_GH-PIHsoDBJlXPsmxAkgp2fE1h7uI8vbFX6SKL-_yqYcCR3vScUyvaCskQv3W2_53DwvuccO3gSuoWU08yyJD6MzSeR1JNFG71eD3VUjlfCTFKI0ImoEE00r75DhLiPNwojNa9Vy6UUfYhA_9YJ3Xtfd4VE3bcfOHoXCBuVKg6Kg1s5YXb0t_bw_sjqb22HowHDEiQHEg",
    cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWByWvdnUZaWSyHWRuiUAof9rGDUkaXD0hDAykUqTaQA_p_GH-PIHsoDBJlXPsmxAkgp2fE1h7uI8vbFX6SKL-_yqYcCR3vScUyvaCskQv3W2_53DwvuccO3gSuoWU08yyJD6MzSeR1JNFG71eD3VUjlfCTFKI0ImoEE00r75DhLiPNwojNa9Vy6UUfYhA_9YJ3Xtfd4VE3bcfOHoXCBuVKg6Kg1s5YXb0t_bw_sjqb22HowHDEiQHEg",
    audioMode: "8d",
  };

  const isHeroPlaying =
    currentSong &&
    (currentSong.title?.includes("Ocean") ||
      (currentSong.artist && currentSong.artist.includes("Billie"))) &&
    isPlaying;

  return (
    <div className="w-full min-w-0 flex flex-col font-sans text-on-surface select-none p-4 sm:p-5 lg:p-6 space-y-6 pb-28 max-w-[1400px] mx-auto box-border">
      {/* HERO FEATURED ARTIST BANNER */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-surface-container-lowest p-6 md:p-8 shadow-2xl group border border-white/5">
        {/* Ambient Neon Glow Layer */}
        <div className="absolute -top-24 -right-12 w-96 h-96 rounded-full bg-primary-container/15 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full bg-secondary-container/20 blur-[100px] pointer-events-none" />

        {/* Background Artwork with Scrim */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-85"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnB7bqYSSlSbk0M6AnMnq5m5HzpxqGtUS13eO6vXNl5AkNJ-cShfgcgAIFucOmqZB-1F1jzXf821nmTO-iZF6k_STohJIZi_ms1Ivn8AZg175S4l1G_dPfc1MFtxHQq9fEZ6_VoKwh5Vq3mPTnEpJGF41ko92XrQZ8Smb-eKwg8Pd8fl-2xumokzoM3180SlIJ9R7oyojx0Yf8BqMJ5u7ZW5RxQjdsL1-bV5pS7RXrEY8Riyd0RFTokw')`,
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/80 to-transparent" />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-surface-container-lowest via-surface-container-lowest/60 to-transparent" />

        {/* Hero Content Layer */}
        <div className="relative z-10 flex flex-col justify-end min-h-[300px] md:min-h-[340px] gap-4">
          {/* Badges & Verification */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high/90 text-primary backdrop-blur-md shadow-sm border border-white/5">
              <span
                className="material-symbols-outlined text-sm text-primary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              <span className="font-label-caps text-[10px] tracking-wider uppercase text-on-surface">
                Verified Artist
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/20 text-primary-container backdrop-blur-md shadow-[0_0_16px_rgba(0,245,155,0.25)] border border-primary-container/30">
              <span className="material-symbols-outlined text-sm animate-pulse">spatial_audio</span>
              <span className="font-label-caps text-[10px] uppercase tracking-wider font-bold">
                Spatial Audio Exclusive
              </span>
            </span>
          </div>

          {/* Artist Title & Metrics */}
          <div className="flex flex-col gap-1">
            <h1 className="font-display-hero text-3xl sm:text-4xl md:text-5xl lg:text-[54px] text-on-surface tracking-tight font-extrabold drop-shadow-md leading-tight">
              Billie Eilish
            </h1>
            <div className="flex items-center gap-2 text-on-surface-variant font-body-md text-xs sm:text-sm">
              <span className="flex items-center gap-1 text-secondary font-semibold">
                <span className="material-symbols-outlined text-base">headset</span>
                109,482,631
              </span>
              <span className="text-outline">•</span>
              <span className="text-on-surface-variant">Monthly Listeners in 8D Orbit</span>
            </div>
          </div>

          {/* CTAs & Orbit Switch Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (currentSong && isHeroPlaying) {
                    togglePlay();
                  } else {
                    playSong(heroTrack, trendingAlbums);
                  }
                }}
                className="flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-full bg-primary-container text-on-primary-container font-label-lg text-xs sm:text-sm font-bold shadow-[0_0_24px_rgba(0,245,155,0.45)] hover:bg-primary-fixed hover:scale-105 transition-all active:scale-95 cursor-pointer"
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isHeroPlaying ? "pause" : "play_arrow"}
                </span>
                <span>{isHeroPlaying ? "Pause" : "Listen now"}</span>
              </button>

              <button
                onClick={() => setIsFollowingHero(!isFollowingHero)}
                className="flex items-center gap-1.5 px-5 py-2.5 sm:py-3 rounded-full bg-surface-container-high/70 hover:bg-surface-container-highest text-on-surface font-label-lg text-xs sm:text-sm backdrop-blur-md transition-all cursor-pointer border border-white/5"
              >
                <span className="material-symbols-outlined text-base">
                  {isFollowingHero ? "check" : "add"}
                </span>
                <span>{isFollowingHero ? "Following" : "Follow"}</span>
              </button>
            </div>

            {/* Interactive 360° Orbit Mode Toggle Switch */}
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-surface-container-high/80 backdrop-blur-lg shadow-inner border border-white/5">
              <div className="flex flex-col">
                <span className="font-label-caps text-[9px] text-outline uppercase tracking-wider font-bold">
                  Spatial Audio Engine
                </span>
                <span className="font-label-md text-xs text-on-surface font-semibold flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOrbitModeActive ? "bg-primary-container animate-ping" : "bg-outline"
                    }`}
                  />
                  360° Orbit Mode
                </span>
              </div>
              <button
                aria-label="Toggle 360 Orbit Mode"
                onClick={toggleOrbitMode}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                  isOrbitModeActive ? "bg-primary-container shadow-[0_0_12px_rgba(0,245,155,0.4)]" : "bg-surface-container-highest"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    isOrbitModeActive
                      ? "translate-x-5 bg-on-primary-container"
                      : "translate-x-0 bg-outline"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TABS CAROUSEL */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-2 flex-nowrap">
          {["All", "Music", "Podcasts", "Spatial Mixes", "Live Sessions"].map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-1.5 rounded-full font-label-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary-container text-on-primary-container font-bold shadow-[0_0_14px_rgba(0,245,155,0.3)]"
                    : "bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright"
                }`}
              >
                {tab === "Spatial Mixes" && (
                  <span className="material-symbols-outlined text-sm text-secondary mr-1 inline-block align-middle">
                    surround_sound
                  </span>
                )}
                {tab}
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-outline">
          <span className="font-body-sm text-xs">Format:</span>
          <span className="font-label-caps text-[11px] text-primary uppercase font-bold">
            Binaural 96kHz
          </span>
        </div>
      </div>

      {/* TRENDING ALBUMS SECTION */}
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="font-headline-md text-lg sm:text-xl text-on-surface font-bold tracking-tight">
              Trending Albums
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-surface-container-high font-label-caps text-[9px] text-outline uppercase font-semibold border border-white/5">
              Mastered in 8D
            </span>
          </div>

          <button
            onClick={() => onNavigate("library")}
            className="group flex items-center gap-1 font-label-md text-xs text-primary-container hover:text-primary transition-colors cursor-pointer"
          >
            <span>See All</span>
            <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </button>
        </div>

        {/* 4-Card Responsive Grid matching Stitch */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 w-full">
          {trendingAlbums.map((album) => {
            const isPlayingThis =
              currentSong &&
              (currentSong.title === album.title || currentSong._id === album.id) &&
              isPlaying;

            return (
              <div
                key={album.id}
                onClick={() => playSong(album, trendingAlbums)}
                className="group relative flex flex-col gap-2.5 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all duration-300 shadow-lg hover:shadow-[0_12px_28px_rgba(0,0,0,0.6)] cursor-pointer border border-white/5"
              >
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-surface-container-highest">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={album.cover}
                    alt={album.title}
                  />

                  {/* 8D Spatial Pill Tag */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center gap-1 border border-white/5">
                    <span className="material-symbols-outlined text-[10px] text-primary-container">
                      surround_sound
                    </span>
                    <span className="font-label-caps text-[9px] text-on-surface font-bold">
                      8D Spatial
                    </span>
                  </div>

                  {/* Hover / Active Play Button FAB */}
                  <button
                    aria-label={`Play ${album.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      playSong(album, trendingAlbums);
                    }}
                    className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-[0_0_16px_rgba(0,245,155,0.5)] transition-all duration-300 hover:scale-110 ${
                      isPlayingThis
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-2xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {isPlayingThis ? "pause" : "play_arrow"}
                    </span>
                  </button>
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="font-label-lg text-xs sm:text-sm text-on-surface font-semibold truncate group-hover:text-primary-container transition-colors">
                    {album.title}
                  </span>
                  <span className="font-body-sm text-[11px] text-outline truncate mt-0.5">
                    {album.artist}
                  </span>
                  <div className="flex items-center gap-1 mt-1 font-body-sm text-[10px] text-on-surface-variant">
                    <span className="material-symbols-outlined text-xs text-secondary">
                      play_circle
                    </span>
                    <span>{album.plays}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOP ARTISTS SECTION */}
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-lg sm:text-xl text-on-surface font-bold tracking-tight">
            Top Artists
          </h2>
          <button
            onClick={() => onNavigate("library")}
            className="group flex items-center gap-1 font-label-md text-xs text-primary-container hover:text-primary transition-colors cursor-pointer"
          >
            <span>See All</span>
            <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full">
          {topArtists.map((artist) => {
            const isFollowing = followingArtists.has(artist.name);

            return (
              <div
                key={artist.name}
                onClick={() => onNavigate("library", artist.name)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors group shadow-sm border border-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-surface-container-high ring-2 ring-transparent group-hover:ring-primary-container transition-all">
                    <img
                      className="w-full h-full object-cover"
                      src={artist.avatar}
                      alt={artist.name}
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-lg text-xs sm:text-sm text-on-surface font-semibold truncate group-hover:text-primary-container transition-colors">
                      {artist.name}
                    </span>
                    <span className="font-body-sm text-[11px] text-outline">
                      {artist.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleArtistFollow(artist.name);
                  }}
                  className={`px-3.5 py-1.5 rounded-full font-label-md text-xs transition-colors shrink-0 cursor-pointer ${
                    isFollowing
                      ? "bg-surface-container-high hover:bg-surface-container-highest text-on-surface"
                      : "bg-primary-container/15 hover:bg-primary-container text-primary-container hover:text-on-primary-container font-semibold"
                  }`}
                >
                  {isFollowing ? "Following" : "+ Follow"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
