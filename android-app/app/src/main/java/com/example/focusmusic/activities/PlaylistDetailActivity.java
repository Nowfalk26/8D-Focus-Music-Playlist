package com.example.focusmusic.activities;

import android.app.AlertDialog;
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
import com.example.focusmusic.adapters.SongAdapter;
import com.example.focusmusic.api.ApiClient;
import com.example.focusmusic.api.ApiService;
import com.example.focusmusic.models.ApiResponse;
import com.example.focusmusic.models.Playlist;
import com.example.focusmusic.models.PlaylistSongRequest;
import com.example.focusmusic.models.Song;
import com.example.focusmusic.service.MusicPlayerManager;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PlaylistDetailActivity extends AppCompatActivity implements MusicPlayerManager.PlaybackListener {

    public static final String EXTRA_PLAYLIST = "extra_playlist";

    private FrameLayout btnBack;
    private TextView tvBarTitle;
    private FrameLayout btnDeleteThisPlaylist;

    private TextView tvDetailPlaylistName;
    private TextView tvDetailPlaylistDesc;
    private TextView tvDetailTrackCount;
    private Button btnPlayAll;
    private Button btnAddTrack;

    private RecyclerView rvPlaylistSongs;
    private ProgressBar progressBarPlaylistDetail;
    private LinearLayout layoutEmptyTracks;

    // Mini Player
    private LinearLayout layoutMiniPlayer;
    private ImageView ivMiniCover;
    private TextView tvMiniTitle;
    private TextView tvMiniArtist;
    private FrameLayout btnMiniPlayPause;
    private ImageView ivMiniPlayPauseIcon;

    private Playlist currentPlaylist;
    private SongAdapter songAdapter;
    private ApiService apiService;
    private Song currentActiveSong;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_playlist_detail);

        apiService = ApiClient.getApiService(this);

        if (getIntent().hasExtra(EXTRA_PLAYLIST)) {
            currentPlaylist = (Playlist) getIntent().getSerializableExtra(EXTRA_PLAYLIST);
        }

        initViews();
        setupRecyclerView();
        setupListeners();

        if (currentPlaylist != null) {
            populateHeader(currentPlaylist);
            loadFreshPlaylist(currentPlaylist.getId());
        }
    }

    private void initViews() {
        btnBack = findViewById(R.id.btnBack);
        tvBarTitle = findViewById(R.id.tvBarTitle);
        btnDeleteThisPlaylist = findViewById(R.id.btnDeleteThisPlaylist);

        tvDetailPlaylistName = findViewById(R.id.tvDetailPlaylistName);
        tvDetailPlaylistDesc = findViewById(R.id.tvDetailPlaylistDesc);
        tvDetailTrackCount = findViewById(R.id.tvDetailTrackCount);
        btnPlayAll = findViewById(R.id.btnPlayAll);
        btnAddTrack = findViewById(R.id.btnAddTrack);

        rvPlaylistSongs = findViewById(R.id.rvPlaylistSongs);
        progressBarPlaylistDetail = findViewById(R.id.progressBarPlaylistDetail);
        layoutEmptyTracks = findViewById(R.id.layoutEmptyTracks);

        layoutMiniPlayer = findViewById(R.id.layoutMiniPlayer);
        ivMiniCover = findViewById(R.id.ivMiniCover);
        tvMiniTitle = findViewById(R.id.tvMiniTitle);
        tvMiniArtist = findViewById(R.id.tvMiniArtist);
        btnMiniPlayPause = findViewById(R.id.btnMiniPlayPause);
        ivMiniPlayPauseIcon = findViewById(R.id.ivMiniPlayPauseIcon);
    }

    private void populateHeader(Playlist playlist) {
        tvBarTitle.setText(playlist.getName());
        tvDetailPlaylistName.setText(playlist.getName());

        if (playlist.getDescription() != null && !playlist.getDescription().trim().isEmpty()) {
            tvDetailPlaylistDesc.setText(playlist.getDescription());
            tvDetailPlaylistDesc.setVisibility(View.VISIBLE);
        } else {
            tvDetailPlaylistDesc.setVisibility(View.GONE);
        }

        int count = playlist.getSongCount();
        tvDetailTrackCount.setText(count + (count == 1 ? " Track" : " Tracks"));
    }

    private void setupRecyclerView() {
        songAdapter = new SongAdapter((song, position) -> {
            MusicPlayerManager.getInstance().playTrack(
                    PlaylistDetailActivity.this,
                    song,
                    songAdapter.getSongs(),
                    position
            );
        });
        rvPlaylistSongs.setLayoutManager(new LinearLayoutManager(this));
        rvPlaylistSongs.setAdapter(songAdapter);
    }

    private void setupListeners() {
        btnBack.setOnClickListener(v -> finish());

        btnDeleteThisPlaylist.setOnClickListener(v -> {
            if (currentPlaylist != null) {
                confirmDeletePlaylist();
            }
        });

        btnPlayAll.setOnClickListener(v -> {
            List<Song> songs = songAdapter.getSongs();
            if (songs != null && !songs.isEmpty()) {
                MusicPlayerManager.getInstance().playTrack(
                        PlaylistDetailActivity.this,
                        songs.get(0),
                        songs,
                        0
                );
            } else {
                Toast.makeText(this, "Playlist has no tracks yet.", Toast.LENGTH_SHORT).show();
            }
        });

        btnAddTrack.setOnClickListener(v -> showAddTrackDialog());

        btnMiniPlayPause.setOnClickListener(v -> {
            MusicPlayerManager.getInstance().togglePlayPause(this);
        });

        layoutMiniPlayer.setOnClickListener(v -> {
            Song active = MusicPlayerManager.getInstance().getCurrentSong();
            if (active != null) {
                Intent intent = new Intent(PlaylistDetailActivity.this, PlayerActivity.class);
                intent.putExtra(PlayerActivity.EXTRA_SONG, active);
                intent.putExtra(PlayerActivity.EXTRA_PLAYLIST, new ArrayList<>(songAdapter.getSongs()));
                intent.putExtra(PlayerActivity.EXTRA_CURRENT_INDEX, songAdapter.getSongs().indexOf(active));
                startActivity(intent);
            }
        });
    }

    private void loadFreshPlaylist(String playlistId) {
        progressBarPlaylistDetail.setVisibility(View.VISIBLE);

        apiService.getPlaylistById(playlistId).enqueue(new Callback<ApiResponse<Playlist>>() {
            @Override
            public void onResponse(Call<ApiResponse<Playlist>> call, Response<ApiResponse<Playlist>> response) {
                progressBarPlaylistDetail.setVisibility(View.GONE);

                if (response.isSuccessful() && response.body() != null) {
                    ApiResponse<Playlist> apiResponse = response.body();
                    if (apiResponse.isSuccess() && apiResponse.getData() != null) {
                        currentPlaylist = apiResponse.getData();
                        populateHeader(currentPlaylist);

                        List<Song> songs = currentPlaylist.getSongs();
                        songAdapter.setSongs(songs);

                        if (songs == null || songs.isEmpty()) {
                            layoutEmptyTracks.setVisibility(View.VISIBLE);
                            rvPlaylistSongs.setVisibility(View.GONE);
                        } else {
                            layoutEmptyTracks.setVisibility(View.GONE);
                            rvPlaylistSongs.setVisibility(View.VISIBLE);
                        }
                    }
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Playlist>> call, Throwable t) {
                progressBarPlaylistDetail.setVisibility(View.GONE);
                Toast.makeText(PlaylistDetailActivity.this, "Failed to load playlist.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showAddTrackDialog() {
        progressBarPlaylistDetail.setVisibility(View.VISIBLE);

        // Fetch all catalog songs
        apiService.getSongs(null, null).enqueue(new Callback<ApiResponse<List<Song>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Song>>> call, Response<ApiResponse<List<Song>>> response) {
                progressBarPlaylistDetail.setVisibility(View.GONE);

                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    List<Song> allSongs = response.body().getData();
                    if (allSongs.isEmpty()) {
                        Toast.makeText(PlaylistDetailActivity.this, "No tracks available in catalog.", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    String[] titles = new String[allSongs.size()];
                    for (int i = 0; i < allSongs.size(); i++) {
                        Song s = allSongs.get(i);
                        titles[i] = s.getTitle() + " (" + s.getArtist() + ")";
                    }

                    new AlertDialog.Builder(PlaylistDetailActivity.this)
                            .setTitle("Add Track to Playlist")
                            .setItems(titles, (dialog, which) -> {
                                Song chosen = allSongs.get(which);
                                addSongApi(chosen.getId());
                            })
                            .setNegativeButton("Cancel", null)
                            .show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Song>>> call, Throwable t) {
                progressBarPlaylistDetail.setVisibility(View.GONE);
                Toast.makeText(PlaylistDetailActivity.this, "Could not fetch catalog.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void addSongApi(String songId) {
        apiService.addSongToPlaylist(currentPlaylist.getId(), new PlaylistSongRequest(songId))
                .enqueue(new Callback<ApiResponse<Playlist>>() {
                    @Override
                    public void onResponse(Call<ApiResponse<Playlist>> call, Response<ApiResponse<Playlist>> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            Toast.makeText(PlaylistDetailActivity.this, "Track added to playlist!", Toast.LENGTH_SHORT).show();
                            loadFreshPlaylist(currentPlaylist.getId());
                        } else {
                            Toast.makeText(PlaylistDetailActivity.this, "Track is already in playlist or error occurred.", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiResponse<Playlist>> call, Throwable t) {
                        Toast.makeText(PlaylistDetailActivity.this, "Network error adding track.", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void confirmDeletePlaylist() {
        new AlertDialog.Builder(this)
                .setTitle("Delete Playlist")
                .setMessage("Are you sure you want to delete this playlist?")
                .setPositiveButton("Delete", (dialog, which) -> {
                    apiService.deletePlaylist(currentPlaylist.getId()).enqueue(new Callback<ApiResponse<Void>>() {
                        @Override
                        public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                            Toast.makeText(PlaylistDetailActivity.this, "Playlist deleted.", Toast.LENGTH_SHORT).show();
                            finish();
                        }

                        @Override
                        public void onFailure(Call<ApiResponse<Void>> call, Throwable t) {
                            Toast.makeText(PlaylistDetailActivity.this, "Network error.", Toast.LENGTH_SHORT).show();
                        }
                    });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

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
