package com.example.focusmusic.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class Song implements Serializable {
    @SerializedName("_id")
    private String id;

    @SerializedName("title")
    private String title;

    @SerializedName("artist")
    private String artist;

    @SerializedName("category")
    private String category;

    @SerializedName("audioUrl")
    private String audioUrl;

    @SerializedName("imageUrl")
    private String imageUrl;

    @SerializedName("duration")
    private int duration;

    @SerializedName("is8D")
    private boolean is8D;

    @SerializedName("createdAt")
    private String createdAt;

    public Song() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getArtist() {
        return artist;
    }

    public void setArtist(String artist) {
        this.artist = artist;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getAudioUrl() {
        return audioUrl;
    }

    public void setAudioUrl(String audioUrl) {
        this.audioUrl = audioUrl;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public boolean is8D() {
        return is8D;
    }

    public void setIs8D(boolean is8D) {
        this.is8D = is8D;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getFormattedDuration() {
        if (duration <= 0) return "0:00";
        int minutes = duration / 60;
        int seconds = duration % 60;
        return String.format("%d:%02d", minutes, seconds);
    }
}
