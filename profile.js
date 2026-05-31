// js/profile.js
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

    // === ЭЛЕМЕНТЫ ===
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

    // === РЕНДЕР ПРОФИЛЯ ===
    function renderProfile(user) {
        if (els.sidebarFio) els.sidebarFio.textContent = user.fio || 'Пользователь';
        if (els.sidebarEmail) els.sidebarEmail.textContent = user.email || '';
        if (els.sidebarPhone) els.sidebarPhone.textContent = user.phone || '';
        if (els.avatar) els.avatar.textContent = (user.fio?.charAt(0) || '👤').toUpperCase();
        if (els.viewFio) els.viewFio.textContent = user.fio || '—';
        if (els.viewPhone) els.viewPhone.textContent = user.phone || '—';
        if (els.viewEmail) els.viewEmail.textContent = user.email || '—';
        if (els.viewDob) els.viewDob.textContent = user.dob || '—';
        if (els.viewNickname) els.viewNickname.textContent = user.nickname || '—';
        if (els.viewCreated) els.viewCreated.textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : '—';
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
            if (btn.dataset.tab === 'orders') loadRealOrders();
            if (btn.dataset.tab === 'appointments') loadUserAppointments();
        });
    });

    // === МОДАЛКА РЕДАКТИРОВАНИЯ ===
    function openEditModal() {
        if (els.editFio) els.editFio.value = currentUser.fio || '';
        if (els.editPhone) els.editPhone.value = currentUser.phone || '';
        if (els.editEmail) els.editEmail.value = currentUser.email || '';
        if (els.editModal) els.editModal.style.display = 'flex';
    }
    function closeEditModal() { if (els.editModal) els.editModal.style.display = 'none'; }

    els.editBtn?.addEventListener('click', openEditModal);
    els.closeEdit?.addEventListener('click', closeEditModal);
    els.cancelEdit?.addEventListener('click', closeEditModal);
    els.editModal?.addEventListener('click', (e) => { if (e.target === els.editModal) closeEditModal(); });

    // === СОХРАНЕНИЕ ПРОФИЛЯ ===
    els.editForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedUser = {
            fio: els.editFio?.value.trim(),
            phone: els.editPhone?.value.trim(),
            email: els.editEmail?.value.trim()
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
                if (typeof window.showToast === 'function') window.showToast('success', 'Профиль обновлён', 'Система');
            } else {
                alert('Ошибка сохранения. Попробуйте позже.');
            }
        } catch (err) {
            console.error('Ошибка:', err);
            const updatedSession = { ...currentUser, ...updatedUser };
            localStorage.setItem('currentUser', JSON.stringify(updatedSession));
            renderProfile(updatedSession);
            closeEditModal();
            if (typeof window.showToast === 'function') window.showToast('success', 'Профиль обновлён', 'Система');
        }
    });

    // === СМЕНА ПАРОЛЯ ===
    els.passwordForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (els.newPass?.value !== els.confirmPass?.value) { alert('Пароли не совпадают!'); return; }
        if ((els.newPass?.value || '').length < 8) { alert('Пароль должен быть не менее 8 символов.'); return; }
        alert('Пароль успешно изменён! (Демо-режим)');
        if (els.passwordForm) els.passwordForm.reset();
    });

async function loadRealOrders() {
    if (!els.ordersList) return;
    
    // Получаем актуального пользователя
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;

    try {
        // ЗАГРУЖАЕМ ВСЕ ЗАКАЗЫ БЕЗ ФИЛЬТРАЦИИ НА СЕРВЕРЕ
        // Это обходит проблему, если json-server не может найти ID
        const res = await fetch(`http://localhost:3000/orders`);
        const allOrders = await res.json();
        
        // ФИЛЬТРУЕМ В БРАУЗЕРЕ (это надежнее)
        const userOrders = allOrders.filter(order => order.userId === user.id);
        
        console.log('Всего заказов в базе:', allOrders.length);
        console.log('Заказов найдено для пользователя:', userOrders.length);
        
        if (userOrders.length === 0) {
            els.ordersList.innerHTML = '<p class="empty-state">У вас пока нет заказов.</p>';
            return;
        }

        els.ordersList.innerHTML = userOrders.map(order => {
            const statusText = { 
                pending: '⏳ В обработке', 
                confirmed: '✅ Подтверждён', 
                completed: '🎉 Выполнен', 
                cancelled: '❌ Отменён' 
            }[order.status] || '⏳ Ожидает';
            
            const statusClass = { 
                pending: 'status-pending', 
                confirmed: 'status-completed', 
                completed: 'status-completed', 
                cancelled: 'status-cancelled' 
            }[order.status] || 'status-pending';
            
            const itemsPreview = order.items?.slice(0, 2).map(i => `${i.name} × ${i.quantity}`).join(', ') || '';
            const moreText = order.items?.length > 2 ? ` +${order.items.length - 2} ещё` : '';
            const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('ru-RU') : '—';
            
            return `
                <div class="order-card">
                    <div class="order-info">
                        <h4>${order.id ? `#${order.id.slice(-6)}` : '—'}</h4>
                        <p>📅 ${date} • 📦 ${itemsPreview}${moreText}</p>
                        ${order.customerAddress ? `<p style="font-size:12px; color:var(--text-muted); margin-top:4px;">📍 ${order.customerAddress}</p>` : ''}
                    </div>
                    <div style="text-align:right;">
                        <div class="order-status ${statusClass}">${statusText}</div>
                        <strong style="display:block; margin-top:6px; color:var(--primary);">${order.total?.toFixed(2).replace('.', ',') || '0.00'} руб.</strong>
                    </div>
                </div>
            `;
        }).join('');
   } catch (err) {
        console.error('Ошибка:', err);
    }
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

    // === УДАЛЕНИЕ ЗАПИСИ ===
    window.cancelAppointment = function(apptId) {
        if (!confirm('Удалить эту запись?\nЭто действие нельзя отменить.')) return;
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const userId = user?.id || 'guest';
        const userKey = `user_appts_${userId}`;
        let userAppts = JSON.parse(localStorage.getItem(userKey)) || [];
        userAppts = userAppts.filter(a => a.id !== apptId);
        localStorage.setItem(userKey, JSON.stringify(userAppts));
        let allAppts = JSON.parse(localStorage.getItem('appointments')) || [];
        allAppts = allAppts.filter(a => a.id !== apptId);
        localStorage.setItem('appointments', JSON.stringify(allAppts));
        loadUserAppointments();
        if (typeof window.showToast === 'function') window.showToast('success', 'Запись удалена', 'Процедура убрана из списка');
    };

    // === ВЫХОД ===
    els.logoutBtn?.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    });
console.log('Попытка загрузки заказов...')
    // === ПЕРВОНАЧАЛЬНАЯ ЗАГРУЗКА ===
    loadRealOrders();
    if (document.getElementById('appointments-list')) loadUserAppointments();
});