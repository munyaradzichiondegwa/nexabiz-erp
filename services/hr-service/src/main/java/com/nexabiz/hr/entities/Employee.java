package com.nexabiz.hr.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "employees", schema = "public",
    uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "employee_number"}))
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    @NotNull
    private UUID tenantId;

    @Column(name = "employee_number", nullable = false, length = 50)
    @NotBlank
    private String employeeNumber;

    @Column(name = "first_name", nullable = false, length = 100)
    @NotBlank @Size(max = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    @NotBlank @Size(max = 100)
    private String lastName;

    @Column(length = 320)
    @Email
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(length = 200)
    private String role;

    @Column(length = 200)
    private String department;

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(nullable = false, precision = 14, scale = 4)
    @DecimalMin("0")
    private BigDecimal salary = BigDecimal.ZERO;

    @Column(name = "pay_frequency", length = 20)
    private String payFrequency = "monthly";

    @Column(name = "tax_code", length = 50)
    private String taxCode;

    @Column(name = "bank_account", length = 100)
    private String bankAccount;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "national_id", length = 100)
    private String nationalId;

    @Column(name = "start_date", nullable = false)
    @NotNull
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(nullable = false, length = 20)
    @NotNull
    private String status = "active";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
