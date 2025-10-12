-- styles
INSERT INTO styles(code,name) VALUES ('SIMPLE','Simple'),('GRAND','Grand'),('DELUXE','Deluxe'),('DEFAULT','Default');
INSERT INTO style_surcharges(style_id,surcharge_type,value)
SELECT id,'FLAT',0 FROM styles WHERE code='DEFAULT';
-- 예: 그랜드 +5000, 디럭스 +12000
INSERT INTO style_surcharges(style_id,surcharge_type,value)
SELECT id,'FLAT',5000 FROM styles WHERE code='GRAND';
INSERT INTO style_surcharges(style_id,surcharge_type,value)
SELECT id,'FLAT',12000 FROM styles WHERE code='DELUXE';

-- units
INSERT INTO units(code,name) VALUES
('CUP','잔'),('BOTTLE','병'),('POT','포트'),('PLATE','접시'),('SERVING','인분'),('PIECE','개');

-- items
INSERT INTO items(code,name,base_price,is_active) VALUES
('STEAK','스테이크',10000,1),('SALAD','샐러드',5000,1),
('WINE','와인',NULL,1),('CHAMPAGNE','샴페인',NULL,1),('COFFEE','커피',NULL,1),
('EGG_SCRAMBLE','에그 스크램블',1000,1),('BACON','베이컨',1500,1),
('BREAD','빵',2000,1),('BAGUETTE','바게트',1500,1);

-- item_unit_prices (단위별 판매가)
INSERT INTO item_unit_prices(item_id,unit_id,price)
SELECT i.id,u.id,10000 FROM items i JOIN units u ON i.code='STEAK' AND u.code='PLATE' UNION ALL
SELECT i.id,u.id, 5000 FROM items i JOIN units u ON i.code='SALAD' AND u.code='PLATE' UNION ALL
SELECT i.id,u.id, 1000 FROM items i JOIN units u ON i.code='EGG_SCRAMBLE' AND u.code='SERVING' UNION ALL
SELECT i.id,u.id, 1500 FROM items i JOIN units u ON i.code='BACON' AND u.code='SERVING' UNION ALL
SELECT i.id,u.id, 2000 FROM items i JOIN units u ON i.code='BREAD' AND u.code='PIECE' UNION ALL
SELECT i.id,u.id, 1500 FROM items i JOIN units u ON i.code='BAGUETTE' AND u.code='PIECE' UNION ALL
SELECT i.id,u.id, 5000 FROM items i JOIN units u ON i.code='WINE' AND u.code='CUP' UNION ALL
SELECT i.id,u.id,18000 FROM items i JOIN units u ON i.code='WINE' AND u.code='BOTTLE' UNION ALL
SELECT i.id,u.id, 1000 FROM items i JOIN units u ON i.code='COFFEE' AND u.code='CUP' UNION ALL
SELECT i.id,u.id, 8000 FROM items i JOIN units u ON i.code='COFFEE' AND u.code='POT' UNION ALL
SELECT i.id,u.id, 7000 FROM items i JOIN units u ON i.code='CHAMPAGNE' AND u.code='CUP' UNION ALL
SELECT i.id,u.id,45000 FROM items i JOIN units u ON i.code='CHAMPAGNE' AND u.code='BOTTLE';
