package com.team606.mrdinner.repository;

import com.team606.mrdinner.entity.Style;
import com.team606.mrdinner.entity.StyleSurcharge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface StyleSurchargeRepository extends JpaRepository<StyleSurcharge, Long> {
    Optional<StyleSurcharge> findByStyle(Style style);
}
