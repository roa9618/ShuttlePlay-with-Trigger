package com.shuttleplay.server.domain.notification.repository;

import com.shuttleplay.server.domain.notification.entity.PushSubscription;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    List<PushSubscription> findAllByUserId(Long userId);

    Optional<PushSubscription> findByEndpointHash(String endpointHash);

    @Modifying
    @Transactional
    void deleteByEndpointHash(String endpointHash);

    @Modifying
    @Transactional
    void deleteByEndpointHashAndUserId(String endpointHash, Long userId);
}
