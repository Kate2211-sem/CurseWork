/**
 * 📋 Booking Module v2.3 (Интеграция системы скидок 20%)
 */
(function() {
  'use strict';

  // === ДАННЫЕ ===
  const CATEGORIES = {
    manicure: '💅 Маникюр',
    men: '✂️ Мужские услуги',
    women: '💇‍♀️ Женские услуги',
    brows: '🪞 Брови'
  };

  const SERVICES = {
    'manicure-classic': { cat: 'manicure', name: 'Классический маникюр', duration: 45, price: 20 },
    'manicure-notgel':  { cat: 'manicure', name: 'Маникюр без покрытия', duration: 25, price: 15 },
    'manicure-design':  { cat: 'manicure', name: 'Маникюр с покрытием', duration: 100, price: 40 },
    'manicure-nara':    { cat: 'manicure', name: 'Наращивание', duration: 160, price: 60 },
    'men-cut':          { cat: 'men', name: 'Стрижка модельная', duration: 30, price: 15 },
    'men-beard':        { cat: 'men', name: 'Оформление бороды', duration: 20, price: 15 },
    'men-complex':      { cat: 'men', name: 'Стрижка машинкой', duration: 45, price: 5 },
    'men-comyn':        { cat: 'men', name: 'Камуфлирование седины', duration: 45, price: 25 },
    'women-cut':        { cat: 'women', name: 'Стрижка модельная', duration: 45, price: 65 },
    'women-styling':    { cat: 'women', name: 'Стрижка кончиков', duration: 40, price: 45 },
    'women-color':      { cat: 'women', name: 'Окрашивание однотонное', duration: 90, price: 120 },
    'women-colortwo':   { cat: 'women', name: 'Окрашивание сложное', duration: 90, price: 200 },
    'brows-correct':    { cat: 'brows', name: 'Коррекция', duration: 30, price: 15 },
    'brows-correction': { cat: 'brows', name: 'Коррекция+окрашивание', duration: 30, price: 30 },
    'brows-tint':       { cat: 'brows', name: 'Коррекция+окрашивание+ду', duration: 20, price: 50 },
    'brows-lam':        { cat: 'brows', name: 'Перманент бровей', duration: 45, price: 255 }
  };

  const MASTERS = {
    anna: { name: 'Анна (топ-мастер)' },
    elena: { name: 'Елена (стилист)' },
    maria: { name: 'Мария (бровист)' },
    any: { name: 'Любой свободный' }
  };

  // === HTML МОДАЛКИ ===
  const MODAL_HTML = `
    <div id="booking-modal" class="modal-overlay" style="display:none;">
      <div class="modal-content" style="max-width:560px; padding:24px; position:relative; background:var(--bg-card); border-radius:20px;">
        <button class="modal-close" id="close-booking" style="position:absolute; top:16px; right:16px; background:none; border:none; font-size:22px; cursor:pointer;">&times;</button>
        <h3 style="font-family:'Gilroy',sans-serif; font-size:22px; margin:0 0 20px;">✍️ Запись на процедуру</h3>
        <form id="booking-form" style="display:flex; flex-direction:column; gap:16px;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div>
              <label style="display:block; margin-bottom:6px; font-weight:600; font-size:14px;">📂 Направление *</label>
              <select id="book-category" required style="width:100%; padding:12px; border:1px solid var(--border); border-radius:8px; background:var(--input-bg); color:var(--text-main);">
                <option value="">Выберите направление</option>
                ${Object.entries(CATEGORIES).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display:block; margin-bottom:6px; font-weight:600; font-size:14px;">✂️ Услуга *</label>
              <select id="book-service" required disabled style="width:100%; padding:12px; border:1px solid var(--border); border-radius:8px; background:var(--input-bg); color:var(--text-muted);">
                <option value="">Сначала выберите направление</option>
              </select>
            </div>
          </div>
          <div>
            <label style="display:block; margin-bottom:6px; font-weight:600; font-size:14px;">👤 Мастер *</label>
            <select id="book-master" required style="width:100%; padding:12px; border:1px solid var(--border); border-radius:8px; background:var(--input-bg); color:var(--text-main);">
              <option value="">Выберите мастера</option>
              ${Object.entries(MASTERS).map(([k,v]) => `<option value="${k}">${v.name}</option>`).join('')}
            </select>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div>
              <label style="display:block; margin-bottom:6px; font-weight:600; font-size:14px;">📅 Дата *</label>
              <input type="date" id="book-date" required style="width:100%; padding:12px; border:1px solid var(--border); border-radius:8px; background:var(--input-bg); color:var(--text-main);">
            </div>
            <div>
              <label style="display:block; margin-bottom:6px; font-weight:600; font-size:14px;">🕐 Время *</label>
              <select id="book-time" required disabled style="width:100%; padding:12px; border:1px solid var(--border); border-radius:8px; background:var(--input-bg); color:var(--text-main);">
                <option value="">Сначала выберите дату</option>
              </select>
            </div>
          </div>
          <textarea id="book-comment" placeholder="Комментарий" rows="2" style="padding:12px; border:1px solid var(--border); border-radius:8px; background:var(--input-bg); color:var(--text-main); resize:vertical;"></textarea>
          
          <div style="background:var(--bg-card); padding:12px; border-radius:8px; font-weight:700; font-size:16px; display:flex; flex-direction:column; gap:4px; border:1px solid var(--border);">
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
              <span>Итого:</span>
              <span><span id="book-price">0</span> руб. • <span id="book-duration">0</span> мин</span>
            </div>
            <div id="promo-notice" style="font-size:12px; color:#22c55e; display:none; text-align:right; font-weight:600;"></div>
          </div>
          <button type="submit" class="cart-checkout" style="width:100%;">✅ Подтвердить запись</button>
        </form>
      </div>
    </div>
    <div id="booking-success" style="display:none; position:fixed; inset:0; background:var(--bg-page); z-index:2000; padding:20px; overflow-y:auto;">
      <div style="max-width:500px; margin:60px auto; text-align:center;">
        <div style="font-size:64px; margin-bottom:16px;">✅</div>
        <h2 style="font-family:'Gilroy',sans-serif; margin:0 0 12px;">Вы успешно записаны!</h2>
        <p style="color:var(--text-muted); margin-bottom:24px;">Запись сохранена в личном кабинете</p>
        <div id="booking-details" style="background:var(--bg-card); border-radius:16px; padding:20px; text-align:left; margin-bottom:24px;"></div>
        <button onclick="BookingModule.closeSuccess()" class="btn-online" style="width:auto; padding:14px 32px;">✅ Готово</button>
      </div>
    </div>`;

  // === ВСПОМОГАТЕЛЬНЫЕ ===
  function getTimeSlots(dateStr, duration, masterId) {
    const slots = [], startHour = 9, endHour = 21;
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const busy = appointments.filter(a => a.appointmentDate === dateStr && (masterId === 'any' || a.masterId === masterId)).map(a => a.appointmentTime);
    for (let h = startHour; h < endHour; h++) {
      for (let m of [0, 30]) {
        const time = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
        if (!busy.includes(time) && h + (m + duration)/60 <= endHour) slots.push(time);
      }
    }
    return slots;
  }

  function saveAppointment(data) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return alert('Ошибка авторизации');

    // Рассчитываем итоговую стоимость с учётом возможной скидки
    let finalPrice = SERVICES[data.serviceId].price;
    const activePromo = localStorage.getItem('active_salon_promo');
    let appliedPromoName = '';
    
    if (activePromo) {
      finalPrice = Math.round(finalPrice * 0.8); // Применяем скидку 20%
      appliedPromoName = activePromo === 'pensioner' ? 'Акция "Пенсионерам" (-20%)' : 'Акция "Новый клиент" (-20%)';
      
      // Сбрасываем промокод после успешного использования, чтобы он не висел вечно
      localStorage.removeItem('active_salon_promo');
    }
    
    const appointment = {
      id: 'AP-' + Date.now().toString().slice(-6),
      userId: user.id,
      createdAt: new Date().toISOString(),
      masterId: data.masterId, masterName: MASTERS[data.masterId]?.name || 'Любой',
      categoryId: data.categoryId, categoryName: CATEGORIES[data.categoryId],
      serviceId: data.serviceId, serviceName: SERVICES[data.serviceId].name,
      duration: SERVICES[data.serviceId].duration, 
      price: finalPrice, // Сюда уходит цена со скидкой
      promoApplied: appliedPromoName, // Пометка для истории заказов
      appointmentDate: data.date, appointmentTime: data.time,
      customer: { name: user.fio, phone: user.phone, comment: data.comment },
      status: 'confirmed'
    };

    // Защита от дублей
    let all = JSON.parse(localStorage.getItem('appointments')) || [];
    all = all.filter(a => !(a.appointmentDate === data.date && a.appointmentTime === data.time && a.userId === user.id));
    all.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(all));

    const key = `user_appts_${user.id}`;
    let userAppts = JSON.parse(localStorage.getItem(key)) || [];
    userAppts = userAppts.filter(a => a.id !== appointment.id);
    userAppts.push(appointment);
    localStorage.setItem(key, JSON.stringify(userAppts));

    return appointment;
  }

  // === МОДУЛЬ ===
  window.BookingModule = {
    _initialized: false,
    init() {
      if (this._initialized) return;
      this._initialized = true;
      if (!document.getElementById('booking-modal')) {
        document.body.insertAdjacentHTML('beforeend', MODAL_HTML);
      }
      this.bindEvents();
    },

    open() {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (!user) {
        alert('⚠️ Для записи необходимо авторизоваться.');
        window.location.href = 'index.html';
        return;
      }
      if (user.role === 'admin') {
        this._showAdminBookingModal();
        return;
      }
      
      const modal = document.getElementById('booking-modal');
      if (!modal) this.init();
      
      document.getElementById('book-date').min = new Date().toISOString().split('T')[0];
      document.getElementById('book-date').value = '';
      document.getElementById('book-category').value = '';
      document.getElementById('book-service').innerHTML = '<option value="">Сначала выберите направление</option>';
      document.getElementById('book-service').disabled = true;
      document.getElementById('book-time').innerHTML = '<option value="">Сначала выберите дату</option>';
      document.getElementById('book-time').disabled = true;
      document.getElementById('book-price').textContent = '0';
      document.getElementById('book-duration').textContent = '0';
      document.getElementById('book-comment').value = '';
      
      // Скрываем строчку уведомления о скидке при чистом открытии
      const promoNotice = document.getElementById('promo-notice');
      if (promoNotice) promoNotice.style.display = 'none';

      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // Если открыли форму, и у нас выбрана услуга, обновляем прайс
      this.updateTotal();
    },

    _showAdminBookingModal() {
      if (!document.getElementById('admin-booking-modal')) {
        const html = `
          <div id="admin-booking-modal" class="modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:3000; align-items:center; justify-content:center;">
            <div class="modal-content" style="max-width:420px; padding:24px; text-align:center; position:relative; background:var(--bg-card); border-radius:20px; box-shadow:var(--shadow-md);">
              <button class="modal-close" id="close-admin-booking-modal" style="position:absolute; top:16px; right:16px; background:none; border:none; font-size:22px; cursor:pointer; color:var(--text-muted);">&times;</button>
              <div style="font-size:56px; margin-bottom:12px;">🚫</div>
              <h3 style="font-family:'Gilroy',sans-serif; margin:0 0 12px; color:var(--error);">Доступ запрещён</h3>
              <p style="color:var(--text-muted); margin:0 0 24px; line-height:1.5;">
                Вы вошли как <strong>администратор</strong>.<br>
                Администраторы не могут записываться на услуги через клиентскую форму.
              </p>
              <button onclick="BookingModule._closeAdminBookingModal()" class="btn-secondary" style="width:100%; padding:14px; cursor:pointer;">Понятно</button>
            </div>
          </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
      }
      const modal = document.getElementById('admin-booking-modal');
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      document.getElementById('close-admin-booking-modal').onclick = () => this._closeAdminBookingModal();
      modal.onclick = (e) => { if (e.target === modal) this._closeAdminBookingModal(); };
    },

    _closeAdminBookingModal() {
      document.getElementById('admin-booking-modal').style.display = 'none';
      document.body.style.overflow = '';
    },

    close() { document.getElementById('booking-modal').style.display = 'none'; document.body.style.overflow = ''; },
    closeSuccess() { document.getElementById('booking-success').style.display = 'none'; document.body.style.overflow = ''; },

    updateCategoryServices() {
      const cat = document.getElementById('book-category').value;
      const serviceSelect = document.getElementById('book-service');
      serviceSelect.innerHTML = '<option value="">Выберите услугу</option>';
      serviceSelect.disabled = !cat;
      if (cat) {
        Object.entries(SERVICES).forEach(([id, s]) => {
          if (s.cat === cat) serviceSelect.innerHTML += `<option value="${id}">${s.name} — ${s.duration} мин, ${s.price} руб.</option>`;
        });
        this.updateTotal();
      }
    },

    updateTimeSlots() {
      const date = document.getElementById('book-date').value;
      const serviceId = document.getElementById('book-service').value;
      const masterId = document.getElementById('book-master').value;
      const timeSelect = document.getElementById('book-time');
      
      if (!date || !serviceId || !masterId) {
        timeSelect.innerHTML = '<option value="">Заполните все поля</option>';
        timeSelect.disabled = true;
        return;
      }
      
      const slots = getTimeSlots(date, SERVICES[serviceId].duration, masterId);
      if (slots.length === 0) {
        timeSelect.innerHTML = '<option value="">Нет свободных слотов 😔</option>';
        timeSelect.disabled = true;
      } else {
        timeSelect.innerHTML = '<option value="">Выберите время</option>' + slots.map(t => `<option value="${t}">${t}</option>`).join('');
        timeSelect.disabled = false;
      }
    },

    updateTotal() {
      const id = document.getElementById('book-service').value;
      const priceElem = document.getElementById('book-price');
      const durationElem = document.getElementById('book-duration');
      const promoNotice = document.getElementById('promo-notice');
      const isEn = document.documentElement.lang === 'en';

      if (id && SERVICES[id]) {
        let basePrice = SERVICES[id].price;
        durationElem.textContent = SERVICES[id].duration;

        // Проверяем наличие активной промо-акции
        const activePromo = localStorage.getItem('active_salon_promo');
        if (activePromo) {
          const discountPrice = Math.round(basePrice * 0.8); // Скидка 20%
          priceElem.textContent = discountPrice;
          
          if (promoNotice) {
            promoNotice.textContent = activePromo === 'pensioner' 
              ? (isEn ? '✓ Senior discount applied (-20%)' : '✓ Применена скидка пенсионерам (-20%)')
              : (isEn ? '✓ New client discount applied (-20%)' : '✓ Применена скидка нового клиента (-20%)');
            promoNotice.style.display = 'block';
          }
        } else {
          priceElem.textContent = basePrice;
          if (promoNotice) promoNotice.style.display = 'none';
        }
      }
    },

    bindEvents() {
      document.getElementById('close-booking')?.addEventListener('click', () => this.close());
      document.getElementById('booking-modal')?.addEventListener('click', (e) => { if (e.target.id === 'booking-modal') this.close(); });
      document.getElementById('book-category')?.addEventListener('change', () => this.updateCategoryServices());
      ['book-date', 'book-master', 'book-service'].forEach(id => document.getElementById(id)?.addEventListener('change', () => this.updateTimeSlots()));
      document.getElementById('book-service')?.addEventListener('change', () => this.updateTotal());
      
      document.getElementById('booking-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
          categoryId: document.getElementById('book-category').value,
          serviceId: document.getElementById('book-service').value,
          masterId: document.getElementById('book-master').value,
          date: document.getElementById('book-date').value,
          time: document.getElementById('book-time').value,
          comment: document.getElementById('book-comment').value.trim()
        };
        if (!data.categoryId || !data.serviceId || !data.masterId || !data.date || !data.time) return alert('Заполните все поля');
        
        const appt = saveAppointment(data);
        document.getElementById('booking-details').innerHTML = `
          <div style="margin-bottom:8px;"><strong>📅 Дата:</strong> ${appt.appointmentDate} в ${appt.appointmentTime}</div>
          <div style="margin-bottom:8px;"><strong>✂️ Услуга:</strong> ${appt.categoryName} → ${appt.serviceName}</div>
          <div style="margin-bottom:8px;"><strong>👤 Мастер:</strong> ${appt.masterName}</div>
          <div style="margin-bottom:8px;"><strong>💰 Стоимость:</strong> ${appt.price} руб. ${appt.promoApplied ? `<span style="color:#22c55e; font-size:13px; font-weight:600;"><br>(${appt.promoApplied})</span>` : ''}</div>
        `;
        this.close();
        document.getElementById('booking-success').style.display = 'block';
        document.body.style.overflow = 'hidden';
      });
      
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (document.getElementById('booking-modal')?.style.display === 'flex') this.close();
          if (document.getElementById('booking-success')?.style.display === 'block') this.closeSuccess();
        }
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-book]') && !window.BookingModule._initialized) {
      window.BookingModule.init();
    }
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-book]');
    if (btn) {
      console.log('🔘 Клик по кнопке записи!');
      if (typeof BookingModule !== 'undefined') {
        console.log('🚀 Вызываем BookingModule.open()');
        BookingModule.open();
      } else {
        console.error('❌ BookingModule не определён!');
      }
    }
  });
})();