/* ==========================================================================
   ОТДЕЛЬНЫЙ СКРИПТ ДЛЯ МУЛЬТИЯЗЫЧНОСТИ (RU / EN)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.querySelector('button[data-tool="lang"]');
    const onlineBtn = document.querySelector('.btn-online');
    
    // Функция определения, маленький ли экран
    const isMobile = () => window.innerWidth < 768; // или твой брейкпоинт
    
    // Функция переключения текстов на странице
    const changeLanguage = (targetLang) => {
        // 1. Обычные элементы с [data-ru][data-en]
        const elementsToTranslate = document.querySelectorAll('[data-ru][data-en]');
        elementsToTranslate.forEach(element => {
            if (targetLang === 'en') {
                element.textContent = element.dataset.en;
            } else {
                element.textContent = element.dataset.ru;
            }
        });

        // 2. Особая обработка кнопки "Онлайн запись" с учётом размера экрана
        if (onlineBtn) {
            const isSmallScreen = isMobile();
            if (targetLang === 'en') {
                onlineBtn.textContent = isSmallScreen ? onlineBtn.dataset.enShort : onlineBtn.dataset.enFull;
            } else {
                onlineBtn.textContent = isSmallScreen ? onlineBtn.dataset.ruShort : onlineBtn.dataset.ruFull;
            }
        }

        // Меняем текст на самой кнопке языка (RU или EN)
        if (langBtn) {
            langBtn.textContent = targetLang.toUpperCase();
        }
        
        // Устанавливаем атрибут lang для тега html
        document.documentElement.setAttribute('lang', targetLang);
    };

    // Обработчик клика по кнопке языка
    if (langBtn) {
        langBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let currentLang = localStorage.getItem('site-lang') || 'ru';
            let newLang = currentLang === 'ru' ? 'en' : 'ru';
            localStorage.setItem('site-lang', newLang);
            changeLanguage(newLang);
        });
    }

    // Обработчик изменения размера окна (для адаптивной кнопки)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const savedLang = localStorage.getItem('site-lang') || 'ru';
            changeLanguage(savedLang);
        }, 150); // debounce для производительности
    });

    // Автоматическая проверка языка при загрузке
    const savedLang = localStorage.getItem('site-lang') || 'ru';
    changeLanguage(savedLang);
});