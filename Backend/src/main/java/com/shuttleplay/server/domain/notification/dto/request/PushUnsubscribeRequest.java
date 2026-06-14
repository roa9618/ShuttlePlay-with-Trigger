package com.shuttleplay.server.domain.notification.dto.request;

import jakarta.validation.constraints.NotBlank;

public record PushUnsubscribeRequest(@NotBlank String endpoint) {
}
