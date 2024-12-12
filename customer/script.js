const API_BASE_URL = 'http://140.128.101.122:31167/api'; // 後端 API 的基礎網址

// let DISCOUNT = 0;
// let MEMBER_ID = "B123456789";

// 切換顯示登入和創建帳號介面
function showLogin() {
    document.getElementById('login-container').classList.add('active');
    document.getElementById('create-account-container').classList.remove('active');
}

function showCreateAccount() {
    document.getElementById('create-account-container').classList.add('active');
    document.getElementById('login-container').classList.remove('active');
}

// 創建帳號功能
let accounts = {}; // 模擬帳號資料庫
function createAccount() {
    const username = document.getElementById('create-username').value.trim();
    const password = document.getElementById('create-password').value.trim();
    const member_id = document.getElementById('create-id').value.trim();
    const member_name = document.getElementById('create-name').value.trim();
    const email = document.getElementById('create-email').value.trim();
    const phone_number = document.getElementById('create-phone').value.trim();
    const mobile_number = document.getElementById('create-mobile').value.trim();
    const joined_line = document.querySelector('input[name="joined-line"]:checked')?.value || '不是';
    const address = document.getElementById('create-address').value.trim();
    const age = document.getElementById('create-age').value.trim();


    // 檢查必填欄位
    if (!username || !password || !member_id || !member_name || !email) {
        alert('帳號、密碼、身份證字號、姓名和 Email 為必填欄位');
        return;
    }

    data = {
        "member_id": member_id,
        "member_name": member_name,
        "phone_number": phone_number,
        "mobile_number": mobile_number,
        "email": email,
        "joined_line": joined_line,
        "address": address,
        "age": age,
        "username": username,
        "password": password
    }
    // 檢查身份證字號格式
    // const idRegex = /^[A-Z][0-9]{9}$/; // 第一位為大寫英文字母，後九位為數字
    // if (!idRegex.test(id)) {
    //     alert('身份證字號格式不正確，第一位必須是大寫英文字母，後九位為數字');
    //     return;
    // }

    // if (accounts[username]) {
    //     alert('帳號已存在');
    //     return;
    // }

    // 檢查是否選擇照片（選填時可省略此檢查）
    // const photo = document.getElementById('create-photo').files[0];
    // const reader = new FileReader();
    const photo_input = document.getElementById('create-photo');
    if (photo_input && photo_input.files.length > 0) {
        const file = photo_input.files[0];
        const reader = new FileReader();
        reader.onloadend = function() {
            data['photo'] = reader.result; // 將圖片轉換為 Base64
            create_user(data);
        };
        reader.readAsDataURL(file);
    }
    else {
        data['photo'] = '';
        create_user(data)
    }

    // reader.onload = function () {
    //     // 儲存帳號資料
    //     accounts[username] = {
    //         password,
    //         id,
    //         name,
    //         email,
    //         phone: document.getElementById('create-phone').value.trim(),
    //         mobile: document.getElementById('create-mobile').value.trim(),
    //         address: document.getElementById('create-address').value.trim(),
    //         age: document.getElementById('create-age').value.trim(),
    //         lineOptIn: document.querySelector('input[name="line-opt-in"]:checked')?.value || 'no', // 預設為 "否"
    //         photo: reader.result || null, // 選填，可能為空
    //     };
    //     alert('帳號創建成功，請返回登入');
    //     showLogin();
    // };

    // if (photo) {
    //     reader.readAsDataURL(photo);
    // } else {
    //     reader.onload(); // 無照片時直接執行儲存
    // }
}

async function create_user(data) {
    try {
        const response = await fetch(`${API_BASE_URL}/members/insert`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        const response_data = await response.json();

        if (response.ok) {
            console.log('Success:', response_data.status);
            console.log('Messages:', response_data.messages);
            alert('創建會員成功！');
            showLogin();
        } else {
            console.error('Error:', response_data.error);
            alert(`創建會員失敗: ${response_data.error}`);
        }
    }
    catch (error) {
        console.error('創建會員過程失敗:', error);
        alert('無法新增資料，請檢查後端伺服器狀態！' + error);
    }
}

// 登入功能
async function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const member_id = document.getElementById('login-id').value.trim();

    // verify(member_id, username, password);
    data = {
        'username': username,
        'password': password,
        'member_id': member_id
    }
    try {
        // 這裡先暫存
        localStorage.setItem('customer_username', username)
        localStorage.setItem('customer_password', password)
        localStorage.setItem('customer_member_id', member_id)
        const response = await fetch(`${API_BASE_URL}/customer/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        // const response_data = await response.json();

        if (response.ok) {
            const response_data = await response.json();

            // 保存 Token 到 localStorage
            localStorage.setItem('authToken', response_data.token);

            alert('登入成功！');
            window.location.href = "customer_private.html";
        }
    }
    catch (error) {
        console.error('查詢資料失敗:', error);
        alert('查無此用戶！');
    }
}

// 檢查帳號密碼與身份證字號
// function checkCredentials(username, password, id) {
//     return (
//         accounts[username] &&
//         accounts[username].password === password &&
//         accounts[username].id === id
//     );
// }


// async function verify(member_id, username, password) {
//     data = {
//         'member_id': member_id
//     }
//     try {
//         const response = await fetch(`${API_BASE_URL}/members/select`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(data)
//         });
//         const response_data = await response.json();

//         if (response.ok) {
//             console.log('Success:', response_data.status);
//             console.log('Messages:', response_data.messages);
        
//             const messagesMapArray = [];
//             if (response_data.messages && Array.isArray(response_data.messages)) {
//                 response_data.messages.forEach(message => {
//                     const map = new Map(Object.entries(message));
//                     messagesMapArray.push(map);
//                 });
//             }
//             console.log(messagesMapArray[0].get('username'));
//             console.log(messagesMapArray[0].get('password'));
//             if (messagesMapArray[0].get('username') === username && messagesMapArray[0].get('password') === password) {
//                 alert('登入成功！');
//                 DISCOUNT = parseFloat(messagesMapArray[0].get('discount'));
//                 MEMBER_ID = member_id;
                
//                 window.location.href = "order_system.html";
//             }
//             else {
//                 alert('帳號或密碼錯誤');
//             }

//         } else {
//             console.error('Error:', response_data.error);
//             alert(`查無此用戶: ${response_data.error}`);
//         }
//     }
//     catch (error) {
//         console.error('查詢資料失敗:', error);
//         alert('查無此用戶！');
//     }
// }













// Order system
// 模擬水果資料庫
let fruitDatabase = {}; // key : fruit_id, value : map of fruit_information

// 訂單陣列和總金額
let orders = {};
let totalAmount = 0;

// 初始化水果選單
async function updateFruitSelect() {
    // update_fruit_date();
    try {
        const response = await fetch(`${API_BASE_URL}/fruits/all`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const response_data = await response.json();

        if (response.ok) {
            console.log('Success:', response_data.status);
            console.log('Messages:', response_data.messages);
            let messagesMap = {};
            if (response_data.messages && Array.isArray(response_data.messages)) {
                response_data.messages.forEach(message => {
                    const map = new Map(Object.entries(message));
                    messagesMap[map.get('fruit_id')] = map;
                });
            }
            fruitDatabase = messagesMap;
            console.log('取得水果資料');
        } else {
            console.error('無法取得水果資料:', response_data.error);
            alert(`無法取得水果資料: ${response_data.error}`);
        }
    }
    catch (error) {
        console.error('無法取得水果資料:', error);
        alert('無法取得水果資料！' + error);
    }


    const select = document.getElementById('fruit-select');
    select.innerHTML = '<option value="">選擇水果</option>';
    Object.entries(fruitDatabase).forEach(([fruit_id, fruit_tuple])=> {
        const salePrice = (parseFloat(fruit_tuple.get('purchase_price')) * 1.5).toFixed(2);
        select.innerHTML += `<option value=${fruit_id}>編號: ${fruit_tuple.get('fruit_id')} - 名稱: ${fruit_tuple.get('fruit_name')} - 標準售價: $${salePrice} (庫存: ${fruit_tuple.get('quantity')})</option>`;
        console.log(`<option value=${fruit_id}>編號: ${fruit_tuple.get('fruit_id')} - 名稱: ${fruit_tuple.get('fruit_name')}> - 標準售價: $${salePrice} (庫存: ${fruit_tuple.get('quantity')})</option>`);
    });
}

// 下單功能
async function purchaseFruit() {
    const fruit_id = document.getElementById('fruit-select').value;
    const quantity = parseInt(document.getElementById('purchase-quantity').value, 10);
    const deliveryDate = document.getElementById('delivery-date').value;
    const input_price = parseFloat(document.getElementById('purchase-price').value);

    if (!fruit_id || isNaN(quantity) || quantity <= 0 || !deliveryDate || isNaN(input_price) || input_price <= 0) {
        alert("請填寫完整資訊，且確保購買數量和購買價格為有效數字！");
        return;
    }

    const fruit_tuple = fruitDatabase[fruit_id];
    const sale_price = fruit_tuple.get('purchase_price') * 1.5;

    if (fruit_tuple.get('quantity') < quantity) {
        alert("庫存不足");
        return;
    }

    if (input_price < sale_price) {
        alert(`購買價格必須高於標準售價 $${sale_price.toFixed(2)}`);
        return;
    }

    member_id = localStorage.getItem('customer_member_id');
    data = {
        "fruit_id": fruit_id,
        "member_id": member_id,
        "fruit_name": fruit_tuple.get('fruit_name'),
        "supplier_name": fruit_tuple.get('supplier_name'),
        "purchase_quantity": String(quantity), // int
        "sale_price": String(input_price), // float
        "transaction_date": getTodayDate(),
        "expected_shipping_date": deliveryDate
    }

    let transaction_success = false;
    // Insert into transactions table
    try {
        // console.log("Member id", MEMBER_ID);
        const response = await fetch(`${API_BASE_URL}/transactions/insert`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        const response_data = await response.json();

        if (response.ok) {
            console.log('Success:', response_data.status);
            console.log('Messages:', response_data.messages);
            transaction_success = true;
            alert('下單成功！');
            
        } else {
            console.log('下單失敗:', response_data.error);
            alert(`下單失敗: ${response_data.error}`);
        }
    }
    catch (error) {
        console.log('下單失敗:', error);
        alert(`下單失敗: ${error}`);
    }

    // Select transactions by member_id, sipped = 0 (Reload)
    select_conditions = {
        "member_id": localStorage.getItem('customer_member_id'),
        "shipped": "0" // 限制未取貨 
    }
    try {
        const response = await fetch(`${API_BASE_URL}/transactions/select`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(select_conditions)
        });
        const response_data = await response.json();

        if (response.ok) {
            console.log('Success:', response_data.status);
            console.log('Messages:', response_data.messages);
            let new_orders = {};
            if (response_data.messages && Array.isArray(response_data.messages)) {
                response_data.messages.forEach(message => {
                    const map = new Map(Object.entries(message));
                    new_orders[map.get('transaction_id')] = map;
                });
            }
            console.log('查詢未完成訂單成功');
            orders = new_orders;
        } else {
            console.log('查詢未完成訂單失敗:', response_data.error);
            alert(`查詢未完成訂單失敗: ${response_data.error}`);
        }
    }
    catch (error) {
        console.log('查詢未完成訂單失敗:', error);
        alert(`查詢未完成訂單失敗: ${error}`);
    }



    // 扣除庫存
    let new_quantity = fruit_tuple.get('quantity') - quantity;
    
    // Update quantity in fruit table
    if (transaction_success) {
        let conditions = {'fruit_id': fruit_id}, updates = {'quantity': String(new_quantity)};
        // data = ; // { conditions, updates }

        try {
            const response = await fetch(`${API_BASE_URL}/fruits/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({conditions, updates})
            });
            const response_data = await response.json();
    
            if (response.ok) {
                console.log('Success:', response_data.status);
                console.log('Messages:', response_data.messages);
                alert('更新水果數量成功');

                document.getElementById('fruit-select').value = '';
                document.getElementById('purchase-quantity').value = '';
                document.getElementById('delivery-date').value = '';
                document.getElementById('purchase-price').value = '';
                
            } else {
                console.log('更新水果數量失敗:', response_data.error);
                alert(`更新水果數量失敗: ${response_data.error}`);
            }
        }
        catch (error) {
            console.log('更新水果數量失敗:', error);
            alert(`更新水果數量失敗: ${error}`);
        }
    }

    // 計算金額
    // const total_price = (sale_price * quantity).toFixed(2);
    // const price_after_discount = (total_price * DISCOUNT).toFixed(2);
    // console.log(`Total price: ${total_price}`);
    // console.log(`Price after discount: ${price_after_discount}`);

    // 新增訂單
    // orders.push({ fruit: fruit.name, quantity, totalAmount: total, fruitId, supplier: fruit.supplier, deliveryDate });

    // 更新總金額
    // totalAmount += total;

    // 顯示結果
    // const resultDiv = document.getElementById('result');
    // resultDiv.innerHTML = `<p>已成功下單：${fruit.name} - ${quantity} 顆，總金額：${total} 元，交運日期：${deliveryDate}，供應商:${fruit.supplier}</p>`;

    // 更新訂單狀況
    updateOrderStatus();

    // 更新下拉清單
    updateFruitSelect();

    updateFruitSelect();
}

// 更新訂單狀況顯示
function updateOrderStatus() {
    const orderListDiv = document.getElementById('order-list');
    // orderListDiv.innerHTML = orders.map((order, index) => `
    orderListDiv.innerHTML = Object.entries(orders).map(([transaction_id, transaction_info])=> `
        <p>
            訂單編號 ${transaction_id}: ${transaction_info.get('fruit_id')} ${transaction_info.get('fruit_name')} - ${transaction_info.get('purchase_quantity')} 顆 - ${transaction_info.get('price_after_discount')} 元
            (供應商: ${transaction_info.get('supplier_name')}, 交運日期: ${transaction_info.get('transaction_date')})
        </p>
    `
    ).join('');
    // <span class="delete-button" onclick="deleteOrder(${transaction_id})">刪除</span>
    console.log(orderListDiv.innerHTML);

    // 更新總金額
    const totalAmountDiv = document.getElementById('total-amount');
    totalAmountDiv.textContent = totalAmount;
}

function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // 月份從 0 開始
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

console.log(getTodayDate()); // 輸出格式為 "yyyy-mm-dd"


// 確保只能輸入數字
function validateNumericInput(input) {
    input.value = input.value.replace(/[^0-9]/g, ''); // 只允許數字
}


// 刪除訂單功能
function deleteOrder(orderIndex) {
    // const order = orders[orderIndex];
    // const fruit = fruitDatabase[order.fruitId];

    // // 恢復庫存
    // fruit.stock += order.quantity;

    // // 刪除訂單
    // orders.splice(orderIndex, 1);

    // // 更新總金額
    // totalAmount -= order.totalAmount;

    // // 更新訂單狀況
    // updateOrderStatus();

    // // 更新下拉清單
    // updateFruitSelect();
}

function setDateRestriction() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const minDate = `${year}-${month}-${day}`;
    document.getElementById('delivery-date').setAttribute('min', minDate);
}
setDateRestriction();

// 初始化頁面
updateFruitSelect();