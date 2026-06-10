package com.shuttleplay.server.domain.auth.oauth;

import com.shuttleplay.server.domain.user.enums.AuthProvider;
import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import java.util.Map;

public final class OAuth2UserInfoFactory {
    private OAuth2UserInfoFactory() {
    }

    public static OAuth2UserInfo create(String registrationId, Map<String, Object> attributes) {
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

        if (provider == AuthProvider.GOOGLE) {
            return new GoogleOAuth2UserInfo(attributes);
        }

        if (provider == AuthProvider.KAKAO) {
            return new KakaoOAuth2UserInfo(attributes);
        }

        if (provider == AuthProvider.NAVER) {
            return new NaverOAuth2UserInfo(attributes);
        }

        throw new BusinessException(ErrorCode.INVALID_REQUEST);
    }
}