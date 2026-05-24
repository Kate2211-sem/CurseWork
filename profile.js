document.addEventListener('DOMContentLoaded', () => {
    // 🔐 ПРОВЕРКА АВТОРИЗАЦИИ
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    if (currentUser.role === 'admin') {
        window.location.href = 'admin/index.html';
        return;
    }

    // === ЭЛЕМЕНТЫ (без опечаток!) ===
    const els = {
        sidebarFio: document.getElementById('sidebar-fio'),
        sidebarEmail: document.getElementById('sidebar-email'),
        sidebarPhone: document.getElementById('sidebar-phone'),
        avatar: document.getElementById('user-avatar'),
        
        viewFio: document.getElementById('view-fio'),
        viewPhone: document.getElementById('view-phone'),
        viewEmail: document.getElementById('view-email'),
        viewDob: document.getElementById('view-dob'),
        viewNickname: document.getElementById('view-nickname'),
        viewCreated: document.getElementById('view-created'),
        
        editBtn: document.getElementById('btn-open-edit'),
        logoutBtn: document.getElementById('btn-logout'),
        editModal: document.getElementById('edit-modal'),
        closeEdit: document.getElementById('close-edit-modal'),
        cancelEdit: document.getElementById('cancel-edit'),
        editForm: document.getElementById('edit-form'),
        
        editFio: document.getElementById('edit-fio'),
        editPhone: document.getElementById('edit-phone'),
        editEmail: document.getElementById('edit-email'),
        
        passwordForm: document.getElementById('password-form'),
        newPass: document.getElementById('new-password'),
        confirmPass: document.getElementById('confirm-password'),
        
        ordersList: document.getElementById('orders-list')
    };

    // === РЕНДЕР ДАННЫХ ПРОФИЛЯ ===
    function renderProfile(user) {
        els.sidebarFio.textContent = user.fio || 'Пользователь';
        els.sidebarEmail.textContent = user.email || '';
        els.sidebarPhone.textContent = user.phone || '';
        els.avatar.textContent = (user.fio?.charAt(0) || '👤').toUpperCase();

        els.viewFio.textContent = user.fio || '—';
        els.viewPhone.textContent = user.phone || '—';
        els.viewEmail.textContent = user.email || '—';
        els.viewDob.textContent = user.dob || '—';
        els.viewNickname.textContent = user.nickname || '—';
        els.viewCreated.textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : '—';
    }
    renderProfile(currentUser);

    // === ТАБЫ ===
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const tabId = `tab-${btn.dataset.tab}`;
            const tab = document.getElementById(tabId);
            if (tab) tab.classList.add('active');
            
            // Перезагружаем данные при переключении на вкладку заказов/записей
            if (btn.dataset.tab === 'orders') loadRealOrders();
            if (btn.dataset.tab === 'appointments') loadUserAppointments();
        });
    });

    // === МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ===
    function openEditModal() {
        els.editFio.value = currentUser.fio || '';
        els.editPhone.value = currentUser.phone || '';
        els.editEmail.value = currentUser.email || '';
        els.editModal.style.display = 'flex';
    }
    function closeEditModal() { els.editModal.style.display = 'none'; }

    els.editBtn?.addEventListener('click', openEditModal);
    els.closeEdit?.addEventListener('click', closeEditModal);
    els.cancelEdit?.addEventListener('click', closeEditModal);
    els.editModal?.addEventListener('click', (e) => {
        if (e.target === els.editModal) closeEditModal();
    });

    // === СОХРАНЕНИЕ ПРОФИЛЯ ===
    els.editForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedUser = {
            fio: els.editFio.value.trim(),
            phone: els.editPhone.value.trim(),
            email: els.editEmail.value.trim()
        };
        try {
            const res = await fetch(`http://localhost:3000/users/${currentUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser)
            });
            if (res.ok) {
                const savedUser = await res.json();
                const updatedSession = { ...currentUser, ...savedUser };
                localStorage.setItem('currentUser', JSON.stringify(updatedSession));
                renderProfile(updatedSession);
                closeEditModal();
                if (typeof showToast === 'function') showToast('success', 'Профиль обновлён', 'Система');
            } else {
                alert('Ошибка сохранения. Попробуйте позже.');
            }
        } catch (err) {
            console.error('Ошибка:', err);
            // Fallback: обновляем только локально
            const updatedSession = { ...currentUser, ...updatedUser };
            localStorage.setItem('currentUser', JSON.stringify(updatedSession));
            renderProfile(updatedSession);
            closeEditModal();
            if (typeof showToast === 'function') showToast('success', 'Профиль обновлён', 'Система');
        }
    });

    // === СМЕНА ПАРОЛЯ ===
    els.passwordForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (els.newPass.value !== els.confirmPass.value) {
            alert('Пароли не совпадают!');
            return;
        }
        if (els.newPass.value.length < 8) {
            alert('Пароль должен быть не менее 8 символов.');
            return;
        }
        alert('Пароль успешно изменён! (Демо-режим)');
        els.passwordForm.reset();
    });

    // === 🔥 РЕАЛЬНЫЕ ЗАКАЗЫ ИЗ LOCALSTORAGE (вместо моков) ===
    function loadRealOrders() {
        if (!els.ordersList) return;
        
        const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
        // Фильтруем только заказы текущего пользователя
        const userOrders = allOrders.filter(o => o.customer?.phone === currentUser.phone || o.userId === currentUser.id);
        
        if (userOrders.length === 0) {
            els.ordersList.innerHTML = '<p class="empty-state">У вас пока нет заказов. <br><a href="shop.html" class="btn-online" style="margin-top:10px; display:inline-block;">Перейти в магазин</a></p>';
            return;
        }
        
        // Сортировка: новые сверху
        userOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        els.ordersList.innerHTML = userOrders.map(order => {
            const statusText = { pending: '⏳ В обработке', confirmed: '✅ Подтверждён', completed: '🎉 Выполнен', cancelled: '❌ Отменён' }[order.status] || '⏳ Ожидает';
            const statusClass = { pending: 'status-pending', confirmed: 'status-completed', completed: 'status-completed', cancelled: 'status-cancelled' }[order.status] || 'status-pending';
            
            const itemsPreview = order.items?.slice(0, 2).map(i => `${i.name} × ${i.quantity}`).join(', ') || '';
            const moreText = order.items?.length > 2 ? ` +${order.items.length - 2} ещё` : '';
            
            const date = order.date ? new Date(order.date).toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—';
            
            return `
                <div class="order-card">
                    <div class="order-info">
                        <h4>${order.orderNumber || `#${order.id?.slice(-6) || '—'}`}</h4>
                        <p>📅 ${date} • 📦 ${itemsPreview}${moreText}</p>
                        ${order.customer?.address ? `<p style="font-size:12px; color:var(--text-muted); margin-top:4px;">📍 ${order.customer.address}</p>` : ''}
                    </div>
                    <div style="text-align:right;">
                        <div class="order-status ${statusClass}">${statusText}</div>
                        <strong style="display:block; margin-top:6px; color:var(--primary);">${order.total?.toFixed(2).replace('.', ',') || '0.00'} руб.</strong>
                    </div>
                </div>
            `;
        }).join('');
    }

    // === ЗАПИСИ НА ПРОЦЕДУРЫ ===
function loadUserAppointments() {
    const container = document.getElementById('appointments-list');
    if (!container) return;
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const key = `user_appts_${user?.id || 'guest'}`;
    const appointments = JSON.parse(localStorage.getItem(key)) || [];
    
    if (appointments.length === 0) {
        container.innerHTML = '<p class="empty-state">У вас пока нет записей. <br><button class="btn-online" onclick="BookingModule?.open?.()" style="margin-top:10px; cursor:pointer;">✍️ Записаться</button></p>';
        return;
    }
    
    // Сортировка: ближайшие сверху
    appointments.sort((a, b) => new Date(a.appointmentDate + 'T' + a.appointmentTime) - new Date(b.appointmentDate + 'T' + b.appointmentTime));
    
    container.innerHTML = appointments.map(appt => {
        const isPast = new Date(`${appt.appointmentDate}T${appt.appointmentTime}`) < new Date();
        
        return `
            <div class="order-card" style="${isPast ? 'opacity:0.7' : ''}">
                <div class="order-info">
                    <h4>${appt.serviceName}</h4>
                    <p>📅 ${appt.appointmentDate} в ${appt.appointmentTime} • 👤 ${appt.masterName}</p>
                </div>
                <div style="text-align:right;">
                    <strong style="display:block; margin-top:6px;">${appt.price} руб.</strong>
                    ${!isPast ? `<button onclick="cancelAppointment('${appt.id}')" style="margin-top:8px; padding:6px 12px; background:#fee2e2; color:#dc2626; border:none; border-radius:6px; cursor:pointer; font-size:12px;">🗑️ Удалить</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

    // 🔹 Глобальная функция: ПОЛНОЕ УДАЛЕНИЕ записи
window.cancelAppointment = function(apptId) {
    if (!confirm('Удалить эту запись?\nЭто действие нельзя отменить.')) return;
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user?.id || 'guest';
    const userKey = `user_appts_${userId}`;
    
    // 1️⃣ Удаляем из ЛК пользователя
    let userAppts = JSON.parse(localStorage.getItem(userKey)) || [];
    userAppts = userAppts.filter(a => a.id !== apptId);
    localStorage.setItem(userKey, JSON.stringify(userAppts));
    
    // 2️⃣ Удаляем из общей базы записей
    let allAppts = JSON.parse(localStorage.getItem('appointments')) || [];
    allAppts = allAppts.filter(a => a.id !== apptId);
    localStorage.setItem('appointments', JSON.stringify(allAppts));
    
    // 3️⃣ Перерисовываем список
    loadUserAppointments();
    
    // 4️⃣ Показываем уведомление
    if (typeof showToast === 'function') {
        showToast('success', 'Запись удалена', 'Процедура убрана из списка');
    }
};

    // === ВЫХОД ===
    els.logoutBtn?.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    });

    // === ПЕРВОНАЧАЛЬНАЯ ЗАГРУЗКА ===
    loadRealOrders(); // Загружаем заказы сразу при открытии профиля
    if (document.getElementById('appointments-list')) {
        loadUserAppointments();
    }
});