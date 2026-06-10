package com.shuttleplay.server.domain.auth.handler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
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
        log.error("OAuth2 로그인 실패 - requestUri: {}", request.getRequestURI(), exception);

        String message = "소셜 로그인에 실패했습니다.";

        if (exception instanceof OAuth2AuthenticationException oauth2Exception) {
            log.error(
                    "OAuth2 에러 코드: {}, 설명: {}",
                    oauth2Exception.getError().getErrorCode(),
                    oauth2Exception.getError().getDescription()
            );

            if (StringUtils.hasText(oauth2Exception.getError().getDescription())) {
                message = oauth2Exception.getError().getDescription();
            }
        }

        response.sendRedirect(oauth2RedirectUrl + "?error=" + encode(message));
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}