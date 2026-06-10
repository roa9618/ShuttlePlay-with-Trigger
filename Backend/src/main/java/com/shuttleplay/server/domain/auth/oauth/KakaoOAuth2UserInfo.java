package com.shuttleplay.server.domain.auth.oauth;

import com.shuttleplay.server.domain.user.enums.AuthProvider;
import java.util.Map;

public class KakaoOAuth2UserInfo extends OAuth2UserInfo {
    private final Map<String, Object> kakaoAccount;
    private final Map<String, Object> profile;

    @SuppressWarnings("unchecked")
    public KakaoOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
        this.kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        this.profile = kakaoAccount == null
                ? null
                : (Map<String, Object>) kakaoAccount.get("profile");
    }

    @Override
    public AuthProvider getProvider() {
        return AuthProvider.KAKAO;
    }

    @Override
    public String getProviderId() {
        return String.valueOf(attributes.get("id"));
    }

    @Override
    public String getEmail() {
        if (kakaoAccount == null) {
            return null;
        }

        return (String) kakaoAccount.get("email");
    }

    @Override
    public String getName() {
        return "카카오 사용자";
    }

    @Override
    public String getProfileImageUrl() {
        if (profile == null) {
            return null;
        }

        return (String) profile.get("profile_image_url");
    }

    @Override
    public String getNameAttributeKey() {
        return "id";
    }
}