package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/denisenkom/go-mssqldb"
)

func Init() {
	// Database connection string, first connect to the MySQL server
	// fmt.Println(dsn)
	fmt.Println(dsn)
	db_server, err := sql.Open("sqlserver", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to the SQL Server: %v", err)
	}
	// defer db_server.Close()
	if err := db_server.Ping(); err != nil {
		// return nil, err
		log.Printf("Failed to ping the SQL Server: %v\n", err)
	}
	log.Println("Database initialization begin.")
	err = ensure_database_exists(db_server, DATABASE_NAME, RESET_DATABASE)
	if err != nil {
		log.Fatalf("Failed to initialize the database: %v", err)
	}

	// Connect to the specified database
	dsn_with_DB := fmt.Sprintf("%s;database=%s", dsn, DATABASE_NAME)
	var err1 error
	DB, err1 = sql.Open("sqlserver", dsn_with_DB)
	if err1 != nil {
		log.Fatalf("Failed to connect to the specified database %s: %v", DATABASE_NAME, err)
	}
	// defer DB.Close()

	log.Println("Tables initialization begin.")
	// Check and initialize tables
	for _, table := range Tables {
		fmt.Println("\n" + table.name)
		err = ensure_table_exists(DB, table.name, table.create)
		if err != nil {
			log.Fatalf("Failed to initialize the table %s: %v", table.name, err)
		}

		err = ensure_table_has_data(DB, table)
		if err != nil {
			log.Fatalf("Failed to insert data into the table %s: %v", table.name, err)
		}
	}

	log.Println("Database and tables initialization complete.")

}

func ensure_database_exists(db *sql.DB, database_name string, reset_db bool) error {
	if reset_db {
		_, err := db.Exec(fmt.Sprintf("DROP DATABASE IF EXISTS %s", database_name))
		if err != nil {
			return fmt.Errorf("failed to drop the database: %v", err)
		}
	}

	// Check if the database exists
	query := "SELECT name FROM sys.databases WHERE name LIKE '%" + database_name + "%'"

	fmt.Println(query)
	var result string
	err := db.QueryRow(query).Scan(&result)
	if err != nil && err != sql.ErrNoRows {
		return fmt.Errorf("failed to check the database: %v", err)
	}

	// If the database does not exist, create it
	if result == "" {
		fmt.Printf("The database %s does not exist, creating...\n", database_name)
		_, err := db.Exec(fmt.Sprintf("CREATE DATABASE %s", database_name))
		if err != nil {
			return fmt.Errorf("failed to create the database: %v", err)
		}
		fmt.Printf("The database %s has been created successfully!\n", database_name)
	} else {
		fmt.Printf("The database %s already exists.\n", database_name)
	}

	return nil
}

// Ensure the table exists function
func ensure_table_exists(db *sql.DB, table_name string, table_content string) error {
	// Check if the table exists
	query := fmt.Sprintf("SELECT name FROM sys.tables WHERE name LIKE '%s'", table_name)
	fmt.Println(query)

	var result string
	err := db.QueryRow(query).Scan(&result)
	if err != nil && err != sql.ErrNoRows {
		return fmt.Errorf("failed to check the table: %v", err)
	}

	// If the table does not exist, create it
	if result == "" {
		fmt.Printf("The table %s does not exist, creating...\n", table_name)
		_, err := db.Exec(table_content)
		if err != nil {
			return fmt.Errorf("failed to create the table: %v", err)
		}
		fmt.Printf("The table %s has been created successfully!\n", table_name)
	} else {
		fmt.Printf("The table %s already exists.\n", table_name)
	}

	return nil
}

func ensure_table_has_data(db *sql.DB, table Table) error {
	// 检查表中的记录数
	var count int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM %s", table.name)
	err := db.QueryRow(countQuery).Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to get row count for table %s: %v", table.name, err)
	}

	// 如果记录数少于或等于3，插入数据
	if count <= 3 {
		fmt.Printf("Table %s has %d records, inserting data...\n", table.name, count)
		for i, insertQuery := range table.insert {
			_, err := db.Exec(insertQuery)
			if err != nil {
				return fmt.Errorf("failed to insert data into table %s: %v", table.name, err)
			}
			fmt.Printf("Inserted data %d into table %s successfully!\n", i+1, table.name)
		}
	} else {
		fmt.Printf("Table %s already has sufficient records.\n", table.name)
	}

	return nil
}
