package com.example.focusmusic.service;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.example.focusmusic.R;
import com.example.focusmusic.activities.PlayerActivity;
import com.example.focusmusic.api.ApiClient;
import com.example.focusmusic.models.Song;

import java.io.IOException;
import java.util.ArrayList;

public class MusicService extends Service implements
        MediaPlayer.OnPreparedListener,
        MediaPlayer.OnCompletionListener,
        MediaPlayer.OnErrorListener {

    public static final String ACTION_PLAY = "com.example.focusmusic.ACTION_PLAY";
    public static final String ACTION_PAUSE = "com.example.focusmusic.ACTION_PAUSE";
    public static final String ACTION_TOGGLE = "com.example.focusmusic.ACTION_TOGGLE";
    public static final String ACTION_NEXT = "com.example.focusmusic.ACTION_NEXT";
    public static final String ACTION_PREVIOUS = "com.example.focusmusic.ACTION_PREVIOUS";
    public static final String ACTION_SEEK = "com.example.focusmusic.ACTION_SEEK";
    public static final String ACTION_STOP = "com.example.focusmusic.ACTION_STOP";

    public static final String EXTRA_SONG = "extra_song";
    public static final String EXTRA_SEEK_POSITION = "extra_seek_position";

    private static final String CHANNEL_ID = "focus_music_playback_channel";
    private static final int NOTIFICATION_ID = 808;

    private MediaPlayer mediaPlayer;
    private Song currentSong;
    private final Handler progressHandler = new Handler(Looper.getMainLooper());
    private Runnable progressRunnable;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        initMediaPlayer();
        setupProgressLoop();
    }

    private void initMediaPlayer() {
        mediaPlayer = new MediaPlayer();
        mediaPlayer.setWakeMode(getApplicationContext(), PowerManager.PARTIAL_WAKE_LOCK);
        mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .build());
        mediaPlayer.setOnPreparedListener(this);
        mediaPlayer.setOnCompletionListener(this);
        mediaPlayer.setOnErrorListener(this);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "8D Focus Soundscape Playback",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Shows notification controls for 8D music playback");
            channel.setShowBadge(false);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private void setupProgressLoop() {
        progressRunnable = new Runnable() {
            @Override
            public void run() {
                if (mediaPlayer != null && mediaPlayer.isPlaying()) {
                    try {
                        int pos = mediaPlayer.getCurrentPosition();
                        int dur = mediaPlayer.getDuration();
                        MusicPlayerManager.getInstance().notifyProgress(pos, dur);
                    } catch (IllegalStateException ignored) {}
                }
                progressHandler.postDelayed(this, 500);
            }
        };
        progressHandler.post(progressRunnable);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || intent.getAction() == null) {
            return START_STICKY;
        }

        String action = intent.getAction();

        switch (action) {
            case ACTION_PLAY:
                if (intent.hasExtra(EXTRA_SONG)) {
                    Song song = (Song) intent.getSerializableExtra(EXTRA_SONG);
                    playSong(song);
                } else if (mediaPlayer != null && !mediaPlayer.isPlaying()) {
                    resumePlayback();
                }
                break;

            case ACTION_PAUSE:
                pausePlayback();
                break;

            case ACTION_TOGGLE:
                if (mediaPlayer != null && mediaPlayer.isPlaying()) {
                    pausePlayback();
                } else {
                    resumePlayback();
                }
                break;

            case ACTION_NEXT:
                playNextTrack();
                break;

            case ACTION_PREVIOUS:
                playPreviousTrack();
                break;

            case ACTION_SEEK:
                int pos = intent.getIntExtra(EXTRA_SEEK_POSITION, 0);
                if (mediaPlayer != null) {
                    try {
                        mediaPlayer.seekTo(pos);
                    } catch (IllegalStateException ignored) {}
                }
                break;

            case ACTION_STOP:
                stopPlayback();
                break;
        }

        return START_NOT_STICKY;
    }

    private void playSong(Song song) {
        if (song == null) return;
        this.currentSong = song;

        try {
            mediaPlayer.reset();
            String streamUrl = ApiClient.resolveMediaUrl(song.getAudioUrl());
            if (streamUrl == null || streamUrl.trim().isEmpty()) {
                MusicPlayerManager.getInstance().notifyStateChanged(false);
                return;
            }
            mediaPlayer.setDataSource(streamUrl);
            mediaPlayer.prepareAsync();

            startForeground(NOTIFICATION_ID, buildNotification(false));
            MusicPlayerManager.getInstance().notifyTrackChanged(currentSong);
        } catch (IOException | IllegalArgumentException e) {
            MusicPlayerManager.getInstance().notifyStateChanged(false);
        }
    }

    private void resumePlayback() {
        if (mediaPlayer != null) {
            try {
                mediaPlayer.start();
                updateNotification(true);
                MusicPlayerManager.getInstance().notifyStateChanged(true);
            } catch (IllegalStateException ignored) {}
        }
    }

    private void pausePlayback() {
        if (mediaPlayer != null && mediaPlayer.isPlaying()) {
            try {
                mediaPlayer.pause();
                updateNotification(false);
                MusicPlayerManager.getInstance().notifyStateChanged(false);
            } catch (IllegalStateException ignored) {}
        }
    }

    private void playNextTrack() {
        MusicPlayerManager manager = MusicPlayerManager.getInstance();
        ArrayList<Song> queue = manager.getQueue();
        int curIdx = manager.getCurrentIndex();

        if (queue != null && !queue.isEmpty()) {
            int nextIdx = (curIdx + 1) % queue.size();
            Song nextSong = queue.get(nextIdx);
            manager.updateCurrentTrack(nextSong, nextIdx);
            playSong(nextSong);
        }
    }

    private void playPreviousTrack() {
        MusicPlayerManager manager = MusicPlayerManager.getInstance();
        ArrayList<Song> queue = manager.getQueue();
        int curIdx = manager.getCurrentIndex();

        if (queue != null && !queue.isEmpty()) {
            int prevIdx = curIdx > 0 ? curIdx - 1 : queue.size() - 1;
            Song prevSong = queue.get(prevIdx);
            manager.updateCurrentTrack(prevSong, prevIdx);
            playSong(prevSong);
        }
    }

    private void stopPlayback() {
        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
            } catch (IllegalStateException ignored) {}
        }
        MusicPlayerManager.getInstance().notifyStateChanged(false);
        stopForeground(true);
        stopSelf();
    }

    @Override
    public void onPrepared(MediaPlayer mp) {
        mp.start();
        updateNotification(true);
        MusicPlayerManager.getInstance().notifyStateChanged(true);
        MusicPlayerManager.getInstance().notifyProgress(0, mp.getDuration());
    }

    @Override
    public void onCompletion(MediaPlayer mp) {
        MusicPlayerManager.getInstance().notifyStateChanged(false);
        playNextTrack();
    }

    @Override
    public boolean onError(MediaPlayer mp, int what, int extra) {
        MusicPlayerManager.getInstance().notifyStateChanged(false);
        mp.reset();
        return true;
    }

    private Notification buildNotification(boolean isPlaying) {
        Intent openAppIntent = new Intent(this, PlayerActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent contentPendingIntent = PendingIntent.getActivity(
                this, 0, openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        PendingIntent prevIntent = getServicePendingIntent(ACTION_PREVIOUS, 1);
        PendingIntent toggleIntent = getServicePendingIntent(ACTION_TOGGLE, 2);
        PendingIntent nextIntent = getServicePendingIntent(ACTION_NEXT, 3);

        String title = currentSong != null ? currentSong.getTitle() : "Focus Soundscape";
        String artist = currentSong != null ? currentSong.getArtist() + " • 8D Spatial Audio" : "8D Audio Focus";

        int playPauseIcon = isPlaying ? R.drawable.ic_pause : R.drawable.ic_play_arrow;
        String playPauseTitle = isPlaying ? "Pause" : "Play";

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_headphones)
                .setContentTitle(title)
                .setContentText(artist)
                .setSubText("8D Spatial Audio")
                .setContentIntent(contentPendingIntent)
                .setOngoing(isPlaying)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .addAction(R.drawable.ic_skip_previous, "Previous", prevIntent)
                .addAction(playPauseIcon, playPauseTitle, toggleIntent)
                .addAction(R.drawable.ic_skip_next, "Next", nextIntent)
                .setStyle(new androidx.media.app.NotificationCompat.MediaStyle()
                        .setShowActionsInCompactView(0, 1, 2))
                .build();
    }

    private PendingIntent getServicePendingIntent(String action, int requestCode) {
        Intent intent = new Intent(this, MusicService.class);
        intent.setAction(action);
        return PendingIntent.getService(
                this, requestCode, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private void updateNotification(boolean isPlaying) {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.notify(NOTIFICATION_ID, buildNotification(isPlaying));
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (progressRunnable != null) {
            progressHandler.removeCallbacks(progressRunnable);
        }
        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
                mediaPlayer.release();
            } catch (Exception ignored) {}
            mediaPlayer = null;
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
