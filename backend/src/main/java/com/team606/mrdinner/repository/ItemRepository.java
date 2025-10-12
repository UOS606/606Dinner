package com.team606.mrdinner.repository;

import com.team606.mrdinner.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface ItemRepository extends JpaRepository<Item, Long> {
    Optional<Item> findByName(String name);
    Optional<Item> findByCode(String code);
}
