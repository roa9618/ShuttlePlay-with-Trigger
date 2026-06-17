package com.shuttleplay.server.domain.user.repository;

import com.shuttleplay.server.domain.user.entity.UserNotificationSettings;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserNotificationSettingsRepository extends JpaRepository<UserNotificationSettings, Long> {
    Optional<UserNotificationSettings> findByUserId(Long userId);
}
