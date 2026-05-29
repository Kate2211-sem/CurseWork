// ========== 1. ОБНОВЛЕНИЕ БЕЙДЖЕЙ (Работает на ВСЕХ страницах) ==========
function updateHeaderBadges() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const badgeCart = document.getElementById('badge-cart');
        if (badgeCart) {
            badgeCart.textContent = cartCount;
            badgeCart.style.display = cartCount > 0 ? 'flex' : 'none';
        }
        
        const favCount = favorites.length;
        const badgeFav = document.getElementById('badge-favorites');
        if (badgeFav) {
            badgeFav.textContent = favCount;
            badgeFav.style.display = favCount > 0 ? 'flex' : 'none';
        }
    } catch (e) {
        console.warn('⚠️ Ошибка обновления бейджей:', e);
    }
}

window.updateHeaderBadges = updateHeaderBadges;

// ========== УПРАВЛЕНИЕ ВСПЛЫВАЮЩИМИ УВЕДОМЛЕНИЯМИ ==========
let currentToastType = 'cart';

function showToast(type, productName, itemType = 'товар') {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    
    const title = toast.querySelector('.toast-title');
    const text = toast.querySelector('.toast-text');
    const primaryBtn = toast.querySelector('.toast-btn-primary');
    
    currentToastType = type;
    toast.classList.remove('cart', 'favorite', 'admin');
    toast.classList.add(type);
    
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
    
    toast.classList.add('show');
    setTimeout(() => hideToast(), 5000);
}

function hideToast() {
    const toast = document.getElementById('toast-notification');
    if (toast) toast.classList.remove('show');
}

function goToCart() { hideToast(); window.location.href = 'cart.html'; }
function goToFavorites() { hideToast(); window.location.href = 'favorites.html'; }
function closeModal() {
    const modal = document.getElementById('quick-view-modal');
    if (modal) modal.style.display = 'none';
}

// ========== ОБРАБОТЧИКИ КЛИКОВ ==========
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
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            favorites.length === 0 ? showEmptyModal('favorites') : window.location.href = 'favorites.html';
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
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart.length === 0 ? showEmptyModal('cart') : window.location.href = 'cart.html';
        });
    }
});

// ========== МОДАЛЬНОЕ ОКНО "ПУСТО" ==========
function showEmptyModal(type) {
    let modal = document.getElementById('quick-view-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'quick-view-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `<div class="modal-content"><button class="modal-close" onclick="closeModal()">&times;</button><div id="modal-body"></div></div>`;
        document.body.appendChild(modal);
    }
    const body = document.getElementById('modal-body');
    const isCart = type === 'cart';
    body.innerHTML = `
        <div style="text-align:center;padding:20px;">
            <div style="font-size:64px;margin-bottom:20px;">${isCart ? '🛒' : '❤️'}</div>
            <h3 style="margin:0 0 10px;font-family:'Gilroy',sans-serif;font-size:24px;">
                ${isCart ? 'Корзина пуста' : 'Избранное пусто'}
            </h3>
            <p style="color:#6b7280;margin:0 0 25px;">
                ${isCart ? 'Добавьте товары из магазина' : 'Нажимайте ❤️ на понравившихся товарах'}
            </p>
            <button onclick="closeModal();window.location.href='shop.html'" 
                    style="background:linear-gradient(270deg,#FD9113,#FDBB13);color:#fff;border:none;padding:14px 32px;border-radius:12px;font-family:'Gilroy',sans-serif;font-size:16px;font-weight:600;cursor:pointer;">
                ${isCart ? 'Перейти в магазин' : 'Смотреть товары'}
            </button>
        </div>`;
    modal.style.display = 'flex';
}

// Экспорт функций
window.showToast = showToast;
window.hideToast = hideToast;
window.goToCart = goToCart;
window.goToFavorites = goToFavorites;
window.closeModal = closeModal;
window.showEmptyModal = showEmptyModal;