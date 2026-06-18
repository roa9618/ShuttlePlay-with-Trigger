package com.shuttleplay.server.domain.group.service;

import com.shuttleplay.server.domain.group.entity.GroupSession;
import com.shuttleplay.server.domain.group.repository.GroupSessionRepository;
import java.security.SecureRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SessionEntryCodeService {
    private static final char[] CHARACTERS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ".toCharArray();
    private static final SecureRandom RANDOM = new SecureRandom();
    private final GroupSessionRepository sessions;

    public String ensureCode(GroupSession session) {
        if (session.getEntryCode() != null && !session.getEntryCode().isBlank()) return session.getEntryCode();
        String code;
        do { code = generate(); } while (sessions.existsByEntryCode(code));
        session.assignEntryCode(code);
        return code;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String ensurePersistedCode(Long sessionId) {
        GroupSession session = sessions.findByIdAndIsDeletedFalse(sessionId).orElseThrow();
        return ensureCode(session);
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void backfillMissingCodes() {
        sessions.findAllByEntryCodeIsNullAndIsDeletedFalse().forEach(this::ensureCode);
    }

    private String generate() {
        StringBuilder result = new StringBuilder(8);
        for (int index = 0; index < 8; index++) result.append(CHARACTERS[RANDOM.nextInt(CHARACTERS.length)]);
        return result.toString();
    }
}
