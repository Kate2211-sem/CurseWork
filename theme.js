document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const bodyElement = document.body;

    // 1. Проверяем, есть ли сохраненная тема в localStorage
    const savedTheme = localStorage.getItem('site-theme');

    // 2. Если тема была сохранена как темная, сразу применяем её
    if (savedTheme === 'dark') {
        bodyElement.classList.add('dark-theme');
        updateToggleIcon('dark');
    } else {
        bodyElement.classList.remove('dark-theme');
        updateToggleIcon('light');
    }

    // 3. Отслеживаем клик по кнопке
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            // Переключаем класс dark-theme у тега body
            const isDarkNow = bodyElement.classList.toggle('dark-theme');

            if (isDarkNow) {
                localStorage.setItem('site-theme', 'dark');
                updateToggleIcon('dark');
            } else {
                localStorage.setItem('site-theme', 'light');
                updateToggleIcon('light');
            }
        });
    }

    // Функция, которая меняет смайлик на кнопке (Солнце / Луна)
    function updateToggleIcon(theme) {
        if (!themeToggleBtn) return;
        themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
});