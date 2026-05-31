document.addEventListener('DOMContentLoaded', () => {
    const API = 'http://localhost:3000';
    let products = [];

    const productsGrid = document.getElementById('main-product-grid');
    const secondGrid = document.getElementById('second-product-grid');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const brandSelect = document.getElementById('brand-select');
    const categorySelect = document.getElementById('category-select');
    const priceRange = document.getElementById('price-range');
    const priceMaxLabel = document.getElementById('price-max-label');

   async function loadProducts() {
    try {
        // ✅ Загружаем через JSON Server!
        const res = await fetch('http://localhost:3000/products');
        if (!res.ok) throw new Error('Server error');
        products = await res.json();
        renderProducts(products);
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        productsGrid.innerHTML = '<p>Не удалось загрузить товары. Запустите JSON Server!</p>';
    }
}

    function renderProducts(list) {
        if (!productsGrid) return;
        productsGrid.innerHTML = '';
        secondGrid && (secondGrid.innerHTML = '');

        if (list.length === 0) {
            productsGrid.innerHTML = '<p class="no-products">Товары не найдены</p>';
            return;
        }

        list.forEach((p, i) => {
            const html = `
                <div class="product-card" data-product-id="${p.id}" data-product-name="${p.name}" data-product-price="${p.price}" data-product-image="${p.image}">
                    <div class="product-image">
                        ${p.discount ? '<span class="discount-badge">%</span>' : ''}
                        <div class="product-actions">
                            <button class="btn-action btn-favorite" type="button" data-action="toggle-favorite" data-type="product" data-id="${p.id}" aria-label="В избранное"><span class="fav-icon">♡</span></button>
                            <button class="btn-action btn-cart-action" type="button" data-action="add-to-cart" aria-label="В корзину">🛒</button>
                        </div>
                        <img src="${p.image}" alt="${p.name}">
                    </div>
                    <p class="p-category">${p.category}</p>
                    <h2 class="p-name">${p.name}</h2>
                    <div class="p-footer">
                        <span class="p-price ${p.discount ? 'orange' : ''}">${p.price.toFixed(2).replace('.', ',')} <small>руб.</small></span>
                        <span class="p-volume">${p.volume}</span>
                    </div>
                </div>`;
            
            (i < 8 && productsGrid ? productsGrid : secondGrid).insertAdjacentHTML('beforeend', html);
        });
    }

    function filterAndSort() {
        let f = [...products];
        if (searchInput?.value.trim()) f = f.filter(p => p.name.toLowerCase().includes(searchInput.value.toLowerCase()));
        if (categorySelect?.value !== 'all') f = f.filter(p => p.category === categorySelect.value);
        if (brandSelect?.value !== 'all') f = f.filter(p => p.brand === brandSelect.value);
        const max = parseFloat(priceRange?.value || 100);
        priceMaxLabel && (priceMaxLabel.textContent = `${max} р.`);
        f = f.filter(p => p.price <= max);

        const sort = sortSelect?.value;
        if (sort === 'price-asc') f.sort((a,b) => a.price - b.price);
        else if (sort === 'price-desc') f.sort((a,b) => b.price - a.price);
        else if (sort === 'name-asc') f.sort((a,b) => a.name.localeCompare(b.name));

        renderProducts(f);
    }

    searchInput?.addEventListener('input', filterAndSort);
    categorySelect?.addEventListener('change', filterAndSort);
    brandSelect?.addEventListener('change', filterAndSort);
    priceRange?.addEventListener('input', filterAndSort);
    sortSelect?.addEventListener('change', filterAndSort);

    loadProducts();
});
function goToCart() {
    window.location.href = 'cart.html';
}