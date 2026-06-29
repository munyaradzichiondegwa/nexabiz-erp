package com.nexabiz.gl.controllers;

import com.nexabiz.gl.entities.Account;
import com.nexabiz.gl.entities.JournalEntry;
import com.nexabiz.gl.repositories.AccountRepository;
import com.nexabiz.gl.repositories.JournalEntryRepository;
import com.nexabiz.gl.services.GlPostingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class GlController {

    private final AccountRepository accountRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final GlPostingService glPostingService;

    // Chart of Accounts
    @GetMapping("/accounting/coa")
    public ResponseEntity<List<Account>> getChartOfAccounts(@RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(accountRepository.findByTenantIdAndIsActiveTrue(tenantId));
    }

    // General Ledger
    @GetMapping("/accounting/gl")
    public ResponseEntity<?> getGLEntries(
        @RequestHeader("X-Tenant-ID") UUID tenantId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<JournalEntry> result = journalEntryRepository.findByTenantIdOrderByDateDescCreatedAtDesc(tenantId, pageable);
        return ResponseEntity.ok(Map.of("entries", result.getContent(), "total", result.getTotalElements(), "page", page));
    }

    // Manual journal entry
    @PostMapping("/accounting/journal")
    public ResponseEntity<JournalEntry> postJournalEntry(
        @RequestHeader("X-Tenant-ID") UUID tenantId,
        @RequestHeader("X-User-ID") UUID userId,
        @RequestBody Map<String, Object> body
    ) {
        JournalEntry entry = glPostingService.postManualJournal(tenantId, userId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(entry);
    }
}
