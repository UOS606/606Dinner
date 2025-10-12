package com.team606.mrdinner.repository;

import com.team606.mrdinner.entity.Style;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface StyleRepository extends JpaRepository<Style, Long> {
    Optional<Style> findByCode(String code);
}
