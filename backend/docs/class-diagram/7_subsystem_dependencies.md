# 전체 서브시스템 의존관계 다이어그램

```mermaid
classDiagram
    direction TB

    class ui {
        <<subsystem>>
        App
        NavBar
        Home / Story / Menu
        LoginModal / SignupModal / OrderModal
        Cart / OrderHistory
        AdminDashboard / StockStatus / OrderForm / Assign
    }

    class db {
        <<subsystem>>
        entity
        repository
    }

    class account {
        <<subsystem>>
        controller
        dto
        security
        service
    }

    class order_pkg {
        <<subsystem>>
        controller
        dto
        service
    }

    class management {
        <<subsystem>>
        controller
        service
    }

    class ai {
        <<subsystem>>
        AIService
        OrderResult
        OrderSession
    }

    class config {
        <<subsystem>>
        CorsConfig
    }

    ui --> account : REST API
    ui --> order_pkg : REST API
    ui --> management : REST API
    ui --> ai : REST API (voice)

    account --> db : uses
    order_pkg --> db : uses
    order_pkg --> ai : uses
    order_pkg --> account : uses
    order_pkg --> management : uses
    management --> db : uses
```

---

## UI - Backend 연동 상세

```mermaid
flowchart LR
    subgraph UI["UI (React Frontend)"]
        direction TB
        NavBar
        LoginModal
        SignupModal
        OrderModal
        Cart
        OrderHistory
        StockStatus
        OrderForm
        Assign
    end

    subgraph Backend["Backend (Spring Boot)"]
        direction TB
        subgraph Account
            AuthController
            CustomerController
            CouponController
            UserController
        end
        subgraph Order
            OrderController
            VoiceController
            OrderAdminController
        end
        subgraph Management
            IngredientController
            IngredientOrderController
            StaffController
        end
    end

    NavBar -->|"/api/coupons, /api/users, /api/voice-record"| Backend
    LoginModal -->|"/api/login"| AuthController
    SignupModal -->|"/api/signup"| CustomerController
    OrderModal -->|"/api/orders, /api/menu, /api/stock"| OrderController
    Cart -->|"/api/orders, /api/coupons"| Backend
    OrderHistory -->|"/api/orders/history"| OrderController
    StockStatus -->|"/api/ingredients"| IngredientController
    OrderForm -->|"/api/fetch/ingredients_orders"| IngredientOrderController
    Assign -->|"/api/admin/orders, /api/staffs"| Backend
```

---

## 서브시스템 역할 요약

| 서브시스템 | 역할 |
|-----------|------|
| **UI** | 사용자 인터페이스 (React SPA) - 로그인/회원가입, 메뉴 주문, 장바구니, 주문내역, 관리자 대시보드 |
| **Account** | 사용자 인증 (JWT), 회원가입, 쿠폰 관리 |
| **Order** | 주문 생성/조회/수정, 장바구니, 음성 주문 처리 |
| **Management** | 재고 관리, 재료 주문, 직원 배정 |
| **AI** | 음성 파일 → 텍스트 변환 (Whisper), 의도 분석 (Qwen) |
| **DB** | 영속성 계층 (JPA Entity, Repository) |
| **Config** | Spring 설정 (CORS 등) |
