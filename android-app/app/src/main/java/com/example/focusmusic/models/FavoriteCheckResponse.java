package com.example.focusmusic.models;

import com.google.gson.annotations.SerializedName;

public class FavoriteCheckResponse {
    @SerializedName("success")
    private boolean success;

    @SerializedName("isFavorite")
    private boolean isFavorite;

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public boolean isFavorite() {
        return isFavorite;
    }

    public void setFavorite(boolean favorite) {
        isFavorite = favorite;
    }
}
