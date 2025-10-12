package com.team606.mrdinner.repository;

import com.team606.mrdinner.entity.Item;
import com.team606.mrdinner.entity.ItemUnitPrice;
import com.team606.mrdinner.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface ItemUnitPriceRepository extends JpaRepository<ItemUnitPrice, Long> {
    Optional<ItemUnitPrice> findByItemAndUnit(Item item, Unit unit);
}
