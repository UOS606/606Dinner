package com.team606.mrdinner.service;

import com.team606.mrdinner.entity.IngredientOrder;
import com.team606.mrdinner.entity.IngredientOrderItem;
import com.team606.mrdinner.repository.IngredientOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IngredientOrderService {

    private final IngredientOrderRepository ingredientOrderRepository;
    private final IngredientService ingredientService;

    @Transactional(readOnly = true)
    public List<IngredientOrder> list() {
        return ingredientOrderRepository.findAll();
    }

    /**
     * 재고 주문 생성
     * 프론트에서 넘어오는 구조:
     * {
     *   "orderItems": [ { "item": "바게트", "quantity": 5 }, ... ],
     *   "state": "ordered",
     *   "orderDate": "2025-11-27T21:40:00.000Z" (옵션)
     * }
     */
    @Transactional
    public IngredientOrder create(IngredientOrder req) {
        IngredientOrder order = new IngredientOrder();
        order.setOrderDate(
                req.getOrderDate() != null ? req.getOrderDate() : OffsetDateTime.now()
        );
        order.setState("ordered");

        order.setItems(new ArrayList<>()); // Builder.Default 보정용
        if (req.getItems() != null) {
            for (IngredientOrderItem src : req.getItems()) {
                IngredientOrderItem item = new IngredientOrderItem();
                item.setItem(src.getItem());
                item.setQuantity(src.getQuantity());
                order.addItem(item);
            }
        }

        return ingredientOrderRepository.save(order);
    }

    /**
     * 주문 상태를 applied 로 변경하고, 한 번만 재고를 반영한다.
     */
    @Transactional
    public void apply(IngredientOrder req) {
        if (req.getId() == null) {
            throw new IllegalArgumentException("재고 주문 ID가 필요합니다.");
        }

        IngredientOrder order = ingredientOrderRepository.findById(req.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("해당 ID의 재고 주문을 찾을 수 없습니다. id=" + req.getId()));

        // 이미 적용된 주문이면 재반영하지 않음
        if ("applied".equalsIgnoreCase(order.getState())) {
            return;
        }

        // 재고 반영
        ingredientService.applyOrder(order);

        // 상태 변경
        order.setState("applied");
        // @Transactional 이므로 변경 감지로 update ingredient_orders + update ingredients 실행
    }
}
