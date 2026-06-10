package com.shuttleplay.server.domain.auth.oauth;

import com.shuttleplay.server.domain.user.enums.AuthProvider;
import java.util.Map;

public abstract class OAuth2UserInfo {
    protected final Map<String, Object> attributes;

    protected OAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    public abstract AuthProvider getProvider();

    public abstract String getProviderId();

    public abstract String getEmail();

    public abstract String getName();

    public abstract String getProfileImageUrl();

    public abstract String getNameAttributeKey();

    public Map<String, Object> getAttributes() {
        return attributes;
    }
}