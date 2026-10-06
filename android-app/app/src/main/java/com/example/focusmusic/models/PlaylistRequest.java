package com.example.focusmusic.models;

import com.google.gson.annotations.SerializedName;

public class PlaylistRequest {
    @SerializedName("name")
    private String name;

    @SerializedName("description")
    private String description;

    public PlaylistRequest(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
