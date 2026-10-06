package com.example.focusmusic.utils;

import org.json.JSONObject;

import okhttp3.ResponseBody;

public class ErrorUtils {

    /**
     * Parses the backend JSON error response (e.g., {"success":false, "message":"..."})
     * and extracts the human-readable message.
     */
    public static String parseError(ResponseBody errorBody) {
        if (errorBody == null) {
            return "An unexpected error occurred.";
        }
        try {
            String json = errorBody.string();
            JSONObject obj = new JSONObject(json);
            if (obj.has("message")) {
                return obj.getString("message");
            } else if (obj.has("error")) {
                return obj.getString("error");
            }
        } catch (Exception ignored) {
            // Return fallback message on parse failure
        }
        return "Server error. Please check your connection and try again.";
    }
}

