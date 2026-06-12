package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.GroupMember;
import com.shuttleplay.server.domain.group.enums.GroupMemberRole;
import com.shuttleplay.server.domain.group.enums.GroupMemberStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    @EntityGraph(attributePaths = {"group", "group.owner"})
    @Query("""
            select gm
            from GroupMember gm
            where gm.user.id = :userId
              and gm.status = :status
              and gm.group.status = com.shuttleplay.server.domain.group.enums.GroupStatus.ACTIVE
              and (:role is null or gm.role = :role)
              and (
                :keyword = ''
                or lower(gm.group.name) like lower(concat('%', :keyword, '%'))
                or lower(gm.group.activityRegion) like lower(concat('%', :keyword, '%'))
                or lower(gm.group.description) like lower(concat('%', :keyword, '%'))
              )
            """)
    Page<GroupMember> findMyGroups(
            @Param("userId") Long userId,
            @Param("status") GroupMemberStatus status,
            @Param("role") GroupMemberRole role,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"group", "group.owner"})
    List<GroupMember> findAllByUserIdAndStatus(Long userId, GroupMemberStatus status);

    @EntityGraph(attributePaths = {"group", "group.owner"})
    Optional<GroupMember> findByGroupIdAndUserIdAndStatus(
            Long groupId,
            Long userId,
            GroupMemberStatus status
    );

    @Query("""
            select gm.group.id as groupId, count(gm.id) as memberCount
            from GroupMember gm
            where gm.group.id in :groupIds
              and gm.status = :status
            group by gm.group.id
            """)
    List<ActiveMemberCount> countActiveMembersByGroupIds(
            @Param("groupIds") List<Long> groupIds,
            @Param("status") GroupMemberStatus status
    );
}
