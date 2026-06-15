package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.GroupGuestProfile;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface GroupGuestProfileRepository extends JpaRepository<GroupGuestProfile, Long> {
    Optional<GroupGuestProfile> findByGroup_IdAndIdentityKey(Long groupId, String identityKey);

    Optional<GroupGuestProfile> findByIdAndGroup_Id(Long id, Long groupId);

    @EntityGraph(attributePaths = {"group", "user"})
    @Query("""
            select guest from GroupGuestProfile guest
            where guest.group.id = :groupId
              and (:keyword = '' or lower(guest.name) like lower(concat('%', :keyword, '%')))
              and (:registered is null
                   or (:registered = true and guest.user is not null)
                   or (:registered = false and guest.user is null))
            order by guest.updatedAt desc, guest.id desc
            """)
    Page<GroupGuestProfile> findGroupGuests(Long groupId, String keyword, Boolean registered, Pageable pageable);
}
