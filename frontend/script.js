const API_BASE_URL = 'http://140.128.101.122:31167/api'; // 後端 API 的基礎網址

// 全局變數
let selectedRow = null;
let pendingOperation = null; // 用於追蹤當前的操作（add, select, edit, delete）
let pendingTable = null; // 用於追蹤當前操作的表格

const TABLE_ATTRIBUTE = new Map([
  ["fruits", ["fruit_id", "fruit_name", "supplier_name", "quantity", "unit", "purchase_price", "total_value", "storage_location", "purchase_date", "promotion_start_date", "discard_date"]],
  ["members", ["member_id", "member_name", "phone_number", "mobile_number", "email", "joined_line", "address", "age", "photo", "discount"]],
  ["inactive", ["member_id", "member_name", "phone_number", "mobile_number", "email", "joined_line", "address", "age", "photo", "discount"]],
  ["suppliers",["supplier_id", "supplier_name", "phone_number", "email", "address", "contact_name"]],
  ["transactions", ["fruit_id", "member_id", "fruit_name", "supplier_name", "purchase_quantity", "sale_price", "total_price", "price_after_discount", "transaction_date", "expected_shipping_date", "actual_shipping_date"]]
]);

let current_tuples = null;

// 動態加載表格資料
function loadData(table) {
  const tables = document.querySelectorAll('.table-container');
  tables.forEach(t => t.classList.add('hidden'));
  const targetTable = document.getElementById(table);
  if (targetTable) {
    targetTable.classList.remove('hidden');
    fetchData(table); // 從後端獲取資料
  }
}

// 從後端 API 獲取資料


// 渲染表格內容
function renderTable(table, data) {
  // const tableBody = document.querySelector(`#${table} tbody`);
  // tableBody.innerHTML = '';
  // data.forEach(row => {
  //   const tr = document.createElement('tr');
  //   Object.entries(row).forEach(([key, value]) => {
  //     const td = document.createElement('td');
  //     if (key.toLowerCase() === 'photo') { // 處理圖片欄位
  //       const img = document.createElement('img');
  //       img.src = value;
  //       td.appendChild(img);
  //     } else {
  //       td.textContent = value;
  //       // 為住址欄位添加工具提示
  //       if ((table === 'members' || table === 'inactive') && key.toLowerCase() === 'address') {
  //         td.setAttribute('title', value);
  //       }
  //     }
  //     tr.appendChild(td);
  //   });
  //   tableBody.appendChild(tr);
  // });

  // // 添加行點擊事件以選擇記錄
  // tableBody.querySelectorAll('tr').forEach(tr => {
  //   tr.addEventListener('click', () => {
  //     if (selectedRow) {
  //       selectedRow.classList.remove('selected');
  //     }
  //     selectedRow = tr;
  //     selectedRow.classList.add('selected');
  //   });
  // });
}

// 開啟 Modal
function openModal(table, action) {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalForm = document.getElementById('modal-form');

//   if (action === 'edit' || action === 'delete') {
//     // 設定待處理的操作和表格
//     pendingOperation = action;
//     pendingTable = table;

//     // 設定模態框標題為「查詢資料」
//     modalTitle.textContent = '查詢資料';

//     // 生成查詢表單
//     modalForm.innerHTML = generateForm(table, action);
//     modal.style.display = 'block';
//   } else {
    // 對於其他操作（add, select），正常處理
    pendingOperation = action;
    pendingTable = table;

    modalTitle.textContent = `${action === 'add' ? '新增' : action === 'edit' ? '修改' : action === 'delete' ? '刪除' : '查詢'}資料`;
    modalForm.innerHTML = generateForm(table, action);
    modal.style.display = 'block';
//   }
}

// 關閉 Modal
function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
}

// 生成表單 HTML
function generateForm(table, action) {
  let formHTML = '';
  switch(table) {
    case 'fruits':
      formHTML += generateFruitsForm(table, action);
      break;
    case 'members':
      formHTML += generateMembersForm(table, action);
      break;
    case 'inactive':
      formHTML += generateInactiveForm(table, action);
      break;
    case 'suppliers':
      formHTML += generateSuppliersForm(table, action);
      break;
    case 'transactions':
      formHTML += generateTransactionsForm(table, action);
      break;
    default:
      formHTML = '';
  }
  // 標註必填內容並添加提交按鈕
//   if (action !== 'select') {
    formHTML += `<button type="submit" class="submit-btn">${action === 'add' ? '新增' : action === 'edit' ? '修改' : action === 'delete' ? '刪除' : '查詢'}</button>`;
//   } else {
//     formHTML += `<button type="submit" class="submit-btn">123</button>`;
//   }
  return formHTML;
}

// 生成水果資料表的表單
function generateFruitsForm(table, action) {
  let formHTML = '';
  const required = 'required';
  if (action === 'add') {
    formHTML += `
      <label for="fruit_id">水果編號 <span style="color:red;">*</span>:</label>
      <input type="text" id="fruit_id" name="fruit_id" maxlength="13" pattern="\\d{2}-\\d{3}-\\d{3}-\\d{2}" ${required}>

      <label for="fruit_name">水果名稱 <span style="color:red;">*</span>:</label>
      <input type="text" id="fruit_name" name="fruit_name" maxlength="12" ${required}>

      <label for="supplier_name">水果供應商名稱 <span style="color:red;">*</span>:</label>
      <input type="text" id="supplier_name" name="supplier_name" maxlength="12" ${required}>

      <label for="quantity">現有數量:</label>
      <input type="number" id="quantity" name="quantity" max="999999">

      <label for="unit">單位 <span style="color:red;">*</span>:</label>
      <input type="text" id="unit" name="unit" maxlength="4" ${required}>

      <label for="purchase_price">進貨單價:</label>
      <input type="number" step="0.01" id="purchase_price" name="purchase_price" max="999999.99">

      <label for="storage_location">公司內存放位置 <span style="color:red;">*</span>:</label>
      <input type="text" id="storage_location" name="storage_location" maxlength="12" ${required}>

      <label for="purchase_date">進貨日期 <span style="color:red;">*</span>:</label>
      <input type="date" id="purchase_date" name="purchase_date" ${required}>

      <label for="promotion_start_date">開始促銷日期:</label>
      <input type="date" id="promotion_start_date" name="promotion_start_date">

      <label for="discard_date">該丟棄之日期:</label>
      <input type="date" id="discard_date" name="discard_date">
    `;
  } else if (action === 'select' || action === 'delete') {
    // 查詢或修改模式，所有欄位均為選填
    formHTML += `
      <label for="fruit_id">水果編號:</label>
      <input type="text" id="fruit_id" name="fruit_id" maxlength="13" pattern="\\d{2}-\\d{3}-\\d{3}-\\d{2}">

      <label for="fruit_name">水果名稱:</label>
      <input type="text" id="fruit_name" name="fruit_name" maxlength="12">

      <label for="supplier_name">水果供應商名稱:</label>
      <input type="text" id="supplier_name" name="supplier_name" maxlength="12">

      <label for="quantity">現有數量:</label>
      <input type="number" id="quantity" name="quantity" max="999999">

      <label for="unit">單位:</label>
      <input type="text" id="unit" name="unit" maxlength="4">

      <label for="purchase_price">進貨單價:</label>
      <input type="number" step="0.01" id="purchase_price" name="purchase_price" max="999999.99">

      <label for="storage_location">公司內存放位置:</label>
      <input type="text" id="storage_location" name="storage_location" maxlength="12">

      <label for="purchase_date">進貨日期:</label>
      <input type="date" id="purchase_date" name="purchase_date">

      <label for="promotion_start_date">開始促銷日期:</label>
      <input type="date" id="promotion_start_date" name="promotion_start_date">

      <label for="discard_date">該丟棄之日期:</label>
      <input type="date" id="discard_date" name="discard_date">
    `;
  } else if (action === 'edit') {
    // 修改操作的表單：分為條件和修改數值兩個部分
    formHTML += `
      <h3>條件</h3>
      <div class="form-section">
        <label for="condition_fruit_id">水果編號:</label>
        <input type="text" id="condition_fruit_id" name="condition_fruit_id" maxlength="13" pattern="\\d{2}-\\d{3}-\\d{3}-\\d{2}">

        <label for="condition_member_id">會員身分證字號:</label>
        <input type="text" id="condition_member_id" name="condition_member_id" maxlength="10" pattern="[A-Z]{1}\\d{9}">

        <label for="condition_fruit_name">水果名稱:</label>
        <input type="text" id="condition_fruit_name" name="condition_fruit_name" maxlength="12">

        <label for="condition_supplier_name">水果供應商名稱:</label>
        <input type="text" id="condition_supplier_name" name="condition_supplier_name" maxlength="12">

        <label for="condition_quantity">購買數量:</label>
        <input type="number" id="condition_quantity" name="condition_quantity" max="999999">

        <label for="condition_sale_price">出售單價:</label>
        <input type="number" step="0.01" id="condition_sale_price" name="condition_sale_price" max="999999.99">

        <label for="condition_transaction_date">交易日期:</label>
        <input type="date" id="condition_transaction_date" name="condition_transaction_date">

        <label for="condition_expected_shipping_date">預計交運日期:</label>
        <input type="date" id="condition_expected_shipping_date" name="condition_expected_shipping_date">

        <label for="condition_actual_shipping_date">實際交運日期:</label>
        <input type="date" id="condition_actual_shipping_date" name="condition_actual_shipping_date">
      </div>

      <h3>修改數值</h3>
      <div class="form-section">
        <label for="update_fruit_id">水果編號:</label>
        <input type="text" id="update_fruit_id" name="update_fruit_id" maxlength="13" pattern="\\d{2}-\\d{3}-\\d{3}-\\d{2}">

        <label for="update_member_id">會員身分證字號:</label>

        <input type="text" id="update_member_id" name="update_member_id" maxlength="10" pattern="[A-Z]{1}\\d{9}">

        <label for="update_fruit_name">水果名稱:</label>
        <input type="text" id="update_fruit_name" name="update_fruit_name" maxlength="12">

        <label for="update_supplier_name">水果供應商名稱:</label>
        <input type="text" id="update_supplier_name" name="update_supplier_name" maxlength="12">

        <label for="update_quantity">購買數量:</label>
        <input type="number" id="update_quantity" name="update_quantity" max="999999">

        <label for="update_sale_price">出售單價:</label>
        <input type="number" step="0.01" id="update_sale_price" name="update_sale_price" max="999999.99">

        <label for="update_transaction_date">交易日期:</label>
        <input type="date" id="update_transaction_date" name="update_transaction_date">

        <label for="update_expected_shipping_date">預計交運日期:</label>
        <input type="date" id="update_expected_shipping_date" name="update_expected_shipping_date">

        <label for="update_actual_shipping_date">實際交運日期:</label>
        <input type="date" id="update_actual_shipping_date" name="update_actual_shipping_date">
      </div>
    `;
  }
  return formHTML;
}

// 生成會員資料表的表單
function generateMembersForm(table, action) {
  let formHTML = '';
  const required = 'required';
  if (action === 'add') {
    formHTML += `
      <label for="member_id">會員身分證字號 <span style="color:red;">*</span>:</label>
      <input type="text" id="member_id" name="member_id" maxlength="10" pattern="[A-Z]{1}\\d{9}" ${required}>

      <label for="member_name">會員姓名 <span style="color:red;">*</span>:</label>
      <input type="text" id="member_name" name="member_name" maxlength="12" ${required}>

      <label for="phone">電話:</label>
      <input type="text" id="phone_number" name="phone_number" maxlength="16" pattern="\\d{2}\\d{4}\\d{4}">

      <label for="mobile">手機號碼:</label>
      <input type="text" id="mobile_number" name="mobile_number" maxlength="16" pattern="\\d{4}\\d{3}\\d{3}">

      <label for="email">Email <span style="color:red;">*</span>:</label>
      <input type="email" id="email" name="email" maxlength="36" ${required}>

      <label for="line_joined">是否加入Line:</label>
      <select id="joined_line" name="joined_line">
        <option value="">請選擇</option>
        <option value="是">是</option>
        <option value="不是">不是</option>
      </select>

      <label for="address">住址:</label>
      <textarea id="address" name="address" maxlength="60"></textarea>

      <label for="age">年齡:</label>
      <input type="number" id="age" name="age" min="0" max="9999">

      <label for="photo">照片:</label>
      <input type="file" id="photo" name="photo" accept="image/*">

      <label for="discount">會員折扣:</label>
      <input type="number" step="0.01" id="discount" name="discount" min="0" max="1.00">
    `;
  } else if (action === 'select' || action === 'delete') {
    // 查詢或修改模式，所有欄位均為選填
    formHTML += `
      <label for="member_id">會員身分證字號:</label>
      <input type="text" id="member_id" name="member_id" maxlength="10" pattern="[A-Z]{1}\\d{9}">

      <label for="member_name">會員姓名:</label>
      <input type="text" id="member_name" name="member_name" maxlength="12">

      <label for="phone">電話:</label>
      <input type="text" id="phone_number" name="phone_number" maxlength="16" pattern="\\d{2}\\d{4}\\d{4}">

      <label for="mobile">手機號碼:</label>
      <input type="text" id="mobile_number" name="mobile_number" maxlength="16" pattern="\\d{4}\\d{3}\\d{3}">

      <label for="email">Email:</label>
      <input type="email" id="email" name="email" maxlength="36">

      <label for="line_joined">是否加入Line:</label>
      <select id="joined_line" name="joined_line">
        <option value="">請選擇</option>
        <option value="是">是</option>
        <option value="不是">不是</option>
      </select>

      <label for="address">住址:</label>
      <textarea id="address" name="address" maxlength="60"></textarea>

      <label for="age">年齡:</label>
      <input type="number" id="age" name="age" min="0" max="9999">

      <label for="discount">會員折扣:</label>
      <input type="number" step="0.01" id="discount" name="discount" min="0" max="1.00">
    `;
  } else if (action === 'edit') {
    // 修改操作的表單：分為條件和修改數值兩個部分
    formHTML += `
      <h3>條件</h3>
      <div class="form-section">
        <label for="condition_member_id">會員身分證字號:</label>
        <input type="text" id="condition_member_id" name="condition_member_id" maxlength="10" pattern="[A-Z]{1}\\d{9}">

        <label for="condition_member_name">會員姓名:</label>
        <input type="text" id="condition_member_name" name="condition_member_name" maxlength="12">

        <label for="condition_phone">電話:</label>
        <input type="text" id="condition_phone_number" name="condition_phone" maxlength="16" pattern="\\d{2}\\d{4}\\d{4}">

        <label for="condition_mobile">手機號碼:</label>
        <input type="text" id="condition_mobile_number" name="condition_mobile_number" maxlength="16" pattern="\\d{4}\\d{3}\\d{3}">

        <label for="condition_email">Email:</label>
        <input type="email" id="condition_email" name="condition_email" maxlength="36">

        <label for="condition_line_joined">是否加入Line:</label>
        <select id="condition_joined_line" name="condition_joined_line">
          <option value="">請選擇</option>
          <option value="是">是</option>
          <option value="不是">不是</option>
        </select>

        <label for="condition_address">住址:</label>
        <textarea id="condition_address" name="condition_address" maxlength="60"></textarea>

        <label for="condition_age">年齡:</label>
        <input type="number" id="condition_age" name="condition_age" min="0" max="9999">

        <label for="condition_discount">會員折扣:</label>
        <input type="number" step="0.01" id="condition_discount" name="condition_discount" min="0" max="1.00">
      </div>

      <h3>修改數值</h3>
      <div class="form-section">
        <label for="update_member_id">會員身分證字號:</label>
        <input type="text" id="update_member_id" name="update_member_id" maxlength="10" pattern="[A-Z]{1}\\d{9}">

        <label for="update_member_name">會員姓名:</label>
        <input type="text" id="update_member_name" name="update_member_name" maxlength="12">

        <label for="update_phone">電話:</label>
        <input type="text" id="update_phone" name="update_phone_number" maxlength="16" pattern="\\d{2}\\d{4}\\d{4}">

        <label for="update_mobile">手機號碼:</label>
        <input type="text" id="update_mobile_number" name="update_mobile_number" maxlength="16" pattern="\\d{4}\\d{3}\\d{3}">

        <label for="update_email">Email:</label>
        <input type="email" id="update_email" name="update_email" maxlength="36">

        <label for="update_line_joined">是否加入Line:</label>
        <select id="update_joined_line" name="update_joined_line">
          <option value="">請選擇</option>
          <option value="是">是</option>
          <option value="不是">不是</option>
        </select>

        <label for="update_address">住址:</label>
        <textarea id="update_address" name="update_address" maxlength="60"></textarea>

        <label for="update_age">年齡:</label>
        <input type="number" id="update_age" name="update_age" min="0" max="9999">

        <label for="photo">照片:</label>
        <input type="file" id="update_photo" name="update_photo" accept="image/*">

        <label for="update_discount">會員折扣:</label>
        <input type="number" step="0.01" id="update_discount" name="update_discount" min="0" max="1.00">
      </div>
    `;
  }
  return formHTML;
}

// 生成靜止會員資料表的表單
function generateInactiveForm(table, action) {
  // 與 generateMembersForm 相同
  return generateMembersForm(table, action);
}

// 生成供應商資料表的表單
function generateSuppliersForm(table, action) {
  let formHTML = '';
  const required = 'required';
  if (action === 'add') {
    formHTML += `
      <label for="supplier_id">供應商統一編號 <span style="color:red;">*</span>:</label>
      <input type="text" id="supplier_id" name="supplier_id" maxlength="8" pattern="\\d{8}" ${required}>

      <label for="supplier_name">水果供應商名稱 <span style="color:red;">*</span>:</label>
      <input type="text" id="supplier_name" name="supplier_name" maxlength="12" ${required}>

      <label for="phone">電話:</label>
      <input type="text" id="phone_number" name="phone_number" maxlength="16" pattern="\\d{2}\\d{4}\\d{4}">

      <label for="email">Email <span style="color:red;">*</span>:</label>
      <input type="email" id="email" name="email" maxlength="36" ${required}>

      <label for="address">住址:</label>
      <textarea id="address" name="address" maxlength="60"></textarea>

      <label for="manager_name">負責人姓名 <span style="color:red;">*</span>:</label>
      <input type="text" id="contact_name" name="contact_name" maxlength="12" ${required}>
    `;
  } else if (action === 'select' || action === 'delete') {
    // 查詢或刪除模式，所有欄位均為選填
    formHTML += `
      <label for="supplier_id">供應商統一編號:</label>
      <input type="text" id="supplier_id" name="supplier_id" maxlength="8" pattern="\\d{8}">

      <label for="supplier_name">水果供應商名稱:</label>
      <input type="text" id="supplier_name" name="supplier_name" maxlength="12">

      <label for="phone">電話:</label>
      <input type="text" id="phone_number" name="phone_number" maxlength="16" pattern="\\d{2}\\d{4}\\d{4}">

      <label for="email">Email:</label>
      <input type="email" id="email" name="email" maxlength="36">

      <label for="address">住址:</label>
      <textarea id="address" name="address" maxlength="60"></textarea>

      <label for="manager_name">負責人姓名:</label>
      <input type="text" id="contact_name" name="contact_name" maxlength="12">
    `;
  } else if (action === 'edit') {
    // 修改操作的表單：分為條件和修改數值兩個部分
    formHTML += `
      <h3>條件</h3>
      <div class="form-section">
        <label for="condition_supplier_id">供應商統一編號:</label>
        <input type="text" id="condition_supplier_id" name="condition_supplier_id" maxlength="8" pattern="\\d{8}">

        <label for="condition_supplier_name">水果供應商名稱:</label>
        <input type="text" id="condition_supplier_name" name="condition_supplier_name" maxlength="12">

        <label for="condition_phone">電話:</label>
        <input type="text" id="condition_phone_number" name="condition_phone_number" maxlength="16" pattern="\\d{2}\\d{4}\\d{4}">

        <label for="condition_email">Email:</label>
        <input type="email" id="condition_email" name="condition_email" maxlength="36">

        <label for="condition_address">住址:</label>
        <textarea id="condition_address" name="condition_address" maxlength="60"></textarea>

        <label for="condition_manager_name">負責人姓名:</label>
        <input type="text" id="condition_contact_name" name="condition_contact_name" maxlength="12">
      </div>

      <h3>修改數值</h3>
      <div class="form-section">
        <label for="update_supplier_id">供應商統一編號:</label>
        <input type="text" id="update_supplier_id" name="update_supplier_id" maxlength="8" pattern="\\d{8}">

        <label for="update_supplier_name">水果供應商名稱:</label>
        <input type="text" id="update_supplier_name" name="update_supplier_name" maxlength="12">

        <label for="update_phone">電話:</label>
        <input type="text" id="update_phone_number" name="update_phone_number" maxlength="16" pattern="\\d{2}\\d{4}\\d{4}">

        <label for="update_email">Email:</label>
        <input type="email" id="update_email" name="update_email" maxlength="36">

        <label for="update_address">住址:</label>
        <textarea id="update_address" name="update_address" maxlength="60"></textarea>

        <label for="update_manager_name">負責人姓名:</label>
        <input type="text" id="update_contact_name" name="update_contact_name" maxlength="12">
      </div>
    `;
  }
  return formHTML;
}

// 生成交易資料表的表單
function generateTransactionsForm(table, action) {
  let formHTML = '';
  const required = 'required';
  if (action === 'add') {
    formHTML += `
      <label for="fruit_id">水果編號 <span style="color:red;">*</span>:</label>
      <input type="text" id="fruit_id" name="fruit_id" maxlength="13" pattern="\\d{2}-\\d{3}-\\d{3}-\\d{2}" ${required}>

      <label for="member_id">會員身分證字號 <span style="color:red;">*</span>:</label>
      <input type="text" id="member_id" name="member_id" maxlength="10" pattern="[A-Z]{1}\\d{9}" ${required}>

      <label for="fruit_name">水果名稱 <span style="color:red;">*</span>:</label>
      <input type="text" id="fruit_name" name="fruit_name" maxlength="12" ${required}>

      <label for="supplier_name">水果供應商名稱 <span style="color:red;">*</span>:</label>
      <input type="text" id="supplier_name" name="supplier_name" maxlength="12" ${required}>

      <label for="purchase_quantity">購買數量 <span style="color:red;">*</span>:</label>
      <input type="number" id="purchase_quantity" name="purchase_quantity" max="999999" ${required}>

      <label for="sale_price">出售單價 <span style="color:red;">*</span>:</label>
      <input type="number" step="0.01" id="sale_price" name="sale_price" max="999999.99" ${required}>

      <label for="transaction_date">交易日期 <span style="color:red;">*</span>:</label>
      <input type="date" id="transaction_date" name="transaction_date" ${required}>

      <label for="expected_shipping_date">預計交運日期 <span style="color:red;">*</span>:</label>
      <input type="date" id="expected_shipping_date" name="expected_shipping_date" ${required}>

      <label for="actual_shipping_date">實際交運日期:</label>
      <input type="date" id="actual_shipping_date" name="actual_shipping_date"  >
    `;
  } else if (action === 'select' || action === 'delete') {
    // 查詢或刪除模式，所有欄位均為選填
    formHTML += `
      <label for="fruit_id">水果編號:</label>
      <input type="text" id="fruit_id" name="fruit_id" maxlength="13" pattern="\\d{2}-\\d{3}-\\d{3}-\\d{2}">

      <label for="member_id">會員身分證字號:</label>
      <input type="text" id="member_id" name="member_id" maxlength="10" pattern="[A-Z]{1}\\d{9}">

      <label for="fruit_name">水果名稱:</label>
      <input type="text" id="fruit_name" name="fruit_name" maxlength="12">

      <label for="supplier_name">水果供應商名稱:</label>
      <input type="text" id="supplier_name" name="supplier_name" maxlength="12">

      <label for="purchase_quantity">購買數量:</label>
      <input type="number" id="purchase_quantity" name="purchase_quantity" max="999999">

      <label for="sale_price">出售單價:</label>
      <input type="number" step="0.01" id="sale_price" name="sale_price" max="999999.99">

      <label for="transaction_date">交易日期:</label>
      <input type="date" id="transaction_date" name="transaction_date">

      <label for="expected_shipping_date">預計交運日期:</label>
      <input type="date" id="expected_shipping_date" name="expected_shipping_date">

      <label for="actual_shipping_date">實際交運日期:</label>
      <input type="date" id="actual_shipping_date" name="actual_shipping_date">
    `;
  } else if (action === 'edit') {
    // 修改操作的表單：分為條件和修改數值兩個部分
    formHTML += `
      <h3>條件</h3>
      <div class="form-section">
        <label for="condition_fruit_id">水果編號:</label>
        <input type="text" id="condition_fruit_id" name="condition_fruit_id" maxlength="13" pattern="\\d{2}-\\d{3}-\\d{3}-\\d{2}">

        <label for="condition_member_id">會員身分證字號:</label>
        <input type="text" id="condition_member_id" name="condition_member_id" maxlength="10" pattern="[A-Z]{1}\\d{9}">

        <label for="condition_fruit_name">水果名稱:</label>
        <input type="text" id="condition_fruit_name" name="condition_fruit_name" maxlength="12">

        <label for="condition_supplier_name">水果供應商名稱:</label>
        <input type="text" id="condition_supplier_name" name="condition_supplier_name" maxlength="12">

        <label for="condition_purchase_quantity">購買數量:</label>
        <input type="number" id="condition_purchase_quantity" name="condition_purchase_quantity" max="999999">

        <label for="condition_sale_price">出售單價:</label>
        <input type="number" step="0.01" id="condition_sale_price" name="condition_sale_price" max="999999.99">

        <label for="condition_transaction_date">交易日期:</label>
        <input type="date" id="condition_transaction_date" name="condition_transaction_date">

        <label for="condition_expected_shipping_date">預計交運日期:</label>
        <input type="date" id="condition_expected_shipping_date" name="condition_expected_shipping_date">

        <label for="condition_actual_shipping_date">實際交運日期:</label>
        <input type="date" id="condition_actual_shipping_date" name="condition_actual_shipping_date">
      </div>

      <h3>修改數值</h3>
      <div class="form-section">
        <label for="update_fruit_id">水果編號:</label>
        <input type="text" id="update_fruit_id" name="update_fruit_id" maxlength="13" pattern="\\d{2}-\\d{3}-\\d{3}-\\d{2}">

        <label for="update_member_id">會員身分證字號:</label>
        <input type="text" id="update_member_id" name="update_member_id" maxlength="10" pattern="[A-Z]{1}\\d{9}">

        <label for="update_fruit_name">水果名稱:</label>
        <input type="text" id="update_fruit_name" name="update_fruit_name" maxlength="12">

        <label for="update_supplier_name">水果供應商名稱:</label>
        <input type="text" id="update_supplier_name" name="update_supplier_name" maxlength="12">

        <label for="update_purchase_quantity">購買數量:</label>
        <input type="number" id="update_purchase_quantity" name="update_purchase_quantity" max="999999">

        <label for="update_sale_price">出售單價:</label>
        <input type="number" step="0.01" id="update_sale_price" name="update_sale_price" max="999999.99">

        <label for="update_transaction_date">交易日期:</label>
        <input type="date" id="update_transaction_date" name="update_transaction_date">

        <label for="update_expected_shipping_date">預計交運日期:</label>
        <input type="date" id="update_expected_shipping_date" name="update_expected_shipping_date">

        <label for="update_actual_shipping_date">實際交運日期:</label>
        <input type="date" id="update_actual_shipping_date" name="update_actual_shipping_date">
      </div>
    `;
  }
  return formHTML;
}

// 填充表單數據（編輯模式）
function populateForm(table, row) {
  const form = document.getElementById('modal-form');
  switch(table) {
    case 'fruits':
      form.fruit_id.value = row.fruit_id;
      form.fruit_name.value = row.fruit_name;
      form.supplier_name.value = row.supplier_name;
      form.quantity.value = row.quantity;
      form.unit.value = row.unit;
      form.purchase_price.value = row.purchase_price;
      form.storage_location.value = row.storage_location;
      form.purchase_date.value = row.purchase_date;
      form.promotion_start_date.value = row.promotion_start_date;
      form.discard_date.value = row.discard_date;
      break;

    case 'members':
    case 'inactive':
      form.member_id.value = row.member_id;
      form.member_name.value = row.member_name;
      form.phone.value = row.phone;
      form.mobile.value = row.mobile;
      form.email.value = row.email;
      form.line_joined.value = row.line_joined;
      form.address.value = row.address;
      form.age.value = row.age;
      form.discount.value = row.discount;
      break;

    case 'suppliers':
      form.supplier_id.value = row.supplier_id;
      form.supplier_name.value = row.supplier_name;
      form.phone.value = row.phone;
      form.email.value = row.email;
      form.address.value = row.address;
      form.manager_name.value = row.manager_name;
      break;

    case 'transactions':
      form.fruit_id.value = row.fruit_id;
      form.member_id.value = row.member_id;
      form.fruit_name.value = row.fruit_name;
      form.supplier_name.value = row.supplier_name;
      form.purchase_quantity.value = row.purchase_quantity;
      form.sale_price.value = row.sale_price;
      form.transaction_date.value = row.transaction_date;
      form.expected_shipping_date.value = row.expected_shipping_date;
      form.actual_shipping_date.value = row.actual_shipping_date;
      break;

    default:
      break;
  }
}

// 關閉 Modal 點擊空白處關閉
window.onclick = function(event) {
  const modal = document.getElementById('modal');
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}

// 處理表單提交
document.getElementById('modal-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const form = event.target;
    const table = pendingTable;
    const operation = pendingOperation;
    const formData = new FormData(form);
    const data = {};
    const conditions = {};
    const updates = {};
  
    // 根據字段名稱區分條件與更新數值
    formData.forEach((value, key) => {
      if (key.startsWith('condition_')) {
        // 條件部分
        const conditionKey = key.replace('condition_', '');
        if (value) 
          conditions[conditionKey] = value; // 忽略空值
      } else if (key.startsWith('update_')) {
        // 更新數值部分
        const updateKey = key.replace('update_', '');
        if (value) 
          updates[updateKey] = value; // 忽略空值2;
      } else {
        // 其他操作，例如新增或查詢
        data[key] = value;
      }
    });
  
    if (operation === 'select') {  // 查詢
      selectRecord(table, data)
      closeModal();
      // 普通查詢操作
      // selectRecord(table, data).then(selectedData => {
      //   if (selectedData.messages.length === 1 && pendingOperation) {
      //     const selectedRowData = selectedData[0];
      //     openEditDeleteForm(operation, table, selectedRowData);
      //   } else if (selectedData.length === 1 && !pendingOperation) {
      //     // 若操作已經是 'edit' 或 'delete'，不進一步操作
      //     closeModal();
      //   } else if (selectedData.length === 0) {
      //     alert('未找到符合條件的記錄。');
      //   } else {
      //     alert('請精確查詢僅選擇一條記錄。');
      //   }
      // }).catch(error => {
      //   console.error('查詢失敗:', error);
      //   alert('查詢失敗，請稍後再試。' + error);
      // });
    } else if (operation === 'edit') {
      const photoInput = form.querySelector('input[type="file"]');
        if (photoInput && photoInput.files.length > 0) {
          const file = photoInput.files[0];
          const reader = new FileReader();
          reader.onloadend = function() {
            // if (reader.result.length != 0) ///////////////////////
            updates['photo'] = reader.result; // 將圖片轉換為 Base64
            // alert(reader.result);
            updateRecord(table, { conditions, updates });
          };
          reader.readAsDataURL(file);
        } else if (photoInput && photoInput.files.length == 0) {
          updates['photo'] = "";
          updateRecord(table, { conditions, updates });
        } else {
          updateRecord(table, { conditions, updates });
        }
        closeModal();

    } else if (operation === 'delete') {
      deleteRecord(table, data);
      closeModal();
    } else {  //  新增
      // 其他操作（add）
      if (operation === 'add') {
        // 處理圖片上傳（將圖片轉換為 Base64 字符串）
        const photoInput = form.querySelector('input[type="file"]');
        if (photoInput && photoInput.files.length > 0) {
          const file = photoInput.files[0];
          const reader = new FileReader();
          reader.onloadend = function() {
            // if (reader.result.length != 0) ///////////////////////
            data['photo'] = reader.result; // 將圖片轉換為 Base64
            // alert(reader.result);
            createRecord(table, data);
          };
          reader.readAsDataURL(file);
        } else if (photoInput && photoInput.files.length == 0) {
          data['photo'] = ''
          createRecord(table, data)
        } else {
          createRecord(table, data);
        }
      }
      closeModal();
    }
});

// 執行操作
function executeOperation(operation, table, data) {
  if (operation === '新增') {
    createRecord(table, data);
  } else if (operation === '修改') {
    updateRecord(table, data);
  } else if (operation === '刪除') {
    deleteRecord(table, data);
  } else if (operation === '移轉') {
    transferRecord(table, data);
  } else if (operation === '查詢') {
    selectRecord(table, data);
  }
}

// 獲取當前顯示的表格名稱
function getCurrentTable() {
  const tables = document.querySelectorAll('.table-container');
  for (const table of tables) {
    if (!table.classList.contains('hidden')) {
      return table.id;
    }
  }
  return null;
}

// 新增資料
async function createRecord(table, data) {
  try {
    const response = await fetch(`${API_BASE_URL}/${table}/insert`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    // const data = await response.json();
    if (response.ok) {
      alert('新增成功！');
    } else {
        console.warn('No messages found in the response or messages is not an array.');
        const response_data = await response.json();
        alert(`新增失敗: ${response_data.error}`);
    }
  } catch (error) {
    console.error('新增資料失敗:', error);
    alert('無法新增資料，請檢查後端伺服器狀態！');
  }
}

// 修改資料
async function updateRecord(table, data) {
    const { conditions, updates } = data;

    if (!conditions || Object.keys(conditions).length === 0) {
      alert('請提供至少一個更新條件！');
      return;
    }
  
    if (!updates || Object.keys(updates).length === 0) {
      alert('請提供至少一個要更新的數值！');
      return;
    }

    const confirmUpdate = confirm('確定要更新符合條件的資料嗎？');
    if (!confirmUpdate) {
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/${table}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conditions, updates }),
      });
  
      if (response.ok) {
        alert('修改成功！');
        // fetchData(table);
      } else {
        const errorData = await response.json();
        alert(`修改失敗：${errorData.message}`);
      }
    } catch (error) {
      console.error('修改資料失敗:', error);
      alert('無法修改資料，請檢查後端伺服器狀態！');
    }
}

// 刪除資料
async function deleteRecord(table, data) {
   // 構建條件
   const conditions = {};
   Object.entries(data).forEach(([key, value]) => {
     if (value) { // 只有非空條件才傳遞
       conditions[key] = value;
     }
   });
   const conditionsStr = JSON.stringify(conditions);
   alert(conditionsStr);
 
   if (Object.keys(conditions).length === 0) {
     alert('請提供至少一個刪除條件aaa！' + data);
     return;
   }

   // 確認刪除操作
  const confirmDelete = confirm('確定要刪除符合條件的資料嗎？');
  if (!confirmDelete) {
    return;
  }
 
   try {
     const response = await fetch(`${API_BASE_URL}/${table}/delete`, {
       method: 'PUT',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(conditions),
     });
 
     if (response.ok) {
       alert('刪除成功！');
      //  fetchData(table);
     } else {
       const errorData = await response.json();
       alert(`刪除失敗：${errorData.message}`);
     }
   } catch (error) {
     console.error('刪除資料失敗:', error);
     alert('無法刪除資料，請檢查後端伺服器狀態！');
   }
}

// 移轉資料（僅針對靜止會員資料表）
async function transferRecord(table, data) {
  if (table !== 'inactive') return;
  const member_id = data['transfer_member_id'] || data['member_id']; // 支援不同表單欄位名稱
  if (!member_id) {
    alert('未提供會員身分證字號。');
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/${table}/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ member_id })
    });
    if (response.ok) {
      alert('移轉成功！');
      // fetchData(table);
      // fetchData('members');
    } else {
      const errorData = await response.json();
      alert(`移轉失敗：${errorData.message}`);
    }
  } catch (error) {
    console.error('移轉資料失敗:', error);
    alert('無法移轉資料，請檢查後端伺服器狀態！');
  }
}

// 查詢資料
async function selectRecord(table, data) {
  try {
    const response = await fetch(`${API_BASE_URL}/${table}/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    const response_data = await response.json();
    // alert(1);
    // alert(Data.messages);
    // alert(JSON.stringify(response));
    if (response.ok) {
      alert('查詢成功！');
      // 操作成功
      console.log('Success:', response_data.status);
      console.log('Messages:', response_data.messages);
      // 處理多個訊息
      // if (Data.messages && Array.isArray(Data.messages)) {
      //   Data.messages.forEach(message => {
      //       for (const [key, value] of Object.entries(message)) {
      //           console.log(`${key}: ${value}`);
      //       }
      //   });
      // }
      // alert('Success: ' + Data.messages.map(msg => JSON.stringify(msg)).join(', '));

      const messagesMapArray = [];
      let total_value = 0.0, shipped = 0.0, unshipped = 0.0;  
      if (response_data.messages && Array.isArray(response_data.messages)) {
        // response_data.messages.forEach(message => {
        //   const map = new Map(Object.entries(message));
        //   messagesMapArray.push(map);
              //   map.forEach((value, key) => {
              //     console.log(`${key}:`, value);
              // });
          if (response_data.messages && Array.isArray(response_data.messages)) {
            response_data.messages.forEach(message => {
              const map = new Map(Object.entries(message));
              messagesMapArray.push(map);
                  //   map.forEach((value, key) => {
                  //     console.log(`${key}:`, value);
                  // });
              if (table === 'transactions') {
                if (map.get('price_after_discount') != null) {
                  let price = parseFloat(map.get('price_after_discount'));
                  total_value += price;
                  if (map.get('actual_shipping_date') != null)
                    shipped += price;
                  else
                    unshipped += price;
                }
                else {
                  let price = parseFloat(map.get('total_price'));
                  total_value += price;
                  if (map.get('actual_shipping_date') != null)
                    shipped += price;
                  else
                    unshipped += price;
                }
              }
            });
          }
          
        if (table === 'transactions') {
          updateTransactionTotal(total_value, shipped, unshipped);
        }

        current_tuples = data;
        renderTable(table, messagesMapArray);
        // (messagesMapArray);
      } else {
        console.error('Error:', response_data.error || response_data.messages);
        alert(`查詢失敗: ${response_data.error || response_data.messages}`);
        // alert(`新增失敗：${errorData.message}`);
      }
    }
  } catch (error) {
    console.error('查詢資料失敗:', error);
    alert('無法查詢資料，請檢查後端伺服器狀態！' + error);
    return [];
  }
}

async function shipped_sort() {
  shipped = []
  current_tuples.forEach((message) => {
    if (message.get('actual_shipping_date') != null) {
      shipped.push(message);
    }
  });

  shipped.sort((a, b) => parseFloat(a.get('price_after_discount')) - parseFloat(b.get('price_after_discount')));
  renderTable('transactions', shipped);
}

async function unshipped_sort() {
  unshipped = []
  current_tuples.forEach((message) => {
    if (message.get('actual_shipping_date') == null) {
      unshipped.push(message);
    }
  });

  unshipped.sort((a, b) => parseFloat(a.get('price_after_discount')) - parseFloat(b.get('price_after_discount')));
  renderTable('transactions', unshipped);
}

async function fetchData(table) {
  try {
    const response = await fetch(`${API_BASE_URL}/${table}/all` , {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      // alert(11)
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    else {
      // alert(22)
    }
    const response_data = await response.json();
    if (response.ok) {
      alert('查詢成功！');
      // 操作成功
      console.log('Success:', response_data.status);
      console.log('Messages:', response_data.messages);

      const messagesMapArray = [];
      let total_value = 0.0, shipped = 0.0, unshipped = 0.0;
      if (response_data.messages && Array.isArray(response_data.messages)) {
        response_data.messages.forEach(message => {
          const map = new Map(Object.entries(message));
          messagesMapArray.push(map);
              //   map.forEach((value, key) => {
              //     console.log(`${key}:`, value);
              // });
          if (table === 'transactions') {
            if (map.get('price_after_discount') != null) {
              let price = parseFloat(map.get('price_after_discount'));
              total_value += price;
              if (map.get('actual_shipping_date') != null)
                shipped += price;
              else
                unshipped += price;
            }
            else {
              let price = parseFloat(map.get('total_price'));
              total_value += price;
              if (map.get('actual_shipping_date') != null)
                shipped += price;
              else
                unshipped += price;
            }
          }
        });
        // (messagesMapArray);
      }
      if (table === 'transactions') {
        updateTransactionTotal(total_value.toFixed(2), shipped.toFixed(2), unshipped.toFixed(2));
      }


      current_tuples = messagesMapArray;
      renderTable(table, messagesMapArray);

    }
    else {
      console.error('Error:', response_data.error);
      alert(`查詢失敗: ${response_data.error }`);
    }
  } catch (error) {
    console.error('資料加載失敗:', error);
    alert('無法加載資料，請檢查後端伺服器狀態！' + error);
  }
}

function renderTable(table, data) {
  // const tableBody = document.querySelector(`#${table} tbody`);
  // tableBody.innerHTML = '';
  // data.forEach(row => {
  //   const tr = document.createElement('tr');
  //   Object.entries(row).forEach(([key, value]) => {
  //     const td = document.createElement('td');
  //     if (key.toLowerCase() === 'photo') { // 處理圖片欄位
  //       const img = document.createElement('img');
  //       img.src = value;
  //       td.appendChild(img);
  //     } else {
  //       td.textContent = value;
  //       // 為住址欄位添加工具提示
  //       if ((table === 'members' || table === 'inactive') && key.toLowerCase() === 'address') {
  //         td.setAttribute('title', value);
  //       }
  //     }
  //     tr.appendChild(td);
  //   });
  //   tableBody.appendChild(tr);
  // });

  // // 添加行點擊事件以選擇記錄
  // tableBody.querySelectorAll('tr').forEach(tr => {
  //   tr.addEventListener('click', () => {
  //     if (selectedRow) {
  //       selectedRow.classList.remove('selected');
  //     }
  //     selectedRow = tr;
  //     selectedRow.classList.add('selected');
  //   });
  // });
  const tableBody = document.querySelector(`#${table} tbody`);
  tableBody.innerHTML = '';
  attrs = TABLE_ATTRIBUTE.get(table)
  data.forEach(row => {
    const tr = document.createElement('tr');
    
    // 使用 Map 的 forEach 方法來迭代每個鍵值對
    // row.forEach((value, key) => {
    //   const td = document.createElement('td');
      
    //   if (key.toLowerCase() === 'photo') { // 處理圖片欄位
    //     const img = document.createElement('img');
    //     img.src = value;
    //     img.alt = 'Photo';
    //     img.style.width = '50px'; // 根據需求調整圖片大小
    //     img.style.height = '50px'; // 根據需求調整圖片大小
    //     td.appendChild(img);
    //   } else {
    //     td.textContent = value;
        
    //     // 為住址欄位添加工具提示
    //     if ((table === 'members' || table === 'inactive') && key.toLowerCase() === 'address') {
    //       td.setAttribute('title', value);
    //     }
    //   }
      
    //   tr.appendChild(td);
    // });
    attrs.forEach(attr => {
      const td = document.createElement('td');
      
      if (attr.toLowerCase() === 'photo') { // 處理圖片欄位
        const img = document.createElement('img');
        img.src = row.get(attr);
        img.alt = 'Photo';
        img.style.width = '50px'; // 根據需求調整圖片大小
        img.style.height = '50px'; // 根據需求調整圖片大小
        td.appendChild(img);
      } else {
        td.textContent = row.get(attr);
        
        // 為住址欄位添加工具提示
        if ((table === 'members' || table === 'inactive') && attr.toLowerCase() === 'address') {
          td.setAttribute('title', row.get(attr));
        }
      }
      
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });

  // 添加行點擊事件以選擇記錄
  tableBody.querySelectorAll('tr').forEach(tr => {
    tr.addEventListener('click', () => {
      if (selectedRow) {
        selectedRow.classList.remove('selected');
      }
      selectedRow = tr;
      selectedRow.classList.add('selected');
    });
  });
}

// 列印資料（展示表格中的所有內容）
async function printTable(table) {
  fetchData(table);
}

// 打開修改或刪除的表單
function openEditDeleteForm(operation, table, rowData) {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalForm = document.getElementById('modal-form');

  modalTitle.textContent = `${operation === 'edit' ? '修改' : '刪除'}資料`;
  modalForm.innerHTML = generateForm(table, operation);
  populateForm(table, rowData);
  modal.style.display = 'block';

  // **關鍵修正**：不要重置 pendingOperation 和 pendingTable
  // pendingOperation = null;
  // pendingTable = null;
}

// 獲取主鍵欄位名稱
function getKeyAttribute(table) {
  switch(table) {
    case 'fruits':
      return 'fruit_id';
    case 'members':
    case 'inactive':
      return 'member_id';
    case 'suppliers':
      return 'supplier_id';
    case 'transactions':
      return 'transaction_id'; // 假設有一個單一的主鍵
    default:
      return '';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var username = prompt("請輸入帳號");
  var password = prompt("請輸入密碼");
  
  if (username !== '015' || password !== '015') {
    alert("帳號或密碼錯誤");
    // 若要結束程式可直接重整或導向其他頁面
    window.location.reload();
  }
  // 若正確則不做任何事，維持原本頁面顯示。
});

// 新增一個方法用來更新總金額顯示
function updateTransactionTotal(value, shipped, unshipped) {
  document.getElementById('transaction-total').textContent = value;
  document.getElementById('transaction-shipped').textContent = shipped;
  document.getElementById('transaction-unshipped').textContent = unshipped;
}

