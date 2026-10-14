import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { songsApi, recommendationsApi } from "../api/api";
import { playbackCycleManager } from "../services/PlaybackCycleManager";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  // Audio Universe Mode: 'normal' | '8d'
  const [audioMode, setAudioModeState] = useState(() => {
    const saved = localStorage.getItem("flow8d_audio_mode");
    if (saved === "9d") {
      localStorage.setItem("flow8d_audio_mode", "8d");
      return "8d";
    }
    return saved || null;
  });
  const [isModeSelectorOpen, setIsModeSelectorOpen] = useState(() => {
    return !localStorage.getItem("flow8d_audio_mode");
  });

  // Mode Transition state & lock
  const [isTransitioningMode, setIsTransitioningMode] = useState(false);
  const [transitionTargetMode, setTransitionTargetMode] = useState(null);
  const [isSwitchingLocked, setIsSwitchingLocked] = useState(false);

  // Smart No-Repeat Playback Cycle status
  const [cycleStatus, setCycleStatus] = useState(() => playbackCycleManager.getCycleStatus());

  useEffect(() => {
    playbackCycleManager.init(audioMode || "8d");
    const unsubscribe = playbackCycleManager.subscribe((status) => {
      setCycleStatus({ ...status });
    });
    return unsubscribe;
  }, [audioMode]);

  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [showTasteModal, setShowTasteModal] = useState(false);
  const [showMiloChat, setShowMiloChat] = useState(false);
  const [miloInitialQuery, setMiloInitialQuery] = useState("");
  const [is8DActive, setIs8DActive] = useState(() => {
    const saved = localStorage.getItem("flow8d_audio_mode");
    return saved !== "normal";
  });
  const [orbitSpeed, setOrbitSpeed] = useState(1.0);
  const [spatialDepth, setSpatialDepth] = useState(85);
  const [reverbRoom, setReverbRoom] = useState(50);
  const [favorites, setFavorites] = useState(new Set());

  // ML Recommendation State
  const [recommendations, setRecommendations] = useState([]);
  const [tasteProfile, setTasteProfile] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Interaction tracking refs
  const playStartTimeRef = useRef(0);
  const lastLoggedSongIdRef = useRef(null);
  const hasLoggedCompletionRef = useRef(false);

  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const pannerRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const animFrameRef = useRef(null);
  const orbitAngleRef = useRef(0);
  const prefetchedNextSongRef = useRef(null);
  const bgOrbitIntervalRef = useRef(null);

  // Offline & Network state
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [offlineNotice, setOfflineNotice] = useState(null);
  const synthNodesRef = useRef(null);

  // Monitor online / offline network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOfflineNotice(null);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setOfflineNotice("No internet connection detected. Online streaming is paused.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Stop offline synthesizer
  const stopOfflineSynth = () => {
    if (synthNodesRef.current?.oscillators) {
      synthNodesRef.current.oscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {}
      });
    }
    synthNodesRef.current = null;
  };

  // Start 100% offline 8D meditative ambient synthesizer (0 network bytes!)
  const startOfflineSynth = (title = "Offline 8D Ambient Meditative Waves (432Hz)") => {
    stopOfflineSynth();
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      if (!pannerRef.current && ctx.createStereoPanner) {
        pannerRef.current = ctx.createStereoPanner();
        pannerRef.current.connect(ctx.destination);
      }

      const dest = pannerRef.current || ctx.destination;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.18, ctx.currentTime);
      masterGain.connect(dest);

      // 432Hz harmonic series (Root 432Hz, sub-octave 216Hz, fifth 324Hz, harmonic 540Hz)
      const freqs = [432, 216, 324, 540];
      const oscillators = freqs.map((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        gain.gain.setValueAtTime(0.25 / freqs.length, ctx.currentTime);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        return osc;
      });

      synthNodesRef.current = { oscillators, masterGain };
      setIsPlaying(true);
      setCurrentSong({
        _id: "offline-ambient-8d",
        title: title || "Offline 8D Ambient Meditative Waves (432Hz)",
        artist: "Flow 8D Local Synthesizer",
        category: "Focus & Ambient",
        duration: 9999,
        isOfflineSynth: true,
        imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%237b2cbf'/><stop offset='100%' stop-color='%2300f0ff'/></linearGradient></defs><rect width='100' height='100' rx='16' fill='url(%23g)'/><circle cx='50' cy='50' r='20' fill='%2307050b' opacity='0.7'/><circle cx='50' cy='50' r='8' fill='%2300f0ff'/></svg>"
      });
      setOfflineNotice("Offline 8D Ambient Focus sound active. 100% on-device spatial synthesis without internet!");
    } catch (e) {
      console.warn("Could not start offline synth:", e);
    }
  };

  // Initialize or setup Web Audio API for 8D Spatial Panning
  const initAudioNodes = () => {
    if (!audioRef.current) return;
    if (audioContextRef.current) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;

      if (ctx.createStereoPanner) {
        const panner = ctx.createStereoPanner();
        pannerRef.current = panner;
        source.connect(panner);
        panner.connect(ctx.destination);
      } else {
        source.connect(ctx.destination);
      }
    } catch (e) {
      console.warn("Web Audio API spatial nodes initialized in standard fallback mode:", e);
    }
  };

  // Centralized setAudioMode method
  const setAudioMode = useCallback((newMode) => {
    if (!["normal", "8d"].includes(newMode)) return;
    setAudioModeState(newMode);
    localStorage.setItem("flow8d_audio_mode", newMode);
    setIsModeSelectorOpen(false);

    // Apply mode-specific acoustic dynamics
    if (newMode === "normal") {
      setIs8DActive(false);
      if (pannerRef.current) {
        try {
          pannerRef.current.pan.value = 0;
        } catch (e) {}
      }
    } else if (newMode === "8d") {
      setIs8DActive(true);
      setOrbitSpeed(1.0);
      setSpatialDepth(85);
    }

    // Gracefully handle active playback:
    // If the active track does not belong to the newly selected mode, pause and clear it so we don't mislabel it!
    if (currentSong && currentSong.audioMode && currentSong.audioMode !== newMode) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setCurrentSong(null);
      setPlaylist([]);
      setCurrentIndex(-1);
    }

    // Inform smart no-repeat cycle manager of universe mode transition
    playbackCycleManager.setAudioMode(newMode);

    // Immediately reload recommendations matching the new mode
    refreshRecommendations(null, newMode);
  }, [currentSong]);

  // Animated mode switch initiation: locks clicks, sets target mode, triggers loading overlay
  const switchAudioMode = useCallback((targetMode) => {
    if (isSwitchingLocked) return;
    if (!["normal", "8d"].includes(targetMode)) return;

    // If user clicks the mode that is already active, do not unnecessarily restart loading animation
    if (targetMode === audioMode) {
      setIsModeSelectorOpen(false);
      return;
    }

    setIsSwitchingLocked(true);
    setTransitionTargetMode(targetMode);
    setIsTransitioningMode(true);
    setIsModeSelectorOpen(false);
  }, [audioMode, isSwitchingLocked]);

  // Invoked when ModeTransitionOverlay completes its 1.8s - 2.1s animation
  const handleTransitionComplete = useCallback(() => {
    if (transitionTargetMode) {
      setAudioMode(transitionTargetMode);
    }
    setIsTransitioningMode(false);
    setTransitionTargetMode(null);
    setIsSwitchingLocked(false);
  }, [transitionTargetMode, setAudioMode]);

  // Open and close Audio Universe selector
  const openModeSelector = () => setIsModeSelectorOpen(true);
  const closeModeSelector = () => {
    // Only allow closing if a mode has already been selected previously
    if (localStorage.getItem("flow8d_audio_mode")) {
      setIsModeSelectorOpen(false);
    }
  };

  // Continuous Spatial Panning loop with lock-screen awareness (Dual RAF + Interval ticker)
  useEffect(() => {
    let lastTime = performance.now();

    const updatePanning = (delta) => {
      if (isPlaying && is8DActive && pannerRef.current && audioMode !== "normal") {
        const rate = orbitSpeed * 1.2;
        orbitAngleRef.current += rate * delta;
        const depth = spatialDepth / 100;

        // 8D Circular Binaural Orbit
        const panValue = Math.sin(orbitAngleRef.current) * depth;
        pannerRef.current.pan.value = Math.max(-1, Math.min(1, panValue));
      } else if (pannerRef.current && (!is8DActive || audioMode === "normal")) {
        // Pure stereo center without spatial panning
        pannerRef.current.pan.value = 0;
      }
    };

    const loop = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      updatePanning(delta);
      if (typeof document !== "undefined" && !document.hidden) {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    const handleVisibility = () => {
      if (typeof document !== "undefined" && document.hidden) {
        // Screen locked or tab hidden: cancel RAF and run smooth fallback interval
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (!bgOrbitIntervalRef.current) {
          bgOrbitIntervalRef.current = setInterval(() => {
            updatePanning(0.05);
          }, 50);
        }
        // Ensure AudioContext doesn't suspend in background
        if (audioContextRef.current && audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume().catch(() => {});
        }
      } else {
        // Screen unlocked / tab visible: return to RAF
        if (bgOrbitIntervalRef.current) {
          clearInterval(bgOrbitIntervalRef.current);
          bgOrbitIntervalRef.current = null;
        }
        lastTime = performance.now();
        animFrameRef.current = requestAnimationFrame(loop);
        if (audioContextRef.current && audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume().catch(() => {});
        }
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibility);
      window.addEventListener("focus", handleVisibility);
      window.addEventListener("pageshow", handleVisibility);

      if (document.hidden) {
        bgOrbitIntervalRef.current = setInterval(() => updatePanning(0.05), 50);
      } else {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (bgOrbitIntervalRef.current) clearInterval(bgOrbitIntervalRef.current);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibility);
        window.removeEventListener("focus", handleVisibility);
        window.removeEventListener("pageshow", handleVisibility);
      }
    };
  }, [isPlaying, is8DActive, orbitSpeed, spatialDepth, audioMode]);

  // Fetch ML recommendations and Taste Profile from backend strictly matching audioMode and excluding current cycle songs
  const refreshRecommendations = useCallback(async (excludeId = null, overrideMode = null) => {
    const targetMode = overrideMode || audioMode || "8d";
    try {
      setLoadingRecs(true);
      const excludedSet = playbackCycleManager.getExcludedIds();
      if (excludeId) excludedSet.add(excludeId.toString());
      if (currentSong?._id) excludedSet.add(currentSong._id.toString());

      const [recsRes, profileRes] = await Promise.all([
        recommendationsApi.getRecommendations({
          limit: 5,
          excludeSongIds: Array.from(excludedSet),
          mode: targetMode,
          playlistSongIds: playbackCycleManager.context.songIds,
        }).catch(() => ({ data: { data: [] } })),
        recommendationsApi.getProfile().catch(() => ({ data: { data: null } })),
      ]);

      setRecommendations(recsRes.data?.data || []);
      if (profileRes.data?.data) {
        setTasteProfile(profileRes.data.data);
      }
    } catch (e) {
      console.warn("Failed to refresh recommendations:", e);
    } finally {
      setLoadingRecs(false);
    }
  }, [currentSong, audioMode]);

  // Initial load of recommendations & profile
  useEffect(() => {
    refreshRecommendations();
  }, [refreshRecommendations]);

  // Pre-fetch the next track well in advance so lock-screen transitions are instant & zero-latency
  const prefetchNextTrack = useCallback(async (baseList = null, curId = null) => {
    try {
      const activeList = baseList || playlist;
      let eligible = activeList.filter((s) => !s.audioMode || !audioMode || s.audioMode === audioMode);
      if (eligible.length === 0) {
        const res = await songsApi.getAll({ mode: audioMode || "8d" });
        if (res.data?.data && res.data.data.length > 0) {
          eligible = res.data.data;
        }
      }
      if (eligible.length === 0) return;

      const next = await playbackCycleManager.getNextSong(
        eligible,
        curId || currentSong?._id || currentSong?.id,
        async (params) => {
          const res = await recommendationsApi.getRecommendations(params);
          return res.data?.data || [];
        }
      );
      if (next) {
        prefetchedNextSongRef.current = next;
      }
    } catch (e) {
      console.warn("Background prefetch next track error:", e);
    }
  }, [playlist, audioMode, currentSong]);

  // Play a song & register interaction with ML Recommendation engine and PlaybackCycleManager
  const playSong = async (
    song,
    songList = null,
    isFromRecommendation = false,
    contextOptions = null
  ) => {
    if (!song) return;

    // Check if user was previously playing a track and skipped early
    if (currentSong && lastLoggedSongIdRef.current && currentTime > 2 && !hasLoggedCompletionRef.current) {
      playbackCycleManager.recordTrackSkipped(currentSong, playlist);
      if (currentTime < 20) {
        try {
          recommendationsApi.recordInteraction({
            songId: currentSong._id || currentSong.id,
            eventType: "skip",
            durationSec: Math.round(currentTime),
          });
        } catch (err) {
          console.warn("Error logging skip interaction:", err);
        }
      }
    }

    initAudioNodes();
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    let activeList = playlist;
    if (songList && songList.length > 0) {
      const modeFiltered = songList.filter((s) => !s.audioMode || !audioMode || s.audioMode === audioMode);
      const listToUse = modeFiltered.length > 0 ? modeFiltered : songList;
      setPlaylist(listToUse);
      activeList = listToUse;
      const idx = listToUse.findIndex((s) => (s._id || s.id) === (song._id || song.id));
      setCurrentIndex(idx !== -1 ? idx : 0);

      // Handle context scoping (e.g. Scoped Playlist vs Full Library)
      if (contextOptions?.contextType === "playlist") {
        playbackCycleManager.setContext(
          "playlist",
          contextOptions.playlistId || "custom_playlist",
          contextOptions.playlistName || "Playlist",
          listToUse
        );
      } else if (contextOptions?.contextType === "library") {
        if (playbackCycleManager.context.type !== "library") {
          playbackCycleManager.setContext("library", `library_${audioMode || "8d"}`, `${(audioMode || "8d").toUpperCase()} Library`);
        }
      }
    }

    // Register selection: manual user selection takes priority and is never blocked
    if (!isFromRecommendation) {
      playbackCycleManager.recordManualSelection(song, contextOptions);
    } else {
      playbackCycleManager.recordTrackStarted(song);
    }

    setCurrentSong(song);
    setIsPlaying(true);
    playStartTimeRef.current = Date.now();
    lastLoggedSongIdRef.current = song._id || song.id;
    hasLoggedCompletionRef.current = false;

    if (currentSong?.isOfflineSynth) {
      stopOfflineSynth();
    }

    if (audioRef.current) {
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume().catch(() => {});
      }
      audioRef.current.src = song.audioUrl || "";
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            if (audioContextRef.current && audioContextRef.current.state === "suspended") {
              audioContextRef.current.resume().catch(() => {});
            }
          })
          .catch((err) => {
            setIsPlaying(false);
            console.warn("Playback could not start:", err.message);
            if (!navigator.onLine || err.name === "NotSupportedError") {
              setOfflineNotice(
                "Offline: Internet is disconnected. Reconnect to stream online songs, or use Offline 8D Ambient mode."
              );
            }
          });
      }
    }

    // Log Selection / Play interaction to ML model
    try {
      const eventType = isFromRecommendation ? "recommendation_click" : "play";
      await recommendationsApi.recordInteraction({
        songId: song._id || song.id,
        eventType,
        durationSec: 0,
      });
      // Refresh recommendations excluding all cycle played tracks
      refreshRecommendations(song._id || song.id);
    } catch (err) {
      console.warn("Error logging play event:", err);
    }

    // Schedule background prefetch of next track for seamless lock-screen transition
    setTimeout(() => {
      prefetchNextTrack(activeList, song._id || song.id);
    }, 1500);
  };

  const togglePlay = () => {
    if (!currentSong) return;
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    if (currentSong.isOfflineSynth) {
      if (isPlaying) {
        stopOfflineSynth();
        setIsPlaying(false);
      } else {
        startOfflineSynth(currentSong.title);
      }
      return;
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current?.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            setIsPlaying(false);
            console.warn("Playback prevented or offline:", err.message);
            if (!navigator.onLine || err.name === "NotSupportedError") {
              setOfflineNotice(
                "Cannot stream track while offline. Connect to the internet or switch to Offline 8D Ambient sound."
              );
            }
          });
      }
    }
  };

  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Smart No-Repeat Next Track Selection: ML ranked with cycle guarantee
  const playNext = async () => {
    let eligibleSongs = playlist.filter((s) => !s.audioMode || !audioMode || s.audioMode === audioMode);

    // If in library context or playlist is exhausted, ensure we have full library pool
    if (eligibleSongs.length === 0 || playbackCycleManager.context.type === "library") {
      try {
        const res = await songsApi.getAll({ mode: audioMode || "8d" });
        if (res.data?.data && res.data.data.length > 0) {
          eligibleSongs = res.data.data;
          setPlaylist(eligibleSongs);
        }
      } catch (e) {
        console.warn("Could not fetch eligible songs for next selection:", e);
      }
    }

    if (eligibleSongs.length === 0) return;

    // Use pre-fetched candidate if ready to eliminate latency
    let nextSong = prefetchedNextSongRef.current;
    prefetchedNextSongRef.current = null;

    if (!nextSong) {
      nextSong = await playbackCycleManager.getNextSong(
        eligibleSongs,
        currentSong?._id || currentSong?.id,
        async (params) => {
          const res = await recommendationsApi.getRecommendations(params);
          return res.data?.data || [];
        }
      );
    }

    if (!nextSong) {
      nextSong = playbackCycleManager.peekNextCandidateSync(
        eligibleSongs,
        currentSong?._id || currentSong?.id
      );
    }

    if (nextSong) {
      await playSong(nextSong, eligibleSongs, true);
    }
  };

  // Immediate Zero-Latency Track Transition for lock-screen continuity
  const handleTrackEnded = async () => {
    if (currentSong) {
      playbackCycleManager.recordTrackCompleted(currentSong, playlist);
    }

    let eligibleSongs = playlist.filter((s) => !s.audioMode || !audioMode || s.audioMode === audioMode);
    if (eligibleSongs.length === 0) {
      try {
        const res = await songsApi.getAll({ mode: audioMode || "8d" });
        if (res.data?.data && res.data.data.length > 0) {
          eligibleSongs = res.data.data;
          setPlaylist(eligibleSongs);
        }
      } catch (e) {}
    }

    // Seamless instantaneous transition using pre-fetched or immediate candidate
    let nextSong = prefetchedNextSongRef.current;
    prefetchedNextSongRef.current = null;

    if (!nextSong && eligibleSongs.length > 0) {
      nextSong = playbackCycleManager.peekNextCandidateSync(
        eligibleSongs,
        currentSong?._id || currentSong?.id
      );
    }

    if (nextSong) {
      // Synchronous start maintains mobile browser lock-screen playback authorization
      playSong(nextSong, eligibleSongs, true);
    } else {
      await playNext();
    }
  };

  const playPrev = () => {
    const modePlaylist = playlist.filter((s) => !s.audioMode || !audioMode || s.audioMode === audioMode);
    if (modePlaylist.length === 0) return;
    const prevIdx = (currentIndex - 1 + modePlaylist.length) % modePlaylist.length;
    setCurrentIndex(prevIdx);
    playSong(modePlaylist[prevIdx]);
  };

  const toggleFavorite = async (songId) => {
    const isNowFav = !favorites.has(songId);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(songId)) next.delete(songId);
      else next.add(songId);
      return next;
    });

    if (isNowFav) {
      try {
        await recommendationsApi.recordInteraction({
          songId,
          eventType: "favorite",
        });
        refreshRecommendations();
      } catch (e) {
        console.warn("Error recording favorite interaction:", e);
      }
    }
  };

  // Reset taste profile
  const resetTasteProfile = async () => {
    try {
      await recommendationsApi.resetProfile();
      await refreshRecommendations();
    } catch (e) {
      console.warn("Failed to reset profile:", e);
    }
  };

  // Listen for song completion / high duration threshold
  const handleTimeUpdate = () => {
    const curr = audioRef.current?.currentTime || 0;
    const dur = audioRef.current?.duration || 0;
    setCurrentTime(curr);

    // Sync lock-screen scrubber position
    if (typeof navigator !== "undefined" && "mediaSession" in navigator && "setPositionState" in navigator.mediaSession) {
      try {
        if (dur > 0 && curr >= 0 && curr <= dur) {
          navigator.mediaSession.setPositionState({
            duration: dur,
            playbackRate: audioRef.current?.playbackRate || 1.0,
            position: curr,
          });
        }
      } catch (e) {}
    }

    if (dur > 0 && curr / dur >= 0.75 && !hasLoggedCompletionRef.current && currentSong) {
      hasLoggedCompletionRef.current = true;
      playbackCycleManager.recordTrackCompleted(currentSong, playlist);
      recommendationsApi.recordInteraction({
        songId: currentSong._id || currentSong.id,
        eventType: "completed",
        durationSec: Math.round(curr),
      }).then(() => refreshRecommendations());
    }
  };

  // Media Session API: Full Lock-screen & Notification Center Integration
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

    if (currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist || "Flow 8D Artist",
        album: `Flow 8D • ${audioMode === "normal" ? "Normal Music" : "8D Audio"}`,
        artwork: [
          {
            src: currentSong.imageUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=512",
            sizes: "512x512",
            type: "image/jpeg",
          },
          {
            src: currentSong.imageUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=192",
            sizes: "192x192",
            type: "image/jpeg",
          },
        ],
      });
    }

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

    const handlers = [
      ["play", () => {
        if (audioRef.current && audioRef.current.paused) {
          if (audioContextRef.current && audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume().catch(() => {});
          }
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }],
      ["pause", () => {
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }],
      ["previoustrack", () => playPrev()],
      ["nexttrack", () => playNext()],
      ["seekto", (details) => {
        if (details.seekTime !== undefined) seek(details.seekTime);
      }],
      ["seekforward", (details) => {
        const step = details.seekOffset || 10;
        seek(Math.min((audioRef.current?.duration || 0), (audioRef.current?.currentTime || 0) + step));
      }],
      ["seekbackward", (details) => {
        const step = details.seekOffset || 10;
        seek(Math.max(0, (audioRef.current?.currentTime || 0) - step));
      }],
      ["stop", () => {
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
      }],
    ];

    handlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (err) {}
    });
  }, [currentSong, isPlaying, audioMode]);

  // Screen Wake Lock API: keeps device display/audio pipeline awake during playback
  useEffect(() => {
    let wakeLock = null;

    const requestLock = async () => {
      try {
        if (typeof navigator !== "undefined" && "wakeLock" in navigator && isPlaying && document.visibilityState === "visible") {
          wakeLock = await navigator.wakeLock.request("screen");
        }
      } catch (e) {}
    };

    if (isPlaying) {
      requestLock();
    } else if (wakeLock) {
      wakeLock.release().catch(() => {});
      wakeLock = null;
    }

    const handleVis = () => {
      if (document.visibilityState === "visible" && isPlaying) {
        requestLock();
      }
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVis);
    }

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVis);
      }
      if (wakeLock) wakeLock.release().catch(() => {});
    };
  }, [isPlaying]);

  return (
    <PlayerContext.Provider
      value={{
        audioMode: audioMode || "8d",
        setAudioMode,
        switchAudioMode,
        isModeSelectorOpen,
        openModeSelector,
        closeModeSelector,
        setIsModeSelectorOpen,
        isTransitioningMode,
        transitionTargetMode,
        isSwitchingLocked,
        handleTransitionComplete,
        playbackCycleManager,
        cycleStatus,
        resetPlaybackCycle: () => playbackCycleManager.resetCycle(playlist),
        switchPlaybackContext: (type, id, name, songs) => playbackCycleManager.setContext(type, id, name, songs),
        currentSong,
        isPlaying,
        currentTime,
        duration,
        playlist,
        showFullPlayer,
        showTasteModal,
        is8DActive,
        orbitSpeed,
        spatialDepth,
        reverbRoom,
        favorites,
        recommendations,
        tasteProfile,
        loadingRecs,
        setShowFullPlayer,
        setShowTasteModal,
        showMiloChat,
        setShowMiloChat,
        miloInitialQuery,
        setMiloInitialQuery,
        setIs8DActive,
        setOrbitSpeed,
        setSpatialDepth,
        setReverbRoom,
        playSong,
        togglePlay,
        seek,
        playNext,
        playPrev,
        toggleFavorite,
        refreshRecommendations,
        resetTasteProfile,
        isOnline,
        offlineNotice,
        setOfflineNotice,
        startOfflineSynth,
        stopOfflineSynth,
      }}
    >
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="auto"
        playsInline={true}
        webkit-playsinline="true"
        x-webkit-airplay="allow"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={handleTrackEnded}
        onError={() => {
          if (currentSong) {
            playbackCycleManager.recordTrackFailed(currentSong);
          }
          setIsPlaying(false);
          const isNetOffline = !navigator.onLine || (audioRef.current?.error && audioRef.current.error.code === 2);
          if (isNetOffline) {
            setOfflineNotice("Network disconnected: Unable to stream online track. Reconnect to internet or tap 'Offline 8D Ambient'.");
            return;
          }
          if (audioRef.current && audioRef.current.hasAttribute("crossorigin")) {
            audioRef.current.removeAttribute("crossorigin");
            audioRef.current.load();
          }
        }}
      />
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
