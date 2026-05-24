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