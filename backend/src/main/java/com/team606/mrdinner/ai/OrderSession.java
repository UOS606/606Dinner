package com.team606.mrdinner.ai;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class OrderSession {

    private String menuName;
    private String serviceStyle;
    private String eventDate;
    private List<OrderResult.OrderItem> currentItems = new ArrayList<>();
    private List<OrderResult.OrderItem> recentItems = new ArrayList<>();
    private String output;
    private boolean checkEnd = false;
    private String lastIntent; // 초기값 null 가능

    // =================================================================
    // AI 결과(OrderResult)를 받아 Intent에 따라 동작 결정
    // =================================================================
    public void updateFromAI(OrderResult result) {
        if (result == null) {
            System.err.println("error: result is null");
            return;
        }

        LocalTime nowTime = LocalTime.now();

        // Intent
        String intent = result.getIntent();
        recentItems = result.getItems();
        if (intent == null) intent = "unknown";

        String set_date = result.getDate();
        System.out.println("🤖 [시스템] 파악된 의도: " + intent);

        switch (intent) {

            // -----------------------------
            // 추천 디너
            // -----------------------------
            case "recommend_dinner":
                this.output = "무슨 기념일 인가요?";
                this.lastIntent = "recommend_dinner";
                break;

            // -----------------------------
            // 샴페인 축제 디너
            // -----------------------------
            case "select_champagne_dinner":
                this.menuName = "champagne_dinner";
                this.output = "샴페인 축제 디너 알겠습니다. 서빙은 그랜드 스타일 어떠세요?";

                currentItems.clear();
                currentItems.add(new OrderResult.OrderItem("샴페인", "5", "잔"));
                currentItems.add(new OrderResult.OrderItem("바게트", "4", "개"));
                currentItems.add(new OrderResult.OrderItem("커피", "5", "잔"));
                currentItems.add(new OrderResult.OrderItem("와인", "5", "잔"));
                currentItems.add(new OrderResult.OrderItem("스테이크", "1", "접시"));

                this.lastIntent = "select_dinner";
                break;

            // -----------------------------
            // 프렌치 디너
            // -----------------------------
            case "select_french_dinner":
                this.menuName = "french_dinner";
                this.output = "프렌치 디너 알겠습니다. 서빙은 디럭스 스타일 어떠세요?";

                currentItems.clear();
                currentItems.add(new OrderResult.OrderItem("샐러드", "1", "접시"));
                currentItems.add(new OrderResult.OrderItem("커피", "1", "잔"));
                currentItems.add(new OrderResult.OrderItem("와인", "1", "잔"));
                currentItems.add(new OrderResult.OrderItem("스테이크", "1", "접시"));

                this.lastIntent = "select_dinner";
                break;

            // -----------------------------
            // 잉글리시 디너
            // -----------------------------
            case "select_english_dinner":
                this.menuName = "english_dinner";
                this.output = "잉글리시 디너 알겠습니다. 서빙은 디럭스 스타일 어떠세요?";

                currentItems.clear();
                currentItems.add(new OrderResult.OrderItem("에그스크램블", "1", "인분"));
                currentItems.add(new OrderResult.OrderItem("스테이크", "1", "접시"));
                currentItems.add(new OrderResult.OrderItem("베이컨", "1", "인분"));
                currentItems.add(new OrderResult.OrderItem("바게트", "1", "개"));

                this.lastIntent = "select_dinner";
                break;

            // -----------------------------
            // 발렌타인 디너
            // -----------------------------
            case "select_valentine_dinner":
                this.menuName = "valentine_dinner";
                this.output = "발렌타인 디너 알겠습니다. 서빙은 그랜드 스타일 어떠세요?";

                currentItems.clear();
                currentItems.add(new OrderResult.OrderItem("와인", "5", "잔"));
                currentItems.add(new OrderResult.OrderItem("스테이크", "1", "접시"));

                this.lastIntent = "select_dinner";
                break;

            // -----------------------------
            // 스타일 선택
            // -----------------------------
            case "select_deluxe_style":
                if (!"select_dinner".equals(this.lastIntent)) {
                    this.output = "디너 먼저 골라주시길 바랍니다.!";
                    break;
                }
                this.serviceStyle = "deluxe_style";
                this.output = "네, 고객님 디너는 " + this.menuName + " 서빙은 디럭스 스타일로 주문하셨습니다.";
                this.lastIntent = "select_style";
                break;

            case "select_grand_style":
                if (!"select_dinner".equals(this.lastIntent)) {
                    this.output = "디너 먼저 골라주시길 바랍니다.!";
                    break;
                }
                this.serviceStyle = "grand_style";
                this.output = "네, 고객님 디너는 " + this.menuName + " 서빙은 그랜드 스타일로 주문하셨습니다.";
                this.lastIntent = "select_style";
                break;

            case "select_simple_style":
                if (!"select_dinner".equals(this.lastIntent)) {
                    this.output = "디너 먼저 골라주시길 바랍니다.!";
                    break;
                }
                this.serviceStyle = "simple_style";
                this.output = "네, 고객님 디너는 " + this.menuName + " 서빙은 심플 스타일로 주문하셨습니다.";
                this.lastIntent = "select_style";
                break;

            // -----------------------------
            // 메뉴 수정
            // -----------------------------
            case "modify_menu":
                if (!"select_style".equals(this.lastIntent)) {
                    if ("select_dinner".equals(this.lastIntent))
                        this.output = "메뉴 수정 전에 메뉴와 스타일을 먼저 골라주시길 바랍니다.! 무슨 메뉴로 드릴까요?";
                    else
                        this.output = "메뉴 수정 전에 메뉴와 스타일을 먼저 골라주시길 바랍니다.! 무슨 스타일로 드릴까요?";
                    break;
                }

                boolean changed = false;
                StringBuilder changeLog = new StringBuilder();

                for (OrderResult.OrderItem newItem : recentItems) {
                    if (newItem.getName() == null) continue;

                    newItem.setName(newItem.getName().replace(" ", ""));

                    for (OrderResult.OrderItem existing : currentItems) {
                        if (existing.getName() == null) continue;

                        if (existing.getName().equals(newItem.getName())) {
                            changeLog.append(newItem.getName()).append(" ")
                                    .append(newItem.getQty()).append(newItem.getUnit()).append(", ");

                            if ("병".equals(newItem.getUnit())) {
                                try {
                                    int oldQty = Integer.parseInt(newItem.getQty());
                                    int converted = oldQty * 5;
                                    newItem.setUnit("잔");
                                    newItem.setQty(String.valueOf(converted));
                                } catch (Exception ignore) {}
                            }

                            existing.setQty(newItem.getQty());
                            changed = true;
                            break;
                        }
                    }
                }

                if (changed)
                    this.output = this.output + "  " + changeLog + "으로 변경하셨습니다.";
                else
                    this.output = this.output + "위 메뉴에는 고객님이 말씀하신 것이 들어있지 않습니다.";

                break;

            // -----------------------------
            // 주문 확인
            // -----------------------------
            case "confirm_order":
                this.output = "추가로 필요한 거 있으실까요?";
                this.lastIntent = "confirm_order";
                break;

            // -----------------------------
            // 추가 없음 → 주문 종료
            // -----------------------------
            case "no_additional":
                this.output = "네 그럼 정해주신 날짜로 배송해드리겠습니다.";
                this.checkEnd = true;
                break;

            // -----------------------------
            // 메뉴 추가
            // -----------------------------
            case "add_menu":
                if (!"select_style".equals(this.lastIntent)) {
                    this.output = "메뉴 추가 전에 메뉴와 스타일을 먼저 골라주시길 바랍니다.! 무슨 스타일로 드릴까요?";
                    break;
                }

                StringBuilder addLog = new StringBuilder();

                for (OrderResult.OrderItem newItem : recentItems) {
                    if (newItem.getName() == null) continue;

                    String clean = newItem.getName().replace(" ", "");
                    newItem.setName(clean);

                    boolean found = false;
                    int sum;

                    for (OrderResult.OrderItem existing : currentItems) {
                        if (existing.getName() == null) continue;

                        if (existing.getName().equals(clean)) {
                            try {
                                int oldQty = Integer.parseInt(existing.getQty());
                                int addQty = Integer.parseInt(newItem.getQty());

                                if ("병".equals(newItem.getUnit())) {
                                    sum = oldQty + addQty * 5;
                                } else {
                                    sum = oldQty + addQty;
                                }
                                existing.setQty(String.valueOf(sum));

                                addLog.append(existing.getName()).append(" ")
                                        .append(addQty).append(newItem.getUnit()).append(" 추가, ");

                            } catch (Exception e) {
                                existing.setQty(newItem.getQty());
                            }

                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        currentItems.add(newItem);
                        addLog.append(newItem.getName()).append(" ")
                                .append(newItem.getQty()).append(newItem.getUnit()).append(" 추가, ");
                    }
                }

                this.output = this.output + "그리고, " + addLog.toString() + " 처리해 드렸습니다.";
                break;

            // -----------------------------
            // 메뉴 삭제
            // -----------------------------
            case "delete_menu":
                if (!"select_style".equals(this.lastIntent)) {
                    if ("select_dinner".equals(this.lastIntent))
                        this.output = "메뉴 삭제 전에 메뉴와 스타일을 먼저 골라주시길 바랍니다.! 무슨 메뉴로 드릴까요?";
                    else
                        this.output = "메뉴 삭제 전에 메뉴와 스타일을 먼저 골라주시길 바랍니다.! 무슨 스타일로 드릴까요?";
                    break;
                }

                StringBuilder delLog = new StringBuilder();
                boolean deleted = false;

                for (OrderResult.OrderItem t : recentItems) {
                    if (t.getName() == null) continue;

                    String clean = t.getName().replace(" ", "");

                    boolean removed =
                            currentItems.removeIf(ex ->
                                    ex.getName() != null &&
                                            ex.getName().equals(clean));

                    if (removed) {
                        delLog.append(t.getName()).append(" ");
                        deleted = true;
                    }
                }

                if (deleted)
                    this.output = "네, " + delLog + "메뉴에서 제외했습니다.";
                else
                    this.output = "해당 메뉴는 주문 내역에 없습니다.";
                break;

            // -----------------------------
            // 기념일 의도
            // -----------------------------
            case "occasion":
                this.output = "정말 축하드려요! 프렌치 디너나 샴페인 축제 디너는 어떠세요?";
                this.eventDate = result.getDate();
                break;
        }
    }

    // Getters
    public String getMenuName() { return menuName; }
    public String getServiceStyle() { return serviceStyle; }
    public String getEventDate() { return eventDate; }
    public List<OrderResult.OrderItem> getCurrentItems() { return currentItems; }
    public String getOutput() { return output; }
    public boolean getcheckEnd() { return checkEnd; }
    public String getLastIntent() { return lastIntent; }
}
