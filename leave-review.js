document.addEventListener("DOMContentLoaded", () => {
    const reviewBtn = document.querySelector('.reviews-btn');
    const modal = document.getElementById('review-modal');
    const closeBtn = document.getElementById('close-review-modal');
    const form = document.getElementById('review-form');
    const stars = document.querySelectorAll('.rating-stars span');
    const ratingInput = document.getElementById('review-rating-value');

    function getLang() {
        return document.documentElement.lang === 'en' ? 'en' : 'ru';
    }

    // 1. Логика выбора звёзд рейтинга
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            ratingInput.value = value; // Записываем значение в скрытый инпут

            // Перекрашиваем звёзды до выбранной включительно
            stars.forEach(s => {
                if (s.getAttribute('data-value') <= value) {
                    s.style.color = '#ffb300'; // Золотой цвет для активных
                } else {
                    s.style.color = 'var(--text-muted)'; // Серый для остальных
                }
            });
        });
    });

   reviewBtn?.addEventListener('click', (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const lang = getLang();

    if (!user) {
        alert(lang === 'en' ? '⚠️ Please log in to leave a review.' : '⚠️ Чтобы оставить отзыв, необходимо авторизоваться.');
        window.location.href = 'index.html';
        return;
    }

    // 🛑 БЛОКИРОВКА АДМИНА
    if (user.role === 'admin') {
        alert(lang === 'en' 
            ? '🚫 Access denied. Administrators cannot leave reviews.' 
            : '🚫 Доступ запрещен. Администраторы не могут оставлять отзывы.'
        );
        return;
    }

    // Открываем модалку, если всё ок
    form.reset();
    ratingInput.value = "";
    stars.forEach(s => s.style.color = 'var(--text-muted)');
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
});

    // 3. Отправка формы отзыва
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) return;

        const rating = ratingInput.value;
        if (!rating) {
            alert(getLang() === 'en' ? 'Please select a rating star!' : 'Пожалуйста, выберите оценку звёздами!');
            return;
        }

        const reviewData = {
            id: 'REV-' + Date.now().toString().slice(-5),
            userId: user.id,
            userName: user.fio, // Автоматически подставляем имя пользователя
            rating: parseInt(rating),
            text: document.getElementById('review-text-input').value.trim(),
            date: new Date().toLocaleDateString(getLang() === 'en' ? 'en-US' : 'ru-RU'),
            createdAt: new Date().toISOString()
        };

        // Сохраняем отзыв в массив local_reviews в localStorage
        const allReviews = JSON.parse(localStorage.getItem('local_reviews')) || [];
        allReviews.unshift(reviewData); // Добавляем новый отзыв в самое начало
        localStorage.setItem('local_reviews', JSON.stringify(allReviews));

        // Закрываем окно
        closeModal();

        // Показываем уведомление об успешной отправке
        const isEn = getLang() === 'en';
        const successMsg = isEn ? '✓ Your review has been added!' : '✓ Спасибо! Ваш отзыв успешно добавлен!';
        if (typeof showNotification === 'function') {
            showNotification(successMsg, 'success');
        } else {
            alert(successMsg);
        }

        // Если на странице есть функция рендеринга отзывов — вызываем её для мгновенного обновления без перезагрузки
        if (typeof renderReviews === 'function') {
            renderReviews();
        } else {
            window.location.reload(); // Либо просто обновляем страницу
        }
    });

    // Закрытие окон
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    closeBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
});