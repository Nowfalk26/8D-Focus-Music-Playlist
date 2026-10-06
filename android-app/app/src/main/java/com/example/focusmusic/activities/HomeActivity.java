package com.example.focusmusic.activities;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.bumptech.glide.load.resource.bitmap.RoundedCorners;
import com.bumptech.glide.request.RequestOptions;
import com.example.focusmusic.R;
import com.example.focusmusic.adapters.CategoryAdapter;
import com.example.focusmusic.adapters.SongAdapter;
import com.example.focusmusic.api.ApiClient;
import com.example.focusmusic.api.ApiService;
import com.example.focusmusic.models.ApiResponse;
import com.example.focusmusic.models.Category;
import com.example.focusmusic.models.Song;
import com.example.focusmusic.service.MusicPlayerManager;
import com.example.focusmusic.utils.SessionManager;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HomeActivity extends AppCompatActivity implements MusicPlayerManager.PlaybackListener {

    private TextView tvUserName;
    private FrameLayout btnProfile;
    private EditText etSearch;
    private ImageView btnClearSearch;
    private RecyclerView rvCategories;
    private RecyclerView rvSongs;
    private TextView tvSectionTitle;
    private TextView tvTrackCount;
    private ProgressBar progressBarSongs;
    private TextView tvEmptyState;

    // Mini Player components
    private LinearLayout layoutMiniPlayer;
    private ImageView ivMiniCover;
    private TextView tvMiniTitle;
    private TextView tvMiniArtist;
    private FrameLayout btnMiniPlayPause;
    private ImageView ivMiniPlayPauseIcon;

    private CategoryAdapter categoryAdapter;
    private SongAdapter songAdapter;
    private ApiService apiService;
    private SessionManager sessionManager;

    private String selectedCategory = null;
    private String currentSearch = "";
    private Song currentActiveSong = null;
    private boolean isPlaying = false;

    private final Handler searchHandler = new Handler(Looper.getMainLooper());
    private Runnable searchRunnable;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        sessionManager = new SessionManager(this);
        apiService = ApiClient.getApiService(this);

        initViews();
        setupUserData();
        setupRecyclerViews();
        setupListeners();

        loadCategories();
        loadSongs(null, null);
    }

    private void initViews() {
        tvUserName = findViewById(R.id.tvUserName);
        btnProfile = findViewById(R.id.btnProfile);
        etSearch = findViewById(R.id.etSearch);
        btnClearSearch = findViewById(R.id.btnClearSearch);
        rvCategories = findViewById(R.id.rvCategories);
        rvSongs = findViewById(R.id.rvSongs);
        tvSectionTitle = findViewById(R.id.tvSectionTitle);
        tvTrackCount = findViewById(R.id.tvTrackCount);
        progressBarSongs = findViewById(R.id.progressBarSongs);
        tvEmptyState = findViewById(R.id.tvEmptyState);

        layoutMiniPlayer = findViewById(R.id.layoutMiniPlayer);
        ivMiniCover = findViewById(R.id.ivMiniCover);
        tvMiniTitle = findViewById(R.id.tvMiniTitle);
        tvMiniArtist = findViewById(R.id.tvMiniArtist);
        btnMiniPlayPause = findViewById(R.id.btnMiniPlayPause);
        ivMiniPlayPauseIcon = findViewById(R.id.ivMiniPlayPauseIcon);
    }

    private void setupUserData() {
        String name = sessionManager.getUserName();
        if (name != null && !name.trim().isEmpty()) {
            tvUserName.setText(name);
        } else {
            tvUserName.setText("Focus Listener");
        }
    }

    private void setupRecyclerViews() {
        // Horizontal Categories
        categoryAdapter = new CategoryAdapter(new CategoryAdapter.OnCategoryClickListener() {
            @Override
            public void onCategorySelected(Category category) {
                if ("all".equalsIgnoreCase(category.getId())) {
                    selectedCategory = null;
                    tvSectionTitle.setText("Featured 8D Audio");
                } else {
                    selectedCategory = category.getName();
                    tvSectionTitle.setText(category.getName() + " Tracks (Hold to explore)");
                }
                loadSongs(selectedCategory, currentSearch);
            }

            @Override
            public void onCategoryLongClick(Category category) {
                if (!"all".equalsIgnoreCase(category.getId())) {
                    Intent intent = new Intent(HomeActivity.this, CategoryDetailActivity.class);
                    intent.putExtra(CategoryDetailActivity.EXTRA_CATEGORY, category);
                    startActivity(intent);
                }
            }
        });
        rvCategories.setLayoutManager(new LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false));
        rvCategories.setAdapter(categoryAdapter);

        // Vertical Songs
        songAdapter = new SongAdapter((song, position) -> {
            onTrackSelected(song);
        });
        rvSongs.setLayoutManager(new LinearLayoutManager(this));
        rvSongs.setAdapter(songAdapter);
    }

    private void setupListeners() {
        // Profile & Settings handler
        if (btnProfile != null) {
            btnProfile.setOnClickListener(v -> {
                Intent intent = new Intent(HomeActivity.this, ProfileActivity.class);
                startActivity(intent);
            });
        }

        // Playlists handler
        View btnPlaylists = findViewById(R.id.btnPlaylists);
        if (btnPlaylists != null) {
            btnPlaylists.setOnClickListener(v -> {
                Intent intent = new Intent(HomeActivity.this, PlaylistsActivity.class);
                startActivity(intent);
            });
        }

        // Favorites handler
        View btnFavorites = findViewById(R.id.btnFavorites);
        if (btnFavorites != null) {
            btnFavorites.setOnClickListener(v -> {
                Intent intent = new Intent(HomeActivity.this, FavoritesActivity.class);
                startActivity(intent);
            });
        }

        // Search text watcher with debouncing (350ms)
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                currentSearch = s.toString().trim();
                btnClearSearch.setVisibility(currentSearch.isEmpty() ? View.GONE : View.VISIBLE);

                if (searchRunnable != null) {
                    searchHandler.removeCallbacks(searchRunnable);
                }
                searchRunnable = () -> loadSongs(selectedCategory, currentSearch);
                searchHandler.postDelayed(searchRunnable, 350);
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        // Clear search button
        btnClearSearch.setOnClickListener(v -> {
            etSearch.setText("");
            currentSearch = "";
            loadSongs(selectedCategory, null);
        });

        // Launch full SearchActivity
        ImageView btnSearchFull = findViewById(R.id.btnSearchFull);
        if (btnSearchFull != null) {
            btnSearchFull.setOnClickListener(v -> {
                Intent intent = new Intent(HomeActivity.this, SearchActivity.class);
                startActivity(intent);
            });
        }

        // Mini player play/pause toggle
        btnMiniPlayPause.setOnClickListener(v -> {
            MusicPlayerManager.getInstance().togglePlayPause(this);
        });

        // Open full-screen PlayerActivity when clicking mini player
        layoutMiniPlayer.setOnClickListener(v -> {
            Song active = MusicPlayerManager.getInstance().getCurrentSong();
            if (active != null) {
                Intent intent = new Intent(HomeActivity.this, PlayerActivity.class);
                intent.putExtra(PlayerActivity.EXTRA_SONG, active);
                intent.putExtra(PlayerActivity.EXTRA_PLAYLIST, new java.util.ArrayList<>(songAdapter.getSongs()));
                intent.putExtra(PlayerActivity.EXTRA_CURRENT_INDEX, songAdapter.getSongs().indexOf(active));
                startActivity(intent);
            }
        });
    }

    private void onTrackSelected(Song song) {
        if (song != null) {
            MusicPlayerManager.getInstance().playTrack(
                    this, song, songAdapter.getSongs(), songAdapter.getSongs().indexOf(song)
            );
        }
    }

    @Override
    public void onTrackChanged(Song song) {
        if (song == null) return;
        runOnUiThread(() -> {
            currentActiveSong = song;
            layoutMiniPlayer.setVisibility(View.VISIBLE);
            tvMiniTitle.setText(song.getTitle());
            tvMiniArtist.setText(String.format("%s • %s", song.getArtist(), song.getCategory()));

            String resolvedImage = ApiClient.resolveMediaUrl(song.getImageUrl());
            if (!resolvedImage.isEmpty()) {
                Glide.with(this)
                        .load(resolvedImage)
                        .placeholder(R.drawable.ic_music_note)
                        .error(R.drawable.ic_music_note)
                        .apply(RequestOptions.bitmapTransform(new RoundedCorners(10)))
                        .into(ivMiniCover);
            } else {
                ivMiniCover.setImageResource(R.drawable.ic_music_note);
            }
        });
    }

    @Override
    public void onPlaybackStateChanged(boolean playing) {
        runOnUiThread(() -> {
            this.isPlaying = playing;
            ivMiniPlayPauseIcon.setImageResource(playing ? R.drawable.ic_pause : R.drawable.ic_play_arrow);
        });
    }

    @Override
    public void onProgressUpdate(int currentMs, int totalMs) {}

    @Override
    protected void onResume() {
        super.onResume();
        MusicPlayerManager.getInstance().addListener(this);
    }

    @Override
    protected void onPause() {
        super.onPause();
        MusicPlayerManager.getInstance().removeListener(this);
    }

    private void loadCategories() {
        apiService.getCategories().enqueue(new Callback<ApiResponse<List<Category>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Category>>> call, Response<ApiResponse<List<Category>>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    ApiResponse<List<Category>> apiResponse = response.body();
                    if (apiResponse.isSuccess() && apiResponse.getData() != null) {
                        categoryAdapter.setCategories(apiResponse.getData());
                    }
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Category>>> call, Throwable t) {
                // Silently maintain default categories
            }
        });
    }

    private void loadSongs(String category, String search) {
        progressBarSongs.setVisibility(View.VISIBLE);
        tvEmptyState.setVisibility(View.GONE);

        apiService.getSongs(category, search).enqueue(new Callback<ApiResponse<List<Song>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Song>>> call, Response<ApiResponse<List<Song>>> response) {
                progressBarSongs.setVisibility(View.GONE);

                if (response.isSuccessful() && response.body() != null) {
                    ApiResponse<List<Song>> apiResponse = response.body();
                    if (apiResponse.isSuccess() && apiResponse.getData() != null) {
                        List<Song> songs = apiResponse.getData();
                        songAdapter.setSongs(songs);
                        tvTrackCount.setText(songs.size() + (songs.size() == 1 ? " Track" : " Tracks"));

                        if (songs.isEmpty()) {
                            tvEmptyState.setVisibility(View.VISIBLE);
                        } else {
                            tvEmptyState.setVisibility(View.GONE);
                        }
                        return;
                    }
                }

                tvEmptyState.setText("Unable to load tracks from server.");
                tvEmptyState.setVisibility(View.VISIBLE);
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Song>>> call, Throwable t) {
                progressBarSongs.setVisibility(View.GONE);
                tvEmptyState.setText("Connection error. Ensure backend is running.");
                tvEmptyState.setVisibility(View.VISIBLE);
            }
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (searchRunnable != null) {
            searchHandler.removeCallbacks(searchRunnable);
        }
    }
}
