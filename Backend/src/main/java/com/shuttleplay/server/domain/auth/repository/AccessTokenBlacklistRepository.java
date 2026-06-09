package com.shuttleplay.server.domain.auth.repository;

import com.shuttleplay.server.domain.auth.entity.AccessTokenBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccessTokenBlacklistRepository extends JpaRepository<AccessTokenBlacklist, Long> {
    boolean existsByToken(String token);
}