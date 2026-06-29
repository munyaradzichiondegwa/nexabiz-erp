package com.nexabiz.gl.repositories;

import com.nexabiz.gl.entities.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {
    List<Account> findByTenantIdAndIsActiveTrue(UUID tenantId);
    Optional<Account> findByTenantIdAndCode(UUID tenantId, String code);
    List<Account> findByTenantIdAndType(UUID tenantId, String type);
}
