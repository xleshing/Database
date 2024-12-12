DROP DATABASE IF EXISTS fruit_store;
SHOW DATABASES;

CREATE DATABASE fruit_store;
USE fruit_store;
SHOW TABLES;
DROP TABLE IF EXISTS fruits;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS inactive_members;
DROP TABLE IF EXISTS suppliers;

CREATE TABLE fruits (
			fruit_id VARCHAR(13) PRIMARY KEY CHECK (fruit_id REGEXP '^[0-9]{2}-[0-9]{3}-[0-9]{3}-[0-9]{2}$'), 	-- 水果編號 (格式: YY-YYY-YYY-YY)
			fruit_name VARCHAR(12) NOT NULL,          															-- 水果名稱 (最多 12 個字元)
			supplier_name VARCHAR(12) NOT NULL,       															-- 水果供應商名稱 (最多 12 個字元)
			quantity INT CHECK (quantity >= 0 AND quantity <= 999999), 											-- 公司內現有數量 (最多 6 位整數，且不可為負數)
			unit VARCHAR(4) NOT NULL,                 															-- 單位 (最多 4 個字元)
			purchase_price DECIMAL(8, 2) CHECK (purchase_price >= 0), 											-- 進貨單價 (6 位整數 + 2 位小數)
			total_value DECIMAL(8, 2) GENERATED ALWAYS AS (quantity * purchase_price), 							-- 現有價值小計
			storage_location VARCHAR(12) NOT NULL,    															-- 公司內存放位置 (最多 12 個字元)
			purchase_date DATE NOT NULL,              															-- 進貨日期
			promotion_start_date DATE,                															-- 開始促銷日期
			discard_date DATE                         															-- 該丟棄之日期
		);
        
CREATE TABLE members (
			member_id VARCHAR(10) PRIMARY KEY CHECK (member_id REGEXP '^[A-Z]{1}[0-9]{9}$'), -- 格式: 1 英文字母 + 9 數字
			member_name VARCHAR(12) NOT NULL,
			phone_number VARCHAR(16) CHECK (phone_number REGEXP '^[0-9]{16}$'),
			mobile_number VARCHAR(16) CHECK (mobile_number REGEXP '^[0-9]{16}$'),
			email VARCHAR(36) NOT NULL,
			joined_line BOOLEAN DEFAULT FALSE,
			address VARCHAR(60),
			age INT CHECK (age >= 0),
			photo_base64 LONGTEXT, 
			discount DECIMAL(3, 2) DEFAULT 1.00 CHECK (discount >= 0 AND discount <= 1)
		);
        
CREATE TABLE suppliers (
			supplier_id VARCHAR(8) PRIMARY KEY CHECK (supplier_id REGEXP '^[0-9]{8}'),	-- 供應商統一編號 (8 位數字)
			supplier_name VARCHAR(12) NOT NULL,       									-- 供應商名稱 (最多 12 個字元)
			phone_number VARCHAR(16) CHECK (phone_number REGEXP '^[0-9]{16}$'),
			email VARCHAR(36) NOT NULL,               									-- Email
			address VARCHAR(60),                      									-- 住址
			contact_name VARCHAR(12) NOT NULL         									-- 負責人姓名
		);
        
CREATE TABLE transactions (
			fruit_id VARCHAR(13),    														-- 水果編號 (格式: YY-YYY-YYY-YY)  --> foreign key to fruits
			member_id VARCHAR(10) , 														-- 會員身份證字號  格式: 1 英文字母 + 9 數字 --> foreign key to members
			fruit_name VARCHAR(12) NOT NULL,          										-- 水果名稱 (最多 12 個字元)	
			supplier_name VARCHAR(12) NOT NULL,       										-- 水果供應商名稱 (最多 12 個字元)  --> foreign key to supplier
			purchase_quantity INT  NOT NULL,												-- 購買數量 (最多 6 位整數，且不可為負數)
			sale_price DECIMAL(8, 2) NOT NULL,                								-- 出售單價
			total_price DECIMAL(8, 2) GENERATED ALWAYS AS (purchase_quantity * sale_price), -- 總金額
			price_after_discount DECIMAL(8, 2), 											-- 折扣後金額
			transaction_date DATE NOT NULL,              									-- 交易日期
			expected_shipping_date DATE NOT NULL,                							-- 預計交運日期
			actual_shipping_date DATE,                         								-- 實際交運日期日期
			
            CHECK (purchase_quantity >= 0 AND purchase_quantity <= 999999),

			PRIMARY KEY (fruit_id, member_id),
            
			FOREIGN KEY (fruit_id) REFERENCES fruits(fruit_id)
				ON DELETE CASCADE
				ON UPDATE CASCADE,
			FOREIGN KEY (member_id) REFERENCES members(member_id)
				ON DELETE CASCADE
				ON UPDATE CASCADE
		);
        
INSERT INTO fruits (fruit_id, fruit_name, supplier_name, quantity, unit, purchase_price, storage_location, purchase_date, promotion_start_date, discard_date) 
		VALUES ('12-345-678-90', '火龍果', '銘傳水果公司', 30, '粒', 10.00, '一樓冷藏倉庫', '2022-11-04', '2022-11-08', '2022-11-12');
INSERT INTO fruits (fruit_id, fruit_name, supplier_name, quantity, unit, purchase_price, storage_location, purchase_date, promotion_start_date, discard_date)
		VALUES ('12-345-678-91', '蘋果', '銘傳水果公司司', 30, '粒', 10.00, '一樓冷藏倉庫', '2022-11-04', '2022-11-08', '2022-11-12');
        INSERT INTO fruits (fruit_id, fruit_name, supplier_name, quantity, unit, purchase_price, storage_location, purchase_date, promotion_start_date, discard_date)
		VALUES ('12-345-678-92', '橘子', '銘傳水果公司司', 30, '粒', 10.00, '一樓冷藏倉庫', '2022-11-04', '2022-11-08', '2022-11-12');
        
        INSERT INTO members (member_id, member_name, phone_number, mobile_number, email, joined_line, address, age, discount) 
		VALUES ('B123456789', '純純', '0423456666', '0910000000', 'xxxx@thu.edu.tw', '是', '台中市仰德大道 YY 號', 20, 0.88);
        INSERT INTO members (member_id, member_name, phone_number, mobile_number, email, joined_line, address, age, discount) 
		VALUES ('B187654321', '一純純', '0423456666', '0910000001', 'yxxx@thu.edu.tw', '是', '台中市仰德大道 YY 號', 20, 0.88);
        INSERT INTO members (member_id, member_name, phone_number, mobile_number, email, joined_line, address, age, discount) 
		VALUES ('C123456789', '二純純', '0423456666', '0910000001', 'yyxx@thu.edu.tw', '是', '台中市仰德大道 YY 號', 20, 0.88);
        
        INSERT INTO suppliers (supplier_id, supplier_name, phone_number, email, address, contact_name) 
		VALUES ('12345678', '海岸水果批發公司', 0423590121, 'yyyy@coast.com', '台中市仰德大道ZZ號', '王海東');
        INSERT INTO suppliers (supplier_id, supplier_name, phone_number, email, address, contact_name) 
		VALUES ('12345679', '山岸水果批發公司', 0423590122, 'ayyy@coast.com', '台中市仰德大道ZQ號', '王海西');
        INSERT INTO suppliers (supplier_id, supplier_name, phone_number, email, address, contact_name) 
		VALUES ('12345670', '天空水果批發公司', 0423590123, 'byyy@coast.com', '台中市仰德大道ZA號', '王海南');
     
INSERT INTO transactions (fruit_id, member_id, fruit_name, supplier_name, purchase_quantity, sale_price, transaction_date, expected_shipping_date, actual_shipping_date) 
		VALUES ('12-345-678-90', 'B187654321', '火龍果', '海岸水果批發公司', 20, 20.00, '2022-11-04', '2022-11-06', '2022-11-06');
INSERT INTO transactions (fruit_id, member_id, fruit_name, supplier_name, purchase_quantity, sale_price, transaction_date, expected_shipping_date, actual_shipping_date) 
		VALUES ('12-345-678-91', 'B187654321', '蘋果', '山岸水果批發公司', 21, 20.00, '2022-11-04', '2022-11-06', '2022-11-06');
INSERT INTO transactions (fruit_id, member_id, fruit_name, supplier_name, purchase_quantity, sale_price, transaction_date, expected_shipping_date, actual_shipping_date) 
		VALUES ('12-345-678-92', 'B187654321', '橘子', '天空水果批發公司', 22, 20.00, '2022-11-04', '2022-11-06', '2022-11-06');
        
        
SELECT * FROM fruits;
SELECT * FROM members;
SELECT * FROM inactive;
SELECT * FROM suppliers;
SELECT * FROM transactions;

SELECT fruit_id, fruit_name, supplier_name, quantity, unit, purchase_price, total_value, storage_location, purchase_date, promotion_start_date, discard_date FROM fruits WHERE display = 1;

-- CREATE TABLE fruits (
--     fruit_id VARCHAR(15) PRIMARY KEY,          -- 水果編號 (格式: YY-YYY-YYY-YY)
--     fruit_name VARCHAR(12) NOT NULL,          -- 水果名稱 (最多 12 個字元)
--     supplier_name VARCHAR(12) NOT NULL,       -- 水果供應商名稱 (最多 12 個字元)
--     quantity INT CHECK (quantity >= 0 AND quantity <= 999999), -- 公司內現有數量 (最多 6 位整數，且不可為負數)
--     unit VARCHAR(4) NOT NULL,                 -- 單位 (最多 4 個字元)
--     purchase_price DECIMAL(8, 2) CHECK (purchase_price >= 0), -- 進貨單價 (6 位整數 + 2 位小數)
--     total_value DECIMAL(8, 2) GENERATED ALWAYS AS (quantity * purchase_price), -- 現有價值小計
--     storage_location VARCHAR(12) NOT NULL,    -- 公司內存放位置 (最多 12 個字元)
--     purchase_date DATE NOT NULL,              -- 進貨日期
--     promotion_start_date DATE,                -- 開始促銷日期
--     discard_date DATE                         -- 該丟棄之日期
-- );

-- SELECT * FROM fruits;

-- CREATE TABLE members (
--     member_id VARCHAR(10) PRIMARY KEY CHECK (member_id REGEXP '^[A-Z][0-9]{9}$'), -- 格式: 1 英文字母 + 9 數字
--     member_name VARCHAR(12) NOT NULL,
--     phone_number VARCHAR(16),
--     mobile_number VARCHAR(16),
--     email VARCHAR(36) NOT NULL,
--     joined_line BOOLEAN DEFAULT FALSE,
--     address VARCHAR(60),
--     age INT CHECK (age >= 0),
--     photo_base64 LONGTEXT, 
--     discount DECIMAL(3, 2) DEFAULT 1.00 CHECK (discount >= 0 AND discount <= 1)
-- );

-- SELECT * FROM members;

-- CREATE TABLE inactive_members (
--     member_id VARCHAR(10) PRIMARY KEY CHECK (member_id REGEXP '^[A-Z][0-9]{9}$'), -- 格式: 1 英文字母 + 9 數字
--     member_name VARCHAR(12) NOT NULL,
--     phone_number VARCHAR(16),
--     mobile_number VARCHAR(16),
--     email VARCHAR(36) NOT NULL,
--     joined_line BOOLEAN DEFAULT FALSE,
--     address VARCHAR(60),
--     age INT CHECK (age >= 0),
--     photo_base64 LONGTEXT, 
--     discount DECIMAL(3, 2) DEFAULT 1.00 CHECK (discount >= 0 AND discount <= 1)
-- );

-- SELECT * FROM inactive_members;


-- CREATE TABLE suppliers (
--     supplier_id VARCHAR(8) PRIMARY KEY,        -- 供應商統一編號 (8 位數字)
--     supplier_name VARCHAR(12) NOT NULL,       -- 供應商名稱 (最多 12 個字元)
--     phone_number VARCHAR(16),                 -- 電話
--     email VARCHAR(36) NOT NULL,               -- Email
--     address VARCHAR(60),                      -- 住址
--     contact_name VARCHAR(12) NOT NULL         -- 負責人姓名
-- );

-- SELECT * FROM suppliers;