// js/notifications.js — ИСПРАВЛЕННЫЙ (гарантированный показ)
let currentToastType = 'cart';

function showToast(type, productName, itemType = 'товар') {
    const toast = document.getElementById('toast-notification');
    if (!toast) {
        console.warn('⚠️ Элемент #toast-notification не найден');
        return;
    }
    
    const title = toast.querySelector('.toast-title');
    const text = toast.querySelector('.toast-text');
    const primaryBtn = toast.querySelector('.toast-btn-primary');

    currentToastType = type;
    toast.classList.remove('cart', 'favorite', 'admin');
    toast.classList.add(type);

    // Настройка текста
    if (type === 'cart') {
        title.textContent = 'Добавлено в корзину!';
        text.textContent = `${itemType}: ${productName}`;
        primaryBtn.textContent = 'Перейти в корзину';
        primaryBtn.onclick = goToCart;
    } else if (type === 'favorite') {
        title.textContent = 'Добавлено в избранное!';
        text.textContent = `${itemType}: ${productName}`;
        primaryBtn.textContent = 'Перейти в избранное';
        primaryBtn.onclick = goToFavorites;
    } else if (type === 'admin') {
        title.textContent = '⛔ Доступ запрещён';
        text.textContent = productName;
        primaryBtn.textContent = 'Понятно';
        primaryBtn.onclick = hideToast;
    }

    // ✅ ГАРАНТИРОВАННЫЙ ПОКАЗ (не зависит от CSS)
    toast.style.display = 'flex';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    // Запускаем анимацию появления
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => hideToast(), 3000);
}

function hideToast() {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    
    // Анимация исчезновения
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 300); // Ждём окончания анимации
}

function goToCart() { 
    hideToast(); 
    window.location.href = 'cart.html'; 
}

function goToFavorites() { 
    hideToast(); 
    window.location.href = 'favorites.html'; 
}

function closeModal() {
    const modal = document.getElementById('quick-view-modal');
    if (modal) modal.style.display = 'none';
}

// Экспорт в глобальную область (ОБЯЗАТЕЛЬНО!)
window.showToast = showToast;
window.hideToast = hideToast;
window.goToCart = goToCart;
window.goToFavorites = goToFavorites;
window.closeModal = closeModal;

// Обработчики иконок в шапке
document.addEventListener('DOMContentLoaded', () => {
    const favIcon = document.querySelector('.user-zone .icon-btn:first-child');
    if (favIcon) {
        favIcon.addEventListener('click', (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (user && user.role === 'admin') {
                showToast('admin', 'Администраторы не могут использовать избранное', 'Система');
                return;
            }
            window.location.href = 'favorites.html';
        });
    }
    
    const cartIcon = document.querySelector('.user-zone .icon-btn:nth-child(2)');
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (user && user.role === 'admin') {
                showToast('admin', 'Администраторы не могут оформлять заказы', 'Система');
                return;
            }
            window.location.href = 'cart.html';
        });
    }
});