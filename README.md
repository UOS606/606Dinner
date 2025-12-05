# 606 Dinner

디너 주문 및 배달 관리 시스템 (음성 주문 지원)

## 프로젝트 구조

```
606Dinner/
├── backend/          # Spring Boot 백엔드
├── frontend/         # React 프론트엔드
└── README.md
```

## 사전 요구사항

- **Java 21**
- **Node.js 18+**
- **MySQL 8.0**

## 설치 및 실행

### 1. Clone

```bash
git clone https://github.com/UOS606/606Dinner.git
cd 606Dinner
```

### 2. MySQL 설정

```bash
# MySQL 접속
mysql -u root -p

# 데이터베이스 생성
CREATE DATABASE mrdinner;
```

### 3. 백엔드 실행

```bash
cd backend

# application.properties에서 DB 비밀번호 설정
# backend/src/main/resources/application.properties
# spring.datasource.password=<your_mysql_password>

# 실행
./gradlew bootRun
```

백엔드 서버: http://localhost:8080

### 4. 프론트엔드 실행

```bash
cd frontend

# 의존성 설치
npm install

# 실행
npm start
```

프론트엔드: http://localhost:3000

### 5. AI 음성인식 서버 (선택사항)

음성 주문 기능을 사용하려면 Whisper/Qwen AI 서버가 필요합니다.
- ngrok을 통해 외부 AI 서버와 연결
- 없어도 일반 주문 기능은 정상 작동

## 계정 정보

| 역할 | 아이디 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin | 1234 |

## 주요 기능

### 고객
- 회원가입 / 로그인
- 디너 메뉴 조회 및 주문
- 장바구니
- 주문 내역 확인
- 음성 주문 (AI)
- 쿠폰 적립 및 사용

### 관리자
- 주문 관리 (조리/배달 배정)
- 재고 현황 확인
- 재료 주문

## 기술 스택

### Backend
- Spring Boot 3.5
- Spring Security + JWT
- Spring Data JPA
- MySQL 8.0
- Gradle

### Frontend
- React 18
- React Router
- CSS Modules

### AI (음성인식)
- Whisper (STT)
- Qwen (의도 분석)

## 팀

**Team 606** - 서울시립대학교
