package com.example.focusmusic.models;

import com.google.gson.annotations.SerializedName;

public class Favorite {
    @SerializedName("_id")
    private String id;

    @SerializedName("user")
    private String user;

    @SerializedName("song")
    private Song song;

    @SerializedName("createdAt")
    private String createdAt;

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

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
