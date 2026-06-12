package com.shuttleplay.server.domain.group.repository;

public interface ActiveMemberCount {
    Long getGroupId();

    long getMemberCount();
}
