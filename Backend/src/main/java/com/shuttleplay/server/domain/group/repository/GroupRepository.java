package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.Group;
import com.shuttleplay.server.domain.group.enums.GroupStatus;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<Group, Long> {
    Optional<Group> findByIdAndStatus(Long id, GroupStatus status);
}
