package com.example.focusmusic.service;

import android.content.Context;
import android.content.Intent;
import android.os.Build;

import com.example.focusmusic.models.Song;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class MusicPlayerManager {

    public interface PlaybackListener {
        void onTrackChanged(Song song);
        void onPlaybackStateChanged(boolean isPlaying);
        void onProgressUpdate(int currentMs, int totalMs);
    }

    private static MusicPlayerManager instance;

    private final List<PlaybackListener> listeners = new CopyOnWriteArrayList<>();
    private final ArrayList<Song> queue = new ArrayList<>();
    private int currentIndex = 0;
    private Song currentSong = null;
    private boolean isPlaying = false;
    private int currentPositionMs = 0;
    private int durationMs = 0;

    private MusicPlayerManager() {}

    public static synchronized MusicPlayerManager getInstance() {
        if (instance == null) {
            instance = new MusicPlayerManager();
        }
        return instance;
    }

    public void addListener(PlaybackListener listener) {
        if (listener != null && !listeners.contains(listener)) {
            listeners.add(listener);
            // Immediately inform of current state
            if (currentSong != null) {
                listener.onTrackChanged(currentSong);
                listener.onPlaybackStateChanged(isPlaying);
                listener.onProgressUpdate(currentPositionMs, durationMs);
            }
        }
    }

    public void removeListener(PlaybackListener listener) {
        if (listener != null) {
            listeners.remove(listener);
        }
    }

    public void playTrack(Context context, Song song, List<Song> newQueue, int index) {
        if (newQueue != null && !newQueue.isEmpty()) {
            this.queue.clear();
            this.queue.addAll(newQueue);
            this.currentIndex = index >= 0 && index < queue.size() ? index : 0;
        } else if (song != null) {
            this.queue.clear();
            this.queue.add(song);
            this.currentIndex = 0;
        }

        this.currentSong = song != null ? song : (queue.isEmpty() ? null : queue.get(currentIndex));
        this.isPlaying = true;
        this.currentPositionMs = 0;

        notifyTrackChanged(currentSong);
        notifyStateChanged(true);

        Intent intent = new Intent(context, MusicService.class);
        intent.setAction(MusicService.ACTION_PLAY);
        intent.putExtra(MusicService.EXTRA_SONG, currentSong);
        startService(context, intent);
    }

    public void togglePlayPause(Context context) {
        Intent intent = new Intent(context, MusicService.class);
        intent.setAction(MusicService.ACTION_TOGGLE);
        startService(context, intent);
    }

    public void playNext(Context context) {
        Intent intent = new Intent(context, MusicService.class);
        intent.setAction(MusicService.ACTION_NEXT);
        startService(context, intent);
    }

    public void playPrevious(Context context) {
        Intent intent = new Intent(context, MusicService.class);
        intent.setAction(MusicService.ACTION_PREVIOUS);
        startService(context, intent);
    }

    public void seekTo(Context context, int positionMs) {
        this.currentPositionMs = positionMs;
        notifyProgress(currentPositionMs, durationMs);

        Intent intent = new Intent(context, MusicService.class);
        intent.setAction(MusicService.ACTION_SEEK);
        intent.putExtra(MusicService.EXTRA_SEEK_POSITION, positionMs);
        startService(context, intent);
    }

    public void stop(Context context) {
        this.isPlaying = false;
        notifyStateChanged(false);

        Intent intent = new Intent(context, MusicService.class);
        intent.setAction(MusicService.ACTION_STOP);
        startService(context, intent);
    }

    private void startService(Context context, Intent intent) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }
    }

    // Called by MusicService to synchronize manager state with UI
    public void updateState(Song song, boolean playing, int positionMs, int durMs) {
        this.currentSong = song;
        this.isPlaying = playing;
        this.currentPositionMs = positionMs;
        this.durationMs = durMs;

        notifyStateChanged(playing);
        notifyProgress(positionMs, durMs);
    }

    public void updateCurrentTrack(Song song, int newIndex) {
        this.currentSong = song;
        this.currentIndex = newIndex;
        this.currentPositionMs = 0;
        notifyTrackChanged(song);
    }

    public void notifyTrackChanged(Song song) {
        for (PlaybackListener listener : listeners) {
            try {
                listener.onTrackChanged(song);
            } catch (Exception ignored) {}
        }
    }

    public void notifyStateChanged(boolean playing) {
        this.isPlaying = playing;
        for (PlaybackListener listener : listeners) {
            try {
                listener.onPlaybackStateChanged(playing);
            } catch (Exception ignored) {}
        }
    }

    public void notifyProgress(int currentMs, int totalMs) {
        this.currentPositionMs = currentMs;
        this.durationMs = totalMs;
        for (PlaybackListener listener : listeners) {
            try {
                listener.onProgressUpdate(currentMs, totalMs);
            } catch (Exception ignored) {}
        }
    }

    public Song getCurrentSong() {
        return currentSong;
    }

    public ArrayList<Song> getQueue() {
        return queue;
    }

    public int getCurrentIndex() {
        return currentIndex;
    }

    public boolean isPlaying() {
        return isPlaying;
    }

    public int getCurrentPositionMs() {
        return currentPositionMs;
    }

    public int getDurationMs() {
        return durationMs;
    }
}
