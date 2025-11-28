package com.example;

import java.util.ArrayList;
import java.util.List;

// 분석 결과를 담아서 반환할 객체 (DTO)
public class OrderResult {
    private String intent;
    private String date;
    private List<OrderItem> items = new ArrayList<>();

    // 데이터를 쉽게 넣기 위한 내부 클래스 (물품 정보)
    public static class OrderItem {
        public String name;
        public String qty;
        public String unit;

        public OrderItem(String name, String qty, String unit) {
            this.name = name;
            this.qty = qty;
            this.unit = unit;
        }

        @Override
        public String toString() {
            return "이름:" + name + ", 수량:" + qty + ", 단위:" + unit;
        }
    }

    // Setter & Getter
    public void setIntent(String intent) { this.intent = intent; }
    public String getIntent() { return intent; }

    public void setDate(String date) { this.date = date; }
    public String getDate() { return date; }

    public void addItem(String name, String qty, String unit) {
        items.add(new OrderItem(name, qty, unit));
    }
    public List<OrderItem> getItems() { return items; }

    @Override
    public String toString() {
        return "의도: " + intent + " / 날짜: " + date + " / 품목수: " + items.size();
    }
}