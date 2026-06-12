package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<Group, Long> {
}
