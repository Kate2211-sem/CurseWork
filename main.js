window.addEventListener('load', () => {
  const preloader = document.getElementById('site-preloader');
  if (preloader) {
    // Добавляем класс плавного скрытия
    preloader.classList.add('preloader--hidden');
  }
});
document.addEventListener('DOMContentLoaded', () => {
  // 🔐 === АВТОРИЗАЦИЯ В ШАПКЕ ===
  const userProfile = document.querySelector('.user-profile');
  const userName = document.querySelector('.user-profile .user-name');
  
  if (userProfile && userName) {
    const updateAuthUI = () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      if (isLoggedIn && currentUser) {
        const displayName = currentUser.nickname || currentUser.fio?.split(' ')[0] || 'Пользователь';
        userName.textContent = displayName;
        userProfile.href = '#';
        userProfile.title = 'Нажмите для выхода';
        
        userProfile.onclick = (e) => {
          e.preventDefault();
          if (confirm('Выйти из аккаунта?')) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedIn');
            window.location.reload();
          }
        };
      } else {
        userName.textContent = 'Войти';
        userProfile.href = 'index.html';
        userProfile.onclick = null;
      }
    };
    updateAuthUI();
  }

  // === БУРГЕР-МЕНЮ ===
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav');
const overlay = document.querySelector('.nav-overlay');

if (burger && nav) {
  function toggleMenu() {
    nav.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
    document.body.classList.toggle('nav-open');
  }

  burger.addEventListener('click', toggleMenu);
  
  if (overlay) {
    overlay.addEventListener('click', toggleMenu);
  }
  
  // 🔧 Закрытие меню при клике на ОБЫЧНЫЕ ссылки (но НЕ на "Стоимость")
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      // Если это родительская ссылка дропдауна ("Стоимость") — НЕ закрываем меню
      if (link.closest('.nav__item--dropdown') && link.classList.contains('nav__link')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      // Для всех остальных ссылок — закрываем меню
      if (nav.classList.contains('active')) {
        toggleMenu();
      }
    });
  });
  
  // 🔧 Открываем/закрываем дропдаун при клике на "Стоимость" (только на мобильных)
  const dropdownItems = nav.querySelectorAll('.nav__item--dropdown');
  dropdownItems.forEach(item => {
    const parentLink = item.querySelector('.nav__link');
    const dropdown = item.querySelector('.dropdown');
    
    if (parentLink && dropdown) {
      parentLink.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
          e.preventDefault();
          e.stopPropagation();
          
          // Закрываем другие открытые дропдауны
          dropdownItems.forEach(other => {
            if (other !== item) {
              other.classList.remove('active');
              const otherDropdown = other.querySelector('.dropdown');
              if (otherDropdown) otherDropdown.style.display = 'none';
            }
          });
          
          // Переключаем текущий
          item.classList.toggle('active');
          dropdown.style.display = item.classList.contains('active') ? 'block' : 'none';
        }
      });
    }
  });
}
  // 🔒 === КНОПКА АДМИНА (видна только админу) ===
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (user && user.role === 'admin') {
    const heroButtons = document.querySelector('.hero-buttons');
    if (heroButtons && !document.getElementById('admin-hero-btn')) {
      const adminLink = document.createElement('a');
      adminLink.href = 'admin-orders.html';
      adminLink.className = 'btn-secondary';
      adminLink.id = 'admin-hero-btn';
      adminLink.textContent = '⚙️ Управление';
      adminLink.style.cssText = 'margin-left: 10px; background: #22c55e; color: #fff;';
      heroButtons.appendChild(adminLink);
    }
  }
}); // ← ЗАКРЫВАЕМ ОДИН РАЗ ВСЁ, ЧТО ВНУТРИ DOMContentLoaded
// === ВЫПАДАЮЩЕЕ МЕНЮ "СТОИМОСТЬ" НА МОБИЛЬНЫХ ===
const dropdownItems = document.querySelectorAll('.nav__item--dropdown');

dropdownItems.forEach(item => {
  const parentLink = item.querySelector('.nav__link');
  const dropdown = item.querySelector('.dropdown');
  
  if (parentLink && dropdown) {
    parentLink.addEventListener('click', (e) => {
      // Работаем ТОЛЬКО на мобильных (≤1024px)
      if (window.innerWidth <= 1024) {
        e.preventDefault(); // Блокируем переход у РОДИТЕЛЯ
        e.stopPropagation(); // Останавливаем всплытие
        
        // Закрываем другие открытые дропдауны
        dropdownItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const otherDropdown = other.querySelector('.dropdown');
            if (otherDropdown) otherDropdown.style.display = 'none';
          }
        });
        
        // 🔥 Переключаем текущий: показываем/скрываем список
        item.classList.toggle('active');
        dropdown.style.display = item.classList.contains('active') ? 'block' : 'none';
      }
    });
  }
});

// Закрываем все дропдауны при клике вне меню
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav')) {
    dropdownItems.forEach(item => {
      item.classList.remove('active');
      const dropdown = item.querySelector('.dropdown');
      if (dropdown) dropdown.style.display = 'none';
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {
    const headerTools = document.querySelector('.header__tools');

    if (headerTools) {
        headerTools.addEventListener('click', (event) => {
            // Если экран большой (не шестерёнка), ничего не делаем
            if (window.innerWidth > 1258) return;

            // Разрешаем кликать по кнопкам внутри открытого меню (чтобы они работали)
            if (event.target.closest('.tool-btn')) return;

            // Переключаем класс active при клике на саму панель/шестерёнку
            headerTools.classList.toggle('active');
        });

        // Закрываем меню, если кликнули вне его области
        document.addEventListener('click', (event) => {
            if (!headerTools.contains(event.target)) {
                headerTools.classList.remove('active');
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
  const resetBtn = document.getElementById('reset-settings-btn');

  resetBtn?.addEventListener('click', () => {
    // Всплывающее окно подтверждения (выполнение требования ТЗ по всплывающим окнам)
    const isConfirmed = confirm(
      'Вы уверены, что хотите полностью сбросить настройки сайта? \n\nЭто очистит корзину, выйдет из текущего профиля, удалит созданные записи/заказы и вернет стандартную тему.'
    );

    if (isConfirmed) {
      // 1. Полностью очищаем хранилище localStorage
      localStorage.clear();

      // 2. Второе всплывающее окно с уведомлением об успешном сбросе
      alert('Все настройки и данные сайта успешно сброшены!');

      // 3. Перезагружаем страницу, чтобы сайт открылся в первоначальном чистом виде
      window.location.reload();
    }
  });
});


/////слайдеры о нас
document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('testimonials-track');
  const prevBtn = document.getElementById('slider-btn-prev');
  const nextBtn = document.getElementById('slider-btn-next');

  if (track && prevBtn && nextBtn) {
    // Функция получения шага прокрутки (ширина карточки + отступ gap)
    const getScrollStep = () => {
      const card = track.querySelector('.testimonial-card');
      if (!card) return 300; // Дефолтное значение на всякий случай
      
      const cardWidth = card.getBoundingClientRect().width;
      return cardWidth + 25; // 25 — это твой gap из CSS к треку
    };

    // Клик по кнопке "Вперед"
    nextBtn.addEventListener('click', () => {
      track.scrollLeft += getScrollStep();
    });

    // Клик по кнопке "Назад"
    prevBtn.addEventListener('click', () => {
      track.scrollLeft -= getScrollStep();
    });
  }
});



/////пингинация 
document.addEventListener('DOMContentLoaded', () => {
  // 1. Массив со всеми статьями блога (6 штук для демонстрации переключения)
  const blogArticles = [
    {
      img: 'img/blog/post-1.png',
      alt: 'Antistatic',
      titleRu: 'Антистатик зимой',
      titleEn: 'Antistatic in winter',
      text: 'В зимний период волосы часто электризуются от шапок и сухого воздуха в помещениях. Рассказываем, как выбрать правильный антистатик, какие домашние хитрости спасут укладку и как вернуть локонам послушность и естественный блеск.',
      badge: false
    },
    {
      img: 'img/blog/post-2.png',
      alt: 'Wash hair',
      titleRu: 'Мой голову правильно',
      titleEn: 'Wash your hair right',
      text: 'Правильное очищение — залог здоровья кожи головы и красоты волос. Разбираем главные ошибки при мытье: от неподходящей температуры воды до неправильного нанесения масок. Проверьте, всё ли вы делаете верно!',
      badge: true // отобразит бейдж "Новый пост"
    },
    {
      img: 'img/blog/post-3.png',
      alt: 'Hair ends',
      titleRu: 'Уход за кончиками',
      titleEn: 'Hair ends care',
      text: 'Секущиеся и сухие кончики могут испортить даже самую дорогую стрижку. В этой статье мы собрали топ-5 проверенных масел и несмываемых сывороток, а также советы стилистов, которые помогут сохранить срез свежим без ножниц.',
      badge: false
    },
    {
      img: 'img/blog/post-3.png', // можно заменить на post-4.png и т.д.
      alt: 'Spa care',
      titleRu: 'SPA-процедуры для волос',
      titleEn: 'SPA hair treatments',
      text: 'Глубокое питание и восстановление структуры волос в зимний период. Узнайте, какие салонные ритуалы вернут блеск вашим локонам уже за один сеанс...',
      badge: false
    },
    {
      img: 'img/blog/post-1.png',
      alt: 'Trends 2026',
      titleRu: 'Тренды окрашивания 2026',
      titleEn: 'Coloring Trends 2026',
      text: 'Натуральные оттенки, плавные переходы и бережные техники. Рассматриваем главные новинки колористики этого сезона, которые выбирают топ-стилисты...',
      badge: true
    },
    {
      img: 'img/blog/post-2.png',
      alt: 'Manicure tips',
      titleRu: 'Секреты стойкого маникюра',
      titleEn: 'Long-lasting manicure secrets',
      text: 'Как ухаживать за кутикулой в домашних условиях и продлить жизнь покрытию гель-лаком. Полезные советы от ведущих нейл-мастеров нашего салона...',
      badge: false
    }
  ];

  const cardsContainer = document.getElementById('blog-cards-container');
  const paginationContainer = document.getElementById('blog-pagination');
  
  const cardsPerPage = 3; // Сколько статей показывать на одной странице
  let currentPage = 1;

  // Функция отрисовки карточек для конкретной страницы
  function displayCards(page) {
    if (!cardsContainer) return;
    cardsContainer.innerHTML = ''; // Очищаем контейнер

    // Высчитываем индексы элементов для текущей страницы
    const start = (page - 1) * cardsPerPage;
    const end = start + cardsPerPage;
    const paginatedItems = blogArticles.slice(start, end);

    // Генерируем HTML для каждой карточки (сохраняя твою точную верстку!)
    paginatedItems.forEach(article => {
      const cardElement = document.createElement('article');
      cardElement.className = 'blog-card';
      
      // Проверка на бейдж
      const badgeHTML = article.badge 
        ? `<span class="card-badge" data-ru="Новый пост" data-en="New post">Новый пост</span>` 
        : '';

      cardElement.innerHTML = `
        <div class="card-image">
            <img src="${article.img}" alt="${article.alt}">
            ${badgeHTML}
        </div>
        <div class="card-content">
            <h3 class="card-title" data-ru="${article.titleRu}" data-en="${article.titleEn}">${article.titleRu}</h3>
            <p class="card-text">${article.text}</p>
            <a href="#" class="card-link" data-ru="Читать далее" data-en="Read more">
                Читать далее
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.33333 8H12.6667" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 3.33333L12.6667 8L8 12.6667" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </a>
        </div>
      `;
      cardsContainer.appendChild(cardElement);
    });

    // Если у тебя на сайте работает переключение языков, вызываем функцию перевода
    if (window.updateLanguageUI) {
       window.updateLanguageUI(); 
    }
  }

  // Функция создания кнопок пагинации
  function setupPagination() {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';

    const pageCount = Math.ceil(blogArticles.length / cardsPerPage);

    for (let i = 1; i <= pageCount; i++) {
      const btn = document.createElement('button');
      btn.className = 'pagination-btn';
      btn.innerText = i;

      if (i === currentPage) {
        btn.classList.add('active');
      }

      btn.addEventListener('click', () => {
        currentPage = i;
        displayCards(currentPage);

        // Обновляем активный класс на кнопках
        document.querySelectorAll('.pagination-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Плавный скролл к началу блока блога, чтобы пользователю не приходилось мотать наверх
        document.querySelector('.beauty-blog').scrollIntoView({ behavior: 'smooth' });
      });

      paginationContainer.appendChild(btn);
    }
  }

  // Запуск при загрузке страницы
  if (cardsContainer && paginationContainer) {
    displayCards(currentPage);
    setupPagination();
  }
});
// === ИНИЦИАЛИЗАЦИЯ МЕНЕДЖЕРОВ (корзина, избранное) ===
document.addEventListener('DOMContentLoaded', () => {
  // Инициализируем корзину, если класс есть и ещё не создан
  if (typeof CartManager !== 'undefined' && !window.cartManager) {
    window.cartManager = new CartManager();
    console.log('CartManager инициализирован');
  }
  // Инициализируем избранное
  if (typeof FavoritesManager !== 'undefined' && !window.favoritesManager) {
    window.favoritesManager = new FavoritesManager();
    console.log('FavoritesManager инициализирован');
  }
});
