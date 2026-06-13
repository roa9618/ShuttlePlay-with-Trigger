package com.shuttleplay.server.domain.group.entity;

import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@Table(name = "group_comments")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupComment extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private GroupPost post;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private GroupMember author;
    @ManyToOne(fetch = FetchType.LAZY) private GroupComment parent;
    @Column(nullable = false, length = 1000) private String content;
    public static GroupComment create(GroupPost post, GroupMember author, GroupComment parent, String content) {
        GroupComment comment = new GroupComment(); comment.post = post; comment.author = author; comment.parent = parent; comment.content = content; return comment;
    }
    public void update(String content) { this.content = content; }
}
