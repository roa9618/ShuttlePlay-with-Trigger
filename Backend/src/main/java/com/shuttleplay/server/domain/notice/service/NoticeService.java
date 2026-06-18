package com.shuttleplay.server.domain.notice.service;

import com.shuttleplay.server.domain.notice.entity.Notice;
import com.shuttleplay.server.domain.notice.repository.NoticeRepository;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.enums.UserRole;
import com.shuttleplay.server.domain.user.repository.UserRepository;
import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {
    private final NoticeRepository notices;
    private final UserRepository users;
    private final SimpMessagingTemplate messaging;

    public Map<String, Object> list(String keyword, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Page<Notice> result = notices.findAllByIsDeletedFalseAndTitleContainingIgnoreCase(
                keyword == null ? "" : keyword.trim(),
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Order.desc("pinned"), Sort.Order.desc("createdAt")))
        );
        return Map.of(
                "items", result.stream().map(this::summary).toList(),
                "page", result.getNumber(),
                "size", result.getSize(),
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages()
        );
    }

    @Transactional
    public Map<String, Object> detail(Long id) {
        Notice notice = find(id);
        notice.increaseViewCount();
        return detailMap(notice);
    }

    @Transactional
    public Map<String, Object> create(Long userId, Map<String, Object> body) {
        User author = admin(userId);
        Notice notice = notices.save(Notice.create(author, text(body, "title"), text(body, "content"), flag(body, "pinned")));
        publish("CREATED", notice.getId());
        return detailMap(notice);
    }

    @Transactional
    public void update(Long userId, Long id, Map<String, Object> body) {
        admin(userId);
        Notice notice = find(id);
        notice.update(text(body, "title"), text(body, "content"), flag(body, "pinned"));
        publish("UPDATED", id);
    }

    @Transactional
    public void delete(Long userId, Long id) {
        admin(userId);
        find(id).softDelete();
        publish("DELETED", id);
    }

    private User admin(Long userId) {
        User user = users.findById(userId).orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (user.getRole() != UserRole.ADMIN) throw new BusinessException(ErrorCode.FORBIDDEN);
        return user;
    }

    private Notice find(Long id) {
        return notices.findByIdAndIsDeletedFalse(id).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
    }

    private String text(Map<String, Object> body, String key) {
        String value = String.valueOf(body.getOrDefault(key, "")).trim();
        if (value.isBlank()) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        if ((key.equals("title") && value.length() > 200) || (key.equals("content") && value.length() > 10000)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        return value;
    }

    private boolean flag(Map<String, Object> body, String key) {
        return Boolean.parseBoolean(String.valueOf(body.getOrDefault(key, false)));
    }

    private Map<String, Object> summary(Notice notice) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", notice.getId());
        item.put("title", notice.getTitle());
        item.put("authorName", notice.getAuthor().getName());
        item.put("pinned", notice.isPinned());
        item.put("viewCount", notice.getViewCount());
        item.put("createdAt", notice.getCreatedAt());
        item.put("updatedAt", notice.getUpdatedAt());
        return item;
    }

    private Map<String, Object> detailMap(Notice notice) {
        Map<String, Object> item = summary(notice);
        item.put("content", notice.getContent());
        return item;
    }

    private void publish(String type, Long noticeId) {
        messaging.convertAndSend("/topic/notices", Map.of("type", type, "noticeId", noticeId));
        messaging.convertAndSend("/topic/admin", Map.of("domain", "NOTICE", "type", type, "noticeId", noticeId));
    }
}
