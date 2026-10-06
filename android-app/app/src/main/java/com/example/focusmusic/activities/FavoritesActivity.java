package com.example.focusmusic.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
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
import com.example.focusmusic.adapters.FavoriteAdapter;
import com.example.focusmusic.api.ApiClient;
import com.example.focusmusic.api.ApiService;
import com.example.focusmusic.models.ApiResponse;
import com.example.focusmusic.models.Favorite;
import com.example.focusmusic.models.Song;
import com.example.focusmusic.service.MusicPlayerManager;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class FavoritesActivity extends AppCompatActivity implements MusicPlayerManager.PlaybackListener {

    private FrameLayout btnBack;
    private TextView tvFavoriteCount;
    private RecyclerView rvFavorites;
    private ProgressBar progressBarFavorites;
    private LinearLayout layoutEmptyFavorites;
    private Button btnExploreTracks;

    // Mini Player
    private LinearLayout layoutMiniPlayer;
    private ImageView ivMiniCover;
    private TextView tvMiniTitle;
    private TextView tvMiniArtist;
    private FrameLayout btnMiniPlayPause;
    private ImageView ivMiniPlayPauseIcon;

    private FavoriteAdapter favoriteAdapter;
    private ApiService apiService;
    private Song currentActiveSong;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_favorites);

        apiService = ApiClient.getApiService(this);

        initViews();
        setupRecyclerView();
        setupListeners();

        loadFavorites();
    }

    private void initViews() {
        btnBack = findViewById(R.id.btnBack);
        tvFavoriteCount = findViewById(R.id.tvFavoriteCount);
        rvFavorites = findViewById(R.id.rvFavorites);
        progressBarFavorites = findViewById(R.id.progressBarFavorites);
        layoutEmptyFavorites = findViewById(R.id.layoutEmptyFavorites);
        btnExploreTracks = findViewById(R.id.btnExploreTracks);

        layoutMiniPlayer = findViewById(R.id.layoutMiniPlayer);
        ivMiniCover = findViewById(R.id.ivMiniCover);
        tvMiniTitle = findViewById(R.id.tvMiniTitle);
        tvMiniArtist = findViewById(R.id.tvMiniArtist);
        btnMiniPlayPause = findViewById(R.id.btnMiniPlayPause);
        ivMiniPlayPauseIcon = findViewById(R.id.ivMiniPlayPauseIcon);
    }

    private void setupRecyclerView() {
        favoriteAdapter = new FavoriteAdapter(new FavoriteAdapter.OnFavoriteItemClickListener() {
            @Override
            public void onPlaySong(Song song, int position) {
                MusicPlayerManager.getInstance().playTrack(
                        FavoritesActivity.this,
                        song,
                        favoriteAdapter.getSongList(),
                        position
                );
            }

            @Override
            public void onRemoveFavorite(Favorite favorite, int position) {
                deleteFavorite(favorite, position);
            }
        });

        rvFavorites.setLayoutManager(new LinearLayoutManager(this));
        rvFavorites.setAdapter(favoriteAdapter);
    }

    private void setupListeners() {
        btnBack.setOnClickListener(v -> finish());

        btnExploreTracks.setOnClickListener(v -> finish());

        btnMiniPlayPause.setOnClickListener(v -> {
            MusicPlayerManager.getInstance().togglePlayPause(this);
        });

        layoutMiniPlayer.setOnClickListener(v -> {
            Song active = MusicPlayerManager.getInstance().getCurrentSong();
            if (active != null) {
                Intent intent = new Intent(FavoritesActivity.this, PlayerActivity.class);
                intent.putExtra(PlayerActivity.EXTRA_SONG, active);
                intent.putExtra(PlayerActivity.EXTRA_PLAYLIST, new ArrayList<>(favoriteAdapter.getSongList()));
                intent.putExtra(PlayerActivity.EXTRA_CURRENT_INDEX, favoriteAdapter.getSongList().indexOf(active));
                startActivity(intent);
            }
        });
    }

    private void loadFavorites() {
        progressBarFavorites.setVisibility(View.VISIBLE);
        layoutEmptyFavorites.setVisibility(View.GONE);

        apiService.getFavorites().enqueue(new Callback<ApiResponse<List<Favorite>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Favorite>>> call, Response<ApiResponse<List<Favorite>>> response) {
                progressBarFavorites.setVisibility(View.GONE);

                if (response.isSuccessful() && response.body() != null) {
                    ApiResponse<List<Favorite>> apiResponse = response.body();
                    if (apiResponse.isSuccess() && apiResponse.getData() != null) {
                        List<Favorite> favorites = apiResponse.getData();
                        favoriteAdapter.setFavorites(favorites);
                        updateCountUI(favorites.size());
                        return;
                    }
                }

                updateCountUI(0);
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Favorite>>> call, Throwable t) {
                progressBarFavorites.setVisibility(View.GONE);
                Toast.makeText(FavoritesActivity.this, "Unable to load favorites.", Toast.LENGTH_SHORT).show();
                updateCountUI(0);
            }
        });
    }

    private void deleteFavorite(Favorite favorite, int position) {
        if (favorite.getSong() == null) return;

        apiService.removeFavorite(favorite.getSong().getId()).enqueue(new Callback<ApiResponse<Void>>() {
            @Override
            public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                if (response.isSuccessful()) {
                    favoriteAdapter.removeAt(position);
                    updateCountUI(favoriteAdapter.getItemCount());
                    Toast.makeText(FavoritesActivity.this, "Removed from Favorites", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(FavoritesActivity.this, "Failed to remove favorite.", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Void>> call, Throwable t) {
                Toast.makeText(FavoritesActivity.this, "Network error.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void updateCountUI(int count) {
        tvFavoriteCount.setText(count + (count == 1 ? " Track" : " Tracks"));
        if (count == 0) {
            layoutEmptyFavorites.setVisibility(View.VISIBLE);
            rvFavorites.setVisibility(View.GONE);
        } else {
            layoutEmptyFavorites.setVisibility(View.GONE);
            rvFavorites.setVisibility(View.VISIBLE);
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
}
