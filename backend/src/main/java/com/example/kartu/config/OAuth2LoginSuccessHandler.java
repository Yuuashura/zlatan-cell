package com.example.kartu.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * SKPL-F03: after Google login, send the browser back to the React app. The account itself
 * was already created or linked by GoogleAccountService while the user info was loaded.
 */
@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        String targetUrl;
        // In production single-origin, if frontendUrl points to dev localhost:5173
        // while the request is coming from a real host/domain, redirect relatively to stay on the same origin.
        if (frontendUrl != null && !frontendUrl.isBlank() && !frontendUrl.contains("localhost:5173")) {
            targetUrl = frontendUrl + "/?oauth_success=true";
        } else if ("localhost".equalsIgnoreCase(request.getServerName()) || "127.0.0.1".equals(request.getServerName())) {
            // Local development with separate Vite dev server
            String devOrigin = (frontendUrl != null && !frontendUrl.isBlank()) ? frontendUrl : "http://localhost:5173";
            targetUrl = devOrigin + "/?oauth_success=true";
        } else {
            // Production single-origin fallback: stay on current host
            targetUrl = "/?oauth_success=true";
        }
        response.sendRedirect(targetUrl);
    }
}
