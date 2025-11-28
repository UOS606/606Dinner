package com.example;

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
    private String lastIntent;
    // =================================================================
    // ★ [핵심] AI 결과(OrderResult)를 받아 Intent에 따라 동작을 결정하는 메소드
    // =================================================================
    public void updateFromAI(OrderResult result) {
        if (result == null) {
            System.err.println("error");
            return;
        }

        // 2. Intent(의도) 읽기
        String intent = result.getIntent();
        recentItems = result.getItems();
        if (intent == null) intent = "unknown";
        System.out.println("🤖 [시스템] 파악된 의도: " + intent);
        
        // 3. 의도에 따른 분기 처리
        switch (intent) {
            case "recommend_dinner":
                this.output = "무슨 기념일 인가요?";
                this.lastIntent = "recommend_dinner";
                break;
            case "select_champagne_dinner":
                this.menuName = "champagne_dinner";
                this.output = "샴페인 축제 디너 알겠습니다. 서빙은 그랜드 스타일 어떠세요?";
                currentItems.clear(); // 기존 장바구니 비우기
                currentItems.add(new OrderResult.OrderItem("샴페인", "1", "병"));
                currentItems.add(new OrderResult.OrderItem("바게트빵", "4", "개"));
                currentItems.add(new OrderResult.OrderItem("커피", "1", "포트"));
                currentItems.add(new OrderResult.OrderItem("와인", "1", "병"));
                currentItems.add(new OrderResult.OrderItem("스테이크", "1", "개"));
                this.lastIntent = "select_dinner";

                break;
            case "select_french_dinner":
                this.menuName = "french_dinner";
                currentItems.clear(); // 기존 장바구니 비우기
                this.output = "프렌치 디너 알겠습니다. 서빙은 디럭스 스타일 어떠세요?";
                currentItems.add(new OrderResult.OrderItem("샐러드", "1", "개"));
                currentItems.add(new OrderResult.OrderItem("커피", "1", "잔"));
                currentItems.add(new OrderResult.OrderItem("와인", "1", "잔"));
                currentItems.add(new OrderResult.OrderItem("스테이크", "1", "개"));
                this.lastIntent = "select_dinner";                
                break;
            case "select_english_dinner":
                this.menuName = "english_dinner";
                currentItems.clear(); // 기존 장바구니 비우기
                this.output = "잉글리시 디너 알겠습니다. 서빙은 디럭스 스타일 어떠세요?";
                currentItems.add(new OrderResult.OrderItem("에그 스크램블", "1", "개"));
                currentItems.add(new OrderResult.OrderItem("스테이크", "1", "개"));
                currentItems.add(new OrderResult.OrderItem("베이컨", "1", "개"));
                currentItems.add(new OrderResult.OrderItem("바게트빵", "1", "개"));
                this.lastIntent = "select_dinner";            
                break;
            case "select_valentine_dinner":
                this.menuName = "valentine_dinner";
                currentItems.clear(); // 기존 장바구니 비우기
                this.output = "발렌타인 디너 알겠습니다. 서빙은 그랜드 스타일 어떠세요?";                
                currentItems.add(new OrderResult.OrderItem("와인", "1", "병"));
                currentItems.add(new OrderResult.OrderItem("스테이크", "1", "개"));
                this.lastIntent = "select_dinner";                
                break;

            case "select_deluxe_style":
                if(this.lastIntent != "select_dinner"){
                    this.output = "디너 먼저 골라주시길 바랍니다.!";
                    break;
                }
                this.serviceStyle = "deluxe_style";
                this.output ="네, 고객님 디너는"+this.menuName+"서빙은 디럭스 스타일로 주문하셨습니다.";
                this.lastIntent = "select_style";
                break;
            case "select_grand_style":
                if(this.lastIntent != "select_dinner"){
                    this.output = "디너 먼저 골라주시길 바랍니다.!";
                    break;
                }                
                this.serviceStyle = "grand_style";
                this.output ="네, 고객님 디너는"+this.menuName+"서빙은 그랜드 스타일로 주문하셨습니다.";
                this.lastIntent = "select_style";
                break;
            case "select_simple_style":  
                if(this.lastIntent != "select_dinner"){
                    this.output = "디너 먼저 골라주시길 바랍니다.!";
                    this.lastIntent = "select_style";
                    break;
                }                          
                this.serviceStyle = "simple_style";
                this.output ="네, 고객님 디너는"+this.menuName+"서빙은 심플 스타일로 주문하셨습니다.";
                this.lastIntent = "select_style";
                break;
            case "modify_menu":
                if(this.lastIntent != "select_style"){
                    this.output = "메뉴 수정 전에 메뉴와 스타일을 먼저 골라주시길 바랍니다.! 무슨 스타일로 드릴까요?";
                    break;
                }                
                StringBuilder changeLog = new StringBuilder();
                for (OrderResult.OrderItem newItem : recentItems) {
                    newItem.name = newItem.name.replace(" ", "");
                    // 2. 기존 장바구니(currentItems)를 뒤져서 같은 이름이 있는지 찾습니다.
                    for (OrderResult.OrderItem existingItem : currentItems) {
                        if (existingItem.name.equals(newItem.name)) {
                            
                            // 찾았다! -> 수량 변경 (Update)
                            existingItem.qty = newItem.qty;
                            // 단위가 있으면 단위도 변경
                            if (newItem.unit != null) existingItem.unit = newItem.unit;
                            changeLog.append(existingItem.name).append(" ").append(existingItem.qty).append(existingItem.unit).append(", ");
                            break; // 찾았으니 내부 루프 탈출
                        }
                    }
                }
                this.output = this.output+" 그리고 "+changeLog+"으로 변경하셨습니다.";
                break;
            case "confirm_order":
                this.output = "추가로 필요한 거 있으실까요?";
                break;
            case "no_additional":
                this.output = "네 그럼 정해주신 날짜로 배송해드리겠습니다.";
                this.checkEnd = true;
                break;
            case "add_menu":
                StringBuilder addLog = new StringBuilder();
                if(this.lastIntent != "select_style"){
                    this.output = "메뉴 추가 전에 메뉴와 스타일을 먼저 골라주시길 바랍니다.! 무슨 스타일로 드릴까요?";
                    break;
                } 
                for (OrderResult.OrderItem newItem : recentItems) {
                    // ★ 1. 공백 제거
                    String cleanNewName = newItem.name.replace(" ", "");
                    newItem.name = cleanNewName; // 아예 객체 이름도 깨끗하게 변경
                    
                    boolean found = false;

                    for (OrderResult.OrderItem existingItem : currentItems) {
                        // ★ 2. 공백 제거 후 비교
                        if (existingItem.name.replace(" ", "").equals(cleanNewName)) {
                            try {
                                int oldQty = Integer.parseInt(existingItem.qty);
                                int addQty = Integer.parseInt(newItem.qty);
                                int sum = oldQty + addQty;
                                
                                existingItem.qty = String.valueOf(sum);
                                
                                addLog.append(existingItem.name).append(" ").append(addQty).append(existingItem.unit)
                                      .append(" 추가(총 ").append(sum).append("), ");
                            } catch (Exception e) {
                                existingItem.qty = newItem.qty; // 에러나면 덮어쓰기
                            }
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        currentItems.add(newItem);
                        addLog.append(newItem.name).append(" ").append(newItem.qty).append(newItem.unit).append(" 추가, ");
                    }
                }
                this.output = this.output +"또,"+ addLog.toString() + "처리해 드렸습니다.";
                break;


            // =========================================================
            // [삭제] Delete Logic (공백 제거 포함)
            // =========================================================
            case "delete_menu":
                if(this.lastIntent != "select_style"){
                    this.output = "메뉴 삭제 전에 메뉴와 스타일을 먼저 골라주시길 바랍니다.! 무슨 스타일로 드릴까요?";
                    break;
                } 
                StringBuilder deleteLog = new StringBuilder();
                boolean isDeleted = false;

                for (OrderResult.OrderItem targetItem : recentItems) {
                    // ★ 공백 제거한 타겟 이름 준비
                    String targetNameClean = targetItem.name.replace(" ", "");

                    // 비교할 때도 양쪽 다 공백 제거하고 비교
                    boolean result_ = currentItems.removeIf(existing -> 
                        existing.name.replace(" ", "").equals(targetNameClean)
                    );
                    
                    if (result_) {
                        deleteLog.append(targetItem.name).append(" ");
                        isDeleted = true;
                    }
                }

                if (isDeleted) {
                    this.output = "네, " + deleteLog.toString() + "메뉴에서 제외했습니다.";
                } else {
                    this.output = "해당 메뉴는 주문 내역에 없습니다.";
                }
                break;
            case "occasion":
                this.output = "정말 축하드려요! 프렌치 디너나 샴페인 축제 디너는 어떠세요?";
                this.eventDate = result.getDate();
                break;
        }
    }
    public String getMenuName() { return menuName; }

    // 2. 서빙 스타일 (예: "deluxe_style")
    public String getServiceStyle() { return serviceStyle; }

    // 3. 예약 날짜 (예: "12월 02일")
    public String getEventDate() { return eventDate; }

    // 4. 최종 물품 리스트 (변경사항이 모두 반영된 최종 상태)
    public List<OrderResult.OrderItem> getCurrentItems() { return currentItems; }

    // 5. 시스템의 응답 멘트
    public String getOutput() { return output; }

    public boolean checkEnd(){ return checkEnd;}
}