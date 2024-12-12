# 使用輕量級的 Nginx 映像
FROM nginx:alpine
# 複製靜態檔案到 Nginx 預設的靜態檔案資料夾
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

