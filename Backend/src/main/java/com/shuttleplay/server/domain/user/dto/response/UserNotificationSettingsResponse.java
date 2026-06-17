package com.shuttleplay.server.domain.user.dto.response;

import com.shuttleplay.server.domain.user.entity.UserNotificationSettings;
import lombok.Builder;
import lombok.Getter;

@Getter
public class UserNotificationSettingsResponse {
    private final boolean nextMatchEnabled;
    private final boolean matchStartEnabled;
    private final boolean courtChangeEnabled;
    private final boolean resultRequestEnabled;
    private final boolean scheduleChangeEnabled;

    @Builder
    private UserNotificationSettingsResponse(
            boolean nextMatchEnabled,
            boolean matchStartEnabled,
            boolean courtChangeEnabled,
            boolean resultRequestEnabled,
            boolean scheduleChangeEnabled
    ) {
        this.nextMatchEnabled = nextMatchEnabled;
        this.matchStartEnabled = matchStartEnabled;
        this.courtChangeEnabled = courtChangeEnabled;
        this.resultRequestEnabled = resultRequestEnabled;
        this.scheduleChangeEnabled = scheduleChangeEnabled;
    }

    public static UserNotificationSettingsResponse from(UserNotificationSettings settings) {
        return UserNotificationSettingsResponse.builder()
                .nextMatchEnabled(settings.isNextMatchEnabled())
                .matchStartEnabled(settings.isMatchStartEnabled())
                .courtChangeEnabled(settings.isCourtChangeEnabled())
                .resultRequestEnabled(settings.isResultRequestEnabled())
                .scheduleChangeEnabled(settings.isScheduleChangeEnabled())
                .build();
    }
}
