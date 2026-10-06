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
import com.example.focusmusic.models.RegisterRequest;
import com.example.focusmusic.models.User;
import com.example.focusmusic.utils.ErrorUtils;
import com.example.focusmusic.utils.SessionManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterActivity extends AppCompatActivity {

    private EditText etName;
    private EditText etEmail;
    private EditText etPassword;
    private EditText etConfirmPassword;
    private Button btnSignUp;
    private TextView tvSignInLink;
    private TextView tvErrorMessage;
    private ProgressBar progressBar;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        sessionManager = new SessionManager(this);

        initViews();
        setupListeners();
    }

    private void initViews() {
        etName = findViewById(R.id.etName);
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);
        btnSignUp = findViewById(R.id.btnSignUp);
        tvSignInLink = findViewById(R.id.tvSignInLink);
        tvErrorMessage = findViewById(R.id.tvErrorMessage);
        progressBar = findViewById(R.id.progressBar);
    }

    private void setupListeners() {
        btnSignUp.setOnClickListener(v -> validateAndRegister());

        tvSignInLink.setOnClickListener(v -> finish());
    }

    private void validateAndRegister() {
        String name = etName.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        String confirmPassword = etConfirmPassword.getText().toString().trim();

        hideError();

        if (TextUtils.isEmpty(name)) {
            showError("Please enter your full name.");
            etName.requestFocus();
            return;
        }

        if (name.length() < 2) {
            showError("Full name must be at least 2 characters.");
            etName.requestFocus();
            return;
        }

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
            showError("Please enter a password.");
            etPassword.requestFocus();
            return;
        }

        if (password.length() < 6) {
            showError("Password must be at least 6 characters.");
            etPassword.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(confirmPassword)) {
            showError("Please confirm your password.");
            etConfirmPassword.requestFocus();
            return;
        }

        if (!password.equals(confirmPassword)) {
            showError("Passwords do not match.");
            etConfirmPassword.requestFocus();
            return;
        }

        // Trigger network registration call via Retrofit
        setLoading(true);

        ApiService apiService = ApiClient.getApiService(this);
        RegisterRequest registerRequest = new RegisterRequest(name, email, password);

        apiService.register(registerRequest).enqueue(new Callback<ApiResponse<User>>() {
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

                        Toast.makeText(RegisterActivity.this, "Account created! Welcome, " + user.getName(), Toast.LENGTH_SHORT).show();

                        Intent intent = new Intent(RegisterActivity.this, HomeActivity.class);
                        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                        startActivity(intent);
                        finish();
                    } else {
                        String msg = apiResponse.getMessage() != null ? apiResponse.getMessage() : "Registration failed.";
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
            btnSignUp.setEnabled(false);
        } else {
            progressBar.setVisibility(View.GONE);
            btnSignUp.setEnabled(true);
        }
    }
}
