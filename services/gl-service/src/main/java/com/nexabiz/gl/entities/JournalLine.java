package com.nexabiz.gl.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "journal_lines")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class JournalLine {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id", nullable = false)
    @JsonIgnore
    private JournalEntry journalEntry;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(nullable = false, precision = 18, scale = 4)
    private BigDecimal debit = BigDecimal.ZERO;

    @Column(nullable = false, precision = 18, scale = 4)
    private BigDecimal credit = BigDecimal.ZERO;

    private String description;

    @Column(name = "entity_id")
    private UUID entityId;

    @Column(name = "entity_type", length = 50)
    private String entityType;
}
