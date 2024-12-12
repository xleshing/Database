# 使用 Golang 官方映像來建構程式
FROM golang:1.23.3-alpine
WORKDIR /app
# 複製所有的後端程式碼到容器中
COPY . .
# 建構後端應用程式
RUN go build -o backend .
EXPOSE 8080
CMD ["./backend"]

