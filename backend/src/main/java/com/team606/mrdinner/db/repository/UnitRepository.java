package com.team606.mrdinner.db.repository;

import com.team606.mrdinner.db.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface UnitRepository extends JpaRepository<Unit, Long> {
    Optional<Unit> findByName(String name);
    Optional<Unit> findByCode(String code);
}