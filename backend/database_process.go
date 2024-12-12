package main

import (
	"fmt"
	"log"
	"strconv"
)

func select_all(table string) ([]map[string]interface{}, error) {
	var SELECT, FROM, WHERE string = "SELECT ", fmt.Sprintf("FROM " + string(table)), " WHERE display = 1;"
	var table_type Table
	switch table {
	case fruits.name:
		table_type = fruits
	case members.name:
		table_type = members
	case inactive.name:
		table_type = inactive
	case suppliers.name:
		table_type = suppliers
	case transactions.name:
		table_type = transactions
	default:
		return nil, fmt.Errorf("error: table %s does not exist", table)
	}
	for i, attr := range table_type.display_attributes {
		if i == len(table_type.display_attributes)-1 {
			SELECT += attr + " "
		} else {
			SELECT += attr + ", "
		}
	}

	cmd := SELECT + FROM + WHERE
	log.Println(cmd)
	rows, err := DB.Query(cmd)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	var message []map[string]interface{}
	for rows.Next() {
		// 動態準備每一列的變數
		values := make([]interface{}, len(table_type.display_attributes))
		valuePtrs := make([]interface{}, len(table_type.display_attributes))
		for i := range values {
			valuePtrs[i] = &values[i] // 每列的指標
		}

		// Scan 將值存入 valuePtrs
		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, err
		}

		// 將列名與值組合成 map
		row_map := make(map[string]interface{})
		for i, attr := range table_type.display_attributes {
			var v interface{}
			if b, ok := values[i].([]byte); ok {
				v = string(b) // 將 []byte 轉為字串
			} else {
				v = values[i] // 保持原始類型
			}
			row_map[attr] = v
			// fmt.Print(attr, ": ", v, " ")
		}
		// fmt.Println()
		message = append(message, row_map)
	}

	return message, err
}

func update_table(table string, conditions map[string]string, updates map[string]string) ([]map[string]interface{}, error) {
	var conds, upds string = "", ""
	for key, value := range conditions {
		if value != "" {
			if _, is_digits := Digit_attributes[key]; is_digits {
				conds += "AND " + key + "=" + value
			} else {
				conds += "AND " + key + "='" + value + "'"
			}
		}
	}

	for key, value := range updates {
		if value != "" {
			if _, is_digits := Digit_attributes[key]; is_digits {
				upds += ", " + key + "=" + value
			} else {
				upds += ", " + key + "='" + value + "'"
			}
		}
	}

	cmd := fmt.Sprintf("UPDATE %s SET display=1 %s WHERE display=1 %s", table, upds, conds)
	_, err := DB.Exec(cmd)
	if err != nil {
		log.Println("error: ", err)
		return nil, err
	}
	return nil, nil
}
func insert_table(table string, data map[string]string) ([]map[string]interface{}, error) {
	if table == transactions.name {
		if member_id, exits := data["member_id"]; (!exits) || (member_id == "") {
			log.Println("error: member_id is required")
			return nil, fmt.Errorf("error: member_id is required")
		}
		member_id := data["member_id"]
		var discount_select_cmd string = "SELECT discount FROM members WHERE member_id='" + member_id + "'"
		log.Println(discount_select_cmd)
		rows, err := DB.Query(discount_select_cmd)
		if err != nil {
			log.Println("error: ", err)
			return nil, err
		}

		var discount, sale_price, price_after_discount float64
		var purchase_quantity int
		for rows.Next() {
			if err := rows.Scan(&discount); err != nil {
				log.Println("error: ", err)
				return nil, err
			}
		}
		if sale_price, exists := data["sale_price"]; (!exists) || (sale_price == "") {
			log.Println("error: sale_price is required")
			return nil, fmt.Errorf("error: sale_price is required")
		}
		sale_price, _ = strconv.ParseFloat(data["sale_price"], 64)
		if purchase_quantity, exists := data["purchase_quantity"]; (!exists) || (purchase_quantity == "") {
			log.Println("error: purchase_quantity is required")
			return nil, fmt.Errorf("error: purchase_quantity is required")
		}
		purchase_quantity, _ = strconv.Atoi(data["purchase_quantity"])
		price_after_discount = float64(sale_price) * float64(purchase_quantity) * discount

		var attrs, values string
		for key, value := range data {
			if value != "" {
				attrs += ", " + key
				if _, is_digits := Digit_attributes[key]; is_digits {
					values += ", " + value
				} else {
					values += ", '" + value + "'"
				}
			}
		}
		cmd := fmt.Sprintf("INSERT INTO %s (price_after_discount %s) VALUES (%.2f %s)", table, attrs, price_after_discount, values)
		log.Println(cmd)
		_, err = DB.Exec(cmd)
		if err != nil {
			log.Println("error: ", err)
			return nil, err
		}
	} else {
		var attrs, values string
		for key, value := range data {
			if value != "" {
				attrs += ", " + key
				if _, is_digits := Digit_attributes[key]; is_digits {
					values += ", " + value
				} else {
					values += ", '" + value + "'"
				}
			}
		}
		cmd := fmt.Sprintf("INSERT INTO %s (display %s) VALUES (1 %s)", table, attrs, values)
		log.Println(cmd)
		_, err := DB.Exec(cmd)
		if err != nil {
			log.Println("error: ", err)
			return nil, err
		}
	}
	return nil, nil
}

func select_table(table string, data map[string]string) ([]map[string]interface{}, error) {
	var SELECT, FROM, WHERE string = "SELECT ", fmt.Sprintf("FROM " + string(table)), " WHERE display = 1"
	var table_type Table
	switch table {
	case fruits.name:
		table_type = fruits
	case members.name:
		table_type = members
	case inactive.name:
		table_type = inactive
	case suppliers.name:
		table_type = suppliers
	case transactions.name:
		table_type = transactions
	default:
		return nil, fmt.Errorf("error: table %s does not exist", table)
	}
	for i, attr := range table_type.display_attributes {
		if i == len(table_type.display_attributes)-1 {
			SELECT += attr + " "
		} else {
			SELECT += attr + ", "
		}
	}
	for key, value := range data {
		if value != "" {
			if _, is_digits := Digit_attributes[key]; is_digits {
				WHERE += " AND " + key + " = " + value
			} else {
				WHERE += " AND " + key + " = '" + value + "'"
			}
		}
	}

	cmd := SELECT + FROM + WHERE
	log.Println(cmd)
	rows, err := DB.Query(cmd)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	var message []map[string]interface{}
	for rows.Next() {
		// 動態準備每一列的變數
		values := make([]interface{}, len(table_type.display_attributes))
		valuePtrs := make([]interface{}, len(table_type.display_attributes))
		for i := range values {
			valuePtrs[i] = &values[i] // 每列的指標
		}

		// Scan 將值存入 valuePtrs
		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, err
		}

		// 將列名與值組合成 map
		row_map := make(map[string]interface{})
		for i, attr := range table_type.display_attributes {
			var v interface{}
			if b, ok := values[i].([]byte); ok {
				v = string(b) // 將 []byte 轉為字串
			} else {
				v = values[i] // 保持原始類型
			}
			row_map[attr] = v
			// fmt.Print(attr, ": ", v, " ")
		}
		// fmt.Println()
		message = append(message, row_map)
	}
	return message, nil
}

func delete_table(table string, data map[string]string) ([]map[string]interface{}, error) {
	if table == members.name || table == inactive.name {
		var insert_table, select_table Table
		if table == members.name {
			insert_table = inactive
			select_table = members
		} else {
			insert_table = members
			select_table = inactive
		}
		var attrs string = ""
		for i, attr := range select_table.display_attributes {
			if i == len(select_table.display_attributes)-1 {
				attrs += attr + " "
			} else {
				attrs += attr + ", "
			}
		}

		var condition string = ""
		for key, value := range data {
			if value != "" {
				if _, is_digits := Digit_attributes[key]; is_digits {
					condition += " AND " + key + " = " + value
				} else {
					condition += " AND " + key + " = '" + value + "'"
				}
			}
		}
		var INSERT_INTO, SELECT, FROM, WHERE string = fmt.Sprintf("INSERT INTO %s (%s) ", insert_table.name, attrs), "SELECT " + attrs, " FROM " + select_table.name, " WHERE display = 1" + condition
		cmd := INSERT_INTO + SELECT + FROM + WHERE
		log.Println(cmd)
		_, err := DB.Exec(cmd)
		if err != nil {
			log.Println(err)
			return nil, err
		}

		var DELETE string = "DELETE FROM " + select_table.name
		cmd = DELETE + WHERE
		_, err = DB.Exec(cmd)
		if err != nil {
			log.Println(err)
			return nil, err
		}
	} else {
		var condition string = ""
		for key, value := range data {
			if value != "" {
				if _, is_digits := Digit_attributes[key]; is_digits {
					condition += " AND " + key + " = " + value
				} else {
					condition += " AND " + key + " = '" + value + "'"
				}
			}
		}
		var UPDATE, SET, WHERE string = "UPDATE " + table, " SET display = 0 ", "WHERE display = 1" + condition
		cmd := UPDATE + SET + WHERE
		log.Println(cmd)
		_, err := DB.Exec(cmd)
		if err != nil {
			log.Println(err)
			return nil, err
		}

	}
	return nil, nil
}

func authenticator(target string, data map[string]string) ([]map[string]interface{}, error) {
	if target == "employee" {
		if data["username"] == "015" && data["password"] == "015" {
			// log.Println("login successfully")
			return nil, nil
		} else {
			// log.Println("error: username or password is incorrect")
			return nil, fmt.Errorf("error: username or password is incorrect")
		}
	} else if target == "customer" {
		cmd := fmt.Sprintf("SELECT username, password FROM members WHERE member_id='%s'", data["member_id"])
		rows, err := DB.Query(cmd)
		if err != nil {
			log.Println("error: ", err)
			return nil, err
		}

		var username, password string
		for rows.Next() {
			if err := rows.Scan(&username, &password); err != nil {
				log.Println("error: ", err)
				return nil, err
			} else {
				if username == data["username"] && password == data["password"] {
					return nil, nil
				} else {
					return nil, fmt.Errorf("error: username or password is incorrect")
				}
			}
		}
	}
	return nil, fmt.Errorf("error: target is not correct")
}
