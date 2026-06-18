package com.shuttleplay.server.domain.record.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.shuttleplay.server.domain.group.entity.Group;
import com.shuttleplay.server.domain.group.entity.GroupSession;
import com.shuttleplay.server.domain.record.dto.MatchRecordPageResponse;
import com.shuttleplay.server.domain.record.dto.MyRecordSummaryResponse;
import com.shuttleplay.server.domain.record.entity.MatchPlayer;
import com.shuttleplay.server.domain.record.entity.MatchRecord;
import com.shuttleplay.server.domain.record.enums.MatchType;
import com.shuttleplay.server.domain.record.repository.MatchPlayerRepository;
import com.shuttleplay.server.domain.record.repository.MmrHistoryRepository;
import com.shuttleplay.server.domain.record.repository.SessionAttendanceRepository;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.enums.AgeGroup;
import com.shuttleplay.server.domain.user.enums.Gender;
import com.shuttleplay.server.domain.user.enums.Grade;
import com.shuttleplay.server.domain.user.repository.UserRepository;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

@ExtendWith(MockitoExtension.class)
class MyRecordServiceTest {
    @Mock private UserRepository users;
    @Mock private MatchPlayerRepository matchPlayers;
    @Mock private SessionAttendanceRepository attendances;
    @Mock private MmrHistoryRepository mmrHistories;

    private MyRecordService service;
    private User user;

    @BeforeEach
    void setUp() {
        service = new MyRecordService(users, matchPlayers, attendances, mmrHistories);
        user = mock(User.class);
        when(users.findById(1L)).thenReturn(Optional.of(user));
    }

    @Test
    void summaryReturnsProfileAndEmptyStatisticsWhenThereAreNoRecords() {
        when(user.getCreatedAt()).thenReturn(LocalDateTime.of(2026, 1, 1, 0, 0));
        when(user.getName()).thenReturn("홍길동");
        when(user.getGender()).thenReturn(Gender.MALE);
        when(user.getAgeGroup()).thenReturn(AgeGroup.TWENTIES);
        when(user.getGrade()).thenReturn(Grade.C);
        when(user.getDoublesMmr()).thenReturn(1100);
        when(user.getMixedMmr()).thenReturn(1100);
        when(matchPlayers.findUserMatchRecords(1L)).thenReturn(List.of());
        when(attendances.findAllByUserIdAndAttendedAtBetweenAndIsDeletedFalseOrderByAttendedAtAsc(
                eq(1L), any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(List.of());
        when(mmrHistories.findAllByUserIdAndMmrTypeAndChangedAtBetweenAndIsDeletedFalseOrderByChangedAtAsc(
                eq(1L), any(), any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(List.of());

        MyRecordSummaryResponse response = service.summary(1L, YearMonth.of(2026, 6));

        assertThat(response.profile().name()).isEqualTo("홍길동");
        assertThat(response.profile().gender()).isEqualTo("MALE");
        assertThat(response.mmr().doubles()).isEqualTo(1100);
        assertThat(response.mmr().mixed()).isEqualTo(1100);
        assertThat(response.today().hasRecord()).isFalse();
        assertThat(response.month().matches()).isZero();
        assertThat(response.recentMatches()).isEmpty();
        assertThat(response.groups()).isEmpty();
    }

    @Test
    @SuppressWarnings("unchecked")
    void matchesUsesDatabasePaginationAndMapsARecord() {
        MatchPlayer player = player(1L, "홍길동", 1);
        MatchPlayer partner = player(2L, "파트너", 1);
        MatchPlayer opponentA = player(3L, "상대1", 2);
        MatchPlayer opponentB = player(4L, "상대2", 2);
        MatchRecord match = mock(MatchRecord.class);
        GroupSession session = mock(GroupSession.class);
        Group group = mock(Group.class);

        when(player.getMatch()).thenReturn(match);
        when(match.getId()).thenReturn(15L);
        when(match.getMatchType()).thenReturn(MatchType.MENS_DOUBLES);
        when(match.getPlayedAt()).thenReturn(LocalDateTime.of(2026, 6, 18, 19, 0));
        when(match.getTeamAScore()).thenReturn(21);
        when(match.getTeamBScore()).thenReturn(17);
        when(match.getPlayers()).thenReturn(List.of(player, partner, opponentA, opponentB));
        when(match.getSession()).thenReturn(session);
        when(session.getId()).thenReturn(7L);
        when(session.getTitle()).thenReturn("목요일 정기 운동");
        when(session.getGroup()).thenReturn(group);
        when(group.getId()).thenReturn(3L);
        when(group.getName()).thenReturn("셔틀 모임");
        when(matchPlayers.findAll(any(Specification.class), any(Pageable.class))).thenAnswer(invocation -> {
            Pageable pageable = invocation.getArgument(1);
            return new PageImpl<>(List.of(player), pageable, 1);
        });

        MatchRecordPageResponse response = service.matches(1L, -1, 100, null, null, null, null, null);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(matchPlayers).findAll(any(Specification.class), pageableCaptor.capture());
        assertThat(pageableCaptor.getValue().getPageNumber()).isZero();
        assertThat(pageableCaptor.getValue().getPageSize()).isEqualTo(50);
        assertThat(response.totalElements()).isEqualTo(1);
        assertThat(response.items()).singleElement().satisfies(item -> {
            assertThat(item.id()).isEqualTo(15L);
            assertThat(item.win()).isTrue();
            assertThat(item.partner()).isEqualTo("파트너");
            assertThat(item.opponents()).containsExactly("상대1", "상대2");
            assertThat(item.groupName()).isEqualTo("셔틀 모임");
        });
    }

    private MatchPlayer player(Long id, String name, int teamNumber) {
        MatchPlayer player = mock(MatchPlayer.class);
        User participant = mock(User.class);
        when(player.getUser()).thenReturn(participant);
        when(player.getTeamNumber()).thenReturn(teamNumber);
        lenient().when(participant.getId()).thenReturn(id);
        lenient().when(participant.getName()).thenReturn(name);
        return player;
    }
}
