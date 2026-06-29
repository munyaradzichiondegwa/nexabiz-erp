package com.nexabiz.gl.services;

import com.nexabiz.gl.entities.*;
import com.nexabiz.gl.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GlPostingService {

    private final AccountRepository accountRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Transactional
    public JournalEntry postManualJournal(UUID tenantId, UUID userId, Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rawLines = (List<Map<String, Object>>) body.get("lines");

        List<JournalLine> lines = new ArrayList<>();
        BigDecimal totalDebit  = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;

        for (Map<String, Object> l : rawLines) {
            BigDecimal dr = new BigDecimal(l.get("debit").toString());
            BigDecimal cr = new BigDecimal(l.get("credit").toString());
            String accountId = l.get("accountId").toString();

            Account account = accountRepository.findByTenantIdAndCode(tenantId, accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountId));

            JournalLine line = JournalLine.builder()
                .accountId(account.getId())
                .debit(dr)
                .credit(cr)
                .description((String) l.getOrDefault("description", ""))
                .build();
            lines.add(line);
            totalDebit  = totalDebit.add(dr);
            totalCredit = totalCredit.add(cr);
        }

        // Enforce double-entry balance
        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new IllegalArgumentException(
                String.format("Journal entry is not balanced: DR=%.4f CR=%.4f", totalDebit, totalCredit)
            );
        }

        String ref = body.containsKey("ref") ? body.get("ref").toString()
            : "JE-" + System.currentTimeMillis();

        JournalEntry entry = JournalEntry.builder()
            .tenantId(tenantId)
            .ref(ref)
            .date(LocalDate.parse(body.get("date").toString()))
            .description(body.get("description").toString())
            .totalDebit(totalDebit)
            .totalCredit(totalCredit)
            .status("posted")
            .source("manual")
            .postedAt(LocalDateTime.now())
            .postedBy(userId)
            .build();

        entry.getLines().forEach(l -> l.setJournalEntry(entry));
        lines.forEach(l -> {
            l.setJournalEntry(entry);
            entry.getLines().add(l);
        });

        JournalEntry saved = journalEntryRepository.save(entry);

        // Broadcast GL_POSTED event
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "GL_POSTED");
        event.put("tenantId", tenantId.toString());
        event.put("journalEntryId", saved.getId().toString());
        event.put("ref", ref);
        event.put("timestamp", java.time.Instant.now().toString());
        kafkaTemplate.send("nexabiz.gl.posting.results", tenantId.toString(), event);

        log.info("[GL] Manual journal {} posted by {} DR={} CR={}", ref, userId, totalDebit, totalCredit);
        return saved;
    }
}
