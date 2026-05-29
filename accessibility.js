/* ==========================================================================
   УМНАЯ ЛОГИКА ДОСТУПНОСТИ И СКРЫТИЯ КАРТИНОК (ACCESSIBILITY.JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;

    // Элементы модального окна
    const accessToggleBtn = document.getElementById('access-toggle'); // Твоя кнопка 👁
    const accessModal = document.getElementById('accessibility-modal');
    const accessBackdrop = document.getElementById('accessibility-backdrop');
    const accessCloseX = document.getElementById('access-close-x');
    const applyBtn = document.getElementById('accessibility-apply-btn');
    const resetBtn = document.getElementById('accessibility-reset');
    const imagesToggle = document.getElementById('a11y-images-toggle');

    // Селекторы картинок твоего сайта (добавь сюда классы своих картинок, если нужно)
    const CONTENT_IMG_SELECTOR = [
        "img", 
        ".info-card__icon", 
        ".reviews-avatar", 
        "picture"
    ].join(",");

  // --- ФУНКЦИЯ СКРЫТИЯ КАРТИНОК БЕЗ ЛИШНЕГО ТЕКСТА И ЗАГЛУШЕК ---
    const hideContentImages = () => {
        document.querySelectorAll(CONTENT_IMG_SELECTOR).forEach((img) => {
            // Если картинка внутри самой модалки или уже скрыта — игнорируем её
            if (img.closest('.accessibility-modal') || img.dataset.a11yHidden) return;
            
            img.dataset.a11yHidden = "1";
            img.style.display = "none"; // Просто полностью скрываем картинку с экрана
        });
    };

    // --- ФУНКЦИЯ ВОЗВРАТА КАРТИНОК ---
    const showContentImages = () => {
        document.querySelectorAll(CONTENT_IMG_SELECTOR).forEach((img) => {
            if (!img.dataset.a11yHidden) return;
            img.style.display = "";
            delete img.dataset.a11yHidden;
        });
        // Удаляем все текстовые заглушки
        document.querySelectorAll(".a11y-img-placeholder").forEach((el) => el.remove());
    };

    // --- НАБЛЮДАТЕЛЬ ЗА ДИНАМИЧЕСКИМИ КАРТИНКАМИ ---
    let imgObserver = null;
    const startImgObserver = () => {
        if (imgObserver) return;
        imgObserver = new MutationObserver(() => hideContentImages());
        imgObserver.observe(document.body, { childList: true, subtree: true });
    };
    const stopImgObserver = () => {
        imgObserver?.disconnect();
        imgObserver = null;
    };

    // --- ГЛОБАЛЬНОЕ ПРИМЕНЕНИЕ НАСТРОЕК НА САЙТ ---
    const applySettings = (fontSize, colorScheme, imagesOff) => {
        root.setAttribute("data-a11y-font", fontSize);
        root.setAttribute("data-a11y-scheme", colorScheme);

        if (imagesOff) {
            hideContentImages();
            startImgObserver();
        } else {
            stopImgObserver();
            showContentImages();
        }
    };

    // --- СИНХРОНИЗАЦИЯ РАДИОКНОПОК С ТЕКУЩИМ СОСТОЯНИЕМ ---
    const syncControlsToSettings = () => {
        const fontSize = localStorage.getItem('a11y-font') || 'normal';
        const colorScheme = localStorage.getItem('a11y-scheme') || 'default';
        const imagesOff = localStorage.getItem('a11y-images') === 'true';

        const fontRadio = document.querySelector(`input[name="a11y-font"][value="${fontSize}"]`);
        if (fontRadio) fontRadio.checked = true;

        const schemeRadio = document.querySelector(`input[name="a11y-scheme"][value="${colorScheme}"]`);
        if (schemeRadio) schemeRadio.checked = true;

        if (imagesToggle) imagesToggle.checked = imagesOff;
    };

    // --- ОТКРЫТИЕ И ЗАКРЫТИЕ МОДАЛКИ ---
    if (accessToggleBtn) {
        accessToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            syncControlsToSettings();
            accessModal.classList.add('open');
        });
    }

    const closeModal = () => accessModal.classList.remove('open');
    if (accessCloseX) accessCloseX.addEventListener('click', closeModal);
    if (accessBackdrop) accessBackdrop.addEventListener('click', closeModal);

    // --- КНОПКА "ПРИМЕНИТЬ" ---
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const selectedFont = document.querySelector('input[name="a11y-font"]:checked').value;
            const selectedScheme = document.querySelector('input[name="a11y-scheme"]:checked').value;
            const imagesOff = imagesToggle ? imagesToggle.checked : false;

            // Сохраняем в память браузера
            localStorage.setItem('a11y-font', selectedFont);
            localStorage.setItem('a11y-scheme', selectedScheme);
            localStorage.setItem('a11y-images', imagesOff);

            // Применяем на сайт
            applySettings(selectedFont, selectedScheme, imagesOff);
            closeModal();
        });
    }

    // --- КНОПКА "СБРОСИТЬ" ---
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            localStorage.setItem('a11y-font', 'normal');
            localStorage.setItem('a11y-scheme', 'default');
            localStorage.setItem('a11y-images', 'false');

            applySettings('normal', 'default', false);
            syncControlsToSettings();
            closeModal();
        });
    }

    // --- АВТО-ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ---
    const init = () => {
        const fontSize = localStorage.getItem('a11y-font') || 'normal';
        const colorScheme = localStorage.getItem('a11y-scheme') || 'default';
        const imagesOff = localStorage.getItem('a11y-images') === 'true';
        applySettings(fontSize, colorScheme, imagesOff);
    };

    init();
});