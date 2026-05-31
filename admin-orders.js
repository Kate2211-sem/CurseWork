document.addEventListener('DOMContentLoaded', () => {
  // 🔐 Проверка доступа
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user || user.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }
  
  const headerUsername = document.getElementById('header-username');
  if (headerUsername) {
    headerUsername.textContent = user.fio || 'Админ';
  }

  // === ДАННЫЕ ===
  let dataOrders = JSON.parse(localStorage.getItem('orders')) || [];
  let dataAppts = JSON.parse(localStorage.getItem('appointments')) || [];
  
  // Новые модули данных
  let dataHomeRequests = JSON.parse(localStorage.getItem('home_requests')) || [];
  let dataJobApps = JSON.parse(localStorage.getItem('job_applications')) || [];
  // Автоматическое наполнение базы данных всеми 16 реальными товарами
let dataProducts = JSON.parse(localStorage.getItem('shop_products'));

if (!dataProducts || dataProducts.length === 0) {
  dataProducts = [
    { "id": "p1", "name": "Estel Curex Versus Winter Защита", "category": "shampoo", "price": 25.90, "volume": "200 мл", "brand": "ESTEL", "image": "img/products/sh1.jpg", "inStock": true, "discount": null },
    { "id": "p2", "name": "Estel 18+ Многофункциональный", "category": "spray", "price": 19.90, "volume": "200 мл", "brand": "ESTEL", "image": "img/products/s1.jpg", "inStock": true, "discount": 15 },
    { "id": "p3", "name": "Estel Otium Aqua Увлажнение", "category": "mask", "price": 32.50, "volume": "300 мл", "brand": "ESTEL", "image": "img/products/ma1.jpg", "inStock": true, "discount": null },
    { "id": "p4", "name": "Londa Velvet Oil с арганой", "category": "oil", "price": 45.00, "volume": "100 мл", "brand": "Londa", "image": "img/products/s2.jpg", "inStock": true, "discount": null },
    { "id": "p5", "name": "Matrix Total Results Brass Off", "category": "conditioner", "price": 28.10, "volume": "300 мл", "brand": "Matrix", "image": "img/products/s3.jpg", "inStock": true, "discount": null },
    { "id": "p6", "name": "Ollin Perfect Hair 15 в 1", "category": "serum", "price": 18.50, "volume": "250 мл", "brand": "Ollin", "image": "img/products/s4.jpg", "inStock": true, "discount": null },
    { "id": "p7", "name": "Schwarzkopf Silhouette Лак", "category": "styling", "price": 35.20, "volume": "500 мл", "brand": "Schwarzkopf", "image": "img/products/s5.jpg", "inStock": true, "discount": null },
    { "id": "p8", "name": "Nioxin Scalp Recovery Пилинг", "category": "peeling", "price": 54.90, "volume": "150 мл", "brand": "Nioxin", "image": "img/products/s6.jpg", "inStock": true, "discount": null },
    { "id": "p9", "name": "Londa Color Radiance Защита цвета", "category": "shampoo", "price": 22.40, "volume": "250 мл", "brand": "Londa", "image": "img/products/sh2.jpg", "inStock": true, "discount": null },
    { "id": "p10", "name": "Estel Otium Miracle Восстановление", "category": "balm", "price": 17.80, "volume": "200 мл", "brand": "ESTEL", "image": "img/products/ma2.jpg", "inStock": true, "discount": 10 },
    { "id": "p11", "name": "Ollin Bionika Плотность волос", "category": "care", "price": 29.90, "volume": "100 мл", "brand": "Ollin", "image": "img/products/s7.jpg", "inStock": true, "discount": null },
    { "id": "p12", "name": "Estel Couture Термозащита", "category": "spray", "price": 26.00, "volume": "200 мл", "brand": "ESTEL", "image": "img/products/s8.jpg", "inStock": true, "discount": null },
    { "id": "p13", "name": "Matrix Biolage Глубокое увлажнение", "category": "spray", "price": 41.20, "volume": "150 мл", "brand": "Matrix", "image": "img/products/s9.jpg", "inStock": true, "discount": null },
    { "id": "p14", "name": "Wella Invigo Питание и блеск", "category": "shampoo", "price": 31.50, "volume": "250 мл", "brand": "Wella", "image": "img/products/sh3.jpg", "inStock": true, "discount": null },
    { "id": "p15", "name": "Londa Dramatic Hold Объем", "category": "mousse", "price": 24.90, "volume": "250 мл", "brand": "Londa", "image": "img/products/s10.jpg", "inStock": true, "discount": null },
    { "id": "p16", "name": "Matrix Keep Me Vivid Яркость цвета", "category": "care", "price": 21.30, "volume": "300 мл", "brand": "Matrix", "image": "img/products/s11.jpg", "inStock": true, "discount": 20 }
  ];
  localStorage.setItem('shop_products', JSON.stringify(dataProducts));
}
  let currentTab = 'orders'; 
  let currentFilter = 'all';
  let currentSearch = '';
  let selectedItem = null;

  // Словари перевода для фильтров и статусов
  const statusLabels = {
    all: 'Все',
    pending: '⏳ Ожидает',
    confirmed: '✅ Подтверждён',
    completed: '🎉 Выполнен',
    cancelled: '❌ Отменён'
  };

  const apptStatusLabels = {
    all: 'Все',
    confirmed: '✅ Подтверждено',
    completed: '🎉 Выполнено',
    cancelled: '❌ Отменено'
  };

  const rolesMap = {
    hairdresser: 'Парикмахер / Стилист',
    manicure: 'Мастер маникюра',
    browist: 'Бровист / Визажист'
  };

  // === КОНФИГУРАЦИЯ ТАБЛИЦ ===
  const TAB_CONFIG = {
    orders: {
      title: 'Заказы (Магазин)',
      filters: ['all', 'pending', 'confirmed', 'completed', 'cancelled'],
      headers: ['№', 'Дата', 'Клиент', 'Сумма', 'Статус'],
      getData: () => dataOrders,
      filterItem: (item, f) => f === 'all' || item.status === f,
      searchItem: (item, s) => (item.orderNumber && item.orderNumber.toLowerCase().includes(s)) || (item.customer?.name && item.customer.name.toLowerCase().includes(s)),
      // Внутри TAB_CONFIG.orders:
renderRow: (item, index) => { // Добавляем index как второй аргумент
    // 1. Порядковый номер (index + 1, так как массив начинается с 0)
    const rowNumber = index + 1;

    // 2. Форматируем дату из createdAt
    const date = item.createdAt ? new Date(item.createdAt).toLocaleString('ru-RU', {
        day: '2-digit', 
        month: '2-digit', 
        year: '2-digit',
        hour: '2-digit', 
        minute: '2-digit'
    }) : '—';
    
    const statusClass = `status-${item.status || 'pending'}`;
    const statusText = statusLabels[item.status] || '⏳ Ожидает';

    return `
      <tr class="order-row" data-id="${item.id}">
        <td><strong>${rowNumber}</strong></td> 
        <td><small>${date}</small></td>
        <td>${item.customerName || '—'}<br><small>${item.customerPhone || ''}</small></td>
        <td><strong>${item.total ? item.total.toFixed(2) : '0'} ₽</strong></td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td><button class="action-btn view-btn" style="background:none;border:none;cursor:pointer;font-size:18px;">👁️</button></td>
      </tr>
    `;
},
     renderPanel: (item) => {
    document.getElementById('panel-title').textContent = `Заказ #${item.id}`;
    
    // Генерируем список товаров (если они есть)
    const itemsHtml = item.items?.map(i => 
        `<div style="border-bottom:1px dashed #eee; padding:8px 0; display:flex; justify-content:space-between;">
            <span>${i.name} × ${i.quantity}</span>
            <b>${(i.price * i.quantity).toFixed(2)} ₽</b>
        </div>`
    ).join('') || 'Нет товаров';
    
    document.getElementById('panel-body').innerHTML = `
        <div class="info-block">
            <h4>Клиент</h4>
            <p>${item.customerName || '—'}</p>
            <p><a href="tel:${item.customerPhone}">${item.customerPhone || ''}</a></p>
            <p>${item.customerAddress || '—'}</p>
            ${item.customerComment ? `<p><b>Комментарий:</b> ${item.customerComment}</p>` : ''}
        </div>
        <div class="info-block">
            <h4>Состав</h4>
            ${itemsHtml}
            <div style="margin-top:10px; font-weight:700; text-align:right;">ИТОГО: ${item.total || 0} ₽</div>
        </div>
    `;

    document.getElementById('panel-footer').innerHTML = `
        <select class="status-select" id="panel-status" style="width:100%; margin-bottom:10px; padding: 8px;">
            <option value="pending" ${item.status==='pending'?'selected':''}>⏳ Ожидает</option>
            <option value="confirmed" ${item.status==='confirmed'?'selected':''}>✅ Подтверждён</option>
            <option value="completed" ${item.status==='completed'?'selected':''}>🎉 Выполнен</option>
            <option value="cancelled" ${item.status==='cancelled'?'selected':''}>❌ Отменён</option>
        </select>
        <button class="btn-panel primary" id="btn-save" style="width:100%; margin-bottom: 5px;">💾 Сохранить статус</button>
        <button class="btn-panel danger" id="btn-delete" style="width:100%;">🗑️ Удалить заказ</button>
    `;
},
      save: async (newStatus) => {
    try {
        // Отправляем PATCH запрос на сервер для обновления статуса конкретного заказа
        const res = await fetch(`http://localhost:3000/orders/${selectedItem.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (res.ok) {
            alert('Статус успешно обновлен!');
            // После успешного обновления перезагружаем данные
            renderAll(); 
        }
    } catch (err) {
        console.error("Ошибка при сохранении статуса:", err);
    }
},
      delete: () => {
        dataOrders = dataOrders.filter(o => o.orderNumber !== selectedItem.orderNumber);
        localStorage.setItem('orders', JSON.stringify(dataOrders));
      }
    },
    appointments: {
      title: 'Записи (Услуги)',
      filters: ['all', 'confirmed', 'completed', 'cancelled'],
      headers: ['№', 'Дата / Время', 'Клиент', 'Услуга', 'Мастер', 'Статус'],
      getData: () => dataAppts,
      filterItem: (item, f) => f === 'all' || item.status === f,
      searchItem: (item, s) => (item.id && String(item.id).toLowerCase().includes(s)) || (item.customer?.name && item.customer.name.toLowerCase().includes(s)) || (item.serviceName && item.serviceName.toLowerCase().includes(s)),
      renderRow: (item) => {
        // Проверяем, есть ли поле даты, иначе ставим прочерк
        const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU') : '—';
        
        // Используем ваши точные имена полей из лога
        const name = item.customerName || '—';
        const phone = item.customerPhone || '—';
        const orderNumber = item.id || '#';
        const total = item.total || 0;
        
        const statusClass = `status-${item.status || 'pending'}`;
        const statusText = statusLabels[item.status] || '⏳ Ожидает';

        return `
          <tr class="order-row" data-id="${item.id}">
            <td><strong>${orderNumber}</strong></td>
            <td><small>${date}</small></td>
            <td>${name}<br><small>${phone}</small></td>
            <td><strong>${total} ₽</strong></td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td><button class="action-btn view-btn" style="background:none;border:none;cursor:pointer;font-size:18px;">👁️</button></td>
          </tr>
        `;
      },
      renderPanel: (item) => {
        document.getElementById('panel-title').textContent = `Запись ${item.id || ''}`;
        document.getElementById('panel-body').innerHTML = `
          <div class="info-block"><h4>Клиент</h4><p>${item.customer?.name || '—'}</p><p><a href="tel:${item.customer?.phone}">${item.customer?.phone || ''}</a></p></div>
          <div class="info-block"><h4>Услуга</h4><p>${item.categoryName || ''} → ${item.serviceName || '—'}</p><p>Мастер: ${item.masterName || '—'}</p><p>⏱ ${item.duration || 0} мин • 💰 ${item.price || 0} ₽</p></div>
          <div class="info-block"><h4>Время визита</h4><p>📅 ${item.appointmentDate || '—'} в ${item.appointmentTime || ''}</p></div>
          ${item.customer?.comment ? `<div class="info-block"><h4>Комментарий</h4><p>${item.customer.comment}</p></div>` : ''}
        `;
        document.getElementById('panel-footer').innerHTML = `
          <select class="status-select" id="panel-status" style="width:100%; margin-bottom:10px;">
            <option value="confirmed" ${item.status==='confirmed'?'selected':''}>✅ Подтверждено</option>
            <option value="completed" ${item.status==='completed'?'selected':''}>🎉 Выполнено</option>
            <option value="cancelled" ${item.status==='cancelled'?'selected':''}>❌ Отменено</option>
          </select>
          <button class="btn-panel primary" id="btn-save">💾 Сохранить</button>
          <button class="btn-panel danger" id="btn-delete">🗑️ Удалить запись</button>
        `;
      },
      save: (newStatus) => {
        const idx = dataAppts.findIndex(a => a.id === selectedItem.id);
        if (idx !== -1) {
          dataAppts[idx].status = newStatus;
          localStorage.setItem('appointments', JSON.stringify(dataAppts));
          
          const key = `user_appts_${dataAppts[idx].userId || 'guest'}`;
          let ua = JSON.parse(localStorage.getItem(key)) || [];
          const uIdx = ua.findIndex(x => x.id === selectedItem.id);
          if (uIdx !== -1) { ua[uIdx].status = newStatus; localStorage.setItem(key, JSON.stringify(ua)); }
        }
      },
      delete: () => {
        dataAppts = dataAppts.filter(a => a.id !== selectedItem.id);
        localStorage.setItem('appointments', JSON.stringify(dataAppts));
        
        const key = `user_appts_${selectedItem.userId || 'guest'}`;
        let ua = JSON.parse(localStorage.getItem(key)) || [];
        ua = ua.filter(x => x.id !== selectedItem.id);
        localStorage.setItem(key, JSON.stringify(ua));
      }
    },
    home_requests: {
      title: 'Заявки на выезд на дом / праздники',
      filters: ['all'],
      headers: ['ID', 'Клиент', 'Телефон', 'Услуга', 'Дата / Время', 'Адрес доставки'],
      getData: () => dataHomeRequests,
      filterItem: () => true,
      searchItem: (item, s) => (item.id && String(item.id).toLowerCase().includes(s)) || (item.userName && item.userName.toLowerCase().includes(s)),
      renderRow: (item) => `
        <tr class="order-row" data-id="${item.id}">
          <td><strong>${item.id || '—'}</strong></td>
          <td>${item.userName || '—'}</td>
          <td><a href="tel:${item.userPhone}">${item.userPhone || '—'}</a></td>
          <td>${item.service || '—'}</td>
          <td>${item.date || '—'} в ${item.time || '—'}</td>
          <td>${item.address || '—'}</td>
          <td><button class="action-btn view-btn" style="background:none;border:none;cursor:pointer;font-size:18px;">👁️</button></td>
        </tr>
      `,
      renderPanel: (item) => {
        document.getElementById('panel-title').textContent = `Заявка на выезд ${item.id || ''}`;
        document.getElementById('panel-body').innerHTML = `
          <div class="info-block"><h4>Клиент</h4><p>${item.userName || '—'}</p><p>Тел: ${item.userPhone || '—'}</p></div>
          <div class="info-block"><h4>Детали выезда</h4><p>Услуга: ${item.service || '—'}</p><p>Время: ${item.date || '—'} в ${item.time || '—'}</p><p>Адрес: ${item.address || '—'}</p></div>
        `;
        document.getElementById('panel-footer').innerHTML = `<button class="btn-panel danger" id="btn-delete" style="width:100%;">🗑️ Удалить заявку</button>`;
      },
      save: () => {},
      delete: () => {
        dataHomeRequests = dataHomeRequests.filter(x => x.id !== selectedItem.id);
        localStorage.setItem('home_requests', JSON.stringify(dataHomeRequests));
      }
    },
    job_applications: {
      title: 'Резюме соискателей',
      filters: ['all'],
      headers: ['ID', 'ФИО', 'Телефон', 'Вакансия', 'Опыт работы', 'Портфолио'],
      getData: () => dataJobApps,
      filterItem: () => true,
      searchItem: (item, s) => (item.id && String(item.id).toLowerCase().includes(s)) || (item.userName && item.userName.toLowerCase().includes(s)),
      renderRow: (item) => `
        <tr class="order-row" data-id="${item.id}">
          <td><strong>${item.id || '—'}</strong></td>
          <td>${item.userName || '—'}</td>
          <td><a href="tel:${item.userPhone}">${item.userPhone || '—'}</a></td>
          <td>${rolesMap[item.position] || item.position || '—'}</td>
          <td>${item.experience || '—'}</td>
          <td><a href="${item.portfolio || '#'}" target="_blank" style="color:var(--admin-primary); text-decoration:underline;">Открыть ссылку</a></td>
          <td><button class="action-btn view-btn" style="background:none;border:none;cursor:pointer;font-size:18px;">👁️</button></td>
        </tr>
      `,
      renderPanel: (item) => {
        document.getElementById('panel-title').textContent = `Резюме ${item.id || ''}`;
        document.getElementById('panel-body').innerHTML = `
          <div class="info-block"><h4>Соискатель</h4><p>${item.userName || '—'}</p><p>Тел: ${item.userPhone || '—'}</p><p>Вакансия: ${rolesMap[item.position] || item.position}</p></div>
          <div class="info-block"><h4>Опыт и портфолио</h4><p>${item.experience || '—'}</p><p><a href="${item.portfolio || '#'}" target="_blank">Ссылка на портфолио</a></p></div>
        `;
        document.getElementById('panel-footer').innerHTML = `<button class="btn-panel danger" id="btn-delete" style="width:100%;">🗑️ Удалить резюме</button>`;
      },
      save: () => {},
      delete: () => {
        dataJobApps = dataJobApps.filter(x => x.id !== selectedItem.id);
        localStorage.setItem('job_applications', JSON.stringify(dataJobApps));
      }
    },
   catalog: {
      title: 'Каталог косметики в магазине',
      filters: ['all'],
      headers: ['Фото', 'ID товара', 'Название товара', 'Бренд / Объем', 'Цена', 'Категория'],
      getData: () => dataProducts,
      filterItem: () => true,
      searchItem: (item, s) => (item.id && item.id.toLowerCase().includes(s)) || (item.name && item.name.toLowerCase().includes(s)) || (item.brand && item.brand.toLowerCase().includes(s)),
      renderRow: (item) => `
    <tr class="order-row" data-id="${item.id}">
      <td><img src="${item.image || ''}" style="width:40px; height:40px; object-fit:contain;"></td>
      <td><strong>${item.id || '—'}</strong></td>
      <td>${item.name || '—'}</td>
      <td>${item.brand || '—'} / ${item.volume || ''}</td>
      <td><strong>${item.price ? item.price.toFixed(2) : '0.00'} ₽</strong></td>
      <td>${item.category || '—'}</td>
      <td><button class="action-btn view-btn" style="background:none;border:none;cursor:pointer;font-size:18px;">👁️</button></td>
    </tr>
  `,
      renderPanel: (item) => {
        document.getElementById('panel-title').textContent = `Товар ${item.id || ''}`;
        document.getElementById('panel-body').innerHTML = `
          <div class="info-block">
            <h4>Свойства товара</h4>
            <p><b>Название:</b> ${item.name || ''}</p>
            <p><b>Бренд:</b> ${item.brand || '—'}</p>
            <p><b>Объем:</b> ${item.volume || '—'}</p>
            <p><b>Цена:</b> ${item.price || 0} руб.</p>
            <p><b>Категория:</b> ${item.category || ''}</p>
            <p><b>В наличии:</b> ${item.inStock ? 'Да' : 'Нет'}</p>
            <p><b>Скидка:</b> ${item.discount ? item.discount + '%' : 'Нет'}</p>
          </div>
        `;
        document.getElementById('panel-footer').innerHTML = `<button class="btn-panel danger" id="btn-delete" style="width:100%;">🗑️ Удалить товар</button>`;
      },
      save: () => {},
      delete: () => {
        dataProducts = dataProducts.filter(x => x.id !== selectedItem.id);
        localStorage.setItem('shop_products', JSON.stringify(dataProducts));
      }
    }
  };

  // === ГЛАВНАЯ ФУНКЦИЯ ОРИГИНАЛЬНОГО РЕНДЕРА ТАБЛИЦ ===
  function renderTable() {
    const cfg = TAB_CONFIG[currentTab];
    if (!cfg) return;

    // Включение/выключение формы добавления товара
    const formContainer = document.getElementById('catalog-form-container');
    if (formContainer) {
      formContainer.style.display = currentTab === 'catalog' ? 'block' : 'none';
    }

    // Заголовок и шапка таблицы
    const titleEl = document.getElementById('table-title');
    if (titleEl) titleEl.textContent = cfg.title;

    const tHead = document.getElementById('table-head');
    if (tHead) {
      tHead.innerHTML = `<tr>${cfg.headers.map(h => `<th>${h}</th>`).join('')}<th>Действия</th></tr>`;
    }

    // Фильтрация и поиск данных
    let list = cfg.getData().filter(item => cfg.filterItem(item, currentFilter));
    if (currentSearch) {
      list = list.filter(item => cfg.searchItem(item, currentSearch));
    }

    const tBody = document.getElementById('data-body');
    const emptyBlock = document.getElementById('data-empty');

    if (!tBody) return;

    // СТРОГАЯ ОЧИСТКА: Удаляем всё старое содержимое перед рендером новых строк!
    tBody.innerHTML = '';

    if (list.length === 0) {
      if (emptyBlock) emptyBlock.style.display = 'block';
  } else {
      if (emptyBlock) emptyBlock.style.display = 'none';
      
      // ИСПРАВЛЕННЫЙ РЕНДЕР:
      tBody.innerHTML = list.map((item, index) => {
        // Если это заказы (orders) или записи (appointments), передаем индекс
        if (currentTab === 'orders' || currentTab === 'appointments') {
            return cfg.renderRow(item, index);
        } 
        // Для остальных (каталог, вакансии, заявки) передаем только item
        else {
            return cfg.renderRow(item);
        }
      }).join('');
    }
    updateStatsCounters();
  }

  function updateStatsCounters() {
    const totalOrders = dataOrders.length;
    const totalAppts = dataAppts.length;
    
    const ordersStat = document.getElementById('stat-orders-count');
    const apptsStat = document.getElementById('stat-appts-count');
    if (ordersStat) ordersStat.textContent = totalOrders;
    if (apptsStat) apptsStat.textContent = totalAppts;

    const statsContainer = document.getElementById('admin-stats');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="stat-card"><div class="stat-icon blue">🛒</div><div class="stat-info"><h4>Заказов</h4><p>${totalOrders}</p></div></div>
        <div class="stat-card"><div class="stat-icon green">💰</div><div class="stat-info"><h4>Выручка</h4><p>${dataOrders.reduce((s, o) => s + (o.total||0), 0).toFixed(2)} ₽</p></div></div>
        <div class="stat-card"><div class="stat-icon orange">📅</div><div class="stat-info"><h4>Записей</h4><p>${totalAppts}</p></div></div>
        <div class="stat-card"><div class="stat-icon red">👥</div><div class="stat-info"><h4>Сегодня</h4><p>${dataAppts.filter(a => a.appointmentDate === new Date().toISOString().split('T')[0]).length}</p></div></div>
      `;
    }
  }

  function renderFiltersButtons() {
    const fContainer = document.getElementById('data-filters');
    if (!fContainer) return;
    fContainer.innerHTML = '';

    const labels = currentTab === 'orders' ? statusLabels : apptStatusLabels;
    TAB_CONFIG[currentTab].filters.forEach(f => {
      const b = document.createElement('button');
      b.className = `filter-btn ${f === currentFilter ? 'active' : ''}`;
      b.dataset.filter = f;
      b.textContent = labels[f] || f.toUpperCase();
      fContainer.appendChild(b);
    });
  }

async function renderAll() {
    try {
        // Пытаемся получить заказы с сервера
        const response = await fetch('http://localhost:3000/orders');
        if (response.ok) {
            dataOrders = await response.json();
            console.log('СТРУКТУРА ОДНОГО ЗАКАЗА:', dataOrders[0]);
            localStorage.setItem('orders', JSON.stringify(dataOrders));
        }
    } catch (err) {
        console.warn("Сервер недоступен, берем данные из памяти:", err);
        dataOrders = JSON.parse(localStorage.getItem('orders')) || [];
    }

    // Остальные данные (которые не хранятся на сервере)
    dataAppts = JSON.parse(localStorage.getItem('appointments')) || [];
    dataHomeRequests = JSON.parse(localStorage.getItem('home_requests')) || [];
    dataJobApps = JSON.parse(localStorage.getItem('job_applications')) || [];
    dataProducts = JSON.parse(localStorage.getItem('shop_products')) || [];

    renderFiltersButtons();
    renderTable();
}

  // === ОТКРЫТИЕ ПАНЕЛИ ===
 function openPanel(id) {
    const cfg = TAB_CONFIG[currentTab];
    // Если мы в заказах — ищем по orderNumber, во всех остальных — по обычному id
    selectedItem = cfg.getData().find(i => {
        const itemId = (currentTab === 'orders') ? (i.orderNumber || i.id) : i.id;
        return String(itemId) === String(id);
    });
    
    if (selectedItem) {
        cfg.renderPanel(selectedItem);
        document.getElementById('details-panel').classList.add('open');
        document.getElementById('details-overlay').classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

  function closePanel() {
    document.getElementById('details-panel').classList.remove('open');
    document.getElementById('details-overlay').classList.remove('open');
    document.body.style.overflow = '';
    selectedItem = null;
  }

  // === ОБРАБОТЧИКИ СОБЫТИЙ ===
  document.querySelector('.admin-tabs')?.addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    currentFilter = 'all';
    currentSearch = '';
    const searchInput = document.getElementById('data-search');
    if (searchInput) searchInput.value = '';
    closePanel();
    renderAll();
  });

  document.getElementById('data-filters')?.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTable();
  });

  document.getElementById('data-search')?.addEventListener('input', e => {
    currentSearch = e.target.value.toLowerCase().trim();
    renderTable();
  });

 document.getElementById('data-table')?.addEventListener('click', e => {
    // Ищем кнопку .view-btn внутри строки
    const btn = e.target.closest('.view-btn');
    if (btn) {
        const row = e.target.closest('.order-row');
        if (row) {
            console.log('Нажали на заказ с ID:', row.dataset.id); // Проверка в консоли
            openPanel(row.dataset.id);
        }
    }
});

  document.getElementById('panel-close').addEventListener('click', closePanel);
  document.getElementById('details-overlay').addEventListener('click', closePanel);

  document.getElementById('panel-footer').addEventListener('click', e => {
    if (!selectedItem) return;

    if (e.target.id === 'btn-save') {
      const selectStatus = document.getElementById('panel-status');
      TAB_CONFIG[currentTab].save(selectStatus.value);
      renderAll();
      closePanel();
    }

    if (e.target.id === 'btn-delete') {
      if (confirm('Вы действительно хотите удалить эту запись?')) {
        TAB_CONFIG[currentTab].delete();
        if (currentTab === 'orders') dataOrders = JSON.parse(localStorage.getItem('orders')) || [];
        if (currentTab === 'appointments') dataAppts = JSON.parse(localStorage.getItem('appointments')) || [];
        if (currentTab === 'home_requests') dataHomeRequests = JSON.parse(localStorage.getItem('home_requests')) || [];
        if (currentTab === 'job_applications') dataJobApps = JSON.parse(localStorage.getItem('job_applications')) || [];
        if (currentTab === 'catalog') dataProducts = JSON.parse(localStorage.getItem('shop_products')) || [];
        renderAll();
        closePanel();
      }
    }
  });

  document.getElementById('add-product-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const newProduct = {
      id: 'PROD-' + Date.now().toString().slice(-4),
      name: document.getElementById('prod-title-ru').value.trim(), // <--- изменил на name
      brand: 'OK Salon', // Добавьте бренд, если нужно
      volume: '200 мл',  // Или добавьте поле для объема в форму
      price: parseFloat(document.getElementById('prod-price').value),
      image: document.getElementById('prod-img').value.trim(),
      category: document.getElementById('prod-category').value,
      inStock: true
    };
    dataProducts.push(newProduct);
    localStorage.setItem('shop_products', JSON.stringify(dataProducts));
    this.reset();
    renderAll(); // Теперь сработает корректно
    alert('✓ Товар успешно добавлен!');
  });

  // Первоначальный старт
  renderAll();
});