package com.shuttleplay.server.domain.group.service;

import com.shuttleplay.server.domain.group.dto.request.CreateGroupRequest;
import com.shuttleplay.server.domain.group.dto.response.CreateGroupResponse;
import com.shuttleplay.server.domain.group.entity.Group;
import com.shuttleplay.server.domain.group.entity.GroupMember;
import com.shuttleplay.server.domain.group.repository.GroupMemberRepository;
import com.shuttleplay.server.domain.group.repository.GroupRepository;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.repository.UserRepository;
import com.shuttleplay.server.domain.notification.enums.NotificationType;
import com.shuttleplay.server.domain.notification.service.NotificationService;
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
    private final NotificationService notificationService;

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
        notificationService.send(
                owner,
                NotificationType.GROUP,
                "모임 생성이 완료되었습니다",
                group.getName() + " 모임을 바로 운영할 수 있습니다.",
                "/groups/" + group.getId()
        );

        return CreateGroupResponse.from(group);
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
