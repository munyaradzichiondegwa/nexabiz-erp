package com.nexabiz.gl.events;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class GlPostedEvent {
    private String eventType;
    private String tenantId;
    private String correlationId;
    private String journalEntryId;
    private String ref;
    private Instant timestamp;

    public static GlPostedEvent of(String tenantId, String correlationId, String journalEntryId, String ref) {
        return GlPostedEvent.builder()
            .eventType("GL_POSTED")
            .tenantId(tenantId)
            .correlationId(correlationId)
            .journalEntryId(journalEntryId)
            .ref(ref)
            .timestamp(Instant.now())
            .build();
    }
}
