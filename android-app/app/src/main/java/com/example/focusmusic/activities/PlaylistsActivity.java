package com.example.focusmusic.activities;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
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
import com.example.focusmusic.adapters.PlaylistAdapter;
import com.example.focusmusic.api.ApiClient;
import com.example.focusmusic.api.ApiService;
import com.example.focusmusic.models.ApiResponse;
import com.example.focusmusic.models.Playlist;
import com.example.focusmusic.models.PlaylistRequest;
import com.example.focusmusic.models.Song;
import com.example.focusmusic.service.MusicPlayerManager;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PlaylistsActivity extends AppCompatActivity implements MusicPlayerManager.PlaybackListener {

    private FrameLayout btnBack;
    private TextView tvPlaylistCount;
    private FrameLayout btnCreatePlaylist;
    private RecyclerView rvPlaylists;
    private ProgressBar progressBarPlaylists;
    private LinearLayout layoutEmptyPlaylists;
    private Button btnEmptyCreatePlaylist;

    // Mini Player
    private LinearLayout layoutMiniPlayer;
    private ImageView ivMiniCover;
    private TextView tvMiniTitle;
    private TextView tvMiniArtist;
    private FrameLayout btnMiniPlayPause;
    private ImageView ivMiniPlayPauseIcon;

    private PlaylistAdapter playlistAdapter;
    private ApiService apiService;
    private Song currentActiveSong;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_playlists);

        apiService = ApiClient.getApiService(this);

        initViews();
        setupRecyclerView();
        setupListeners();

        loadPlaylists();
    }

    private void initViews() {
        btnBack = findViewById(R.id.btnBack);
        tvPlaylistCount = findViewById(R.id.tvPlaylistCount);
        btnCreatePlaylist = findViewById(R.id.btnCreatePlaylist);
        rvPlaylists = findViewById(R.id.rvPlaylists);
        progressBarPlaylists = findViewById(R.id.progressBarPlaylists);
        layoutEmptyPlaylists = findViewById(R.id.layoutEmptyPlaylists);
        btnEmptyCreatePlaylist = findViewById(R.id.btnEmptyCreatePlaylist);

        layoutMiniPlayer = findViewById(R.id.layoutMiniPlayer);
        ivMiniCover = findViewById(R.id.ivMiniCover);
        tvMiniTitle = findViewById(R.id.tvMiniTitle);
        tvMiniArtist = findViewById(R.id.tvMiniArtist);
        btnMiniPlayPause = findViewById(R.id.btnMiniPlayPause);
        ivMiniPlayPauseIcon = findViewById(R.id.ivMiniPlayPauseIcon);
    }

    private void setupRecyclerView() {
        playlistAdapter = new PlaylistAdapter(new PlaylistAdapter.OnPlaylistClickListener() {
            @Override
            public void onPlaylistClick(Playlist playlist) {
                Intent intent = new Intent(PlaylistsActivity.this, PlaylistDetailActivity.class);
                intent.putExtra(PlaylistDetailActivity.EXTRA_PLAYLIST, playlist);
                startActivity(intent);
            }

            @Override
            public void onDeletePlaylist(Playlist playlist, int position) {
                confirmDeletePlaylist(playlist, position);
            }
        });

        rvPlaylists.setLayoutManager(new LinearLayoutManager(this));
        rvPlaylists.setAdapter(playlistAdapter);
    }

    private void setupListeners() {
        btnBack.setOnClickListener(v -> finish());

        btnCreatePlaylist.setOnClickListener(v -> showCreatePlaylistDialog());

        btnEmptyCreatePlaylist.setOnClickListener(v -> showCreatePlaylistDialog());

        btnMiniPlayPause.setOnClickListener(v -> {
            MusicPlayerManager.getInstance().togglePlayPause(this);
        });

        layoutMiniPlayer.setOnClickListener(v -> {
            Song active = MusicPlayerManager.getInstance().getCurrentSong();
            if (active != null) {
                Intent intent = new Intent(PlaylistsActivity.this, PlayerActivity.class);
                intent.putExtra(PlayerActivity.EXTRA_SONG, active);
                startActivity(intent);
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        MusicPlayerManager.getInstance().addListener(this);
        loadPlaylists();
    }

    @Override
    protected void onPause() {
        super.onPause();
        MusicPlayerManager.getInstance().removeListener(this);
    }

    private void loadPlaylists() {
        progressBarPlaylists.setVisibility(View.VISIBLE);
        layoutEmptyPlaylists.setVisibility(View.GONE);

        apiService.getUserPlaylists().enqueue(new Callback<ApiResponse<List<Playlist>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Playlist>>> call, Response<ApiResponse<List<Playlist>>> response) {
                progressBarPlaylists.setVisibility(View.GONE);

                if (response.isSuccessful() && response.body() != null) {
                    ApiResponse<List<Playlist>> apiResponse = response.body();
                    if (apiResponse.isSuccess() && apiResponse.getData() != null) {
                        List<Playlist> playlists = apiResponse.getData();
                        playlistAdapter.setPlaylists(playlists);
                        updateCountUI(playlists.size());
                        return;
                    }
                }
                updateCountUI(0);
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Playlist>>> call, Throwable t) {
                progressBarPlaylists.setVisibility(View.GONE);
                Toast.makeText(PlaylistsActivity.this, "Unable to load playlists.", Toast.LENGTH_SHORT).show();
                updateCountUI(0);
            }
        });
    }

    private void showCreatePlaylistDialog() {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_create_playlist, null);
        EditText etName = dialogView.findViewById(R.id.etPlaylistNameDialog);
        EditText etDesc = dialogView.findViewById(R.id.etPlaylistDescDialog);

        new AlertDialog.Builder(this)
                .setView(dialogView)
                .setPositiveButton("Create", (dialog, which) -> {
                    String name = etName.getText().toString().trim();
                    String desc = etDesc.getText().toString().trim();

                    if (TextUtils.isEmpty(name)) {
                        Toast.makeText(PlaylistsActivity.this, "Please enter a playlist name", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    createPlaylistApi(name, desc);
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void createPlaylistApi(String name, String desc) {
        apiService.createPlaylist(new PlaylistRequest(name, desc)).enqueue(new Callback<ApiResponse<Playlist>>() {
            @Override
            public void onResponse(Call<ApiResponse<Playlist>> call, Response<ApiResponse<Playlist>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    Toast.makeText(PlaylistsActivity.this, "Playlist created successfully!", Toast.LENGTH_SHORT).show();
                    loadPlaylists();
                } else {
                    Toast.makeText(PlaylistsActivity.this, "Failed to create playlist.", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Playlist>> call, Throwable t) {
                Toast.makeText(PlaylistsActivity.this, "Network error.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void confirmDeletePlaylist(Playlist playlist, int position) {
        new AlertDialog.Builder(this)
                .setTitle("Delete Playlist")
                .setMessage("Are you sure you want to delete \"" + playlist.getName() + "\"?")
                .setPositiveButton("Delete", (dialog, which) -> {
                    deletePlaylistApi(playlist.getId(), position);
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void deletePlaylistApi(String playlistId, int position) {
        apiService.deletePlaylist(playlistId).enqueue(new Callback<ApiResponse<Void>>() {
            @Override
            public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                if (response.isSuccessful()) {
                    playlistAdapter.removeAt(position);
                    updateCountUI(playlistAdapter.getItemCount());
                    Toast.makeText(PlaylistsActivity.this, "Playlist deleted.", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(PlaylistsActivity.this, "Failed to delete playlist.", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Void>> call, Throwable t) {
                Toast.makeText(PlaylistsActivity.this, "Network error.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void updateCountUI(int count) {
        tvPlaylistCount.setText(count + (count == 1 ? " Set" : " Sets"));
        if (count == 0) {
            layoutEmptyPlaylists.setVisibility(View.VISIBLE);
            rvPlaylists.setVisibility(View.GONE);
        } else {
            layoutEmptyPlaylists.setVisibility(View.GONE);
            rvPlaylists.setVisibility(View.VISIBLE);
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
}
