package com.nexabiz.gl.repositories;

import com.nexabiz.gl.entities.JournalEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, UUID> {
    Page<JournalEntry> findByTenantIdOrderByDateDescCreatedAtDesc(UUID tenantId, Pageable pageable);
    List<JournalEntry> findByTenantIdAndDateBetweenOrderByDateDesc(UUID tenantId, LocalDate from, LocalDate to);

    @Query("SELECT je FROM JournalEntry je WHERE je.tenantId = :tenantId AND je.source = :source AND je.sourceId = :sourceId")
    List<JournalEntry> findBySourceAndSourceId(UUID tenantId, String source, UUID sourceId);
}
