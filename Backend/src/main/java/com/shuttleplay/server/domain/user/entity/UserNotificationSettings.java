package com.shuttleplay.server.domain.user.entity;

import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "user_notification_settings")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserNotificationSettings extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private boolean nextMatchEnabled;

    @Column(nullable = false)
    private boolean matchStartEnabled;

    @Column(nullable = false)
    private boolean courtChangeEnabled;

    @Column(nullable = false)
    private boolean resultRequestEnabled;

    @Column(nullable = false)
    private boolean scheduleChangeEnabled;

    private UserNotificationSettings(User user) {
        this.user = user;
        this.nextMatchEnabled = true;
        this.matchStartEnabled = true;
        this.courtChangeEnabled = true;
        this.resultRequestEnabled = true;
        this.scheduleChangeEnabled = true;
    }

    public static UserNotificationSettings createDefault(User user) {
        return new UserNotificationSettings(user);
    }

    public void update(
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
}
