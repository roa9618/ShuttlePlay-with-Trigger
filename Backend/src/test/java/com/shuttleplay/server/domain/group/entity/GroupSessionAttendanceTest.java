package com.shuttleplay.server.domain.group.entity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.shuttleplay.server.domain.group.enums.SessionPlayStatus;
import com.shuttleplay.server.domain.user.entity.User;
import org.junit.jupiter.api.Test;

class GroupSessionAttendanceTest {

    @Test
    void reentryDoesNotOverwriteActivePlayStatus() {
        GroupSessionAttendance calling = attendance();
        calling.arrive();
        calling.call();
        calling.arrive();
        assertThat(calling.getPlayStatus()).isEqualTo(SessionPlayStatus.CALLING);

        GroupSessionAttendance nextUp = attendance();
        nextUp.arrive();
        nextUp.schedule();
        nextUp.arrive();
        assertThat(nextUp.getPlayStatus()).isEqualTo(SessionPlayStatus.NEXT_UP);

        GroupSessionAttendance playing = attendance();
        playing.arrive();
        playing.startPlaying();
        playing.arrive();
        assertThat(playing.getPlayStatus()).isEqualTo(SessionPlayStatus.PLAYING);
    }

    @Test
    void waitingForNextMatchCountsAsRestButPlayingDoesNot() {
        GroupSessionAttendance nextUp = attendance();
        nextUp.arrive();
        nextUp.schedule();
        nextUp.countRest();
        assertThat(nextUp.getConsecutiveRestCount()).isEqualTo(1);
        assertThat(nextUp.getConsecutivePlayCount()).isZero();
        assertThat(nextUp.getPlayStatus()).isEqualTo(SessionPlayStatus.NEXT_UP);

        GroupSessionAttendance playing = attendance();
        playing.arrive();
        playing.startPlaying();
        playing.countRest();
        assertThat(playing.getConsecutiveRestCount()).isZero();
        assertThat(playing.getPlayStatus()).isEqualTo(SessionPlayStatus.PLAYING);
    }

    private GroupSessionAttendance attendance() {
        GroupMember member = mock(GroupMember.class);
        User user = mock(User.class);
        when(member.getUser()).thenReturn(user);
        return GroupSessionAttendance.forMember(mock(GroupSession.class), member);
    }
}
