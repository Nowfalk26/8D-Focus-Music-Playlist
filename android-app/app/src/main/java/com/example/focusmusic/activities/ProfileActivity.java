package com.example.focusmusic.activities;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.example.focusmusic.R;
import com.example.focusmusic.api.ApiClient;
import com.example.focusmusic.api.ApiService;
import com.example.focusmusic.models.ApiResponse;
import com.example.focusmusic.models.Category;
import com.example.focusmusic.models.Favorite;
import com.example.focusmusic.models.Playlist;
import com.example.focusmusic.models.RecentlyPlayed;
import com.example.focusmusic.models.User;
import com.example.focusmusic.service.MusicPlayerManager;
import com.example.focusmusic.utils.SessionManager;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProfileActivity extends AppCompatActivity {

    private FrameLayout btnBack;
    private TextView tvAvatarInitials;
    private TextView tvProfileName;
    private TextView tvProfileEmail;
    private TextView tvProfileRole;
    private TextView tvJoinedDate;

    private TextView tvStatFavorites;
    private TextView tvStatPlaylists;
    private TextView tvStatRecents;

    private EditText etServerUrl;
    private TextView btnPresetEmulator;
    private TextView btnPresetLocalhost;
    private TextView btnTestPing;
    private ProgressBar pbPing;
    private TextView tvPingStatus;
    private View btnSaveServerUrl;
    private View btnLogoutProfile;

    private SessionManager sessionManager;
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        sessionManager = new SessionManager(this);
        apiService = ApiClient.getApiService(this);

        initViews();
        bindInitialData();
        setupListeners();
        fetchLiveProfileAndStats();
    }

    private void initViews() {
        btnBack = findViewById(R.id.btnBack);
        tvAvatarInitials = findViewById(R.id.tvAvatarInitials);
        tvProfileName = findViewById(R.id.tvProfileName);
        tvProfileEmail = findViewById(R.id.tvProfileEmail);
        tvProfileRole = findViewById(R.id.tvProfileRole);
        tvJoinedDate = findViewById(R.id.tvJoinedDate);

        tvStatFavorites = findViewById(R.id.tvStatFavorites);
        tvStatPlaylists = findViewById(R.id.tvStatPlaylists);
        tvStatRecents = findViewById(R.id.tvStatRecents);

        etServerUrl = findViewById(R.id.etServerUrl);
        btnPresetEmulator = findViewById(R.id.btnPresetEmulator);
        btnPresetLocalhost = findViewById(R.id.btnPresetLocalhost);
        btnTestPing = findViewById(R.id.btnTestPing);
        pbPing = findViewById(R.id.pbPing);
        tvPingStatus = findViewById(R.id.tvPingStatus);
        btnSaveServerUrl = findViewById(R.id.btnSaveServerUrl);
        btnLogoutProfile = findViewById(R.id.btnLogoutProfile);
    }

    private void bindInitialData() {
        // Display cached profile data
        String name = sessionManager.getUserName();
        String email = sessionManager.getUserEmail();
        String role = sessionManager.getUserRole();

        tvProfileName.setText(name != null && !name.isEmpty() ? name : "Focus Listener");
        tvProfileEmail.setText(email != null && !email.isEmpty() ? email : "listener@focus8d.app");
        tvProfileRole.setText("ROLE: " + (role != null ? role.toUpperCase() : "USER"));

        if (name != null && !name.trim().isEmpty()) {
            tvAvatarInitials.setText(String.valueOf(name.trim().charAt(0)).toUpperCase());
        } else {
            tvAvatarInitials.setText("U");
        }

        String cachedJoined = sessionManager.getUserCreatedAt();
        if (cachedJoined != null && cachedJoined.length() >= 10) {
            tvJoinedDate.setText("Joined: " + cachedJoined.substring(0, 10));
        } else {
            tvJoinedDate.setText("Active Member");
        }

        // Initialize server URL with current active configuration
        String currentUrl = ApiClient.getBaseUrl();
        etServerUrl.setText(currentUrl);
    }

    private void setupListeners() {
        btnBack.setOnClickListener(v -> finish());

        // Quick Preset: Emulator
        btnPresetEmulator.setOnClickListener(v -> {
            etServerUrl.setText("http://10.0.2.2:5000/api/");
        });

        // Quick Preset: Localhost
        btnPresetLocalhost.setOnClickListener(v -> {
            etServerUrl.setText("http://127.0.0.1:5000/api/");
        });

        // Ping test button
        btnTestPing.setOnClickListener(v -> testServerConnection());

        // Save server URL button
        btnSaveServerUrl.setOnClickListener(v -> saveServerUrl());

        // Logout button with confirmation dialog
        btnLogoutProfile.setOnClickListener(v -> showLogoutConfirmationDialog());
    }

    private void testServerConnection() {
        String enteredUrl = etServerUrl.getText().toString().trim();
        if (enteredUrl.isEmpty()) {
            Toast.makeText(this, "Please enter a valid URL", Toast.LENGTH_SHORT).show();
            return;
        }

        if (!enteredUrl.startsWith("http://") && !enteredUrl.startsWith("https://")) {
            Toast.makeText(this, "URL must begin with http:// or https://", Toast.LENGTH_SHORT).show();
            return;
        }

        if (!enteredUrl.endsWith("/")) {
            enteredUrl += "/";
            etServerUrl.setText(enteredUrl);
        }

        pbPing.setVisibility(View.VISIBLE);
        tvPingStatus.setText("Pinging API...");
        tvPingStatus.setTextColor(ContextCompat.getColor(this, R.color.text_secondary));

        final long startTime = System.currentTimeMillis();

        // Temporarily apply URL to ApiClient to test ping
        ApiClient.setBaseUrl(enteredUrl);
        ApiService testService = ApiClient.getApiService(this);

        testService.getCategories().enqueue(new Callback<ApiResponse<List<Category>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Category>>> call, Response<ApiResponse<List<Category>>> response) {
                pbPing.setVisibility(View.GONE);
                long latency = System.currentTimeMillis() - startTime;
                if (response.isSuccessful()) {
                    tvPingStatus.setText("Connected! (" + latency + "ms • 200 OK)");
                    tvPingStatus.setTextColor(ContextCompat.getColor(ProfileActivity.this, R.color.status_green));
                } else {
                    tvPingStatus.setText("Server error: HTTP " + response.code());
                    tvPingStatus.setTextColor(ContextCompat.getColor(ProfileActivity.this, R.color.status_red));
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Category>>> call, Throwable t) {
                pbPing.setVisibility(View.GONE);
                tvPingStatus.setText("Connection Failed: " + (t.getMessage() != null ? t.getMessage() : "Timeout"));
                tvPingStatus.setTextColor(ContextCompat.getColor(ProfileActivity.this, R.color.status_red));
            }
        });
    }

    private void saveServerUrl() {
        String url = etServerUrl.getText().toString().trim();
        if (url.isEmpty()) {
            Toast.makeText(this, "Server URL cannot be empty", Toast.LENGTH_SHORT).show();
            return;
        }
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            Toast.makeText(this, "URL must start with http:// or https://", Toast.LENGTH_SHORT).show();
            return;
        }
        if (!url.endsWith("/")) {
            url += "/";
            etServerUrl.setText(url);
        }

        ApiClient.setBaseUrl(url);
        sessionManager.setCustomBaseUrl(url);
        apiService = ApiClient.getApiService(this);

        Toast.makeText(this, "Server URL applied and saved!", Toast.LENGTH_SHORT).show();
        tvPingStatus.setText("Configuration saved");
        tvPingStatus.setTextColor(ContextCompat.getColor(this, R.color.accent_cyan));
    }

    private void fetchLiveProfileAndStats() {
        // 1. Fetch fresh profile details
        apiService.getProfile().enqueue(new Callback<ApiResponse<User>>() {
            @Override
            public void onResponse(Call<ApiResponse<User>> call, Response<ApiResponse<User>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    User user = response.body().getData();
                    if (user.getName() != null) {
                        tvProfileName.setText(user.getName());
                        if (!user.getName().isEmpty()) {
                            tvAvatarInitials.setText(String.valueOf(user.getName().charAt(0)).toUpperCase());
                        }
                    }
                    if (user.getEmail() != null) {
                        tvProfileEmail.setText(user.getEmail());
                    }
                    if (user.getRole() != null) {
                        tvProfileRole.setText("ROLE: " + user.getRole().toUpperCase());
                    }
                    if (user.getCreatedAt() != null && user.getCreatedAt().length() >= 10) {
                        String dateStr = user.getCreatedAt().substring(0, 10);
                        tvJoinedDate.setText("Joined: " + dateStr);
                        sessionManager.setUserCreatedAt(user.getCreatedAt());
                    }
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<User>> call, Throwable t) {
                // Silently fallback to cached values
            }
        });

        // 2. Fetch Favorites Count
        apiService.getFavorites().enqueue(new Callback<ApiResponse<List<Favorite>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Favorite>>> call, Response<ApiResponse<List<Favorite>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    int count = response.body().getData().size();
                    tvStatFavorites.setText(String.valueOf(count));
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Favorite>>> call, Throwable t) {
                tvStatFavorites.setText("-");
            }
        });

        // 3. Fetch Playlists Count
        apiService.getUserPlaylists().enqueue(new Callback<ApiResponse<List<Playlist>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Playlist>>> call, Response<ApiResponse<List<Playlist>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    int count = response.body().getData().size();
                    tvStatPlaylists.setText(String.valueOf(count));
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Playlist>>> call, Throwable t) {
                tvStatPlaylists.setText("-");
            }
        });

        // 4. Fetch Recently Played Count
        apiService.getRecentlyPlayed(50).enqueue(new Callback<ApiResponse<List<RecentlyPlayed>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<RecentlyPlayed>>> call, Response<ApiResponse<List<RecentlyPlayed>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    int count = response.body().getData().size();
                    tvStatRecents.setText(String.valueOf(count));
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<RecentlyPlayed>>> call, Throwable t) {
                tvStatRecents.setText("-");
            }
        });
    }

    private void showLogoutConfirmationDialog() {
        new AlertDialog.Builder(this)
                .setTitle("Log Out")
                .setMessage("Are you sure you want to log out of your Focus Music account?")
                .setPositiveButton("Log Out", (dialog, which) -> {
                    // Stop any active audio playback
                    MusicPlayerManager.getInstance().stop(ProfileActivity.this);

                    // Clear user session
                    sessionManager.logoutUser();

                    Toast.makeText(ProfileActivity.this, "Logged out successfully", Toast.LENGTH_SHORT).show();

                    // Navigate to LoginActivity clearing backstack
                    Intent intent = new Intent(ProfileActivity.this, LoginActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                    finish();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }
}
