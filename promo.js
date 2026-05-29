document.addEventListener("DOMContentLoaded", () => {
    // Тексты уведомлений для каждого типа промокода
    const promoMessages = {
        'pensioner': {
            ru: 'Скидка 20% по акции "Пенсионерам" успешно применена к вашей записи!',
            en: '20% discount for seniors has been successfully applied to your appointment!'
        },
        'new-client': {
            ru: 'Скидка 20% для нового клиента успешно применена к вашей записи!',
            en: '20% discount for new clients has been successfully applied to your appointment!'
        }
    };

    // Узнаем текущий язык страницы
    function getActiveLang() {
        return document.documentElement.lang === 'en' ? 'en' : 'ru';
    }

    // Отслеживаем клики по кнопкам с атрибутом data-promo
    document.body.addEventListener('click', (e) => {
        const promoBtn = e.target.closest('[data-promo]');
        
        if (promoBtn) {
            e.preventDefault();
            
            const promoType = promoBtn.getAttribute('data-promo');
            const lang = getActiveLang();
            
            // 1. Запоминаем промокод в браузере
            localStorage.setItem('active_salon_promo', promoType);
            
            // 2. Показываем красивый Toast из твоего notifications.js
            if (typeof showNotification === 'function') {
                showNotification(promoMessages[promoType][lang], 'success');
            } else {
                alert(promoMessages[promoType][lang]); // Если нотификации не загрузились
            }
            
            // 3. Имитируем клик по главной кнопке онлайн-записи
            const mainBookingBtn = document.getElementById('btn-book-appointment') || document.querySelector('[data-book]');
            if (mainBookingBtn) {
                setTimeout(() => {
                    mainBookingBtn.click();
                }, 700); // Небольшая задержка, чтобы успели увидеть всплывающее окошко
            }
        }
    });
});