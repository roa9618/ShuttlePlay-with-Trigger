package com.shuttleplay.server.domain.group.service;

import java.time.LocalDateTime;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class GroupEventService {
    private final SimpMessagingTemplate messagingTemplate;
    public void group(Long id, String type) { send("/topic/groups/" + id, type, true); }
    public void sessions(Long id, String type) { send("/topic/groups/" + id + "/sessions", type, true); }
    public void posts(Long id, String type) { send("/topic/groups/" + id + "/posts", type, true); }
    public void members(Long id, String type) { send("/topic/groups/" + id + "/members", type, true); }
    public void joinRequests(Long id, String type) { send("/topic/groups/" + id + "/join-requests", type, true); }
    public void session(Long groupId, Long sessionId, String type) {
        send("/topic/groups/" + groupId + "/sessions", type, false);
        send("/topic/sessions/" + sessionId, type, true);
    }
    private void send(String destination, String type, boolean notifyAdmin) {
        Runnable dispatch = () -> {
            LocalDateTime occurredAt = LocalDateTime.now();
            messagingTemplate.convertAndSend(destination, Map.of("type", type, "occurredAt", occurredAt));
            if (notifyAdmin) messagingTemplate.convertAndSend("/topic/admin", Map.of("domain", "GROUP", "type", type, "occurredAt", occurredAt));
        };
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { dispatch.run(); }
            });
        } else dispatch.run();
    }
}
