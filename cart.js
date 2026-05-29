class CartManager {
  constructor() {
    this.key = 'cart';
    this.cart = JSON.parse(localStorage.getItem(this.key)) || [];
    this.badge = document.querySelector('.user-zone .icon-btn:nth-child(2) .badge');
    this.init();
  }

  init() {
    this.updateBadge();
    this.bindEvents();
  }

  add(productId, productData) {
    const existing = this.cart.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ productId, ...productData, quantity: 1, addedAt: new Date().toISOString() });
    }
    this.save();
    this.updateBadge();
    if (typeof window.updateHeaderBadges === 'function') window.updateHeaderBadges();
    if (typeof window.showToast === 'function') window.showToast('cart', productData.name, 'Товар');
    return true;
  }

  remove(productId) {
    this.cart = this.cart.filter(item => item.productId !== productId);
    this.save();
    this.updateBadge();
  }

  clear() { this.cart = []; this.save(); this.updateBadge(); }
  getTotalCount() { return this.cart.reduce((sum, item) => sum + (item.quantity || 1), 0); }
  getTotalPrice() { return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0); }
  save() { localStorage.setItem(this.key, JSON.stringify(this.cart)); }

  updateBadge() {
    if (!this.badge) return;
    const count = this.getTotalCount();
    this.badge.textContent = count;
    this.badge.style.display = count > 0 ? 'flex' : 'none';
  }

  bindEvents() {
    // ✅ Делегирование: ловит клики на динамически добавленных карточках
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="add-to-cart"]');
      if (!btn) return;
      
      e.preventDefault();
      const card = btn.closest('.product-card');
      if (!card) return;

      // 🔒 Админ не может покупать
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (user && user.role === 'admin') {
        if (typeof showToast === 'function') showToast('cart', 'Администраторы не могут оформлять заказы!', 'Система');
        return;
      }

      const productData = {
        name: card.dataset.productName,
        price: parseFloat(card.dataset.productPrice),
        image: card.dataset.productImage,
        category: card.querySelector('.p-category')?.textContent
      };

      this.add(card.dataset.productId, productData);
      
      // Визуальный отклик
      const originalText = btn.textContent;
      btn.textContent = '✓';
      btn.style.background = '#22c55e';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
      }, 1500);
    });
  }
}