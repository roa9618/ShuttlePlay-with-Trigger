package com.shuttleplay.server.domain.group.service;

import java.time.LocalDateTime;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GroupEventService {
    private final SimpMessagingTemplate messagingTemplate;
    public void group(Long id, String type) { send("/topic/groups/" + id, type); }
    public void sessions(Long id, String type) { send("/topic/groups/" + id + "/sessions", type); }
    public void posts(Long id, String type) { send("/topic/groups/" + id + "/posts", type); }
    public void members(Long id, String type) { send("/topic/groups/" + id + "/members", type); }
    public void joinRequests(Long id, String type) { send("/topic/groups/" + id + "/join-requests", type); }
    private void send(String destination, String type) {
        messagingTemplate.convertAndSend(destination, Map.of("type", type, "occurredAt", LocalDateTime.now()));
    }
}
