package com.nexabiz.hr.repositories;

import com.nexabiz.hr.entities.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Page<Employee> findByTenantIdAndStatus(UUID tenantId, String status, Pageable pageable);

    @Query("SELECT e FROM Employee e WHERE e.tenantId = :tenantId AND e.status = 'active' " +
           "AND (:search IS NULL OR LOWER(e.firstName) LIKE LOWER(CONCAT('%',:search,'%')) " +
           "OR LOWER(e.lastName) LIKE LOWER(CONCAT('%',:search,'%')) " +
           "OR LOWER(e.email) LIKE LOWER(CONCAT('%',:search,'%')))")
    Page<Employee> searchActive(UUID tenantId, String search, Pageable pageable);

    long countByTenantIdAndStatus(UUID tenantId, String status);
}
