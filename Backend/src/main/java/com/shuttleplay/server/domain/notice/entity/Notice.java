package com.shuttleplay.server.domain.notice.entity;

import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "notices", indexes = {
        @Index(name = "idx_notices_pinned_created_at", columnList = "pinned,created_at")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notice extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 10000)
    private String content;

    @Column(nullable = false)
    private boolean pinned;

    @Column(nullable = false)
    private long viewCount;

    public static Notice create(User author, String title, String content, boolean pinned) {
        Notice notice = new Notice();
        notice.author = author;
        notice.update(title, content, pinned);
        return notice;
    }

    public void update(String title, String content, boolean pinned) {
        this.title = title.trim();
        this.content = content.trim();
        this.pinned = pinned;
    }

    public void increaseViewCount() {
        viewCount++;
    }
}
