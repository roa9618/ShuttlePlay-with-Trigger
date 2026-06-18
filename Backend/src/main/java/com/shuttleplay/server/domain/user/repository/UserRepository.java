package com.shuttleplay.server.domain.user.repository;

import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.enums.AgeGroup;
import com.shuttleplay.server.domain.user.enums.AuthProvider;
import com.shuttleplay.server.domain.user.enums.Gender;
import com.shuttleplay.server.domain.user.enums.Grade;
import com.shuttleplay.server.domain.user.enums.UserStatus;
import com.shuttleplay.server.domain.user.enums.UserRole;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndProvider(String email, AuthProvider provider);

    Optional<User> findByProviderAndProviderId(AuthProvider provider, String providerId);

    boolean existsByEmail(String email);

    boolean existsByEmailAndProvider(String email, AuthProvider provider);

    boolean existsByEmailAndProviderAndStatusNot(String email, AuthProvider provider, UserStatus status);

    long countByStatus(UserStatus status);

    long countByRoleAndStatus(UserRole role, UserStatus status);

    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    List<User> findAllByNameIgnoreCaseAndGenderAndAgeGroupAndGradeAndStatus(
            String name,
            Gender gender,
            AgeGroup ageGroup,
            Grade grade,
            UserStatus status
    );
}
