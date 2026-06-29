package com.nexabiz.hr.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payroll_runs")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PayrollRun {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false, length = 20)
    private String period;

    @Column(nullable = false)
    private Short year;

    @Column(name = "total_gross", nullable = false, precision = 14, scale = 4)
    private BigDecimal totalGross = BigDecimal.ZERO;

    @Column(name = "total_deductions", nullable = false, precision = 14, scale = 4)
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    @Column(name = "total_net", nullable = false, precision = 14, scale = 4)
    private BigDecimal totalNet = BigDecimal.ZERO;

    @Column(name = "employee_count", nullable = false)
    private Integer employeeCount = 0;

    @Column(name = "gl_ref")
    private UUID glRef;

    @Column(nullable = false, length = 20)
    private String status = "draft";

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "processed_by")
    private UUID processedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
