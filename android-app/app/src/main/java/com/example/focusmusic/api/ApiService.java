package com.example.focusmusic.api;

import com.example.focusmusic.models.ApiResponse;
import com.example.focusmusic.models.Category;
import com.example.focusmusic.models.Favorite;
import com.example.focusmusic.models.FavoriteCheckResponse;
import com.example.focusmusic.models.LoginRequest;
import com.example.focusmusic.models.Playlist;
import com.example.focusmusic.models.PlaylistRequest;
import com.example.focusmusic.models.PlaylistSongRequest;
import com.example.focusmusic.models.RecentlyPlayed;
import com.example.focusmusic.models.RegisterRequest;
import com.example.focusmusic.models.Song;
import com.example.focusmusic.models.User;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiService {

    // === Authentication Endpoints ===
    @POST("auth/login")
    Call<ApiResponse<User>> login(@Body LoginRequest request);

    @POST("auth/register")
    Call<ApiResponse<User>> register(@Body RegisterRequest request);

    @GET("auth/profile")
    Call<ApiResponse<User>> getProfile();

    // === Songs Endpoints ===
    @GET("songs")
    Call<ApiResponse<List<Song>>> getSongs(
            @Query("category") String category,
            @Query("search") String search
    );

    @GET("songs/{id}")
    Call<ApiResponse<Song>> getSongById(@Path("id") String songId);

    // === Categories Endpoints ===
    @GET("categories")
    Call<ApiResponse<List<Category>>> getCategories();

    @GET("categories/{id}")
    Call<ApiResponse<Category>> getCategoryById(@Path("id") String categoryId);

    // === Favorites Endpoints ===
    @GET("favorites")
    Call<ApiResponse<List<Favorite>>> getFavorites();

    @POST("favorites/{songId}")
    Call<ApiResponse<Favorite>> addFavorite(@Path("songId") String songId);

    @DELETE("favorites/{songId}")
    Call<ApiResponse<Void>> removeFavorite(@Path("songId") String songId);

    @GET("favorites/check/{songId}")
    Call<FavoriteCheckResponse> checkFavoriteStatus(@Path("songId") String songId);

    // === Playlists Endpoints ===
    @GET("playlists")
    Call<ApiResponse<List<Playlist>>> getUserPlaylists();

    @POST("playlists")
    Call<ApiResponse<Playlist>> createPlaylist(@Body PlaylistRequest request);

    @GET("playlists/{id}")
    Call<ApiResponse<Playlist>> getPlaylistById(@Path("id") String playlistId);

    @PUT("playlists/{id}")
    Call<ApiResponse<Playlist>> updatePlaylist(
            @Path("id") String playlistId,
            @Body PlaylistRequest request
    );

    @DELETE("playlists/{id}")
    Call<ApiResponse<Void>> deletePlaylist(@Path("id") String playlistId);

    @POST("playlists/{id}/songs")
    Call<ApiResponse<Playlist>> addSongToPlaylist(
            @Path("id") String playlistId,
            @Body PlaylistSongRequest request
    );

    @DELETE("playlists/{id}/songs/{songId}")
    Call<ApiResponse<Playlist>> removeSongFromPlaylist(
            @Path("id") String playlistId,
            @Path("songId") String songId
    );

    // === Recently Played Endpoints ===
    @GET("recently-played")
    Call<ApiResponse<List<RecentlyPlayed>>> getRecentlyPlayed(@Query("limit") Integer limit);

    @POST("recently-played/{songId}")
    Call<ApiResponse<RecentlyPlayed>> recordRecentlyPlayed(@Path("songId") String songId);
}
