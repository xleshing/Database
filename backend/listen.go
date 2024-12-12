package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"
)

type Response struct {
	Status   string                   `json:"status"`
	Messages []map[string]interface{} `json:"messages,omitempty"` // 使用omitempty來在錯誤情況下省略此欄位
	Error    string                   `json:"error,omitempty"`
}

func Start_listening() {
	// http.Handle("/api/", enable_CORS(http.HandlerFunc(api_handler)))

	// log.Printf("Server is starting, listening on port %s", LISTEN_PORT)
	// if err := http.ListenAndServe(LISTEN_PORT, nil); err != nil {
	// 	log.Fatalf("Server failed to start: %s", err)
	// }

	defer func() {
		if DB != nil {
			log.Println("Closing database connection...")
			if err := DB.Close(); err != nil {
				log.Printf("Failed to close database: %v", err)
			} else {
				log.Println("Database connection closed.")
			}
		}
	}()

	// 設定 HTTP 伺服器
	mux := http.NewServeMux()
	mux.Handle("/api/", enable_CORS(http.HandlerFunc(api_handler)))

	server := &http.Server{
		Addr:    LISTEN_PORT,
		Handler: mux,
	}

	// 啟動伺服器於獨立的協程中
	go func() {
		log.Printf("Server is starting, listening on port %s", LISTEN_PORT)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// 建立一個接收系統信號的通道
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	// 阻塞直到接收到信號
	<-stop
	log.Println("Signal received. Shutting down gracefully...")

	// 設定一個 5 秒的超時上下文，用於優雅關閉伺服器
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	// 優雅關閉伺服器
	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server shutdown complete.")
	// 資料庫連線將在 defer 中關閉
}

// CORS middleware to allow all origins
func enable_CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 設置 CORS 標頭
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")

		// 處理預檢請求
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// 繼續處理下一個處理器
		next.ServeHTTP(w, r)
	})
}

// 通用 API 處理器
func api_handler(w http.ResponseWriter, r *http.Request) {
	// Get the API path, for example, /api/fruits -> fruits
	fmt.Println(r.URL.Path)
	pathParts := strings.Split(r.URL.Path, "/")
	fmt.Println(pathParts)
	if len(pathParts) < 3 {
		http.Error(w, "Invalid API path", http.StatusBadRequest)
		return
	}

	api_table, api_method := pathParts[len(pathParts)-2], pathParts[len(pathParts)-1]
	fmt.Printf("%s %s\n", api_table, api_method)

	// Read the request body
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Unable to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// If the Content-Type is JSON, parse and print
	// log.Println(r.Header.Get("Content-Type"))
	if strings.Contains(r.Header.Get("Content-Type"), "application/json") {
		message, err := process(body, r.Method, api_method, api_table)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized) // 設置 HTTP 狀態碼為 401
			response := Response{
				Status: "error",
				Error:  err.Error(),
			}
			json.NewEncoder(w).Encode(response)
		} else {
			// log.Println("\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\", message)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK) // 設置 HTTP 狀態碼為 200
			response := Response{
				Status:   "success",
				Messages: message,
			}
			json.NewEncoder(w).Encode(response)
		}
	} else {
		// Otherwise, print as plain text
		// log.Printf("Received non-JSON request resource: %s %s, Content:\n%s\n", api_table, api_method, string(body))
		log.Printf("Received non-JSON request resource: %s %s\n", api_table, api_method)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized) // 設置 HTTP 狀態碼為 400
		response := Response{
			Status: "error",
			Error:  "Invalid content type",
		}
		json.NewEncoder(w).Encode(response)
	}
}

func process(body []byte, request_method string, api_method string, api_table string) ([]map[string]interface{}, error) {
	fmt.Println(request_method)
	if api_method == "all" { // Usually Get happens when api_method = all
		// log.Println("GET")
		message, err := select_all(api_table)

		return message, err
		// return select_all(api_table)
	} else if api_method == "update" {
		var json_data map[string]map[string]string
		if err := json.Unmarshal(body, &json_data); err != nil {
			log.Printf("Received invalid JSON request: %s", err)
			return nil, err
		} else {
			json.MarshalIndent(json_data, "", "  ")
			// prettyJSON, _ := json.MarshalIndent(json_data, "", "  ")
			// log.Printf("Received JSON request resource: %s %s %s, Content:\n%s\n", request_method, api_table, api_method, string(prettyJSON));
			log.Printf("Received JSON request resource: %s %s %s\n", request_method, api_table, api_method)
			var conditions, updates map[string]string
			var conditions_exists, updates_exists bool
			conditions, conditions_exists = json_data["conditions"]
			updates, updates_exists = json_data["updates"]

			if conditions_exists {
				for key, value := range conditions {
					if key != "photo" {
						log.Printf("Condition - %s: %s", key, value)
					}
				}
			} else {
				log.Printf("Conditions not found")
			}

			if updates_exists {
				for key, value := range updates {
					if key != "photo" {
						log.Printf("Update - %s: %s", key, value)
					}
				}
			} else {
				log.Printf("Updates not found")
			}

			_, err := update_table(api_table, conditions, updates)
			return nil, err
		}
	} else if api_method == "auth" {
		var json_data map[string]string
		if err := json.Unmarshal(body, &json_data); err != nil && request_method != http.MethodGet {
			log.Printf("Received invalid JSON request: %s", err)
			return nil, err
		} else {
			json.MarshalIndent(json_data, "", "  ")
			log.Printf("Received JSON request resource: %s %s %s\n", request_method, api_table, api_method)
			for key, value := range json_data {
				log.Printf("Data - %s: %s", key, value)
			}
			return authenticator(api_table, json_data)
		}
	} else {
		var json_data map[string]string
		if err := json.Unmarshal(body, &json_data); err != nil && request_method != http.MethodGet {
			log.Printf("Received invalid JSON request: %s", err)
			return nil, err
		} else {
			// prettyJSON, _ := json.MarshalIndent(json_data, "", "  ")
			json.MarshalIndent(json_data, "", "  ")
			// log.Printf("Received JSON request resource: %s %s %s, Content:\n%s\n", request_method, api_table, api_method, string(prettyJSON))
			log.Printf("Received JSON request resource: %s %s %s\n", request_method, api_table, api_method)
			for key, value := range json_data {
				if key != "photo" {
					log.Printf("Data - %s: %s", key, value)
				}
			}

			var message []map[string]interface{}
			var err error
			switch api_method {
			case "insert":
				message, err = insert_table(api_table, json_data)
			case "delete":
				message, err = delete_table(api_table, json_data)
			case "select":
				message, err = select_table(api_table, json_data)
			default:
				message, err = nil, fmt.Errorf("error: not expected operations")
			}

			return message, err
		}
	}
}
