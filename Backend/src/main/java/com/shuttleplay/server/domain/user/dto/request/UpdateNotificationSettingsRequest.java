package com.shuttleplay.server.domain.user.dto.request;

import jakarta.validation.constraints.NotNull;

public record UpdateNotificationSettingsRequest(
        @NotNull(message = "다음 경기 배정 알림 설정은 필수입니다.")
        Boolean nextMatchEnabled,

        @NotNull(message = "경기 시작 알림 설정은 필수입니다.")
        Boolean matchStartEnabled,

        @NotNull(message = "코트 이동/상태 변경 알림 설정은 필수입니다.")
        Boolean courtChangeEnabled,

        @NotNull(message = "결과 입력 요청 알림 설정은 필수입니다.")
        Boolean resultRequestEnabled,

        @NotNull(message = "모임/일정 변경 알림 설정은 필수입니다.")
        Boolean scheduleChangeEnabled
) {
}
