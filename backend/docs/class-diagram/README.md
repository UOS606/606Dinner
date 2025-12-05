# MrDinner 클래스 다이어그램

## 개요

MrDinner 시스템의 클래스 다이어그램을 서브시스템별로 정리한 문서입니다. 프론트엔드(UI)와 백엔드 전체 구조를 포함합니다.

## 시스템 구조

### Frontend (React)
```
frontend/src/
├── App.jsx                     # 루트 컴포넌트
├── components/
│   ├── common/                 # 공통 컴포넌트
│   │   ├── nav_bar/NavBar.jsx  # 네비게이션 바
│   │   ├── ProtectedRoute.jsx  # 인증 라우트 보호
│   │   └── Info.js             # 유틸리티 함수/상수
│   ├── home/Home.jsx           # 홈 페이지
│   ├── story/Story.jsx         # 스토리 페이지
│   ├── menu/Menu.jsx           # 메뉴 페이지
│   ├── modal/                  # 모달 컴포넌트
│   │   ├── LoginModal.jsx      # 로그인 모달
│   │   ├── SignupModal.jsx     # 회원가입 모달
│   │   └── OrderModal.jsx      # 주문 모달
│   ├── order/                  # 주문 관련
│   │   ├── Cart.jsx            # 장바구니
│   │   └── OrderHistory.jsx    # 주문 내역
│   └── admin/                  # 관리자 페이지
│       ├── AdminDashboard.jsx  # 관리자 대시보드
│       ├── StockStatus.jsx     # 재고 현황
│       ├── OrderForm.jsx       # 재고 주문
│       └── Assign.jsx          # 직원 배정
└── index.js                    # 엔트리 포인트
```

### Backend (Spring Boot)
```
com.team606.mrdinner
├── db/                 # 데이터베이스 계층
│   ├── entity/         # JPA 엔티티
│   └── repository/     # Spring Data JPA Repository
├── account/            # 계정 관리 서브시스템
│   ├── controller/     # REST API 컨트롤러
│   ├── dto/            # 데이터 전송 객체
│   ├── security/       # 보안 설정 (JWT, Spring Security)
│   └── service/        # 비즈니스 로직
├── order/              # 주문 서브시스템
│   ├── controller/     # REST API 컨트롤러
│   ├── dto/            # 데이터 전송 객체
│   └── service/        # 비즈니스 로직
├── management/         # 관리 서브시스템 (재고, 직원)
│   ├── controller/     # REST API 컨트롤러
│   └── service/        # 비즈니스 로직
├── ai/                 # AI 서브시스템 (음성 인식)
└── config/             # 설정 클래스
```

## 다이어그램 목록

| 파일 | 서브시스템 | 설명 |
|------|-----------|------|
| [0_ui_subsystem.md](./0_ui_subsystem.md) | UI | React 프론트엔드 컴포넌트 |
| [1_db_subsystem.md](./1_db_subsystem.md) | DB | Entity 및 Repository 클래스 |
| [2_account_subsystem.md](./2_account_subsystem.md) | Account | 인증, 회원가입, 쿠폰 관련 |
| [3_order_subsystem.md](./3_order_subsystem.md) | Order | 주문, 장바구니, 음성 주문 관련 |
| [4_management_subsystem.md](./4_management_subsystem.md) | Management | 재고 관리, 직원 배정 관련 |
| [5_ai_subsystem.md](./5_ai_subsystem.md) | AI | AI 음성 인식 처리 |
| [6_config_subsystem.md](./6_config_subsystem.md) | Config | Spring 설정 |
| [7_subsystem_dependencies.md](./7_subsystem_dependencies.md) | - | 서브시스템 간 의존관계 |

---

## UML 스테레오타입 범례

| 스테레오타입 | 의미 |
|-------------|------|
| `<<entity>>` | JPA 엔티티 (영속 객체) |
| `<<interface>>` | 인터페이스 |
| `<<enumeration>>` | 열거형 |
| `<<utility>>` | 유틸리티 클래스 |
| `<<subsystem>>` | 서브시스템/패키지 |

---

## 외부 참조 표기법

다른 서브시스템의 클래스를 참조할 때는 다음과 같이 표기합니다:

```
ClassName (from package.name)
```

예시:
- `Customer (from db.entity)` - db 서브시스템의 Customer 엔티티
- `CustomerRepository (from db.repository)` - db 서브시스템의 Repository
- `OrderService (from order.service)` - order 서브시스템의 Service

---

## 관계 표기법 (화살표/선 종류)

### 1. 연관관계 (Association) - 실선 화살표 `-->`

```
A --> B
```

**의미**: A가 B를 **참조(사용)**한다.

**예시**: `Order --> Customer` (주문이 고객을 참조)

**특징**:
- 가장 일반적인 관계
- A 객체가 B 객체의 참조를 필드로 가지고 있음
- 방향이 있으면 단방향, 양쪽이면 양방향 연관

---

### 2. 의존관계 (Dependency) - 점선 화살표 `..>`

```
A ..> B
```

**의미**: A가 B에 **일시적으로 의존**한다.

**예시**: `CustomerRepository ..> Customer` (Repository가 Entity를 관리)

**특징**:
- 필드로 갖지 않고, 메서드 파라미터/리턴타입/지역변수로만 사용
- 연관관계보다 약한 결합
- "uses", "creates", "receives", "returns" 등의 라벨과 함께 사용

---

### 3. 컴포지션 (Composition) - 속이 찬 마름모 `*--`

```
A "1" *-- "*" B
```

**의미**: A가 B를 **소유**하며, A가 삭제되면 B도 **함께 삭제**된다.

**예시**: `Order "1" *-- "*" OrderItem` (주문이 삭제되면 주문항목도 삭제)

**특징**:
- **강한 소유 관계** (Whole-Part 관계)
- 부분(Part)은 전체(Whole) 없이 존재할 수 없음
- 생명주기가 동일함
- 마름모는 **전체(소유자)** 쪽에 위치

**실제 코드**:
```java
class Order {
    // Order가 삭제되면 OrderItem도 함께 삭제됨
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;
}
```

---

### 4. 집약 (Aggregation) - 속이 빈 마름모 `o--`

```
A "1" o-- "*" B
```

**의미**: A가 B를 **포함**하지만, A가 삭제되어도 B는 **독립적으로 존재**할 수 있다.

**예시**: `OrderSession "1" o-- "*" OrderResultItem` (세션이 끝나도 아이템 정보는 존재 가능)

**특징**:
- **약한 소유 관계**
- 부분(Part)이 전체(Whole) 없이도 존재 가능
- 생명주기가 독립적
- 마름모는 **전체(컨테이너)** 쪽에 위치

**실제 코드**:
```java
class OrderSession {
    // OrderSession이 끝나도 OrderResultItem은 독립 존재 가능
    private List<OrderResultItem> currentItems;
}
```

---

### 5. 상속 (Inheritance/Generalization) - 속이 빈 삼각형 `<|--`

```
A <|-- B
```

**의미**: B가 A를 **상속**받는다. (B extends A)

**예시**: `Animal <|-- Dog` (Dog는 Animal을 상속)

**특징**:
- "is-a" 관계
- 삼각형은 **부모 클래스** 쪽에 위치
- 자식이 부모의 속성/메서드를 물려받음

---

### 6. 구현 (Realization/Implementation) - 점선 + 속이 빈 삼각형 `<|..`

```
A <|.. B
```

**의미**: B가 A 인터페이스를 **구현**한다. (B implements A)

**예시**: `Repository <|.. CustomerRepository`

**특징**:
- 인터페이스와 구현 클래스 간의 관계
- 삼각형은 **인터페이스** 쪽에 위치

---

### 7. 내부 클래스 (Inner Class) - `+--`

```
A +-- B
```

**의미**: B는 A의 **내부 클래스**이다.

**예시**: `OrderController +-- DeleteCartRequest`

**특징**:
- 클래스 안에 정의된 클래스
- 외부 클래스와 강하게 결합

---

## 다중성 (Multiplicity) 표기

| 표기 | 의미 |
|------|------|
| `"1"` | 정확히 1개 |
| `"0..1"` | 0개 또는 1개 (Optional) |
| `"*"` | 0개 이상 (다수) |
| `"1..*"` | 1개 이상 |
| `"0..*"` | 0개 이상 (`*`와 동일) |

**예시**:
```
Order "1" *-- "*" OrderItem
```
→ 하나의 Order는 여러 개(0개 이상)의 OrderItem을 가진다.

---

## 관계 요약표

| Mermaid 문법 | UML 명칭 | 모양 | 의미 |
|-------------|----------|------|------|
| `-->` | Association | 실선 화살표 | 참조/사용 관계 |
| `..>` | Dependency | 점선 화살표 | 일시적 의존 |
| `*--` | Composition | 속 찬 마름모 + 실선 | 강한 소유 (생명주기 공유) |
| `o--` | Aggregation | 속 빈 마름모 + 실선 | 약한 소유 (생명주기 독립) |
| `<\|--` | Inheritance | 속 빈 삼각형 + 실선 | 상속 (extends) |
| `<\|..` | Realization | 속 빈 삼각형 + 점선 | 구현 (implements) |
| `+--` | Inner Class | + 기호 | 내부 클래스 |

---

## 컴포지션 vs 집약 비교

| 구분 | 컴포지션 (Composition) | 집약 (Aggregation) |
|------|----------------------|-------------------|
| 마름모 | ◆ (속이 참) | ◇ (속이 빔) |
| 생명주기 | 동일 (부모 삭제 시 자식도 삭제) | 독립 (부모 삭제해도 자식 존재) |
| 소유권 | 강함 | 약함 |
| 예시 | Order-OrderItem | Team-Member |
| 비유 | 사람-심장 (사람 죽으면 심장도 끝) | 회사-직원 (회사 망해도 직원은 존재) |
