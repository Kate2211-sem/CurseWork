class FavoritesManager {
  constructor() {
    this.key = 'favorites';
    this.items = JSON.parse(localStorage.getItem(this.key)) || [];
    this.badge = document.querySelector('.user-zone .icon-btn:first-child .badge');
    this.init();
  }

  init() {
    this.updateBadge();
    this.bindEvents();
    this.syncButtons();
  }

  add(itemId, itemType, meta = {}) {
    if (this.exists(itemId, itemType)) return false;
    this.items.push({ id: crypto.randomUUID?.() || Date.now().toString(), itemId, itemType, meta, addedAt: new Date().toISOString() });
    this.save(); this.updateBadge();
    if (typeof window.updateHeaderBadges === 'function') window.updateHeaderBadges();
    if (typeof window.showToast === 'function') window.showToast('favorite', meta.name || 'Элемент', itemType === 'product' ? 'Товар' : 'Услуга');
    return true;
  }

  remove(itemId, itemType) {
    this.items = this.items.filter(f => !(f.itemId === itemId && f.itemType === itemType));
    this.save(); this.updateBadge();
  }

  toggle(itemId, itemType, meta = {}) {
    return this.exists(itemId, itemType) ? (this.remove(itemId, itemType), false) : (this.add(itemId, itemType, meta), true);
  }

  exists(itemId, itemType) { return this.items.some(f => f.itemId === itemId && f.itemType === itemType); }
  getProducts() { return this.items.filter(f => f.itemType === 'product'); }
  save() { localStorage.setItem(this.key, JSON.stringify(this.items)); }

  updateBadge() {
    if (!this.badge) return;
    this.badge.textContent = this.items.length;
    this.badge.style.display = this.items.length > 0 ? 'flex' : 'none';
  }

  syncButtons() {
    document.querySelectorAll('[data-action="toggle-favorite"]').forEach(btn => {
      if (this.exists(btn.dataset.id, btn.dataset.type || 'product')) {
        btn.classList.add('active');
        const icon = btn.querySelector('.fav-icon');
        if (icon) icon.textContent = '❤️';
      }
    });
  }

  bindEvents() {
    // ✅ Делегирование для динамических карточек
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="toggle-favorite"]');
      if (!btn) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const card = btn.closest('.product-card');
      const itemId = btn.dataset.id;
      const itemType = btn.dataset.type || 'product';
      
      const meta = {
        name: card?.dataset.productName || '',
        price: card?.dataset.productPrice || '',
        image: card?.dataset.productImage || '',
        category: card?.querySelector('.p-category')?.textContent || ''
      };

      const isAdded = this.toggle(itemId, itemType, meta);
      const icon = btn.querySelector('.fav-icon');
      if (icon) {
        btn.classList.toggle('active', isAdded);
        icon.textContent = isAdded ? '❤️' : '♡';
      }
    });
  }
}