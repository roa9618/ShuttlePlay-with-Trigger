package com.shuttleplay.server.domain.auth.handler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

@Component
public class OAuth2FailureHandler implements org.springframework.security.web.authentication.AuthenticationFailureHandler {
    @Value("${app.oauth2-redirect-url}")
    private String oauth2RedirectUrl;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException, ServletException {
        String message = URLEncoder.encode(
                "소셜 로그인에 실패했습니다.",
                StandardCharsets.UTF_8
        );

        response.sendRedirect(oauth2RedirectUrl + "?error=" + message);
    }
}