package com.example.focusmusic.models;

import com.google.gson.annotations.SerializedName;

public class PlaylistSongRequest {
    @SerializedName("songId")
    private String songId;

    public PlaylistSongRequest(String songId) {
        this.songId = songId;
    }

    public String getSongId() {
        return songId;
    }

    public void setSongId(String songId) {
        this.songId = songId;
    }
}
