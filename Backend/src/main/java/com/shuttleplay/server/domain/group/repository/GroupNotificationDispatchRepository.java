package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.GroupNotificationDispatch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupNotificationDispatchRepository extends JpaRepository<GroupNotificationDispatch, Long> {
    boolean existsByEventKeyAndUserId(String eventKey, Long userId);
}
