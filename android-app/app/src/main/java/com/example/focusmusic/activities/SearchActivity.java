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
import com.example.focusmusic.models.Song;
import com.example.focusmusic.service.MusicPlayerManager;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SearchActivity extends AppCompatActivity implements MusicPlayerManager.PlaybackListener {

    private FrameLayout btnBack;
    private EditText etSearchInput;
    private ImageView btnClearSearch;

    // Filter Chips
    private TextView chipAll;
    private TextView chip8DOnly;
    private TextView chipBinaural;
    private TextView chipLofi;
    private TextView chipNature;

    // Suggestions container
    private LinearLayout layoutSuggestions;
    private TextView tagQuantumFlow;
    private TextView tagAlphaWaves;
    private TextView tagRain;
    private TextView tagMidnight;

    private TextView tvResultsHeader;
    private TextView tvSearchResultCount;
    private ProgressBar progressBarSearch;
    private TextView tvEmptySearch;
    private RecyclerView rvSearchResults;

    // Mini Player
    private LinearLayout layoutMiniPlayer;
    private ImageView ivMiniCover;
    private TextView tvMiniTitle;
    private TextView tvMiniArtist;
    private FrameLayout btnMiniPlayPause;
    private ImageView ivMiniPlayPauseIcon;

    private SongAdapter songAdapter;
    private ApiService apiService;

    private String currentQuery = "";
    private String selectedCategory = null;
    private boolean is8DOnlyFilter = false;

    private Song currentActiveSong = null;
    private boolean isPlaying = false;

    private final Handler searchHandler = new Handler(Looper.getMainLooper());
    private Runnable searchRunnable;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_search);

        apiService = ApiClient.getApiService(this);

        initViews();
        setupRecyclerView();
        setupListeners();

        // Initial fetch
        performSearch();
    }

    private void initViews() {
        btnBack = findViewById(R.id.btnBack);
        etSearchInput = findViewById(R.id.etSearchInput);
        btnClearSearch = findViewById(R.id.btnClearSearch);

        chipAll = findViewById(R.id.chipAll);
        chip8DOnly = findViewById(R.id.chip8DOnly);
        chipBinaural = findViewById(R.id.chipBinaural);
        chipLofi = findViewById(R.id.chipLofi);
        chipNature = findViewById(R.id.chipNature);

        layoutSuggestions = findViewById(R.id.layoutSuggestions);
        tagQuantumFlow = findViewById(R.id.tagQuantumFlow);
        tagAlphaWaves = findViewById(R.id.tagAlphaWaves);
        tagRain = findViewById(R.id.tagRain);
        tagMidnight = findViewById(R.id.tagMidnight);

        tvResultsHeader = findViewById(R.id.tvResultsHeader);
        tvSearchResultCount = findViewById(R.id.tvSearchResultCount);
        progressBarSearch = findViewById(R.id.progressBarSearch);
        tvEmptySearch = findViewById(R.id.tvEmptySearch);
        rvSearchResults = findViewById(R.id.rvSearchResults);

        layoutMiniPlayer = findViewById(R.id.layoutMiniPlayer);
        ivMiniCover = findViewById(R.id.ivMiniCover);
        tvMiniTitle = findViewById(R.id.tvMiniTitle);
        tvMiniArtist = findViewById(R.id.tvMiniArtist);
        btnMiniPlayPause = findViewById(R.id.btnMiniPlayPause);
        ivMiniPlayPauseIcon = findViewById(R.id.ivMiniPlayPauseIcon);
    }

    private void setupRecyclerView() {
        songAdapter = new SongAdapter((song, position) -> {
            onTrackSelected(song);
        });
        rvSearchResults.setLayoutManager(new LinearLayoutManager(this));
        rvSearchResults.setAdapter(songAdapter);
    }

    private void setupListeners() {
        btnBack.setOnClickListener(v -> finish());

        // Search text watcher with debouncing (300ms)
        etSearchInput.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                currentQuery = s.toString().trim();
                btnClearSearch.setVisibility(currentQuery.isEmpty() ? View.GONE : View.VISIBLE);
                layoutSuggestions.setVisibility(currentQuery.isEmpty() ? View.VISIBLE : View.GONE);

                if (searchRunnable != null) {
                    searchHandler.removeCallbacks(searchRunnable);
                }
                searchRunnable = () -> performSearch();
                searchHandler.postDelayed(searchRunnable, 300);
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        btnClearSearch.setOnClickListener(v -> {
            etSearchInput.setText("");
            currentQuery = "";
            performSearch();
        });

        // Category Filter Chips
        chipAll.setOnClickListener(v -> {
            selectedCategory = null;
            is8DOnlyFilter = false;
            updateChipStyles(chipAll);
            performSearch();
        });

        chip8DOnly.setOnClickListener(v -> {
            is8DOnlyFilter = !is8DOnlyFilter;
            chip8DOnly.setBackgroundResource(
                    is8DOnlyFilter ? R.drawable.bg_chip_selected : R.drawable.bg_chip_unselected
            );
            performSearch();
        });

        chipBinaural.setOnClickListener(v -> {
            selectedCategory = "Binaural Beats";
            updateChipStyles(chipBinaural);
            performSearch();
        });

        chipLofi.setOnClickListener(v -> {
            selectedCategory = "Lofi Focus";
            updateChipStyles(chipLofi);
            performSearch();
        });

        chipNature.setOnClickListener(v -> {
            selectedCategory = "Nature Sounds";
            updateChipStyles(chipNature);
            performSearch();
        });

        // Popular Suggestion Chips
        tagQuantumFlow.setOnClickListener(v -> selectQueryTag("Quantum"));
        tagAlphaWaves.setOnClickListener(v -> selectQueryTag("Alpha"));
        tagRain.setOnClickListener(v -> selectQueryTag("Rain"));
        tagMidnight.setOnClickListener(v -> selectQueryTag("Midnight"));

        // Mini player play/pause toggle
        btnMiniPlayPause.setOnClickListener(v -> {
            MusicPlayerManager.getInstance().togglePlayPause(this);
        });

        // Open full PlayerActivity
        layoutMiniPlayer.setOnClickListener(v -> {
            Song active = MusicPlayerManager.getInstance().getCurrentSong();
            if (active != null) {
                android.content.Intent intent = new android.content.Intent(SearchActivity.this, PlayerActivity.class);
                intent.putExtra(PlayerActivity.EXTRA_SONG, active);
                intent.putExtra(PlayerActivity.EXTRA_PLAYLIST, new java.util.ArrayList<>(songAdapter.getSongs()));
                intent.putExtra(PlayerActivity.EXTRA_CURRENT_INDEX, songAdapter.getSongs().indexOf(active));
                startActivity(intent);
            }
        });
    }

    private void updateChipStyles(TextView activeChip) {
        TextView[] chips = {chipAll, chipBinaural, chipLofi, chipNature};
        for (TextView chip : chips) {
            chip.setBackgroundResource(
                    chip == activeChip ? R.drawable.bg_chip_selected : R.drawable.bg_chip_unselected
            );
        }
    }

    private void selectQueryTag(String tag) {
        etSearchInput.setText(tag);
        etSearchInput.setSelection(tag.length());
    }

    private void performSearch() {
        progressBarSearch.setVisibility(View.VISIBLE);
        tvEmptySearch.setVisibility(View.GONE);

        String searchParam = currentQuery.isEmpty() ? null : currentQuery;

        apiService.getSongs(selectedCategory, searchParam).enqueue(new Callback<ApiResponse<List<Song>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Song>>> call, Response<ApiResponse<List<Song>>> response) {
                progressBarSearch.setVisibility(View.GONE);

                if (response.isSuccessful() && response.body() != null) {
                    ApiResponse<List<Song>> apiResponse = response.body();
                    if (apiResponse.isSuccess() && apiResponse.getData() != null) {
                        List<Song> songs = apiResponse.getData();

                        // Client-side filter for 8D audio only if requested
                        if (is8DOnlyFilter) {
                            List<Song> filtered = new ArrayList<>();
                            for (Song song : songs) {
                                if (song.is8D()) {
                                    filtered.add(song);
                                }
                            }
                            songs = filtered;
                        }

                        songAdapter.setSongs(songs);
                        tvSearchResultCount.setText(songs.size() + (songs.size() == 1 ? " Track" : " Tracks"));

                        if (songs.isEmpty()) {
                            tvEmptySearch.setVisibility(View.VISIBLE);
                        } else {
                            tvEmptySearch.setVisibility(View.GONE);
                        }
                        return;
                    }
                }

                tvEmptySearch.setText("No tracks match your query.");
                tvEmptySearch.setVisibility(View.VISIBLE);
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Song>>> call, Throwable t) {
                progressBarSearch.setVisibility(View.GONE);
                tvEmptySearch.setText("Network error. Ensure backend is running.");
                tvEmptySearch.setVisibility(View.VISIBLE);
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

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (searchRunnable != null) {
            searchHandler.removeCallbacks(searchRunnable);
        }
    }
}
