document.addEventListener("DOMContentLoaded", () => {
    const kikiBtn = document.getElementById('kikimora-btn');
    const modal = document.getElementById('giveaway-modal');
    const closeBtn = document.getElementById('close-giveaway');
    const okBtn = document.getElementById('giveaway-ok');
    const numberDisplay = document.getElementById('giveaway-number');
    const titleDisplay = document.getElementById('giveaway-title');
    const textDisplay = document.getElementById('giveaway-text');

    // Локализация текстов окна
    const messages = {
        successTitle: { ru: "Вы участвуете!", en: "You're in!" },
        successText: { ru: "Ваш счастливый номер участника розыгрыша набора KIKIMORA:", en: "Your lucky ticket number for the KIKIMORA set giveaway:" },
        alreadyTitle: { ru: "Вы уже в игре!", en: "Already registered!" },
        alreadyText: { ru: "Вы уже зарегистрированы в розыгрыше. Ваш номер билета прежний:", en: "You have already joined this giveaway. Your ticket number is:" }
    };

    function getLang() {
        return document.documentElement.lang === 'en' ? 'en' : 'ru';
    }

    if (kikiBtn) {
        kikiBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // 1. Проверяем авторизацию пользователя
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const lang = getLang();

            if (!user) {
                alert(lang === 'en' ? '⚠️ Please log in to join the giveaway.' : '⚠️ Для участия в розыгрыше необходимо авторизоваться.');
                window.location.href = 'index.html';
                return;
            }

            // 🛑 НОВАЯ ПРОВЕРКА: Если роль пользователя "admin" — блокируем участие
            if (user.role === 'admin') {
                alert(lang === 'en' 
                    ? '🚫 Access denied. Administrators cannot participate in giveaways.' 
                    : '🚫 Доступ запрещен. Администраторы не могут участвовать в розыгрышах.'
                );
                return; // Прерываем выполнение функции, модалка не откроется
            }

            const storageKey = `kikimora_ticket_${user.id}`; // Уникальный ключ для текущего юзера
            let ticketNumber = localStorage.getItem(storageKey);

            if (!ticketNumber) {
                // 2. Если номера нет — генерируем случайный от 1000 до 9999
                ticketNumber = '№ ' + Math.floor(1000 + Math.random() * 9000);
                localStorage.setItem(storageKey, ticketNumber);

                // Настраиваем текст для нового участия
                titleDisplay.textContent = messages.successTitle[lang];
                textDisplay.textContent = messages.successText[lang];
            } else {
                // 3. Если номер уже есть — показываем старый и меняем заголовки
                titleDisplay.textContent = messages.alreadyTitle[lang];
                textDisplay.textContent = messages.alreadyText[lang];
            }

            // Выводим номер в окно и открываем модалку
            numberDisplay.textContent = ticketNumber;
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    // Закрытие модального окна
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    closeBtn?.addEventListener('click', closeModal);
    okBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
});