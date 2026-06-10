package com.shuttleplay.server.domain.auth.oauth;

import com.shuttleplay.server.domain.user.enums.AuthProvider;
import java.util.Map;

public class NaverOAuth2UserInfo extends OAuth2UserInfo {
    private final Map<String, Object> response;

    @SuppressWarnings("unchecked")
    public NaverOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
        this.response = (Map<String, Object>) attributes.get("response");
    }

    @Override
    public AuthProvider getProvider() {
        return AuthProvider.NAVER;
    }

    @Override
    public String getProviderId() {
        return response == null ? null : (String) response.get("id");
    }

    @Override
    public String getEmail() {
        return response == null ? null : (String) response.get("email");
    }

    @Override
    public String getName() {
        if (response == null || response.get("name") == null) {
            return "네이버 사용자";
        }

        return (String) response.get("name");
    }

    @Override
    public String getProfileImageUrl() {
        return response == null ? null : (String) response.get("profile_image");
    }

    @Override
    public String getNameAttributeKey() {
        return "response";
    }
}