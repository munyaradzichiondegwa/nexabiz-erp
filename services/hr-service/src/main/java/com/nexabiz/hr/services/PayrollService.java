package com.nexabiz.hr.services;

import com.nexabiz.hr.entities.Employee;
import com.nexabiz.hr.entities.PayrollRun;
import com.nexabiz.hr.repositories.EmployeeRepository;
import com.nexabiz.hr.repositories.PayrollRunRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayrollService {

    private final EmployeeRepository employeeRepository;
    private final PayrollRunRepository payrollRunRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Zimbabwe PAYE tax brackets (simplified — 2025 rates)
    private static BigDecimal calculatePAYE(BigDecimal annualSalary) {
        // Simplified ZIMRA PAYE calculation
        BigDecimal monthly = annualSalary;
        if (monthly.compareTo(BigDecimal.valueOf(700)) <= 0) return BigDecimal.ZERO;
        if (monthly.compareTo(BigDecimal.valueOf(2000)) <= 0)
            return monthly.subtract(BigDecimal.valueOf(700)).multiply(BigDecimal.valueOf(0.20));
        if (monthly.compareTo(BigDecimal.valueOf(5000)) <= 0)
            return BigDecimal.valueOf(260).add(monthly.subtract(BigDecimal.valueOf(2000)).multiply(BigDecimal.valueOf(0.25)));
        return BigDecimal.valueOf(1010).add(monthly.subtract(BigDecimal.valueOf(5000)).multiply(BigDecimal.valueOf(0.30)));
    }

    private static BigDecimal calculateNSSA(BigDecimal salary) {
        // NSSA: 3.5% employee, capped at $700/month
        BigDecimal nssa = salary.multiply(BigDecimal.valueOf(0.035));
        return nssa.min(BigDecimal.valueOf(700)).setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public PayrollRun runPayroll(UUID tenantId, String period, short year, UUID processedBy) {
        // Prevent duplicate payroll runs
        if (payrollRunRepository.existsByTenantIdAndPeriodAndYear(tenantId, period, year)) {
            throw new IllegalStateException("Payroll already processed for " + period + " " + year);
        }

        List<Employee> activeEmployees = employeeRepository
            .findByTenantIdAndStatus(tenantId, "active", org.springframework.data.domain.Pageable.unpaged())
            .getContent();

        if (activeEmployees.isEmpty()) {
            throw new IllegalStateException("No active employees found for tenant " + tenantId);
        }

        BigDecimal totalGross       = BigDecimal.ZERO;
        BigDecimal totalDeductions  = BigDecimal.ZERO;
        BigDecimal totalNet         = BigDecimal.ZERO;

        for (Employee emp : activeEmployees) {
            BigDecimal gross      = emp.getSalary();
            BigDecimal paye       = calculatePAYE(gross);
            BigDecimal nssa       = calculateNSSA(gross);
            BigDecimal deductions = paye.add(nssa);
            BigDecimal net        = gross.subtract(deductions);

            totalGross      = totalGross.add(gross);
            totalDeductions = totalDeductions.add(deductions);
            totalNet        = totalNet.add(net);
        }

        PayrollRun run = PayrollRun.builder()
            .tenantId(tenantId)
            .period(period)
            .year(year)
            .totalGross(totalGross.setScale(4, RoundingMode.HALF_UP))
            .totalDeductions(totalDeductions.setScale(4, RoundingMode.HALF_UP))
            .totalNet(totalNet.setScale(4, RoundingMode.HALF_UP))
            .employeeCount(activeEmployees.size())
            .status("approved")
            .processedAt(java.time.LocalDateTime.now())
            .processedBy(processedBy)
            .build();

        PayrollRun saved = payrollRunRepository.save(run);

        // Fire Kafka event → GL integration service auto-posts DR Salaries CR Payroll Liabilities
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "PAYROLL_RUN_COMPLETED");
        event.put("tenantId", tenantId.toString());
        event.put("payrollRunId", saved.getId().toString());
        event.put("period", period);
        event.put("year", year);
        event.put("totalGross", totalGross);
        event.put("totalDeductions", totalDeductions);
        event.put("totalNet", totalNet);
        event.put("employeeCount", activeEmployees.size());
        event.put("timestamp", java.time.Instant.now().toString());

        kafkaTemplate.send("nexabiz.hr.events", tenantId.toString(), event);
        log.info("[HR] Payroll run {} completed: {} employees, gross={}, net={}", saved.getId(), activeEmployees.size(), totalGross, totalNet);

        return saved;
    }

    // Auto-run payroll on the last working day of each month at 23:00
    @Scheduled(cron = "0 0 23 28-31 * ?")
    public void scheduledPayrollCheck() {
        LocalDate today = LocalDate.now();
        LocalDate lastDay = today.withDayOfMonth(today.lengthOfMonth());
        if (today.equals(lastDay) || (lastDay.getDayOfWeek().getValue() > 5 && today.getDayOfWeek().getValue() == 5)) {
            log.info("[HR Scheduler] Triggering end-of-month payroll check");
            // In production: query all tenants with auto-payroll enabled and run
        }
    }
}
