package com.shuttleplay.server.domain.group.entity;

import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.enums.AgeGroup;
import com.shuttleplay.server.domain.user.enums.Gender;
import com.shuttleplay.server.domain.user.enums.Grade;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@Table(
        name = "group_guest_profiles",
        indexes = @Index(name = "idx_group_guest_profile_group", columnList = "group_id"),
        uniqueConstraints = @UniqueConstraint(name = "uk_group_guest_profile_identity", columnNames = {"group_id", "identity_key"})
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupGuestProfile extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id")
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "identity_key", nullable = false, length = 200)
    private String identityKey;

    @Column(nullable = false, length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AgeGroup ageGroup;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Grade grade;

    @Column(length = 1000)
    private String memo;

    public static GroupGuestProfile create(Group group, User user, String identityKey, String name, Gender gender, AgeGroup ageGroup, Grade grade) {
        GroupGuestProfile profile = new GroupGuestProfile();
        profile.group = group;
        profile.identityKey = identityKey;
        profile.updateProfile(user, name, gender, ageGroup, grade);
        return profile;
    }

    public void updateProfile(User user, String name, Gender gender, AgeGroup ageGroup, Grade grade) {
        this.user = user;
        this.name = name;
        this.gender = gender;
        this.ageGroup = ageGroup;
        this.grade = grade;
    }

    public void updateMemo(String memo) {
        this.memo = memo;
    }
}
