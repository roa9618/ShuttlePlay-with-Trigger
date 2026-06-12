package com.shuttleplay.server.domain.auth.repository;

import com.shuttleplay.server.domain.auth.entity.RefreshToken;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    List<RefreshToken> findAllByUserIdAndRevokedFalse(Long userId);

    void deleteByUserId(Long userId);
}
