package com.nexabiz.hr.repositories;

import com.nexabiz.hr.entities.PayrollRun;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PayrollRunRepository extends JpaRepository<PayrollRun, UUID> {
    List<PayrollRun> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);
    boolean existsByTenantIdAndPeriodAndYear(UUID tenantId, String period, Short year);
}
