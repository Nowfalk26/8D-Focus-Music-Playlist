package com.example.focusmusic.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class SessionManager {
    private static final String PREF_NAME = "FocusMusicSession";
    private static final String KEY_IS_LOGGED_IN = "isLoggedIn";
    private static final String KEY_TOKEN = "jwtToken";
    private static final String KEY_USER_ID = "userId";
    private static final String KEY_USER_NAME = "userName";
    private static final String KEY_USER_EMAIL = "userEmail";
    private static final String KEY_USER_ROLE = "userRole";
    private static final String KEY_USER_CREATED_AT = "userCreatedAt";
    private static final String KEY_CUSTOM_BASE_URL = "customBaseUrl";

    private final SharedPreferences pref;
    private final SharedPreferences.Editor editor;

    public SessionManager(Context context) {
        pref = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        editor = pref.edit();
    }

    public void createLoginSession(String token, String id, String name, String email, String role) {
        editor.putBoolean(KEY_IS_LOGGED_IN, true);
        editor.putString(KEY_TOKEN, token);
        editor.putString(KEY_USER_ID, id);
        editor.putString(KEY_USER_NAME, name);
        editor.putString(KEY_USER_EMAIL, email);
        editor.putString(KEY_USER_ROLE, role);
        editor.apply();
    }

    public boolean isLoggedIn() {
        return pref.getBoolean(KEY_IS_LOGGED_IN, false);
    }

    public String getToken() {
        return pref.getString(KEY_TOKEN, null);
    }

    public String getUserName() {
        return pref.getString(KEY_USER_NAME, "User");
    }

    public String getUserEmail() {
        return pref.getString(KEY_USER_EMAIL, "");
    }

    public String getUserId() {
        return pref.getString(KEY_USER_ID, "");
    }

    public String getUserRole() {
        return pref.getString(KEY_USER_ROLE, "user");
    }

    public void setUserCreatedAt(String createdAt) {
        editor.putString(KEY_USER_CREATED_AT, createdAt);
        editor.apply();
    }

    public String getUserCreatedAt() {
        return pref.getString(KEY_USER_CREATED_AT, null);
    }

    public void setCustomBaseUrl(String url) {
        editor.putString(KEY_CUSTOM_BASE_URL, url);
        editor.apply();
    }

    public String getCustomBaseUrl() {
        return pref.getString(KEY_CUSTOM_BASE_URL, null);
    }

    public void logoutUser() {
        String savedBaseUrl = getCustomBaseUrl();
        editor.clear();
        if (savedBaseUrl != null && !savedBaseUrl.trim().isEmpty()) {
            editor.putString(KEY_CUSTOM_BASE_URL, savedBaseUrl);
        }
        editor.apply();
    }
}
