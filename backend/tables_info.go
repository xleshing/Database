package main

type Table struct {
	name               string
	create             string
	insert             []string
	display_attributes []string
}

var fruits Table = Table{
	name: "fruits",
	create: `
	CREATE TABLE fruits (
		fruit_id VARCHAR(13) PRIMARY KEY 
			CHECK (fruit_id LIKE '[0-9][0-9]-[0-9][0-9][0-9]-[0-9][0-9][0-9]-[0-9][0-9]'),   -- 水果編號 (格式: YY-YYY-YYY-YY)
		
		fruit_name NVARCHAR(12) NOT NULL,          															-- 水果名稱 (最多 12 個字元)
		supplier_name NVARCHAR(12) NOT NULL,       															-- 水果供應商名稱 (最多 12 個字元)
		quantity INT 
			CHECK (quantity >= 0 AND quantity <= 999999), 											-- 公司內現有數量 (最多 6 位整數，且不可為負數)
		unit NVARCHAR(4) NOT NULL,                 															-- 單位 (最多 4 個字元)
		purchase_price DECIMAL(8, 2) 
			CHECK (purchase_price >= 0), 															-- 進貨單價 (6 位整數 + 2 位小數)
		total_value AS (quantity * purchase_price) PERSISTED, 										-- 現有價值小計
		storage_location NVARCHAR(12) NOT NULL,    															-- 公司內存放位置 (最多 12 個字元)
		purchase_date DATE NOT NULL,              															-- 進貨日期
		promotion_start_date DATE,                															-- 開始促銷日期
		discard_date DATE,                         															-- 該丟棄之日期
		display BIT NOT NULL DEFAULT 1	
	)`,
	insert: []string{
		`INSERT INTO fruits (fruit_id, fruit_name, supplier_name, quantity, unit, purchase_price, storage_location, purchase_date, promotion_start_date, discard_date) 
		VALUES ('12-345-678-90', '火龍果', '火龍果水果公司', 100, '顆', 30.00, '一樓冷藏倉庫', '2022-11-04', '2022-11-08', '2028-11-12')`,
		`INSERT INTO fruits (fruit_id, fruit_name, supplier_name, quantity, unit, purchase_price, storage_location, purchase_date, promotion_start_date, discard_date)
		VALUES ('12-345-678-91', '蘋果', '蘋果水果公司', 200, '顆', 50.00, '二樓冷藏倉庫', '2022-11-04', '2022-11-08', '2029-11-12')`,
		`INSERT INTO fruits (fruit_id, fruit_name, supplier_name, quantity, unit, purchase_price, storage_location, purchase_date, promotion_start_date, discard_date)
		VALUES ('12-345-678-92', '橘子', '橘子水果公司', 150, '顆', 55.00, '一樓冷藏倉庫', '2022-11-04', '2022-11-08', '2077-11-12')`,
		`INSERT INTO fruits (fruit_id, fruit_name, supplier_name, quantity, unit, purchase_price, storage_location, purchase_date, promotion_start_date, discard_date)
		VALUES ('12-345-678-93', '香蕉', '香蕉水果公司', 500, '支', 100.00, '三樓冷藏倉庫', '2022-11-04', '2022-11-08', '2058-11-12')`,
		`INSERT INTO fruits (fruit_id, fruit_name, supplier_name, quantity, unit, purchase_price, storage_location, purchase_date, promotion_start_date, discard_date)
		VALUES ('12-345-678-94', '蓮霧', '蓮霧水果公司', 110, '顆', 90.00, 'PS5旁邊', '2022-11-04', '2022-11-08', '2057-11-12')`,
		`INSERT INTO fruits (fruit_id, fruit_name, supplier_name, quantity, unit, purchase_price, storage_location, purchase_date, promotion_start_date, discard_date)
		VALUES ('12-345-678-95', '楊桃', '楊桃水果公司', 90, '顆', 80.00, 'Switch旁邊', '2022-11-04', '2022-11-08', '3025-11-12')`,
		`INSERT INTO fruits (fruit_id, fruit_name, supplier_name, quantity, unit, purchase_price, storage_location, purchase_date, promotion_start_date, discard_date)
		VALUES ('12-345-678-96', '芭樂', '芭樂水果公司', 800, '顆', 70.00, 'Switch旁邊', '2022-11-04', '2022-11-08', '2578-11-12')`,
		`INSERT INTO fruits (fruit_id, fruit_name, supplier_name, quantity, unit, purchase_price, storage_location, purchase_date, promotion_start_date, discard_date)
		VALUES ('12-345-678-97', '鳳梨', '鳳梨水果公司', 70, '顆', 150.00, '十樓冷藏倉庫', '2022-11-04', '2022-11-08', '2678-11-12')`,
		`INSERT INTO fruits (fruit_id, fruit_name, supplier_name, quantity, unit, purchase_price, storage_location, purchase_date, promotion_start_date, discard_date)
		VALUES ('12-345-678-98', '番茄', '番茄水果公司', 800, '顆', 10.00, '九樓冷藏倉庫', '2022-11-04', '2022-11-08', '2778-11-12')`,
		`INSERT INTO fruits (fruit_id, fruit_name, supplier_name, quantity, unit, purchase_price, storage_location, purchase_date, promotion_start_date, discard_date)
		VALUES ('12-345-678-99', '棗子', '棗子水果公司', 5000, '顆', 30.00, '九樓冷藏倉庫', '2022-11-04', '2022-11-08', '2878-11-12')`,
	},
	display_attributes: []string{
		"fruit_id",
		"fruit_name",
		"supplier_name",
		"quantity",
		"unit",
		"purchase_price",
		"total_value",
		"storage_location",
		"purchase_date",
		"promotion_start_date",
		"discard_date",
	},
}

var members Table = Table{
	name: "members",
	create: `
	CREATE TABLE members (
		member_id VARCHAR(10) PRIMARY KEY 
			CHECK (member_id LIKE '[A-Z][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'), -- 格式: 1 英文字母 + 9 數字

		member_name NVARCHAR(12) NOT NULL,
		
		phone_number VARCHAR(16) 
			CHECK (phone_number NOT LIKE '%[^0-9]%'), -- 1-16 位數字
		
		mobile_number VARCHAR(16) 
			CHECK (mobile_number NOT LIKE '%[^0-9]%'), -- 1-16 位數字
		
		email VARCHAR(36) NOT NULL,
		
		joined_line NVARCHAR(8) DEFAULT '不是',
		
		address NVARCHAR(60),
		
		age INT 
			CHECK (age >= 0),
		
		photo NVARCHAR(MAX), -- Base64
		
		discount DECIMAL(3, 2) DEFAULT 0.88 
			CHECK (discount >= 0 AND discount <= 1),
		
		display BIT NOT NULL DEFAULT 1, -- 1 表示顯示，0 表示隱藏
		
		username VARCHAR(20) NOT NULL,
		
		password VARCHAR(20) NOT NULL
	)`,
	insert: []string{
		`INSERT INTO members (member_id, member_name, phone_number, mobile_number, email, joined_line, address, age, discount, username, password) 
		VALUES ('B123456789', '純純', '0423456666', '0910000000', 'xxxx@thu.edu.tw', '是', '台中市仰德大道 YY 號', 20, 0.88, 'afaifai', '123456789')`,
		`INSERT INTO members (member_id, member_name, phone_number, mobile_number, email, joined_line, address, age, discount, username, password) 
		VALUES ('B187654321', '一純純', '0423456666', '0910000001', 'yxxx@thu.edu.tw', '是', '台中市仰德大道 YY 號', 20, 0.88, 'afaifai', '123456789')`,
		`INSERT INTO members (member_id, member_name, phone_number, mobile_number, email, joined_line, address, age, discount, username, password) 
		VALUES ('C123456789', '二純純', '0423456666', '0910000001', 'yyxx@thu.edu.tw', '是', '台中市仰德大道 YY 號', 20, 0.88, 'afaifai', '123456789')`,
	},
	display_attributes: []string{
		"member_id",
		"member_name",
		"phone_number",
		"mobile_number",
		"email",
		"joined_line",
		"address",
		"age",
		"photo",
		"discount",
		"username",
		"password",
	},
}

var inactive Table = Table{
	name: "inactive",
	create: `
	CREATE TABLE inactive (
		member_id VARCHAR(10) PRIMARY KEY 
			CHECK (member_id LIKE '[A-Z][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'), -- 格式: 1 英文字母 + 9 數字

		member_name NVARCHAR(12) NOT NULL,
		
		phone_number VARCHAR(16) 
			CHECK (phone_number NOT LIKE '%[^0-9]%'), -- 1-16 位數字
		
		mobile_number VARCHAR(16) 
			CHECK (mobile_number NOT LIKE '%[^0-9]%'), -- 1-16 位數字
		
		email VARCHAR(36) NOT NULL,
		
		joined_line NVARCHAR(8) DEFAULT '不是',
		
		address NVARCHAR(60),
		
		age INT 
			CHECK (age >= 0),
		
		photo NVARCHAR(MAX), -- Base64
		
		discount DECIMAL(3, 2) DEFAULT 0.88 
			CHECK (discount >= 0 AND discount <= 1),
		
		display BIT NOT NULL DEFAULT 1, -- 1 表示顯示，0 表示隱藏
		
		username VARCHAR(20) NOT NULL,
		
		password VARCHAR(20) NOT NULL
	)`,
	insert: []string{
		`INSERT INTO inactive (member_id, member_name, phone_number, mobile_number, email, joined_line, address, age, discount, username, password) 
		VALUES ('D123456789', '三純純', '0423456666', '0910000000', 'xxxx@thu.edu.tw', '是', '台中市仰德大道 YY 號', 20, 0.88, 'afaifai', '123456789')`,
		`INSERT INTO inactive (member_id, member_name, phone_number, mobile_number, email, joined_line, address, age, discount, username, password) 
		VALUES ('E123456789', '四純純', '0423456666', '0910000001', 'yxxx@thu.edu.tw', '是', '台中市仰德大道 YY 號', 20, 0.88, 'afaifai', '123456789')`,
		`INSERT INTO inactive (member_id, member_name, phone_number, mobile_number, email, joined_line, address, age, discount, username, password) 
		VALUES ('F123456789', '五純純', '0423456666', '0910000001', 'yyxx@thu.edu.tw', '是', '台中市仰德大道 YY 號', 20, 0.88, 'afaifai', '123456789')`,
	},
	display_attributes: []string{
		"member_id",
		"member_name",
		"phone_number",
		"mobile_number",
		"email",
		"joined_line",
		"address",
		"age",
		"photo",
		"discount",
		"username",
		"password",
	},
}

var suppliers Table = Table{
	name: "suppliers",
	create: `
	CREATE TABLE suppliers (
		supplier_id VARCHAR(8) PRIMARY KEY 
			CHECK (supplier_id LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'), -- 供應商統一編號 (8 位數字)

		supplier_name NVARCHAR(12) NOT NULL,                                        -- 供應商名稱 (最多 12 個字元)

		phone_number VARCHAR(16) 
			CHECK (phone_number NOT LIKE '%[^0-9]%'),                             -- 1-16 位數字

		email VARCHAR(36) NOT NULL,                                                -- Email

		address NVARCHAR(60),                                                       -- 住址

		contact_name NVARCHAR(12) NOT NULL,                                        -- 負責人姓名

		display BIT NOT NULL DEFAULT 1  
	)`,
	insert: []string{
		`INSERT INTO suppliers (supplier_id, supplier_name, phone_number, email, address, contact_name) 
		VALUES ('12345678', '火龍果水果批發公司', 0423590121, 'yyyy@coast.com', '台中市仰德大道ZZ號', '王海東')`,
		`INSERT INTO suppliers (supplier_id, supplier_name, phone_number, email, address, contact_name) 
		VALUES ('12345679', '蘋果水果批發公司', 0423590122, 'ayyy@coast.com', '台中市仰德大道ZQ號', '王海西')`,
		`INSERT INTO suppliers (supplier_id, supplier_name, phone_number, email, address, contact_name) 
		VALUES ('12345670', '橘子水果批發公司', 0423590123, 'byyy@coast.com', '台中市仰德大道ZA號', '王海南')`,
		`INSERT INTO suppliers (supplier_id, supplier_name, phone_number, email, address, contact_name) 
		VALUES ('12345671', '香蕉水果批發公司', 0423590124, 'byyy@coast.com', '台中市仰德大道ZA號', '王海東')`,
		`INSERT INTO suppliers (supplier_id, supplier_name, phone_number, email, address, contact_name) 
		VALUES ('12345672', '蓮霧水果批發公司', 0423590125, 'byyy@coast.com', '台中市仰德大道ZA號', '王海北')`,
		`INSERT INTO suppliers (supplier_id, supplier_name, phone_number, email, address, contact_name) 
		VALUES ('12345673', '楊桃水果批發公司', 0423590126, 'byyy@coast.com', '台中市仰德大道ZA號', '王海南')`,
		`INSERT INTO suppliers (supplier_id, supplier_name, phone_number, email, address, contact_name) 
		VALUES ('12345674', '芭樂水果批發公司', 0423590126, 'byyy@coast.com', '台中市仰德大道ZA號', '王海東')`,
		`INSERT INTO suppliers (supplier_id, supplier_name, phone_number, email, address, contact_name) 
		VALUES ('12345675', '鳳梨水果批發公司', 0423590126, 'byyy@coast.com', '台中市仰德大道ZA號', '王海西')`,
		`INSERT INTO suppliers (supplier_id, supplier_name, phone_number, email, address, contact_name) 
		VALUES ('12345676', '番茄水果批發公司', 0423590126, 'byyy@coast.com', '台中市仰德大道ZA號', '王海北')`,
		`INSERT INTO suppliers (supplier_id, supplier_name, phone_number, email, address, contact_name) 
		VALUES ('12345677', '棗子水果批發公司', 0423590126, 'byyy@coast.com', '台中市仰德大道ZA號', '王海南')`,
	},
	display_attributes: []string{
		"supplier_id",
		"supplier_name",
		"phone_number",
		"email",
		"address",
		"contact_name",
	},
}

var transactions Table = Table{
	name: "transactions",
	create: `
		CREATE TABLE transactions (
		transaction_id INT UNIQUE IDENTITY(1,1), 											-- 交易編號，自動遞增
		fruit_id VARCHAR(13) NOT NULL,    													-- 水果編號 (格式: YY-YYY-YYY-YY)  --> foreign key to fruits
		member_id VARCHAR(10) NOT NULL, 													-- 會員身份證字號  格式: 1 英文字母 + 9 數字 --> foreign key to members
		fruit_name NVARCHAR(12) NOT NULL,          										-- 水果名稱 (最多 12 個字元)	
		supplier_name NVARCHAR(12) NOT NULL,       										-- 水果供應商名稱 (最多 12 個字元)  --> foreign key to supplier
		purchase_quantity INT NOT NULL CHECK (purchase_quantity >= 0 AND purchase_quantity <= 999999),	-- 購買數量 (最多 6 位整數，且不可為負數)
		sale_price DECIMAL(8, 2) NOT NULL,                								-- 出售單價
		total_price AS (purchase_quantity * sale_price) PERSISTED, 						-- 總金額，計算欄位
		price_after_discount DECIMAL(8, 2), 												-- 折扣後金額
		transaction_date DATE NOT NULL,              										-- 交易日期
		expected_shipping_date DATE NOT NULL,                								-- 預計交運日期
		actual_shipping_date DATE,                         								-- 實際交運日期日期
		display BIT NOT NULL DEFAULT 1,														-- 顯示狀態 (1 表示顯示，0 表示隱藏)
		shipped AS (
			CASE
				WHEN actual_shipping_date IS NULL THEN 0
				ELSE 1
			END
		) PERSISTED,																		-- 計算欄位，標示是否已發貨
		
		CHECK (purchase_quantity >= 0 AND purchase_quantity <= 999999),
		
		PRIMARY KEY (transaction_id, fruit_id, member_id),
		
		FOREIGN KEY (fruit_id) REFERENCES fruits(fruit_id)
			ON DELETE CASCADE
			ON UPDATE CASCADE,
		FOREIGN KEY (member_id) REFERENCES members(member_id)
			ON DELETE CASCADE
			ON UPDATE CASCADE
	)`,
	insert: []string{
		`INSERT INTO transactions (fruit_id, member_id, fruit_name, supplier_name, purchase_quantity, sale_price, transaction_date, expected_shipping_date, actual_shipping_date, price_after_discount) 
		VALUES ('12-345-678-90', 'B187654321', '火龍果', '海岸水果批發公司', 20, 20.00, '2022-11-04', '2022-11-06', '2022-11-06', 352.00)`,
		`INSERT INTO transactions (fruit_id, member_id, fruit_name, supplier_name, purchase_quantity, sale_price, transaction_date, expected_shipping_date, actual_shipping_date, price_after_discount) 
		VALUES ('12-345-678-91', 'B187654321', '蘋果', '山岸水果批發公司', 21, 20.00, '2022-11-04', '2022-11-06', '2022-11-06', 369.60)`,
		`INSERT INTO transactions (fruit_id, member_id, fruit_name, supplier_name, purchase_quantity, sale_price, transaction_date, expected_shipping_date, actual_shipping_date, price_after_discount) 
		VALUES ('12-345-678-92', 'B187654321', '橘子', '天空水果批發公司', 22, 20.00, '2022-11-04', '2022-11-06', '2022-11-06', 387.20)`,
	},
	display_attributes: []string{
		"transaction_id",
		"fruit_id",
		"member_id",
		"fruit_name",
		"supplier_name",
		"purchase_quantity",
		"sale_price",
		"total_price",
		"price_after_discount",
		"transaction_date",
		"expected_shipping_date",
		"actual_shipping_date",
	},
}

var Digit_attributes map[string]string = map[string]string{
	"quantity":          "30",
	"purchase_price":    "10.00",
	"age":               "20",
	"discount":          "0.88",
	"purchase_quantity": "20",
	"sale_price":        "20.00",
	"total_value":       "600.00",
	"shipped":           "0",
}
