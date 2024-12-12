// 模擬水果資料庫
let fruitDatabase = [];

// 訂單陣列和總金額
let orders = [];
let totalAmount = 0;

// 初始化水果選單
function updateFruitSelect() {
    update_fruit_date();
    const select = document.getElementById('fruit-select');
    select.innerHTML = '<option value="">選擇水果</option>';
    Object.keys(fruitDatabase).forEach(fruitId => {
        const fruit = fruitDatabase[fruitId];
        const salePrice = fruit.price.toFixed(2);
        select.innerHTML += `<option value="${fruitId}">${fruit.name} - 標準售價: $${salePrice} (庫存: ${fruit.stock})</option>`;
    });
}

async function update_fruit_date() {
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
            let messagesMapArray = [];
            if (response_data.messages && Array.isArray(response_data.messages)) {
                response_data.messages.forEach(message => {
                    const map = new Map(Object.entries(message));
                    messagesMapArray.push(map);
                });
            }
            fruitDatabase = messagesMapArray;
        } else {
            console.error('無法取得水果資料:', response_data.error);
            alert(`無法取得水果資料: ${response_data.error}`);
        }
    }
    catch (error) {
        console.error('無法取得水果資料:', error);
        alert('無法取得水果資料！' + error);
    }
}

// 下單功能
function purchaseFruit() {
    const fruitId = document.getElementById('fruit-select').value;
    const quantity = parseInt(document.getElementById('purchase-quantity').value, 10);
    const deliveryDate = document.getElementById('delivery-date').value;
    const purchasePrice = parseFloat(document.getElementById('purchase-price').value);

    if (!fruitId || isNaN(quantity) || quantity <= 0 || !deliveryDate || isNaN(purchasePrice) || purchasePrice <= 0) {
        alert("請填寫完整資訊，且確保購買數量和購買價格為有效數字！");
        return;
    }

    const fruit = fruitDatabase[fruitId];
    const salePrice = fruit.price * 1.5;

    if (fruit.stock < quantity) {
        alert("庫存不足");
        return;
    }

    if (purchasePrice < salePrice) {
        alert(`購買價格必須高於標準售價 $${salePrice.toFixed(2)}`);
        return;
    }

    // 扣除庫存
    fruit.stock -= quantity;

    // 計算金額
    const total = fruit.price * quantity;

    // 新增訂單
    orders.push({ fruit: fruit.name, quantity, totalAmount: total, fruitId, supplier: fruit.supplier, deliveryDate });

    // 更新總金額
    totalAmount += total;

    // 顯示結果
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p>已成功下單：${fruit.name} - ${quantity} 顆，總金額：${total} 元，交運日期：${deliveryDate}，供應商:${fruit.supplier}</p>`;

    // 更新訂單狀況
    updateOrderStatus();

    // 更新下拉清單
    updateFruitSelect();
}

// 更新訂單狀況顯示
function updateOrderStatus() {
    const orderListDiv = document.getElementById('order-list');
    orderListDiv.innerHTML = orders.map((order, index) => `
        <p>
            訂單 ${index + 1}: ${order.fruit} - ${order.quantity} 顆 - ${order.totalAmount} 元
            (供應商: ${order.supplier}, 交運日期: ${order.deliveryDate})
            <span class="delete-button" onclick="deleteOrder(${index})">刪除</span>
        </p>
    `).join('');

    // 更新總金額
    const totalAmountDiv = document.getElementById('total-amount');
    totalAmountDiv.textContent = totalAmount;
}

// 確保只能輸入數字
function validateNumericInput(input) {
    input.value = input.value.replace(/[^0-9]/g, ''); // 只允許數字
}


// 刪除訂單功能
function deleteOrder(orderIndex) {
    const order = orders[orderIndex];
    const fruit = fruitDatabase[order.fruitId];

    // 恢復庫存
    fruit.stock += order.quantity;

    // 刪除訂單
    orders.splice(orderIndex, 1);

    // 更新總金額
    totalAmount -= order.totalAmount;

    // 更新訂單狀況
    updateOrderStatus();

    // 更新下拉清單
    updateFruitSelect();
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
