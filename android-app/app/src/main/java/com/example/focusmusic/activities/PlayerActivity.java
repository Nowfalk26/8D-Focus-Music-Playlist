package com.example.focusmusic.activities;

import android.animation.ObjectAnimator;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.animation.LinearInterpolator;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;
import com.example.focusmusic.R;
import com.example.focusmusic.api.ApiClient;
import com.example.focusmusic.api.ApiService;
import com.example.focusmusic.models.ApiResponse;
import com.example.focusmusic.models.Favorite;
import com.example.focusmusic.models.FavoriteCheckResponse;
import com.example.focusmusic.models.Song;
import com.example.focusmusic.service.MusicPlayerManager;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PlayerActivity extends AppCompatActivity implements MusicPlayerManager.PlaybackListener {

    public static final String EXTRA_SONG = "extra_song";
    public static final String EXTRA_PLAYLIST = "extra_playlist";
    public static final String EXTRA_CURRENT_INDEX = "extra_current_index";

    private FrameLayout btnCollapse;
    private TextView tvPlayerCategoryBadge;
    private FrameLayout btnFavorite;
    private ImageView ivFavoriteIcon;
    private View cardArtwork;
    private ImageView ivPlayerArtwork;
    private TextView tvPlayerTitle;
    private TextView tvPlayerArtist;

    private SeekBar seekBarProgress;
    private TextView tvCurrentTime;
    private TextView tvTotalDuration;

    private ImageView btnShuffle;
    private FrameLayout btnPrevious;
    private FrameLayout btnPlayPause;
    private ImageView ivPlayPauseIcon;
    private FrameLayout btnNext;
    private ImageView btnRepeat;

    private ApiService apiService;
    private Song currentSong;
    private ArrayList<Song> playlist = new ArrayList<>();
    private int currentIndex = 0;

    private boolean isPlaying = false;
    private boolean isFavorite = false;
    private boolean isShuffle = false;
    private boolean isRepeat = false;
    private boolean isUserSeeking = false;

    private ObjectAnimator rotationAnimator;
    private int totalSongDurationMs = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_player);

        apiService = ApiClient.getApiService(this);

        initViews();
        extractIntentData();
        setupRotationAnimation();
        setupListeners();

        MusicPlayerManager.getInstance().addListener(this);

        // Check if a new song needs to be played
        MusicPlayerManager manager = MusicPlayerManager.getInstance();
        if (currentSong != null) {
            Song active = manager.getCurrentSong();
            if (active == null || !active.getId().equals(currentSong.getId())) {
                manager.playTrack(this, currentSong, playlist, currentIndex);
            } else {
                loadSongDetails(active);
                onPlaybackStateChanged(manager.isPlaying());
            }
        } else if (manager.getCurrentSong() != null) {
            loadSongDetails(manager.getCurrentSong());
            onPlaybackStateChanged(manager.isPlaying());
        }
    }

    private void initViews() {
        btnCollapse = findViewById(R.id.btnCollapse);
        tvPlayerCategoryBadge = findViewById(R.id.tvPlayerCategoryBadge);
        btnFavorite = findViewById(R.id.btnFavorite);
        ivFavoriteIcon = findViewById(R.id.ivFavoriteIcon);
        cardArtwork = findViewById(R.id.cardArtwork);
        ivPlayerArtwork = findViewById(R.id.ivPlayerArtwork);
        tvPlayerTitle = findViewById(R.id.tvPlayerTitle);
        tvPlayerArtist = findViewById(R.id.tvPlayerArtist);

        seekBarProgress = findViewById(R.id.seekBarProgress);
        tvCurrentTime = findViewById(R.id.tvCurrentTime);
        tvTotalDuration = findViewById(R.id.tvTotalDuration);

        btnShuffle = findViewById(R.id.btnShuffle);
        btnPrevious = findViewById(R.id.btnPrevious);
        btnPlayPause = findViewById(R.id.btnPlayPause);
        ivPlayPauseIcon = findViewById(R.id.ivPlayPauseIcon);
        btnNext = findViewById(R.id.btnNext);
        btnRepeat = findViewById(R.id.btnRepeat);
    }

    private void extractIntentData() {
        if (getIntent().hasExtra(EXTRA_SONG)) {
            currentSong = (Song) getIntent().getSerializableExtra(EXTRA_SONG);
        }

        if (getIntent().hasExtra(EXTRA_PLAYLIST)) {
            List<Song> passedList = (List<Song>) getIntent().getSerializableExtra(EXTRA_PLAYLIST);
            if (passedList != null) {
                playlist.clear();
                playlist.addAll(passedList);
            }
        }

        currentIndex = getIntent().getIntExtra(EXTRA_CURRENT_INDEX, 0);
    }

    private void setupRotationAnimation() {
        rotationAnimator = ObjectAnimator.ofFloat(cardArtwork, "rotation", 0f, 360f);
        rotationAnimator.setDuration(24000);
        rotationAnimator.setInterpolator(new LinearInterpolator());
        rotationAnimator.setRepeatCount(ObjectAnimator.INFINITE);
        rotationAnimator.setRepeatMode(ObjectAnimator.RESTART);
    }

    private void setupListeners() {
        btnCollapse.setOnClickListener(v -> finish());

        btnPlayPause.setOnClickListener(v -> {
            MusicPlayerManager.getInstance().togglePlayPause(this);
        });

        btnPrevious.setOnClickListener(v -> {
            MusicPlayerManager.getInstance().playPrevious(this);
        });

        btnNext.setOnClickListener(v -> {
            MusicPlayerManager.getInstance().playNext(this);
        });

        btnFavorite.setOnClickListener(v -> toggleFavorite());

        btnShuffle.setOnClickListener(v -> {
            isShuffle = !isShuffle;
            btnShuffle.setImageTintList(ColorStateList.valueOf(isShuffle ? Color.parseColor("#06B6D4") : Color.parseColor("#94A3B8")));
            Toast.makeText(this, isShuffle ? "Shuffle On" : "Shuffle Off", Toast.LENGTH_SHORT).show();
        });

        btnRepeat.setOnClickListener(v -> {
            isRepeat = !isRepeat;
            btnRepeat.setImageTintList(ColorStateList.valueOf(isRepeat ? Color.parseColor("#06B6D4") : Color.parseColor("#94A3B8")));
            Toast.makeText(this, isRepeat ? "Repeat Current Track" : "Repeat Off", Toast.LENGTH_SHORT).show();
        });

        seekBarProgress.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                if (fromUser && totalSongDurationMs > 0) {
                    int targetMs = (int) ((progress / 100.0) * totalSongDurationMs);
                    tvCurrentTime.setText(formatTime(targetMs / 1000));
                }
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {
                isUserSeeking = true;
            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {
                isUserSeeking = false;
                if (totalSongDurationMs > 0) {
                    int targetMs = (int) ((seekBar.getProgress() / 100.0) * totalSongDurationMs);
                    MusicPlayerManager.getInstance().seekTo(PlayerActivity.this, targetMs);
                }
            }
        });
    }

    private void loadSongDetails(Song song) {
        if (song == null) return;
        this.currentSong = song;
        this.totalSongDurationMs = song.getDuration() * 1000;

        tvPlayerTitle.setText(song.getTitle());
        tvPlayerArtist.setText(String.format("%s • %s", song.getArtist(), song.getCategory()));
        tvPlayerCategoryBadge.setText(song.getCategory());
        tvTotalDuration.setText(song.getFormattedDuration());

        String resolvedImage = ApiClient.resolveMediaUrl(song.getImageUrl());
        if (!resolvedImage.isEmpty()) {
            Glide.with(this)
                    .load(resolvedImage)
                    .placeholder(R.drawable.ic_music_note)
                    .error(R.drawable.ic_music_note)
                    .into(ivPlayerArtwork);
        } else {
            ivPlayerArtwork.setImageResource(R.drawable.ic_music_note);
        }

        checkFavoriteStatus(song.getId());
        recordListenHistory(song.getId());
    }

    @Override
    public void onTrackChanged(Song song) {
        runOnUiThread(() -> loadSongDetails(song));
    }

    @Override
    public void onPlaybackStateChanged(boolean playing) {
        runOnUiThread(() -> {
            this.isPlaying = playing;
            ivPlayPauseIcon.setImageResource(isPlaying ? R.drawable.ic_pause : R.drawable.ic_play_arrow);

            if (rotationAnimator != null) {
                if (isPlaying) {
                    if (rotationAnimator.isPaused()) {
                        rotationAnimator.resume();
                    } else if (!rotationAnimator.isStarted()) {
                        rotationAnimator.start();
                    }
                } else {
                    rotationAnimator.pause();
                }
            }
        });
    }

    @Override
    public void onProgressUpdate(int currentMs, int totalMs) {
        runOnUiThread(() -> {
            if (totalMs > 0) {
                this.totalSongDurationMs = totalMs;
            }
            if (!isUserSeeking && totalSongDurationMs > 0) {
                int percent = (int) (((double) currentMs / totalSongDurationMs) * 100);
                seekBarProgress.setProgress(percent);
                tvCurrentTime.setText(formatTime(currentMs / 1000));
                tvTotalDuration.setText(formatTime(totalSongDurationMs / 1000));
            }
        });
    }

    private void checkFavoriteStatus(String songId) {
        if (songId == null) return;

        apiService.checkFavoriteStatus(songId).enqueue(new Callback<FavoriteCheckResponse>() {
            @Override
            public void onResponse(Call<FavoriteCheckResponse> call, Response<FavoriteCheckResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    isFavorite = response.body().isFavorite();
                    updateFavoriteIcon(isFavorite);
                }
            }

            @Override
            public void onFailure(Call<FavoriteCheckResponse> call, Throwable t) {}
        });
    }

    private void toggleFavorite() {
        if (currentSong == null) return;

        final boolean targetState = !isFavorite;

        if (targetState) {
            apiService.addFavorite(currentSong.getId()).enqueue(new Callback<ApiResponse<Favorite>>() {
                @Override
                public void onResponse(Call<ApiResponse<Favorite>> call, Response<ApiResponse<Favorite>> response) {
                    if (response.isSuccessful()) {
                        isFavorite = true;
                        updateFavoriteIcon(true);
                        Toast.makeText(PlayerActivity.this, "Added to Favorites ❤️", Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onFailure(Call<ApiResponse<Favorite>> call, Throwable t) {
                    Toast.makeText(PlayerActivity.this, "Failed to update favorite.", Toast.LENGTH_SHORT).show();
                }
            });
        } else {
            apiService.removeFavorite(currentSong.getId()).enqueue(new Callback<ApiResponse<Void>>() {
                @Override
                public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                    if (response.isSuccessful()) {
                        isFavorite = false;
                        updateFavoriteIcon(false);
                        Toast.makeText(PlayerActivity.this, "Removed from Favorites", Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onFailure(Call<ApiResponse<Void>> call, Throwable t) {
                    Toast.makeText(PlayerActivity.this, "Failed to update favorite.", Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    private void updateFavoriteIcon(boolean favorited) {
        if (favorited) {
            ivFavoriteIcon.setImageResource(R.drawable.ic_favorite);
            ivFavoriteIcon.setImageTintList(ColorStateList.valueOf(Color.parseColor("#EF4444")));
        } else {
            ivFavoriteIcon.setImageResource(R.drawable.ic_favorite_border);
            ivFavoriteIcon.setImageTintList(ColorStateList.valueOf(Color.parseColor("#FFFFFF")));
        }
    }

    private void recordListenHistory(String songId) {
        if (songId == null) return;
        apiService.recordRecentlyPlayed(songId).enqueue(new Callback<ApiResponse<com.example.focusmusic.models.RecentlyPlayed>>() {
            @Override
            public void onResponse(Call<ApiResponse<com.example.focusmusic.models.RecentlyPlayed>> call, Response<ApiResponse<com.example.focusmusic.models.RecentlyPlayed>> response) {}

            @Override
            public void onFailure(Call<ApiResponse<com.example.focusmusic.models.RecentlyPlayed>> call, Throwable t) {}
        });
    }

    private String formatTime(int totalSeconds) {
        int minutes = totalSeconds / 60;
        int seconds = totalSeconds % 60;
        return String.format("%d:%02d", minutes, seconds);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (rotationAnimator != null && rotationAnimator.isRunning()) {
            rotationAnimator.pause();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (isPlaying && rotationAnimator != null && rotationAnimator.isPaused()) {
            rotationAnimator.resume();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        MusicPlayerManager.getInstance().removeListener(this);
        if (rotationAnimator != null) {
            rotationAnimator.cancel();
        }
    }
}
