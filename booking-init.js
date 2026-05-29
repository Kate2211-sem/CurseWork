/**
 * 🔗 Инициализация кнопок записи
 * Подключи этот файл после booking.js на любой странице
 */

document.addEventListener('DOMContentLoaded', () => {
  // Инициализируем модуль, если он есть
  if (typeof BookingModule !== 'undefined') {
    BookingModule.init();
  }
  
  // Все кнопки с data-book открывают модалку
  document.querySelectorAll('[data-book]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof BookingModule !== 'undefined') {
        BookingModule.open();
      } else {
        // Если модуль ещё не загружен — пробуем инициализировать
        BookingModule?.init?.();
        BookingModule?.open?.();
      }
    });
  });
});