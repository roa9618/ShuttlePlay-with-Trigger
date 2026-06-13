package com.shuttleplay.server.domain.group.entity;

import com.shuttleplay.server.domain.group.enums.GroupPostType;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@Table(name = "group_posts")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupPost extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private Group group;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private GroupMember author;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private GroupPostType type;
    @Column(nullable = false, length = 200) private String title;
    @Column(nullable = false, length = 5000) private String content;
    @Column(nullable = false) private boolean pinned;
    @Column(nullable = false) private long viewCount;
    @Column(length = 3000) private String attachmentNames;

    public static GroupPost create(Group group, GroupMember author, GroupPostType type, String title, String content, boolean pinned, String attachmentNames) {
        GroupPost post = new GroupPost();
        post.group = group; post.author = author; post.update(type, title, content, pinned, attachmentNames);
        return post;
    }
    public void update(GroupPostType type, String title, String content, boolean pinned, String attachmentNames) {
        this.type = type; this.title = title; this.content = content; this.pinned = pinned; this.attachmentNames = attachmentNames;
    }
    public void togglePin() { this.pinned = !this.pinned; }
    public void increaseViewCount() { this.viewCount++; }
}
