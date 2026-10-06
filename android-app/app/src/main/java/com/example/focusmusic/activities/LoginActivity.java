package com.example.focusmusic.activities;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Patterns;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

import com.example.focusmusic.R;
import com.example.focusmusic.api.ApiClient;
import com.example.focusmusic.api.ApiService;
import com.example.focusmusic.models.ApiResponse;
import com.example.focusmusic.models.LoginRequest;
import com.example.focusmusic.models.User;
import com.example.focusmusic.utils.ErrorUtils;
import com.example.focusmusic.utils.SessionManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private EditText etEmail;
    private EditText etPassword;
    private Button btnSignIn;
    private TextView tvSignUpLink;
    private TextView tvErrorMessage;
    private ProgressBar progressBar;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        sessionManager = new SessionManager(this);

        initViews();
        setupListeners();
    }

    private void initViews() {
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnSignIn = findViewById(R.id.btnSignIn);
        tvSignUpLink = findViewById(R.id.tvSignUpLink);
        tvErrorMessage = findViewById(R.id.tvErrorMessage);
        progressBar = findViewById(R.id.progressBar);
    }

    private void setupListeners() {
        btnSignIn.setOnClickListener(v -> validateAndLogin());

        tvSignUpLink.setOnClickListener(v -> {
            Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
            startActivity(intent);
        });
    }

    private void validateAndLogin() {
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        hideError();

        if (TextUtils.isEmpty(email)) {
            showError("Please enter your email address.");
            etEmail.requestFocus();
            return;
        }

        if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            showError("Please enter a valid email address.");
            etEmail.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(password)) {
            showError("Please enter your password.");
            etPassword.requestFocus();
            return;
        }

        if (password.length() < 6) {
            showError("Password must be at least 6 characters.");
            etPassword.requestFocus();
            return;
        }

        // Trigger network login call via Retrofit
        setLoading(true);

        ApiService apiService = ApiClient.getApiService(this);
        LoginRequest loginRequest = new LoginRequest(email, password);

        apiService.login(loginRequest).enqueue(new Callback<ApiResponse<User>>() {
            @Override
            public void onResponse(Call<ApiResponse<User>> call, Response<ApiResponse<User>> response) {
                setLoading(false);

                if (response.isSuccessful() && response.body() != null) {
                    ApiResponse<User> apiResponse = response.body();
                    if (apiResponse.isSuccess() && apiResponse.getData() != null) {
                        User user = apiResponse.getData();
                        sessionManager.createLoginSession(
                                user.getToken(),
                                user.getId(),
                                user.getName(),
                                user.getEmail(),
                                user.getRole()
                        );

                        Toast.makeText(LoginActivity.this, "Welcome back, " + user.getName() + "!", Toast.LENGTH_SHORT).show();

                        Intent intent = new Intent(LoginActivity.this, HomeActivity.class);
                        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                        startActivity(intent);
                        finish();
                    } else {
                        String msg = apiResponse.getMessage() != null ? apiResponse.getMessage() : "Invalid credentials.";
                        showError(msg);
                    }
                } else {
                    String errorMsg = ErrorUtils.parseError(response.errorBody());
                    showError(errorMsg);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<User>> call, Throwable t) {
                setLoading(false);
                showError("Unable to reach server. Please ensure backend is running.");
            }
        });
    }

    public void showError(String message) {
        tvErrorMessage.setText(message);
        tvErrorMessage.setVisibility(View.VISIBLE);
    }

    public void hideError() {
        tvErrorMessage.setVisibility(View.GONE);
    }

    public void setLoading(boolean isLoading) {
        if (isLoading) {
            progressBar.setVisibility(View.VISIBLE);
            btnSignIn.setEnabled(false);
        } else {
            progressBar.setVisibility(View.GONE);
            btnSignIn.setEnabled(true);
        }
    }
}
