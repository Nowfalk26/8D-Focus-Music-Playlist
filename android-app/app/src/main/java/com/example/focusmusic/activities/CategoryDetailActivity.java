package com.example.focusmusic.activities;

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
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.bumptech.glide.load.resource.bitmap.RoundedCorners;
import com.bumptech.glide.request.RequestOptions;
import com.example.focusmusic.R;
import com.example.focusmusic.adapters.SongAdapter;
import com.example.focusmusic.api.ApiClient;
import com.example.focusmusic.api.ApiService;
import com.example.focusmusic.models.ApiResponse;
import com.example.focusmusic.models.Category;
import com.example.focusmusic.models.Song;
import com.example.focusmusic.service.MusicPlayerManager;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CategoryDetailActivity extends AppCompatActivity implements MusicPlayerManager.PlaybackListener {

    public static final String EXTRA_CATEGORY = "extra_category";

    private FrameLayout btnBack;
    private TextView tvBarTitle;
    private TextView tvCategoryBannerTitle;
    private TextView tvCategoryBannerDescription;
    private TextView tvCategoryTrackCount;
    private EditText etCategorySearch;
    private ImageView btnClearCategorySearch;
    private RecyclerView rvCategorySongs;
    private ProgressBar progressBarCategory;
    private TextView tvEmptyCategoryState;

    // Mini Player components
    private LinearLayout layoutMiniPlayer;
    private ImageView ivMiniCover;
    private TextView tvMiniTitle;
    private TextView tvMiniArtist;
    private FrameLayout btnMiniPlayPause;
    private ImageView ivMiniPlayPauseIcon;

    private Category currentCategory;
    private SongAdapter songAdapter;
    private ApiService apiService;
    private String currentSearch = "";
    private Song currentActiveSong = null;
    private boolean isPlaying = false;

    private final Handler searchHandler = new Handler(Looper.getMainLooper());
    private Runnable searchRunnable;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_category_detail);

        apiService = ApiClient.getApiService(this);

        // Retrieve Category from Intent extra
        if (getIntent().hasExtra(EXTRA_CATEGORY)) {
            currentCategory = (Category) getIntent().getSerializableExtra(EXTRA_CATEGORY);
        }

        if (currentCategory == null) {
            currentCategory = new Category("default", "Soundscape", "Explore curated 8D spatial soundscapes.", "");
        }

        initViews();
        setupCategoryHeader();
        setupRecyclerView();
        setupListeners();

        loadCategorySongs(null);
    }

    private void initViews() {
        btnBack = findViewById(R.id.btnBack);
        tvBarTitle = findViewById(R.id.tvBarTitle);
        tvCategoryBannerTitle = findViewById(R.id.tvCategoryBannerTitle);
        tvCategoryBannerDescription = findViewById(R.id.tvCategoryBannerDescription);
        tvCategoryTrackCount = findViewById(R.id.tvCategoryTrackCount);
        etCategorySearch = findViewById(R.id.etCategorySearch);
        btnClearCategorySearch = findViewById(R.id.btnClearCategorySearch);
        rvCategorySongs = findViewById(R.id.rvCategorySongs);
        progressBarCategory = findViewById(R.id.progressBarCategory);
        tvEmptyCategoryState = findViewById(R.id.tvEmptyCategoryState);

        layoutMiniPlayer = findViewById(R.id.layoutMiniPlayer);
        ivMiniCover = findViewById(R.id.ivMiniCover);
        tvMiniTitle = findViewById(R.id.tvMiniTitle);
        tvMiniArtist = findViewById(R.id.tvMiniArtist);
        btnMiniPlayPause = findViewById(R.id.btnMiniPlayPause);
        ivMiniPlayPauseIcon = findViewById(R.id.ivMiniPlayPauseIcon);
    }

    private void setupCategoryHeader() {
        tvBarTitle.setText(currentCategory.getName());
        tvCategoryBannerTitle.setText(currentCategory.getName());
        if (currentCategory.getDescription() != null && !currentCategory.getDescription().trim().isEmpty()) {
            tvCategoryBannerDescription.setText(currentCategory.getDescription());
        } else {
            tvCategoryBannerDescription.setText("Curated 8D focus tracks optimized for cognitive performance.");
        }
    }

    private void setupRecyclerView() {
        songAdapter = new SongAdapter((song, position) -> {
            onTrackSelected(song);
        });
        rvCategorySongs.setLayoutManager(new LinearLayoutManager(this));
        rvCategorySongs.setAdapter(songAdapter);
    }

    private void setupListeners() {
        btnBack.setOnClickListener(v -> finish());

        // Search text watcher with debouncing (350ms)
        etCategorySearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                currentSearch = s.toString().trim();
                btnClearCategorySearch.setVisibility(currentSearch.isEmpty() ? View.GONE : View.VISIBLE);

                if (searchRunnable != null) {
                    searchHandler.removeCallbacks(searchRunnable);
                }
                searchRunnable = () -> loadCategorySongs(currentSearch);
                searchHandler.postDelayed(searchRunnable, 350);
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        btnClearCategorySearch.setOnClickListener(v -> {
            etCategorySearch.setText("");
            currentSearch = "";
            loadCategorySongs(null);
        });

        // Mini player play/pause toggle
        btnMiniPlayPause.setOnClickListener(v -> {
            MusicPlayerManager.getInstance().togglePlayPause(this);
        });

        // Open full PlayerActivity
        layoutMiniPlayer.setOnClickListener(v -> {
            Song active = MusicPlayerManager.getInstance().getCurrentSong();
            if (active != null) {
                android.content.Intent intent = new android.content.Intent(CategoryDetailActivity.this, PlayerActivity.class);
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

    private void loadCategorySongs(String search) {
        progressBarCategory.setVisibility(View.VISIBLE);
        tvEmptyCategoryState.setVisibility(View.GONE);

        String categoryFilter = "all".equalsIgnoreCase(currentCategory.getId()) ? null : currentCategory.getName();

        apiService.getSongs(categoryFilter, search).enqueue(new Callback<ApiResponse<List<Song>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Song>>> call, Response<ApiResponse<List<Song>>> response) {
                progressBarCategory.setVisibility(View.GONE);

                if (response.isSuccessful() && response.body() != null) {
                    ApiResponse<List<Song>> apiResponse = response.body();
                    if (apiResponse.isSuccess() && apiResponse.getData() != null) {
                        List<Song> songs = apiResponse.getData();
                        songAdapter.setSongs(songs);
                        tvCategoryTrackCount.setText(songs.size() + (songs.size() == 1 ? " Track" : " Tracks"));

                        if (songs.isEmpty()) {
                            tvEmptyCategoryState.setVisibility(View.VISIBLE);
                        } else {
                            tvEmptyCategoryState.setVisibility(View.GONE);
                        }
                        return;
                    }
                }

                tvEmptyCategoryState.setText("Unable to load category tracks.");
                tvEmptyCategoryState.setVisibility(View.VISIBLE);
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Song>>> call, Throwable t) {
                progressBarCategory.setVisibility(View.GONE);
                tvEmptyCategoryState.setText("Connection error. Ensure backend is running.");
                tvEmptyCategoryState.setVisibility(View.VISIBLE);
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
