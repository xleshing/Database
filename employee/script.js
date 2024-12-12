const API_BASE_URL = 'http://140.128.101.122:31167/api'; // 後端 API 的基礎網址
// Log in
// 預設的帳密
// const accounts = [
//     { username: "123", password: "123" },
//     { username: "456", password: "456" },
//     { username: "789", password: "789" }
// ];

// document.getElementById('loginForm').addEventListener('submit', function(event) {
//     event.preventDefault();

//     const username = document.getElementById('username').value.trim();
//     const password = document.getElementById('password').value.trim();

//     // const user = accounts.find(acc => acc.username === username && acc.password === password);
//     data = {
//         'username': username,
//         'password': password,
//     }
//     if (user) {
//         alert("登入成功！");
//         window.location.href = "employee_private.html"; // 假設登入後跳轉到工作儀表板頁面
//     } else {
//         document.getElementById('errorMessage').innerText = "帳號或密碼錯誤！";
//     }
// });

        // 定義你的 API 基礎 URL

        document.getElementById('loginForm').addEventListener('submit', async function(event) {
            event.preventDefault(); // 阻止表單預設提交行為
            await login();
        });

        async function login() {
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            const data = {
                'username': username,
                'password': password,
            };

            const errorMessage = document.getElementById('errorMessage');
            const loading = document.getElementById('loading');
            errorMessage.textContent = '';
            loading.style.display = 'block';

            try {
                const response = await fetch(`${API_BASE_URL}/employee/auth`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const response_data = await response.json();
                loading.style.display = 'none';

                if (response.ok) {
                    // 假設後端返回一個 token
                    localStorage.setItem('authToken', response_data.token);
                    alert('登入成功！');
                    window.location.href = "employee_private.html";
                } else {
                    // 使用頁面上的錯誤訊息顯示
                    errorMessage.textContent = response_data.error || '登入失敗！';
                }
            }
            catch (error) {
                loading.style.display = 'none';
                console.error('查詢資料失敗:', error);
                errorMessage.textContent = '查詢資料失敗，請稍後再試。';
            }
        }



        // 定義獲取今天日期的函數
    // 定義獲取今天日期的函數
    function getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // 提交訂單函數
    async function submitOrder() {
        console.log("submitOrder called");

        const member_id = document.getElementById("member_id").value.trim();
        const fruit_id = document.getElementById("fruit_id").value.trim();
        const transaction_id = document.getElementById("order_id").value.trim();

        console.log("member_id:", member_id);
        console.log("fruit_id:", fruit_id);
        console.log("transaction_id:", transaction_id);

        const conditions = {
            "transaction_id": transaction_id,
            "member_id": member_id,
            "fruit_id": fruit_id
        };
        const updates = {
            "actual_shipping_date": getTodayDate()
        };

        console.log("conditions:", conditions);
        console.log("updates:", updates);

        // 發送資料到後端進行比對
        try {
            const response = await fetch(`${API_BASE_URL}/transactions/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ conditions, updates }),
            });

            console.log("Response status:", response.status);
            const response_data = await response.json();
            console.log("Response data:", response_data);

            const resultDiv = document.getElementById('result');

            if (response.ok) {
                console.log('訂單已確認');
                // 清空輸入欄位
                document.getElementById("member_id").value = '';
                document.getElementById("fruit_id").value = '';
                document.getElementById("order_id").value = '';

                // 顯示成功訊息
                resultDiv.className = 'result success';
                resultDiv.textContent = '訂單已成功確認！';
                resultDiv.style.display = 'block';
            } else {
                console.log('更新訂單失敗:', response_data.error);
                // 顯示錯誤訊息
                resultDiv.className = 'result error';
                resultDiv.textContent = `更新訂單失敗: ${response_data.error}`;
                resultDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('更新訂單失敗:', error);
            const resultDiv = document.getElementById('result');
            // 顯示錯誤訊息
            resultDiv.className = 'result error';
            resultDiv.textContent = `更新訂單失敗: ${error}`;
            resultDiv.style.display = 'block';
        }
    }
// Private
// async function submitOrder() {
//     const menber_id = document.getElementById("menber_id").value.trim();
//     const fruit_id = document.getElementById("fruit_id").value.trim();
//     const transaction_id = document.getElementById("order_id").value.trim();

//     conditions = {
//         "transaction_id": transaction_id,
//         "member_id": menber_id,
//         "fruit_id": fruit_id
//     }
//     updates = {
//         "actual_shipping_date": getTodayDate()
//     }

//     // 發送資料到後端進行比對
//     try {
//         const response = await fetch(`${API_BASE_URL}/transactions/update`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ conditions, updates }),
//         });

//         const response_data = await response.json();
//         if (response.ok) {
//             console.log('訂單已確認');
//         } else {
//             console.log('更新訂單失敗:', response_data.error);
//             alert(`更新訂單失敗: ${response_data.error}`);
//         }
//     } catch (error) {
//         console.error('更新訂單失敗:', error);
//         alert(`更新訂單失敗: ${error}`);
//     }
// }

// function getTodayDate() {
//     const today = new Date();
//     const year = today.getFullYear();
//     const month = String(today.getMonth() + 1).padStart(2, '0'); // 月份從 0 開始
//     const day = String(today.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
// }