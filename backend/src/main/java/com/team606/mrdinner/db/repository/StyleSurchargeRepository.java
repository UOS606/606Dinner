package com.team606.mrdinner.db.repository;

import com.team606.mrdinner.db.entity.Style;
import com.team606.mrdinner.db.entity.StyleSurcharge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface StyleSurchargeRepository extends JpaRepository<StyleSurcharge, Long> {
    Optional<StyleSurcharge> findByStyle(Style style);
}
