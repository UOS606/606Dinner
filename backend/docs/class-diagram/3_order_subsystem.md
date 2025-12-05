# order 서브시스템 클래스 다이어그램

```mermaid
classDiagram
    direction TB

    %% ==================== External Classes ====================
    class CustomerRepository["CustomerRepository (from db.repository)"] {
        <<interface>>
    }
    class OrderRepository["OrderRepository (from db.repository)"] {
        <<interface>>
    }
    class ItemRepository["ItemRepository (from db.repository)"] {
        <<interface>>
    }
    class UnitRepository["UnitRepository (from db.repository)"] {
        <<interface>>
    }
    class StyleRepository["StyleRepository (from db.repository)"] {
        <<interface>>
    }
    class StyleSurchargeRepository["StyleSurchargeRepository (from db.repository)"] {
        <<interface>>
    }
    class ItemUnitPriceRepository["ItemUnitPriceRepository (from db.repository)"] {
        <<interface>>
    }

    class AIService["AIService (from ai)"] {
    }
    class OrderResult["OrderResult (from ai)"] {
    }
    class OrderSession["OrderSession (from ai)"] {
    }

    class CouponInfoResponseDto["CouponInfoResponseDto (from account.dto)"] {
    }

    %% ==================== DTOs ====================
    class OrderRequestDto {
        -String id
        -String menuName
        -String style
        -String action
        -String address
        -OffsetDateTime cartedTime
        -OffsetDateTime orderedTime
        -LocalDate deliveryDate
        -List items
    }

    class OrderItemRequestDto {
        -String name
        -int qty
        -String unit
    }

    class OrderResponseDto {
        -String id
        -String action
        -LocalDateTime cartedTime
        -LocalDateTime orderedTime
        -LocalDateTime cookedTime
        -LocalDateTime deliveredTime
        -String menuName
        -String style
        -String address
        -List items
        -boolean isCouponUsed
        -LocalDate deliveryDate
    }

    class OrderItemDto {
        -String name
        -int qty
        -String unit
    }

    class CartOrderResponseDto {
        -String id
        -String menuName
        -String style
        -List items
        -String action
        -Instant cartedTime
        -String address
        -Boolean couponApplied
    }

    class OrderBulkUpdateRequestDto {
        -String action
        -Instant orderedTime
        -List orders
    }

    class OrderUpdateRequestDto {
        -Instant cartedTime
        -boolean isCouponUsed
        -String address
    }

    class VoiceResponseDto {
        -String response_text
        -boolean stop_command
    }

    %% ==================== Services ====================
    class OrderService {
        -CustomerRepository customerRepository
        -StyleRepository styleRepository
        -StyleSurchargeRepository styleSurchargeRepository
        -ItemRepository itemRepository
        -UnitRepository unitRepository
        -ItemUnitPriceRepository itemUnitPriceRepository
        -OrderRepository orderRepository
        +createOrder(OrderRequestDto) CartOrderResponseDto
        +getCartedOrders(String) List
        +getMyOrders(String) List
        +deleteCartedOrder(String, Instant) void
        +markAsOrdered(String, OrderBulkUpdateRequestDto) void
        +getMyCouponInfo(String) CouponInfoResponseDto
        +useCoupons(String, int) void
        +getAllOrdersForAdmin() List
        +updateStatus(String, Instant, String) void
    }

    class VoiceService {
        -AIService aiService
        -OrderService orderService
        -Map sessions
        +handleVoiceFile(MultipartFile) VoiceResponseDto
    }

    %% ==================== Controllers ====================
    class OrderController {
        -OrderService orderService
        +create(OrderRequestDto) ResponseEntity
        +list(Authentication) ResponseEntity
        +getOrderHistory(Authentication) ResponseEntity
        +delete(DeleteCartRequest, Authentication) ResponseEntity
        +bulk(OrderBulkUpdateRequestDto, Authentication) ResponseEntity
        +listAll() ResponseEntity
    }

    class DeleteCartRequest {
        -String id
        -Instant cartedTime
        -String action
    }

    class OrderAdminController {
        -OrderService orderService
        +getAllOrders() List
        +update(Map) void
    }

    class VoiceController {
        -VoiceService voiceService
        +handleVoiceRecord(MultipartFile) ResponseEntity
    }

    %% ==================== Relationships ====================
    OrderService --> CustomerRepository : uses
    OrderService --> OrderRepository : uses
    OrderService --> ItemRepository : uses
    OrderService --> UnitRepository : uses
    OrderService --> StyleRepository : uses
    OrderService --> StyleSurchargeRepository : uses
    OrderService --> ItemUnitPriceRepository : uses

    VoiceService --> AIService : uses
    VoiceService --> OrderService : uses
    VoiceService ..> OrderSession : manages
    VoiceService ..> OrderResult : receives

    OrderController --> OrderService : uses
    OrderController +-- DeleteCartRequest : contains
    OrderAdminController --> OrderService : uses
    VoiceController --> VoiceService : uses

    OrderRequestDto "1" *-- "*" OrderItemRequestDto : items
    OrderResponseDto "1" *-- "*" OrderItemDto : items
    CartOrderResponseDto "1" *-- "*" OrderItemDto : items
    OrderBulkUpdateRequestDto "1" *-- "*" OrderUpdateRequestDto : orders

    OrderController ..> OrderRequestDto : receives
    OrderController ..> OrderResponseDto : returns
    OrderController ..> CartOrderResponseDto : returns
    VoiceController ..> VoiceResponseDto : returns
    OrderService ..> CouponInfoResponseDto : returns
```
