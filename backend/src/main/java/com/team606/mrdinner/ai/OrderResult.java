package com.team606.mrdinner.ai;

import java.util.ArrayList;
import java.util.List;

public class OrderResult {

    private String intent;
    private String date;
    private List<OrderItem> items = new ArrayList<>();

    // ✔ OrderSession 코드가 직접 name/qty/unit 을 수정하므로 public 유지해야 함
    public static class OrderItem {
        public String name;
        public String qty;
        public String unit;

        public OrderItem(String name, String qty, String unit) {
            this.name = name;
            this.qty = qty;
            this.unit = unit;
        }

        // getter/setter도 유지하면 VoiceService가 getName() 등을 정상 사용 가능
        public String getName() {
            return name;
        }
        public void setName(String name) {
            this.name = name;
        }

        public String getQty() {
            return qty;
        }
        public void setQty(String qty) {
            this.qty = qty;
        }

        public String getUnit() {
            return unit;
        }
        public void setUnit(String unit) {
            this.unit = unit;
        }

        @Override
        public String toString() {
            return "이름:" + name + ", 수량:" + qty + ", 단위:" + unit;
        }
    }

    public String getIntent() {
        return intent;
    }

    public void setIntent(String intent) {
        this.intent = intent;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public void addItem(String name, String qty, String unit) {
        items.add(new OrderItem(name, qty, unit));
    }

    @Override
    public String toString() {
        return "의도: " + intent + " / 날짜: " + date + " / 품목수: " + items.size();
    }
}
