package com.shuttleplay.server.domain.notification.dto.response;

public record WebPushConfigResponse(boolean enabled, String publicKey) {
}
