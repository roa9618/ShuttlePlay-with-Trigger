package com.shuttleplay.server.domain.group.service;

import com.shuttleplay.server.domain.group.entity.*;
import com.shuttleplay.server.domain.group.enums.*;
import com.shuttleplay.server.domain.group.repository.*;
import com.shuttleplay.server.global.error.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GroupAccessService {
    private final GroupMemberRepository memberRepository;
    private final GroupSessionRepository sessionRepository;
    private final GroupPostRepository postRepository;

    public GroupMember member(Long groupId, Long userId) {
        return memberRepository.findByGroupIdAndUserIdAndStatus(groupId, userId, GroupMemberStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.GROUP_NOT_FOUND));
    }
    public GroupMember manager(Long groupId, Long userId) {
        GroupMember member = member(groupId, userId);
        if (member.getRole() == GroupMemberRole.MEMBER) throw new BusinessException(ErrorCode.FORBIDDEN);
        return member;
    }
    public GroupMember scheduleManager(Long groupId, Long userId) {
        GroupMember member = manager(groupId, userId);
        if (member.getRole() == GroupMemberRole.MANAGER && !member.isSchedulePermission()) throw new BusinessException(ErrorCode.FORBIDDEN);
        return member;
    }
    public GroupMember noticeManager(Long groupId, Long userId) {
        GroupMember member = manager(groupId, userId);
        if (member.getRole() == GroupMemberRole.MANAGER && !member.isNoticePermission()) throw new BusinessException(ErrorCode.FORBIDDEN);
        return member;
    }
    public GroupMember joinRequestManager(Long groupId, Long userId) {
        GroupMember member = manager(groupId, userId);
        if (member.getRole() == GroupMemberRole.MANAGER && !member.isJoinRequestPermission()) throw new BusinessException(ErrorCode.FORBIDDEN);
        return member;
    }
    public GroupMember memberManager(Long groupId, Long userId) {
        GroupMember member = manager(groupId, userId);
        if (member.getRole() == GroupMemberRole.MANAGER && !member.isMemberPermission()) throw new BusinessException(ErrorCode.FORBIDDEN);
        return member;
    }
    public GroupMember postManager(Long groupId, Long userId) {
        GroupMember member = manager(groupId, userId);
        if (member.getRole() == GroupMemberRole.MANAGER && !member.isPostPermission()) throw new BusinessException(ErrorCode.FORBIDDEN);
        return member;
    }
    public GroupMember operationLogManager(Long groupId, Long userId) {
        GroupMember member = manager(groupId, userId);
        if (member.getRole() == GroupMemberRole.MANAGER && !member.isOperationLogPermission()) throw new BusinessException(ErrorCode.FORBIDDEN);
        return member;
    }
    public GroupMember owner(Long groupId, Long userId) {
        GroupMember member = member(groupId, userId);
        if (member.getRole() != GroupMemberRole.OWNER) throw new BusinessException(ErrorCode.FORBIDDEN);
        return member;
    }
    public GroupSession session(Long groupId, Long sessionId) {
        return sessionRepository.findByIdAndGroupIdAndIsDeletedFalse(sessionId, groupId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
    }
    public GroupPost post(Long groupId, Long postId) {
        return postRepository.findByIdAndGroupIdAndIsDeletedFalse(postId, groupId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
    }
    public GroupMember targetMember(Long groupId, Long memberId) {
        GroupMember target = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        if (!target.getGroup().getId().equals(groupId) || target.getStatus() != GroupMemberStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }
        return target;
    }
}
