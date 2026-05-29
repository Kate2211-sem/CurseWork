document.addEventListener('DOMContentLoaded', () => {
    // Массив, где будут храниться все полученные из db.json товары
    let products = []; 

    // Элементы фильтров и сетки
    const productsGrid = document.getElementById('main-product-grid');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const brandSelect = document.getElementById('brand-select');
    const categorySelect = document.getElementById('category-select');
    const priceRange = document.getElementById('price-range');
    const priceMaxLabel = document.getElementById('price-max-label');

    // 1. Загрузка данных из db.json
    async function loadProducts() {
        try {
            // Укажи правильный путь к твоему файлу db.json
            const response = await fetch('db.json'); 
            const data = await response.json();
            products = data.products;
            
            // Как только данные загрузились — отображаем их
            renderProducts(products);
        } catch (error) {
            console.error('Ошибка загрузки данных товаров:', error);
            productsGrid.innerHTML = '<p>Не удалось загрузить товары.</p>';
        }
    }

    function renderProducts(productsToRender) {
    const firstGrid = document.getElementById('main-product-grid');
    const secondGrid = document.getElementById('second-product-grid');
    
    // Проверяем, есть ли вообще эти блоки на странице
    if (!firstGrid || !secondGrid) return;

    // Очищаем обе сетки перед новой отрисовкой
    firstGrid.innerHTML = '';
    secondGrid.innerHTML = '';

    if (productsToRender.length === 0) {
        firstGrid.innerHTML = `<p class="no-products" style="grid-column: 1/-1; text-align: center; padding: 20px;">Товары не найдены</p>`;
        return;
    }

    // Распределяем товары: первые 8 — в первую сетку, остальные — во вторую
    productsToRender.forEach((product, index) => {
        const cardHTML = createProductCardHTML(product);
        
        if (index < 8) {
            firstGrid.insertAdjacentHTML('beforeend', cardHTML);
        } else {
            secondGrid.insertAdjacentHTML('beforeend', cardHTML);
        }
    });
}

function createProductCardHTML(product) {
    const isDiscount = product.discount ? 'orange' : '';
    const badgeHTML = product.discount ? `<span class="discount-badge">%</span>` : '';
    
    return `
        <div class="product-card" 
             data-product-id="${product.id}" 
             data-product-name="${product.name}" 
             data-product-price="${product.price}" 
             data-product-image="${product.image}">
            <div class="product-image">
                ${badgeHTML}
                <div class="product-actions">
                    <button class="btn-action btn-favorite" data-action="toggle-favorite" data-type="product" data-id="${product.id}" aria-label="В избранное">
                        <span class="fav-icon">♡</span>
                    </button>
                    <button class="btn-action btn-cart-action" data-action="add-to-cart" data-id="${product.id}" aria-label="В корзину">
                        🛒
                    </button>
                </div>
                <img src="${product.image}" alt="${product.name}">
            </div>
            <p class="p-category">${product.category}</p>
            <h2 class="p-name">${product.name}</h2>
            <div class="p-footer">
                <span class="p-price ${isDiscount}">${product.price.toFixed(2).replace('.', ',')} <small>руб.</small></span>
                <span class="p-volume">${product.volume}</span>
            </div>
        </div>
    `;
}
    // 3. Главная функция фильтрации, поиска и сортировки
    function filterAndSortProducts() {
        let filtered = [...products]; // Создаем копию основного массива

        // Фильтрация по Поиску (Строка поиска)
        const searchText = searchInput.value.toLowerCase().trim();
        if (searchText !== '') {
            filtered = filtered.filter(item => item.name.toLowerCase().includes(searchText));
        }

        // Фильтрация по Категории
        const selectedCategory = categorySelect.value;
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        // Фильтрация по Производителю (Бренду)
        const selectedBrand = brandSelect.value;
        if (selectedBrand !== 'all') {
            filtered = filtered.filter(item => item.brand === selectedBrand);
        }

        // Фильтрация по Цене (Ползунок)
        const maxPrice = parseFloat(priceRange.value);
        priceMaxLabel.textContent = `${maxPrice} р.`; // Обновляем текст цены на экране
        filtered = filtered.filter(item => item.price <= maxPrice);

        // Сортировка данных
        const sortingType = sortSelect.value;
        if (sortingType === 'price-asc') {
            filtered.sort((a, b) => a.price - b.price); // От дешевых к дорогим
        } else if (sortingType === 'price-desc') {
            filtered.sort((a, b) => b.price - a.price); // От дорогих к дешевым
        } else if (sortingType === 'name-asc') {
            filtered.sort((a, b) => a.name.localeCompare(b.name)); // По алфавиту
        }

        // Выводим итоговый отфильтрованный список
        renderProducts(filtered);
    }

    // 4. Навешиваем слушатели событий на все элементы управления
    if (searchInput) searchInput.addEventListener('input', filterAndSortProducts);
    if (categorySelect) categorySelect.addEventListener('change', filterAndSortProducts);
    if (brandSelect) brandSelect.addEventListener('change', filterAndSortProducts);
    if (priceRange) priceRange.addEventListener('input', filterAndSortProducts);
    if (sortSelect) sortSelect.addEventListener('change', filterAndSortProducts);

    // Запуск процесса при загрузке страницы
    loadProducts();
});