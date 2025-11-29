package com.team606.mrdinner.controller;

import com.team606.mrdinner.service.IngredientService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ingredients")
public class IngredientController {

    private final IngredientService ingredientService;

    @GetMapping
    public Map<String, Double> list() {
        return ingredientService.getAll();
    }

    @PutMapping
    public void add(@RequestBody Map<String, Double> req) {
        ingredientService.add(req);
    }
}
