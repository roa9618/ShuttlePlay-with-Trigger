package com.shuttleplay.server.domain.group.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.shuttleplay.server.domain.group.entity.GroupSession;
import com.shuttleplay.server.domain.group.enums.GroupSessionType;
import com.shuttleplay.server.domain.group.repository.GroupSessionRepository;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SessionEntryCodeServiceTest {
    @Mock private GroupSessionRepository sessions;

    @Test
    void createsStableEightCharacterCodeWithoutAmbiguousCharacters() {
        when(sessions.existsByEntryCode(anyString())).thenReturn(false);
        SessionEntryCodeService service = new SessionEntryCodeService(sessions);
        GroupSession session = session();

        String first = service.ensureCode(session);
        String second = service.ensureCode(session);

        assertThat(first).matches("[2-9A-HJ-NP-Z]{8}").isEqualTo(second);
        verify(sessions).existsByEntryCode(first);
    }

    @Test
    void regeneratesWhenGeneratedCodeAlreadyExists() {
        when(sessions.existsByEntryCode(anyString())).thenReturn(true, false);
        SessionEntryCodeService service = new SessionEntryCodeService(sessions);

        assertThat(service.ensureCode(session())).matches("[2-9A-HJ-NP-Z]{8}");
        verify(sessions, times(2)).existsByEntryCode(anyString());
    }

    private GroupSession session() {
        LocalDateTime startsAt = LocalDateTime.now().plusDays(1);
        return GroupSession.create(null, "테스트 일정", startsAt, startsAt.plusHours(2), "테스트 체육관",
                startsAt.minusHours(2), GroupSessionType.REGULAR, 2, true, true, true);
    }
}
