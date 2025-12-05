package com.team606.mrdinner.management.controller;

import com.team606.mrdinner.db.entity.IngredientOrder;
import com.team606.mrdinner.management.service.IngredientOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/fetch/ingredients_orders")
public class IngredientOrderController {

    private final IngredientOrderService orderService;

    @GetMapping
    public List<IngredientOrder> list() {
        return orderService.list();
    }

    @PostMapping
    public IngredientOrder create(@RequestBody IngredientOrder req) {
        return orderService.create(req);
    }

    @PutMapping
    public void apply(@RequestBody IngredientOrder req) {
        orderService.apply(req);
    }
}
