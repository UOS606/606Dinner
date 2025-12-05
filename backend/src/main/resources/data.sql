-- MySQL용 data.sql
-- JPA가 테이블 만든 뒤 data.sql이 실행되도록 application.properties에
-- spring.jpa.defer-datasource-initialization=true  설정 권장

-- =========================
-- styles
-- =========================
INSERT INTO styles(code, name) VALUES
  ('SIMPLE','Simple'),
  ('GRAND','Grand'),
  ('DELUXE','Deluxe'),
  ('DEFAULT','Default')
ON DUPLICATE KEY UPDATE
  name = VALUES(name);

-- =========================
-- style_surcharges (스타일별 기본가산비용)
-- =========================
INSERT INTO style_surcharges(style_id, surcharge_type, surcharge_value)
SELECT s.id, 'FLAT', 0
FROM styles s
WHERE s.code='DEFAULT'
ON DUPLICATE KEY UPDATE
  surcharge_value = VALUES(surcharge_value);

INSERT INTO style_surcharges(style_id, surcharge_type, surcharge_value)
SELECT s.id, 'FLAT', 5000
FROM styles s
WHERE s.code='GRAND'
ON DUPLICATE KEY UPDATE
  surcharge_value = VALUES(surcharge_value);

INSERT INTO style_surcharges(style_id, surcharge_type, surcharge_value)
SELECT s.id, 'FLAT', 12000
FROM styles s
WHERE s.code='DELUXE'
ON DUPLICATE KEY UPDATE
  surcharge_value = VALUES(surcharge_value);

-- =========================
-- units
-- =========================
INSERT INTO units(code, name) VALUES
  ('CUP','잔'),
  ('BOTTLE','병'),
  ('POT','포트'),
  ('PLATE','접시'),
  ('SERVING','인분'),
  ('PIECE','개')
ON DUPLICATE KEY UPDATE
  name = VALUES(name);

-- =========================
-- items
-- (기존 메뉴 및 품목)
-- =========================
INSERT INTO items(code, name, base_price, is_active) VALUES
  ('STEAK','스테이크',10000,1),
  ('SALAD','샐러드', 5000,1),
  ('WINE','와인',   NULL,1),
  ('CHAMPAGNE','샴페인',NULL,1),
  ('COFFEE','커피', NULL,1),
  ('EGG_SCRAMBLE','에그스크램블',1000,1),
  ('BACON','베이컨',1500,1),
  ('BREAD','빵',2000,1),
  ('BAGUETTE','바게트',1500,1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  base_price = VALUES(base_price),
  is_active = VALUES(is_active);

-- =========================
-- item_unit_prices (단위별 판매가)
--  (item_id, unit_id) 유니크 필요
-- =========================
INSERT INTO item_unit_prices(item_id, unit_id, price)
SELECT i.id, u.id, 10000 FROM items i JOIN units u ON i.code='STEAK'       AND u.code='PLATE'  UNION ALL
SELECT i.id, u.id,  5000 FROM items i JOIN units u ON i.code='SALAD'       AND u.code='PLATE'  UNION ALL
SELECT i.id, u.id,  1000 FROM items i JOIN units u ON i.code='EGG_SCRAMBLE' AND u.code='SERVING' UNION ALL
SELECT i.id, u.id,  1500 FROM items i JOIN units u ON i.code='BACON'       AND u.code='SERVING' UNION ALL
SELECT i.id, u.id,  2000 FROM items i JOIN units u ON i.code='BREAD'       AND u.code='PIECE'  UNION ALL
SELECT i.id, u.id,  1500 FROM items i JOIN units u ON i.code='BAGUETTE'    AND u.code='PIECE'  UNION ALL
SELECT i.id, u.id,  5000 FROM items i JOIN units u ON i.code='WINE'        AND u.code='CUP'    UNION ALL
SELECT i.id, u.id, 18000 FROM items i JOIN units u ON i.code='WINE'        AND u.code='BOTTLE' UNION ALL
SELECT i.id, u.id,  1000 FROM items i JOIN units u ON i.code='COFFEE'      AND u.code='CUP'    UNION ALL
SELECT i.id, u.id,  8000 FROM items i JOIN units u ON i.code='COFFEE'      AND u.code='POT'    UNION ALL
SELECT i.id, u.id,  7000 FROM items i JOIN units u ON i.code='CHAMPAGNE'   AND u.code='CUP'    UNION ALL
SELECT i.id, u.id, 45000 FROM items i JOIN units u ON i.code='CHAMPAGNE'   AND u.code='BOTTLE'
ON DUPLICATE KEY UPDATE
  price = VALUES(price);

-- =========================
-- ingredients (초기 재고)
-- 프론트 key(한글)과 반드시 동일해야 함
-- =========================
INSERT INTO ingredients(name, quantity, unit) VALUES
  ('샴페인',     50, '잔'),
  ('와인',       50, '잔'),
  ('커피',       50, '잔'),
  ('바게트',     50, '개'),
  ('빵',         50, '개'),
  ('샐러드',     50, '접시'),
  ('스테이크',   50, '접시'),
  ('베이컨',     50, '인분'),
  ('에그스크램블', 50, '인분')
ON DUPLICATE KEY UPDATE
  quantity = VALUES(quantity),
  unit     = VALUES(unit);

-- =========================
-- customers (admin 계정)
-- password: 1234 (BCrypt 해시)
-- =========================
INSERT INTO customers(username, password_hash, name, email, phone, address, card_number, role, enabled, unused_coupon_count, used_coupon_count) VALUES
  ('admin', '$2b$10$iNLUSUvufitW8B1x4OLCYulMa8JfM/qI6.DIqVho.rupLyG/4RRK.', '관리자', 'admin@606dinner.com', '01000000000', '서울특별시 관리자동', '0000000000000000', 'ROLE_ADMIN', 1, 0, 0)
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  role = VALUES(role);
