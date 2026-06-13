package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.GroupPost;
import com.shuttleplay.server.domain.group.enums.GroupPostType;
import java.util.Optional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;

public interface GroupPostRepository extends JpaRepository<GroupPost, Long> {
    @EntityGraph(attributePaths = {"author", "author.user"})
    Page<GroupPost> findAllByGroupIdAndTypeAndTitleContainingIgnoreCaseAndIsDeletedFalse(Long groupId, GroupPostType type, String keyword, Pageable pageable);
    @EntityGraph(attributePaths = {"author", "author.user"})
    Page<GroupPost> findAllByGroupIdAndTitleContainingIgnoreCaseAndIsDeletedFalse(Long groupId, String keyword, Pageable pageable);
    @EntityGraph(attributePaths = {"author", "author.user"})
    Optional<GroupPost> findByIdAndGroupIdAndIsDeletedFalse(Long id, Long groupId);
}
