
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userNameEl = document.querySelector('.user-name');
    const loginLink = document.querySelector('.user-profile');
    
    if (user && userNameEl) {
        // Пользователь авторизован - показываем никнейм
        userNameEl.textContent = user.nickname || user.fio?.split(' ')[0] || 'Профиль';
        if (loginLink) {
            loginLink.href = 'profile.html'; // или 'index.html'
        }
    } else if (userNameEl) {
        // Пользователь не авторизован
        userNameEl.textContent = 'Войти';
        if (loginLink) {
            loginLink.href = 'index.html';
        }
    }
});