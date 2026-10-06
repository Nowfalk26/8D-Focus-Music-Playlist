package com.example.focusmusic.api;

import android.content.Context;

import com.example.focusmusic.utils.SessionManager;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ApiClient {

    /**
     * Standard loopback address for the Android Studio Emulator connecting to localhost.
     * Note: If running on a physical Android device, change this to your computer's local IP,
     * e.g., "http://192.168.1.50:5000/api/".
     */
    private static String baseUrl = "http://10.0.2.2:5000/api/";

    private static Retrofit retrofit = null;
    private static ApiService apiService = null;

    public static synchronized ApiService getApiService(Context context) {
        if (apiService == null) {
            final Context appContext = context.getApplicationContext();
            SessionManager sessionManager = new SessionManager(appContext);
            String customUrl = sessionManager.getCustomBaseUrl();
            if (customUrl != null && !customUrl.trim().isEmpty()) {
                if (!customUrl.endsWith("/")) {
                    customUrl += "/";
                }
                baseUrl = customUrl;
            }

            // HTTP Logging Interceptor for debugging requests & responses
            HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
            loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);

            // Auth Header Interceptor: adds Authorization Bearer <token> if logged in
            Interceptor authInterceptor = new Interceptor() {
                @Override
                public Response intercept(Chain chain) throws IOException {
                    Request originalRequest = chain.request();
                    SessionManager sessionManager = new SessionManager(appContext);
                    String token = sessionManager.getToken();

                    if (token != null && !token.trim().isEmpty()) {
                        Request modifiedRequest = originalRequest.newBuilder()
                                .header("Authorization", "Bearer " + token)
                                .build();
                        return chain.proceed(modifiedRequest);
                    }

                    return chain.proceed(originalRequest);
                }
            };

            OkHttpClient okHttpClient = new OkHttpClient.Builder()
                    .addInterceptor(authInterceptor)
                    .addInterceptor(loggingInterceptor)
                    .connectTimeout(15, TimeUnit.SECONDS)
                    .readTimeout(15, TimeUnit.SECONDS)
                    .writeTimeout(15, TimeUnit.SECONDS)
                    .build();

            retrofit = new Retrofit.Builder()
                    .baseUrl(baseUrl)
                    .client(okHttpClient)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();

            apiService = retrofit.create(ApiService.class);
        }
        return apiService;
    }

    public static String getBaseUrl() {
        return baseUrl;
    }

    public static synchronized void setBaseUrl(String newUrl) {
        if (newUrl != null && !newUrl.trim().isEmpty()) {
            if (!newUrl.endsWith("/")) {
                newUrl += "/";
            }
            baseUrl = newUrl;
            // Invalidate existing client instance to rebuild with new URL
            retrofit = null;
            apiService = null;
        }
    }

    /**
     * Resolves audio or image URL. If it's a relative path (/uploads/...),
     * prepends the server host so Android media player/Glide can stream it.
     */
    public static String resolveMediaUrl(String rawUrl) {
        if (rawUrl == null || rawUrl.trim().isEmpty()) {
            return "";
        }
        if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
            return rawUrl;
        }
        // Base URL host (e.g., http://10.0.2.2:5000)
        String host = baseUrl.replace("/api/", "");
        if (rawUrl.startsWith("/")) {
            return host + rawUrl;
        }
        return host + "/" + rawUrl;
    }
}
