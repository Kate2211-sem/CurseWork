document.addEventListener("DOMContentLoaded", () => {
    const btnHome = document.querySelector('.btn-home');
    const btnVacancy = document.querySelector('.btn-vacancy');
    
    function getLang() {
        return document.documentElement.lang === 'en' ? 'en' : 'ru';
    }

    function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const lang = document.documentElement.lang === 'en' ? 'en' : 'ru';

    if (!user) {
        alert(lang === 'en' ? '⚠️ Please log in first.' : '⚠️ Пожалуйста, сначала авторизуйтесь на сайте.');
        window.location.href = 'index.html';
        return null;
    }

    // 🛑 БЛОКИРОВКА АДМИНА
    if (user.role === 'admin') {
        alert(lang === 'en' 
            ? '🚫 Access denied. Administrators cannot submit applications or request home services.' 
            : '🚫 Доступ запрещен. Администраторы не могут отправлять анкеты или вызывать мастера.'
        );
        return null;
    }
    return user;
}

    // Открытие окон
    btnHome?.addEventListener('click', (e) => {
        e.preventDefault();
        if (checkAuth()) {
            document.getElementById('home-master-modal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            document.getElementById('home-date').min = new Date().toISOString().split('T')[0];
        }
    });

    btnVacancy?.addEventListener('click', (e) => {
        e.preventDefault();
        if (checkAuth()) {
            document.getElementById('vacancy-modal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    });

    // Обработка отправки формы вызова мастера
    document.getElementById('home-master-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = checkAuth();
        if (!user) return;

        const requestData = {
            id: 'HM-' + Date.now().toString().slice(-5),
            userId: user.id,
            userName: user.fio,
            userPhone: user.phone,
            service: document.getElementById('home-service').value.trim(),
            date: document.getElementById('home-date').value,
            time: document.getElementById('home-time').value,
            address: document.getElementById('home-address').value.trim(),
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        const list = JSON.parse(localStorage.getItem('home_requests')) || [];
        list.push(requestData);
        localStorage.setItem('home_requests', JSON.stringify(list));

        closePromoModal('home-master-modal');
        triggerNotification(
            'Заявка на выезд мастера успешно оформлена! Ожидайте звонка.',
            'Home service request submitted successfully! We will call you.'
        );
    });

    // Обработка отправки анкеты соискателя
    document.getElementById('vacancy-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = checkAuth();
        if (!user) return;

        const applicationData = {
            id: 'VAC-' + Date.now().toString().slice(-5),
            userId: user.id,
            userName: user.fio,
            userPhone: user.phone,
            position: document.getElementById('vacancy-role').value,
            experience: document.getElementById('vacancy-exp').value.trim(),
            portfolio: document.getElementById('vacancy-portfolio').value.trim() || 'Не указано',
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        const list = JSON.parse(localStorage.getItem('job_applications')) || [];
        list.push(applicationData);
        localStorage.setItem('job_applications', JSON.stringify(list));

        closePromoModal('vacancy-modal');
        triggerNotification(
            'Ваша анкета успешно отправлена! Скоро мы свяжемся с вами.',
            'Your application has been sent! We will contact you soon.'
        );
    });
});

// Глобальные функции закрытия и уведомления
function closePromoModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = '';
}

function triggerNotification(ruText, enText) {
    const isEn = document.documentElement.lang === 'en';
    const msg = isEn ? enText : ruText;
    
    if (typeof showNotification === 'function') {
        showNotification(msg, 'success');
    } else {
        alert(msg);
    }
}