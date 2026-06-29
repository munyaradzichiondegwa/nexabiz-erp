package com.nexabiz.gl.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "journal_entries")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class JournalEntry {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(length = 50)
    private String ref;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String description;

    @Column(name = "total_debit", nullable = false, precision = 18, scale = 4)
    private BigDecimal totalDebit = BigDecimal.ZERO;

    @Column(name = "total_credit", nullable = false, precision = 18, scale = 4)
    private BigDecimal totalCredit = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    private String status = "posted";

    @Column(nullable = false, length = 50)
    private String source;

    @Column(name = "source_id")
    private UUID sourceId;

    @Column(name = "correlation_id")
    private UUID correlationId;

    @Column(name = "posted_at")
    private LocalDateTime postedAt;

    @Column(name = "posted_by")
    private UUID postedBy;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "journalEntry", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @Builder.Default
    private List<JournalLine> lines = new ArrayList<>();
}
