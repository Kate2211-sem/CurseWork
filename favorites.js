// js/favorites.js
class FavoritesManager {
    constructor() {
        this.API = 'http://localhost:3000';
        this.user = JSON.parse(localStorage.getItem('currentUser'));
        this.bindEvents();
        if (document.getElementById('favorites-grid')) this.renderFavPage();
    }

    async renderFavPage() {
        if (!this.user) return;
        try {
            const res = await fetch(`${this.API}/favorites?userId=${this.user.id}`);
            const items = await res.json();
            const container = document.getElementById('favorites-grid');
            const emptyEl = document.getElementById('favorites-empty');

            if (!items.length) {
                if (emptyEl) emptyEl.style.display = 'block';
                if (container) container.innerHTML = '';
                return;
            }

            if (emptyEl) emptyEl.style.display = 'none';
            container.innerHTML = items.map(item => `
                <div class="fav-card" data-id="${item.id}">
                    <div class="fav-img">
                        <img src="${item.image || 'img/products/placeholder.jpg'}" alt="${item.name}">
                    </div>
                    <h3 class="fav-name">${item.name}</h3>
                    <div class="fav-price">${item.price ? parseFloat(item.price).toFixed(2).replace('.', ',') + ' руб.' : ''}</div>
                    <div class="fav-actions">
                        ${item.itemType === 'product' ? `<button class="fav-btn fav-btn-cart" type="button" data-action="add-to-cart" data-product-id="${item.itemId}">🛒 В корзину</button>` : ''}
                        <button class="fav-btn fav-btn-remove" type="button" data-action="remove" data-id="${item.id}">Удалить</button>
                    </div>
                </div>
            `).join('');
            
            this.updateBadge();
        } catch (err) { console.error('Ошибка избранного:', err); }
    }

    async updateBadge() {
        const badge = document.getElementById('badge-favorites');
        if (!badge || !this.user) return;
        try {
            const res = await fetch(`${this.API}/favorites?userId=${this.user.id}`);
            const items = await res.json();
            badge.textContent = items.length;
            badge.style.display = items.length ? 'flex' : 'none';
        } catch {}
    }

    async toggle(itemId, itemType, meta) {
        if (!this.user) { alert('Войдите в аккаунт'); return false; }
        const res = await fetch(`${this.API}/favorites?userId=${this.user.id}`);
        const items = await res.json();
        const exists = items.find(f => f.itemId === itemId && f.itemType === itemType);

        if (exists) {
            await fetch(`${this.API}/favorites/${exists.id}`, { method: 'DELETE' });
        } else {
            await fetch(`${this.API}/favorites`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: this.user.id, itemId, itemType, ...meta, addedAt: new Date().toISOString() })
            });
        }
        if (document.getElementById('favorites-grid')) this.renderFavPage();
        this.updateBadge();
        return !exists;
    }

    bindEvents() {
        document.addEventListener('click', async (e) => {
            const btn = e.target.closest('[data-action="toggle-favorite"], [data-action="remove"], [data-action="add-to-cart"]');
            if (!btn) return;
            
            e.preventDefault();
            e.stopPropagation();

            if (btn.dataset.action === 'toggle-favorite') {
                const card = btn.closest('.product-card');
                if (!card) return;
                const added = await this.toggle(btn.dataset.id, btn.dataset.type || 'product', {
                    name: card.dataset.productName,
                    price: parseFloat(card.dataset.productPrice),
                    image: card.dataset.productImage || ''
                });
                const icon = btn.querySelector('.fav-icon') || btn;
                btn.classList.toggle('active', added);
                if (icon) icon.textContent = added ? '❤️' : '♡';
                
                if (typeof window.showToast === 'function') {
                    window.showToast('favorite', card.dataset.productName, added ? 'Добавлено' : 'Убрано');
                }
            } 
            else if (btn.dataset.action === 'remove') {
                await fetch(`${this.API}/favorites/${btn.dataset.id}`, { method: 'DELETE' });
                this.renderFavPage();
                if (typeof window.showToast === 'function') window.showToast('favorite', 'Элемент', 'Удалено');
            }
            else if (btn.dataset.action === 'add-to-cart' && window.cartManager) {
                const card = btn.closest('.fav-card');
                if (!card) return;
                await window.cartManager.addToShop(btn.dataset.productId, {
                    name: card.querySelector('.fav-name')?.textContent || '',
                    price: parseFloat(card.querySelector('.fav-price')?.textContent) || 0,
                    image: card.querySelector('img')?.src || ''
                });
            }
        });
    }
}
if (!window.favoritesManager) window.favoritesManager = new FavoritesManager();