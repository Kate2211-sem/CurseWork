// js/cart.js
class CartManager {
    constructor() {
        this.API = 'http://localhost:3000';
        const userData = localStorage.getItem('currentUser');
        this.user = userData ? JSON.parse(userData) : null;
        
        this.container = document.getElementById('cart-list');
        this.emptyEl = document.getElementById('cart-empty');
        this.summaryEl = document.getElementById('cart-summary');
        this.badge = document.getElementById('badge-cart');
        
        this.bindEvents();
        
        // Инициализация только на странице корзины
        if (this.container) {
            this.renderCartPage();
            this.initCheckout(); // 👈 Запускаем логику оформления
        }
    }

    async renderCartPage() {
        if (!this.user) {
            if (this.emptyEl) {
                this.emptyEl.style.display = 'block';
                this.emptyEl.innerHTML = `<div class="cart-empty-icon"></div><h3>Требуется авторизация</h3><a href="index.html" class="btn-online">Войти</a>`;
            }
            if (this.container) this.container.innerHTML = '';
            if (this.summaryEl) this.summaryEl.style.display = 'none';
            return;
        }

        try {
            const res = await fetch(`${this.API}/cart?userId=${this.user.id}`);
            const items = await res.json();

            if (!items.length) {
                if (this.emptyEl) this.emptyEl.style.display = 'block';
                if (this.container) this.container.innerHTML = '';
                if (this.summaryEl) this.summaryEl.style.display = 'none';
                return;
            }

            if (this.emptyEl) this.emptyEl.style.display = 'none';
            if (this.summaryEl) this.summaryEl.style.display = 'block';

            let html = '', total = 0;
            items.forEach(item => {
                total += item.price * item.quantity;
                html += `
                    <div class="cart-item" data-id="${item.id}">
                        <div class="cart-item-img">
                            <img src="${item.image || 'img/products/placeholder.jpg'}" alt="${item.name}" 
                                 onerror="this.src='img/products/placeholder.jpg'; this.onerror=null;"
                                 style="width:100%; height:100%; object-fit:cover; display:block;">
                        </div>
                        <div class="cart-item-info">
                            <h3 class="cart-item-name">${this.escapeHtml(item.name)}</h3>
                            <p class="cart-item-meta">${item.price.toFixed(2).replace('.', ',')} руб.</p>
                        </div>
                        <div class="cart-item-actions">
                            <div class="qty-control">
                                <button class="qty-btn" type="button" data-action="dec" data-id="${item.id}">−</button>
                                <span class="qty-value">${item.quantity}</span>
                                <button class="qty-btn" type="button" data-action="inc" data-id="${item.id}">+</button>
                            </div>
                            <button class="cart-remove" type="button" data-action="del" data-id="${item.id}">🗑️</button>
                        </div>
                    </div>`;
            });

            if (this.container) this.container.innerHTML = html;
            
            document.getElementById('summary-count').textContent = items.reduce((s, i) => s + i.quantity, 0);
            document.getElementById('summary-subtotal').textContent = total.toFixed(2).replace('.', ',') + ' руб.';
            document.getElementById('summary-total').textContent = total.toFixed(2).replace('.', ',') + ' руб.';
            
            this.updateBadge();
        } catch (err) {
            console.error('Ошибка корзины:', err);
            if (this.container) this.container.innerHTML = '<p>Ошибка загрузки...</p>';
        }
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m] || m));
    }

    async updateBadge() {
        const badge = document.getElementById('badge-cart');
        if (!badge || !this.user) return;
        try {
            const res = await fetch(`${this.API}/cart?userId=${this.user.id}`);
            const items = await res.json();
            const count = items.reduce((s, i) => s + i.quantity, 0);
            badge.textContent = count;
            badge.style.display = count ? 'flex' : 'none';
        } catch {}
    }

   async addToShop(productId, productData) {
    if (!this.user) { alert('Войдите в аккаунт'); return; }
    
    const res = await fetch(`${this.API}/cart?userId=${this.user.id}`);
    const items = await res.json();
    const existing = items.find(i => i.productId === productId);

    if (existing) {
        await fetch(`${this.API}/cart/${existing.id}`, {
            method: 'PATCH', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: existing.quantity + 1 })
        });
    } else {
        await fetch(`${this.API}/cart`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: this.user.id, 
                productId, 
                quantity: 1,
                name: productData.name, 
                price: productData.price,
                image: productData.image || '', 
                addedAt: new Date().toISOString()
            })
        });
    }

   setTimeout(() => {
        if (typeof window.showToast === 'function') {
            window.showToast('cart', productData.name, 'Товар');
        } else {
            console.error("showToast не найден!");
        }
    }, 100);
   
    // ----------------------------------------
}
    async changeQty(id, delta) {
        const res = await fetch(`${this.API}/cart/${id}`);
        const item = await res.json();
        const newQty = item.quantity + delta;

        if (newQty <= 0) {
            await fetch(`${this.API}/cart/${id}`, { method: 'DELETE' });
        } else {
            await fetch(`${this.API}/cart/${id}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: newQty })
            });
        }
        this.renderCartPage();
        this.updateBadge();
    }

    //  ЛОГИКА ОФОРМЛЕНИЯ ЗАКАЗА
    initCheckout() {
        
        const btn = document.getElementById('btn-checkout');
        const modal = document.getElementById('checkout-modal');
        const closeBtn = document.getElementById('close-checkout');
        const form = document.getElementById('checkout-form');
        const deliverySelect = document.getElementById('c-delivery');
        const successScreen = document.getElementById('order-success');

        if (!btn) return; // Не на странице корзины

        // 1. Открытие модалки
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const res = await fetch(`${this.API}/cart?userId=${this.user.id}`);
            const items = await res.json();
            if (items.length === 0) {
                alert('Корзина пуста! Добавьте товары.');
                return;
            }
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            this.updateCheckoutTotal(items, deliverySelect?.value || 'pickup');
        });

        // 2. Закрытие модалки
        closeBtn?.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        });

        // 3. Пересчёт при смене доставки
        deliverySelect?.addEventListener('change', async () => {
            const res = await fetch(`${this.API}/cart?userId=${this.user.id}`);
            const items = await res.json();
            this.updateCheckoutTotal(items, deliverySelect.value);
        });

        // 4. Отправка формы
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const res = await fetch(`${this.API}/cart?userId=${this.user.id}`);
            const items = await res.json();
            if (items.length === 0) return;

            const deliveryType = deliverySelect.value;
            const deliveryCost = deliveryType === 'delivery' ? 5 : 0;
            const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
            const total = subtotal + deliveryCost;

            const orderData = {
                userId: this.user.id,
                customerName: document.getElementById('c-name').value.trim(),
                customerPhone: document.getElementById('c-phone').value.trim(),
                customerAddress: document.getElementById('c-address').value.trim(),
                customerComment: document.getElementById('c-comment').value.trim(),
                delivery: deliveryType,
                items: items,
                subtotal,
                deliveryCost,
                total,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            try {
                // Сохраняем заказ в JSON Server
                await fetch(`${this.API}/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });

                // Очищаем корзину на сервере
                for (const item of items) {
                    await fetch(`${this.API}/cart/${item.id}`, { method: 'DELETE' });
                }

                // Показываем экран успеха
                modal.style.display = 'none';
                document.body.style.overflow = '';
                successScreen.style.display = 'block';
                document.getElementById('success-order-num').textContent = `#OK-${Date.now().toString().slice(-6)}`;

            } catch (err) {
                console.error('Ошибка оформления:', err);
                alert('Не удалось оформить заказ. Проверьте подключение к серверу.');
            }
        });
    }

    updateCheckoutTotal(items, deliveryType) {
        const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const delivery = deliveryType === 'delivery' ? 5 : 0;
        const el = document.getElementById('checkout-total');
        if (el) el.textContent = (subtotal + delivery).toFixed(2).replace('.', ',');
    }

    bindEvents() {
        document.addEventListener('click', async (e) => {
            const addBtn = e.target.closest('[data-action="add-to-cart"]');
            if (addBtn) {
                e.preventDefault();
                const card = addBtn.closest('.product-card');
                if (!card) return;
                await this.addToShop(card.dataset.productId, {
                    name: card.dataset.productName,
                    price: parseFloat(card.dataset.productPrice),
                    image: card.dataset.productImage || ''
                });
                return;
            }
            const btn = e.target.closest('.qty-btn, .cart-remove');
            if (!btn) return;
            e.preventDefault();
            if (btn.dataset.action === 'inc') await this.changeQty(btn.dataset.id, 1);
            else if (btn.dataset.action === 'dec') await this.changeQty(btn.dataset.id, -1);
            else if (btn.dataset.action === 'del') await this.changeQty(btn.dataset.id, -999);
        });
   
    }
    
}

if (!window.cartManager) window.cartManager = new CartManager();
window.cartManager = new CartManager();