package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.GroupComment;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface GroupCommentRepository extends JpaRepository<GroupComment, Long> {
    @EntityGraph(attributePaths = {"author", "author.user", "parent"})
    List<GroupComment> findAllByPostIdAndIsDeletedFalseOrderByCreatedAtAsc(Long postId);
    long countByPostIdAndIsDeletedFalse(Long postId);
    Optional<GroupComment> findByIdAndPostIdAndIsDeletedFalse(Long id, Long postId);
}
