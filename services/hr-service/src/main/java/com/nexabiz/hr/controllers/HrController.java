package com.nexabiz.hr.controllers;

import com.nexabiz.hr.entities.Employee;
import com.nexabiz.hr.entities.PayrollRun;
import com.nexabiz.hr.repositories.EmployeeRepository;
import com.nexabiz.hr.services.PayrollService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr")
@RequiredArgsConstructor
public class HrController {

    private final EmployeeRepository employeeRepository;
    private final PayrollService payrollService;

    @GetMapping("/employees")
    public ResponseEntity<?> listEmployees(
        @RequestHeader("X-Tenant-ID") UUID tenantId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String status
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("lastName", "firstName"));
        Page<Employee> result = search != null
            ? employeeRepository.searchActive(tenantId, search, pageable)
            : employeeRepository.findByTenantIdAndStatus(tenantId, status != null ? status : "active", pageable);
        return ResponseEntity.ok(Map.of("employees", result.getContent(), "total", result.getTotalElements(), "page", page));
    }

    @PostMapping("/employees")
    public ResponseEntity<Employee> createEmployee(
        @RequestHeader("X-Tenant-ID") UUID tenantId,
        @Valid @RequestBody Employee employee
    ) {
        employee.setTenantId(tenantId);
        if (employee.getEmployeeNumber() == null || employee.getEmployeeNumber().isBlank()) {
            employee.setEmployeeNumber("EMP-" + System.currentTimeMillis());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeRepository.save(employee));
    }

    @GetMapping("/employees/{id}")
    public ResponseEntity<Employee> getEmployee(@PathVariable UUID id, @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return employeeRepository.findById(id)
            .filter(e -> e.getTenantId().equals(tenantId))
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<Employee> updateEmployee(
        @PathVariable UUID id,
        @RequestHeader("X-Tenant-ID") UUID tenantId,
        @Valid @RequestBody Employee updates
    ) {
        return employeeRepository.findById(id)
            .filter(e -> e.getTenantId().equals(tenantId))
            .map(emp -> {
                emp.setFirstName(updates.getFirstName());
                emp.setLastName(updates.getLastName());
                emp.setRole(updates.getRole());
                emp.setDepartment(updates.getDepartment());
                emp.setSalary(updates.getSalary());
                emp.setStatus(updates.getStatus());
                return ResponseEntity.ok(employeeRepository.save(emp));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/payroll/run")
    public ResponseEntity<PayrollRun> runPayroll(
        @RequestHeader("X-Tenant-ID") UUID tenantId,
        @RequestHeader("X-User-ID") UUID userId,
        @RequestBody Map<String, Object> body
    ) {
        String period = (String) body.get("period");
        short year = Short.parseShort(body.get("year").toString());
        PayrollRun run = payrollService.runPayroll(tenantId, period, year, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(run);
    }

    @GetMapping("/kpis")
    public ResponseEntity<?> getHRKPIs(@RequestHeader("X-Tenant-ID") UUID tenantId) {
        long active   = employeeRepository.countByTenantIdAndStatus(tenantId, "active");
        long onLeave  = employeeRepository.countByTenantIdAndStatus(tenantId, "on_leave");
        return ResponseEntity.ok(Map.of("totalEmployees", active + onLeave, "activeEmployees", active, "onLeave", onLeave));
    }
}
