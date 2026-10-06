package com.example.focusmusic.models;

import com.google.gson.annotations.SerializedName;

public class RecentlyPlayed {
    @SerializedName("_id")
    private String id;

    @SerializedName("user")
    private String user;

    @SerializedName("song")
    private Song song;

    @SerializedName("playedAt")
    private String playedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public Song getSong() {
        return song;
    }

    public void setSong(Song song) {
        this.song = song;
    }

    public String getPlayedAt() {
        return playedAt;
    }

    public void setPlayedAt(String playedAt) {
        this.playedAt = playedAt;
    }
}
