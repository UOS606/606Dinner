package com.team606.mrdinner.management.service;

import com.team606.mrdinner.db.entity.Ingredient;
import com.team606.mrdinner.db.entity.IngredientOrder;
import com.team606.mrdinner.db.entity.IngredientOrderItem;
import com.team606.mrdinner.db.repository.IngredientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IngredientService {

    private final IngredientRepository ingredientRepository;

    /**
     * 전체 재고를 "이름 -> 수량" 맵으로 반환
     */
    @Transactional(readOnly = true)
    public Map<String, Double> getAll() {
        List<Ingredient> all = ingredientRepository.findAll();
        return all.stream()
                .collect(Collectors.toMap(
                        Ingredient::getName,
                        Ingredient::getQuantity,
                        (a, b) -> a,
                        LinkedHashMap::new
                ));
    }

    /**
     * 단순 맵 기반 재고 증가 (필요하면 유지)
     */
    @Transactional
    public void add(Map<String, Double> changes) {
        if (changes == null || changes.isEmpty()) {
            return;
        }

        for (Map.Entry<String, Double> entry : changes.entrySet()) {
            String name = entry.getKey();
            Double delta = entry.getValue();
            if (delta == null || delta == 0.0) {
                continue;
            }

            Ingredient ingredient = ingredientRepository.findByName(name)
                    .orElseThrow(() ->
                            new IllegalArgumentException("알 수 없는 재료명입니다: " + name));

            double newQty = ingredient.getQuantity() + delta;
            ingredient.setQuantity(newQty);
            // @Transactional 안이므로 save 호출 없어도 변경 감지로 UPDATE 실행
        }
    }

    /**
     * 주문(IngredientOrder)의 아이템들을 재고에 반영
     */
    @Transactional
    public void applyOrder(IngredientOrder order) {
        if (order == null || order.getItems() == null) {
            return;
        }

        // 같은 재료가 여러 번 나와도 합쳐서 반영
        Map<String, Double> changes = new LinkedHashMap<>();
        for (IngredientOrderItem item : order.getItems()) {
            if (item.getItem() == null || item.getQuantity() == null) continue;
            changes.merge(item.getItem(), item.getQuantity(), Double::sum);
        }

        add(changes);
    }
}
