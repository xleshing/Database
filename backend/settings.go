package main

import (
	"fmt"
	"os"
)

const LISTEN_PORT string = "0.0.0.0:8080"

var USERNAME string = os.Getenv("DB_USER")
var PASSWORD string = os.Getenv("DB_PASSWORD")
var SERVER_IP string = os.Getenv("DB_HOST")
var SQL_PORT string = os.Getenv("DB_PORT")

var dsn string = fmt.Sprintf("server=%s;port=%s;user id=%s;password=%s", SERVER_IP, SQL_PORT, USERNAME, PASSWORD)

const DATABASE_NAME string = "fruit_store"
const RESET_DATABASE bool = true
var Tables []Table = []Table{fruits, members, inactive, suppliers, transactions}
