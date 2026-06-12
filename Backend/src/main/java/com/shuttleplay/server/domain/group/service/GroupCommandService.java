package com.shuttleplay.server.domain.group.service;

import com.shuttleplay.server.domain.group.dto.request.CreateGroupRequest;
import com.shuttleplay.server.domain.group.dto.response.CreateGroupResponse;
import com.shuttleplay.server.domain.group.entity.Group;
import com.shuttleplay.server.domain.group.entity.GroupMember;
import com.shuttleplay.server.domain.group.repository.GroupMemberRepository;
import com.shuttleplay.server.domain.group.repository.GroupRepository;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.repository.UserRepository;
import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class GroupCommandService {
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    public CreateGroupResponse createGroup(Long userId, CreateGroupRequest request) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Group group = groupRepository.save(Group.create(
                owner,
                request.getName().trim(),
                trimToNull(request.getProfileImageUrl()),
                request.getActivityRegion().trim(),
                request.getDescription().trim(),
                trimToNull(request.getOperationNotice())
        ));
        groupMemberRepository.save(GroupMember.createOwner(group, owner));

        return CreateGroupResponse.from(group);
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
