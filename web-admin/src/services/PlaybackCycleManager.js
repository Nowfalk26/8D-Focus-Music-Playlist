/**
 * PlaybackCycleManager.js
 * Centralized Smart No-Repeat Playback and Recommendation Cycle Engine for Flow 8D.
 *
 * Enforces:
 * 1. Cycle isolation per audio mode ('normal' | '8d') and playback context (library vs playlist).
 * 2. Strict no-repeat playback: a song cannot be automatically recommended or replayed
 *    until every eligible track in the current cycle has played.
 * 3. Priority for manual user selections: always played immediately, never blocked, marked as consumed.
 *    If manually replaying a previously played song, allows it and keeps it excluded from auto-recs.
 * 4. Cycle completion & reset: resets only when all eligible tracks in context have played.
 *    Avoids immediately repeating the last completed track upon cycle reset if >1 track exists.
 * 5. Concurrency safety: atomic reservation and async generation lock for rapid clicks.
 * 6. Persistence: saves cycle state in localStorage to survive page reloads and screen navigation.
 */

const STORAGE_KEY_CYCLES = "flow8d_playback_cycles";
const STORAGE_KEY_ACTIVE_CTX = "flow8d_active_context";

export class PlaybackCycleManager {
  constructor() {
    this.audioMode = "8d";
    this.context = {
      type: "library",
      id: "library_8d",
      name: "Full Library",
      songIds: null,
    };
    this.cycleData = {
      cycleId: 1,
      playedSongIds: [],
      reservedSongIds: [],
      skippedSongIds: [],
      manuallyReplayedIds: [],
      lastCompletedSongId: null,
      queue: [],
      history: [],
    };
    this.isProcessingNext = false;
    this.listeners = new Set();
  }

  // Subscribe to cycle state changes
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach((fn) => {
      try {
        fn(this.getCycleStatus());
      } catch (e) {
        console.warn("Cycle listener error:", e);
      }
    });
  }

  // Initialize from storage or default
  init(currentAudioMode = "8d") {
    this.audioMode = currentAudioMode || "8d";

    try {
      const savedCtx = localStorage.getItem(STORAGE_KEY_ACTIVE_CTX);
      if (savedCtx) {
        const parsed = JSON.parse(savedCtx);
        if (parsed.type === "playlist") {
          this.context = parsed;
        } else {
          this.context = {
            type: "library",
            id: `library_${this.audioMode}`,
            name: `${this.audioMode.toUpperCase()} Library`,
            songIds: null,
          };
        }
      } else {
        this.context = {
          type: "library",
          id: `library_${this.audioMode}`,
          name: `${this.audioMode.toUpperCase()} Library`,
          songIds: null,
        };
      }

      this.loadCycleForContext(this.context.id);
    } catch (e) {
      console.warn("Error restoring playback cycle state:", e);
      this.resetCycleState(1);
    }
  }

  // Set active Audio Universe Mode ('normal', '8d')
  setAudioMode(newMode) {
    if (!["normal", "8d"].includes(newMode)) return;
    const modeChanged = this.audioMode !== newMode;
    this.audioMode = newMode;

    if (modeChanged) {
      // If currently in library mode, switch context to the new mode's library
      if (this.context.type === "library") {
        this.setContext("library", `library_${newMode}`, `${newMode.toUpperCase()} Library`);
      } else {
        // If in a playlist, preserve the playlist context but persist new mode
        this.saveCycle();
      }
    }
  }

  // Set active playback context (library or specific playlist)
  setContext(type, id, name = "Context", songIds = null) {
    const newContextId = id || (type === "library" ? `library_${this.audioMode}` : "playlist_default");

    // Save current context cycle before switching
    this.saveCycle();

    this.context = {
      type,
      id: newContextId,
      name,
      songIds: Array.isArray(songIds) ? songIds.map((s) => (s._id || s.id || s).toString()) : null,
    };

    localStorage.setItem(STORAGE_KEY_ACTIVE_CTX, JSON.stringify(this.context));
    this.loadCycleForContext(newContextId);
    this.notifyListeners();
  }

  // Load cycle data for context from localStorage dictionary
  loadCycleForContext(contextId) {
    try {
      const allCyclesRaw = localStorage.getItem(STORAGE_KEY_CYCLES);
      const allCycles = allCyclesRaw ? JSON.parse(allCyclesRaw) : {};
      const stored = allCycles[contextId];

      if (stored) {
        this.cycleData = {
          cycleId: stored.cycleId || 1,
          playedSongIds: Array.isArray(stored.playedSongIds) ? stored.playedSongIds : [],
          reservedSongIds: Array.isArray(stored.reservedSongIds) ? stored.reservedSongIds : [],
          skippedSongIds: Array.isArray(stored.skippedSongIds) ? stored.skippedSongIds : [],
          manuallyReplayedIds: Array.isArray(stored.manuallyReplayedIds) ? stored.manuallyReplayedIds : [],
          lastCompletedSongId: stored.lastCompletedSongId || null,
          queue: Array.isArray(stored.queue) ? stored.queue : [],
          history: Array.isArray(stored.history) ? stored.history : [],
        };
      } else {
        this.resetCycleState(1);
      }
    } catch (e) {
      console.warn("Failed to load cycle for context:", e);
      this.resetCycleState(1);
    }
  }

  // Save current context cycle data to localStorage dictionary
  saveCycle() {
    try {
      const allCyclesRaw = localStorage.getItem(STORAGE_KEY_CYCLES);
      const allCycles = allCyclesRaw ? JSON.parse(allCyclesRaw) : {};
      allCycles[this.context.id] = {
        cycleId: this.cycleData.cycleId,
        playedSongIds: this.cycleData.playedSongIds,
        reservedSongIds: this.cycleData.reservedSongIds,
        skippedSongIds: this.cycleData.skippedSongIds,
        manuallyReplayedIds: this.cycleData.manuallyReplayedIds,
        lastCompletedSongId: this.cycleData.lastCompletedSongId,
        queue: this.cycleData.queue,
        history: this.cycleData.history.slice(-30),
      };
      localStorage.setItem(STORAGE_KEY_CYCLES, JSON.stringify(allCycles));
    } catch (e) {
      console.warn("Failed to save cycle state:", e);
    }
  }

  // Internal helper to reset cycle state
  resetCycleState(cycleId = 1) {
    this.cycleData = {
      cycleId,
      playedSongIds: [],
      reservedSongIds: [],
      skippedSongIds: [],
      manuallyReplayedIds: [],
      lastCompletedSongId: this.cycleData?.lastCompletedSongId || null,
      queue: [],
      history: this.cycleData?.history ? this.cycleData.history.slice(-30) : [],
    };
    this.saveCycle();
  }

  // Get set of all excluded song IDs for the active cycle
  getExcludedIds() {
    const set = new Set();
    this.cycleData.playedSongIds.forEach((id) => set.add(id.toString()));
    this.cycleData.reservedSongIds.forEach((id) => set.add(id.toString()));
    this.cycleData.skippedSongIds.forEach((id) => set.add(id.toString()));
    this.cycleData.manuallyReplayedIds.forEach((id) => set.add(id.toString()));
    return set;
  }

  // Check if a song is already consumed/excluded in the current cycle
  isSongExcluded(songId) {
    if (!songId) return false;
    const str = songId.toString();
    return (
      this.cycleData.playedSongIds.includes(str) ||
      this.cycleData.reservedSongIds.includes(str) ||
      this.cycleData.skippedSongIds.includes(str) ||
      this.cycleData.manuallyReplayedIds.includes(str)
    );
  }

  /**
   * Scenario B: User Manually Selects a Song
   * - Play the selected song immediately.
   * - Give it priority over automatic recommendations.
   * - If already played in this cycle, allow it (explicit user action),
   *   mark as manually replayed, and continue excluding from future auto-recommendations.
   * - Do not restart the entire queue or cycle.
   */
  recordManualSelection(song, contextOptions = null) {
    if (!song) return { isManualReplay: false };
    const songId = (song._id || song.id).toString();

    // Check if user is starting a playlist context
    if (contextOptions?.contextType === "playlist" && contextOptions?.playlistId) {
      if (this.context.id !== `playlist_${contextOptions.playlistId}`) {
        this.setContext(
          "playlist",
          `playlist_${contextOptions.playlistId}`,
          contextOptions.playlistName || "Playlist",
          contextOptions.songIds || null
        );
      }
    } else if (contextOptions?.contextType === "library") {
      if (this.context.type !== "library") {
        this.setContext("library", `library_${this.audioMode}`, `${this.audioMode.toUpperCase()} Library`);
      }
    }

    const alreadyPlayed = this.cycleData.playedSongIds.includes(songId);

    if (alreadyPlayed) {
      if (!this.cycleData.manuallyReplayedIds.includes(songId)) {
        this.cycleData.manuallyReplayedIds.push(songId);
      }
    } else {
      if (!this.cycleData.reservedSongIds.includes(songId)) {
        this.cycleData.reservedSongIds.push(songId);
      }
    }

    this.cycleData.history.push(songId);
    this.saveCycle();
    this.notifyListeners();

    return { isManualReplay: alreadyPlayed };
  }

  // Mark track as actively playing / reserved
  recordTrackStarted(song) {
    if (!song) return;
    const songId = (song._id || song.id).toString();
    if (!this.cycleData.reservedSongIds.includes(songId)) {
      this.cycleData.reservedSongIds.push(songId);
    }
    this.saveCycle();
    this.notifyListeners();
  }

  // Mark track as completed (reached end or >= 75%)
  recordTrackCompleted(song, allEligibleSongs = []) {
    if (!song) return;
    const songId = (song._id || song.id).toString();

    // Remove from reserved
    this.cycleData.reservedSongIds = this.cycleData.reservedSongIds.filter((id) => id !== songId);

    // Add to played
    if (!this.cycleData.playedSongIds.includes(songId)) {
      this.cycleData.playedSongIds.push(songId);
    }

    this.cycleData.lastCompletedSongId = songId;

    // Check if the current cycle is now fully completed
    this.checkAndHandleCycleCompletion(allEligibleSongs);

    this.saveCycle();
    this.notifyListeners();
  }

  // Mark track as skipped manually
  recordTrackSkipped(song, allEligibleSongs = []) {
    if (!song) return;
    const songId = (song._id || song.id).toString();

    // Remove from reserved
    this.cycleData.reservedSongIds = this.cycleData.reservedSongIds.filter((id) => id !== songId);

    // Add to skipped and played so it stays excluded for the rest of the cycle
    if (!this.cycleData.skippedSongIds.includes(songId)) {
      this.cycleData.skippedSongIds.push(songId);
    }
    if (!this.cycleData.playedSongIds.includes(songId)) {
      this.cycleData.playedSongIds.push(songId);
    }

    this.cycleData.lastCompletedSongId = songId;

    // Check if the skip completed the cycle
    this.checkAndHandleCycleCompletion(allEligibleSongs);

    this.saveCycle();
    this.notifyListeners();
  }

  // Mark track as failed / network error (does NOT count as played)
  recordTrackFailed(song) {
    if (!song) return;
    const songId = (song._id || song.id).toString();
    this.cycleData.reservedSongIds = this.cycleData.reservedSongIds.filter((id) => id !== songId);
    this.saveCycle();
    this.notifyListeners();
  }

  // Check if all eligible songs have been played/excluded, and reset if completed
  checkAndHandleCycleCompletion(allEligibleSongs = []) {
    if (!Array.isArray(allEligibleSongs) || allEligibleSongs.length === 0) return false;

    const excluded = this.getExcludedIds();
    const remaining = allEligibleSongs.filter((s) => !excluded.has((s._id || s.id).toString()));

    if (remaining.length === 0) {
      this.resetCycle(allEligibleSongs);
      return true;
    }
    return false;
  }

  // Reset current cycle when exhausted
  resetCycle(allEligibleSongs = []) {
    const nextCycleId = (this.cycleData.cycleId || 1) + 1;
    const lastCompleted = this.cycleData.lastCompletedSongId;

    this.cycleData = {
      cycleId: nextCycleId,
      playedSongIds: [],
      reservedSongIds: [],
      skippedSongIds: [],
      manuallyReplayedIds: [],
      lastCompletedSongId: lastCompleted,
      queue: [],
      history: this.cycleData.history.slice(-30),
    };

    this.saveCycle();
    this.notifyListeners();
  }

  /**
   * Atomic, concurrency-safe Next Track Selector with ML ranking.
   *
   * @param {Array} allEligibleSongs - All eligible songs for the active mode/playlist.
   * @param {String} currentSongId - ID of currently playing song.
   * @param {Function} fetchRecommendations - Callback to ML recommendation API.
   * @returns {Object|null} - Selected next Song object.
   */
  async getNextSong(allEligibleSongs = [], currentSongId = null, fetchRecommendations = null) {
    if (this.isProcessingNext) {
      // Concurrency lock: wait briefly for in-flight selection to finish
      await new Promise((r) => setTimeout(r, 120));
    }

    this.isProcessingNext = true;

    try {
      if (!Array.isArray(allEligibleSongs) || allEligibleSongs.length === 0) {
        return null;
      }

      // Step 1: Filter unplayed candidates in the active cycle
      let excluded = this.getExcludedIds();
      let candidates = allEligibleSongs.filter(
        (s) => !excluded.has((s._id || s.id).toString())
      );

      // Step 2: If cycle is exhausted, reset cycle
      if (candidates.length === 0) {
        this.resetCycle(allEligibleSongs);
        excluded = this.getExcludedIds();

        // Avoid repeating the last completed track immediately if > 1 track exists
        if (allEligibleSongs.length > 1 && this.cycleData.lastCompletedSongId) {
          candidates = allEligibleSongs.filter(
            (s) => (s._id || s.id).toString() !== this.cycleData.lastCompletedSongId.toString()
          );
        } else {
          candidates = [...allEligibleSongs];
        }
      }

      if (candidates.length === 0) {
        return null;
      }

      // If only 1 candidate remains, choose it directly
      if (candidates.length === 1) {
        const nextSong = candidates[0];
        const nextId = (nextSong._id || nextSong.id).toString();
        this.cycleData.reservedSongIds.push(nextId);
        this.saveCycle();
        this.notifyListeners();
        return nextSong;
      }

      let chosenSong = null;

      // Step 3: Use ML recommendation ranking if callback provided
      if (typeof fetchRecommendations === "function") {
        try {
          const excludeList = Array.from(excluded);
          if (currentSongId && !excludeList.includes(currentSongId.toString())) {
            excludeList.push(currentSongId.toString());
          }

          const recsResult = await fetchRecommendations({
            limit: 8,
            excludeSongIds: excludeList,
            mode: this.audioMode,
            playlistSongIds: this.context.songIds,
          });

          const recList = Array.isArray(recsResult)
            ? recsResult
            : recsResult?.data && Array.isArray(recsResult.data)
            ? recsResult.data
            : [];

          // Find highest ML-ranked recommendation that is among unplayed candidates
          for (const item of recList) {
            const songObj = item.song || item;
            const recId = (songObj._id || songObj.id || "").toString();
            const matchedCandidate = candidates.find(
              (c) => (c._id || c.id).toString() === recId
            );
            if (matchedCandidate) {
              chosenSong = matchedCandidate;
              break;
            }
          }
        } catch (e) {
          console.warn("ML next song selection fallback to local heuristic:", e);
        }
      }

      // Step 4: Fallback heuristic if ML was unavailable (BPM smoothness)
      if (!chosenSong) {
        const currentTrack = allEligibleSongs.find(
          (s) => (s._id || s.id).toString() === (currentSongId || "").toString()
        );
        const currentBpm = currentTrack?.audioFeatures?.tempo || 100;

        // Rank by closest BPM delta
        candidates.sort((a, b) => {
          const bpmA = a.audioFeatures?.tempo || 100;
          const bpmB = b.audioFeatures?.tempo || 100;
          return Math.abs(bpmA - currentBpm) - Math.abs(bpmB - currentBpm);
        });

        chosenSong = candidates[0];
      }

      // Step 5: Atomically mark chosen track as reserved for playback
      const chosenId = (chosenSong._id || chosenSong.id).toString();
      if (!this.cycleData.reservedSongIds.includes(chosenId)) {
        this.cycleData.reservedSongIds.push(chosenId);
      }

      this.saveCycle();
      this.notifyListeners();
      return chosenSong;
    } finally {
      this.isProcessingNext = false;
    }
  }

  /**
   * Synchronous, zero-latency candidate selector for uninterrupted background/lock-screen transitions.
   * Immediately selects and reserves the next eligible track in the current cycle using BPM harmony,
   * with zero network delay, guaranteeing browser audio continuity on lock screen.
   */
  peekNextCandidateSync(allEligibleSongs = [], currentSongId = null) {
    if (!Array.isArray(allEligibleSongs) || allEligibleSongs.length === 0) {
      return null;
    }

    let excluded = this.getExcludedIds();
    let candidates = allEligibleSongs.filter(
      (s) => !excluded.has((s._id || s.id).toString())
    );

    if (candidates.length === 0) {
      this.resetCycle(allEligibleSongs);
      excluded = this.getExcludedIds();
      if (allEligibleSongs.length > 1 && this.cycleData.lastCompletedSongId) {
        candidates = allEligibleSongs.filter(
          (s) => (s._id || s.id).toString() !== this.cycleData.lastCompletedSongId.toString()
        );
      } else {
        candidates = [...allEligibleSongs];
      }
    }

    if (candidates.length === 0) return null;

    const currentTrack = allEligibleSongs.find(
      (s) => (s._id || s.id).toString() === (currentSongId || "").toString()
    );
    const currentBpm = currentTrack?.audioFeatures?.tempo || 100;

    // Pick closest BPM candidate for smooth harmonic transition
    candidates.sort((a, b) => {
      const bpmA = a.audioFeatures?.tempo || 100;
      const bpmB = b.audioFeatures?.tempo || 100;
      return Math.abs(bpmA - currentBpm) - Math.abs(bpmB - currentBpm);
    });

    const chosenSong = candidates[0];
    const chosenId = (chosenSong._id || chosenSong.id).toString();
    if (!this.cycleData.reservedSongIds.includes(chosenId)) {
      this.cycleData.reservedSongIds.push(chosenId);
    }
    this.saveCycle();
    this.notifyListeners();
    return chosenSong;
  }

  // Get current cycle metrics for UI badges and diagnostics
  getCycleStatus(allEligibleSongs = []) {
    const totalEligible = Array.isArray(allEligibleSongs) && allEligibleSongs.length > 0
      ? allEligibleSongs.length
      : this.context.songIds?.length || 0;

    const playedSet = new Set(this.cycleData.playedSongIds);
    const playedCount = playedSet.size;
    const remainingCount = Math.max(0, totalEligible - playedCount);

    return {
      cycleId: this.cycleData.cycleId,
      contextType: this.context.type,
      contextId: this.context.id,
      contextName: this.context.name,
      audioMode: this.audioMode,
      totalEligible,
      playedCount,
      remainingCount,
      skippedCount: this.cycleData.skippedSongIds.length,
      isCycleComplete: totalEligible > 0 && remainingCount === 0,
      lastCompletedSongId: this.cycleData.lastCompletedSongId,
    };
  }
}

// Export singleton instance
export const playbackCycleManager = new PlaybackCycleManager();
export default playbackCycleManager;
