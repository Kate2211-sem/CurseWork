// База данных полного прайс-листа (поддерживает RU и EN)
const priceData = {
    women: {
        title: { ru: "Женский зал — Полный прайс", en: "Women's Hall — Full Price List" },
        services: [
            { name: { ru: "Стрижка модельная", en: "Model haircut" }, time: "45-60 мин", price: "от 20 руб." },
            { name: { ru: "Стрижка кончиков", en: "Trim" }, time: "20 мин", price: "15 руб." },
            { name: { ru: "Окрашивание однотонное", en: "Single-tone coloring" }, time: "90-120 мин", price: "от 60 руб." },
            { name: { ru: "Окрашивание сложное (Airtouch/Шатуш)", en: "Advanced coloring" }, time: "180-240 мин", price: "от 110 руб." },
            { name: { ru: "Укладка дневная / Локоны", en: "Day styling / Curls" }, time: "40 мин", price: "от 25 руб." },
            { name: { ru: "Свадебная прическа", en: "Wedding hairstyle" }, time: "90 мин", price: "от 70 руб." },
            { name: { ru: "Ботокс для волос (уход)", en: "Hair Botox treatment" }, time: "120 мин", price: "от 55 руб." }
        ]
    },
    men: {
        title: { ru: "Мужской зал — Полный прайс", en: "Men's Hall — Full Price List" },
        services: [
            { name: { ru: "Стрижка модельная", en: "Model haircut" }, time: "30-45 мин", price: "15 руб." },
            { name: { ru: "Борода и усы (моделирование)", en: "Beard & Mustache" }, time: "20 мин", price: "15 руб." },
            { name: { ru: "Стрижка машинкой (1-2 насадки)", en: "Clipper cut" }, time: "15 мин", price: "5 руб." },
            { name: { ru: "Камуфлирование седины", en: "Grey camo" }, time: "20 min", price: "25 руб." },
            { name: { ru: "Комплекс (Стрижка + Борода)", en: "Combo (Haircut + Beard)" }, time: "60 мин", price: "25 руб." },
            { name: { ru: "Детская стрижка (до 10 лет)", en: "Kids haircut" }, time: "30 мин", price: "12 руб." }
        ]
    },
    manicure: {
        title: { ru: "Ногтевой сервис — Полный прайс", en: "Nail Service — Full Price List" },
        services: [
            { name: { ru: "Аппаратный маникюр (без покрытия)", en: "E-file manicure" }, time: "30 мин", price: "20 руб." },
            { name: { ru: "Маникюр + Лак (обычный)", en: "Without gel polish" }, time: "40 мин", price: "15 руб." },
            { name: { ru: "Маникюр + Гель-лак (однотонный)", en: "With gel polish" }, time: "90 мин", price: "от 40 руб." },
            { name: { ru: "Наращивание ногтей (гель/акригель)", en: "Nail extension" }, time: "150 мин", price: "от 60 руб." },
            { name: { ru: "Дизайн 1 ногтя (френч/рисунок)", en: "Nail art (1 nail)" }, time: "5-10 мин", price: "от 2 руб." },
            { name: { ru: "Снятие чужого покрытия", en: "Gel removal" }, time: "20 мин", price: "5 руб." }
        ]
    },
    brow: {
        title: { ru: "Brow-сервис — Полный прайс", en: "Brow Service — Full Price List" },
        services: [
            { name: { ru: "Коррекция бровей (пинцет/воск)", en: "Eyebrow shaping" }, time: "20 мин", price: "15 руб." },
            { name: { ru: "Коррекция + Окрашивание (хна/краска)", en: "Shape & Tint" }, time: "40 мин", price: "30 руб." },
            { name: { ru: "Долговременная укладка (ДУ) + комплекс", en: "Shape+Tint+Lamination" }, time: "60 мин", price: "50 руб." },
            { name: { ru: "Перманентный макияж (пудровое напыление)", en: "Permanent makeup" }, time: "120 мин", price: "250 руб." },
            { name: { ru: "Окрашивание ресниц", en: "Eyelash tinting" }, time: "15 мин", price: "10 руб." }
        ]
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("price-modal");
    const modalTitle = document.getElementById("price-modal-title");
    const modalBody = document.getElementById("price-modal-body");
    const closeBtn = document.getElementById("price-modal-close");

    // Исправленная функция определения текущего языка
    function getCurrentLang() {
        // Проверяем, какой язык сейчас установлен в теге <html>
        const htmlLang = document.documentElement.lang;
        if (htmlLang === 'en' || htmlLang === 'ru') {
            return htmlLang;
        }

        // Запасной вариант: проверяем текст на кнопке переключения языка
        const langBtn = document.querySelector('.tool-btn[data-tool="lang"]');
        if (langBtn) {
            const btnText = langBtn.textContent.trim().toUpperCase();
            // Если на кнопке написано "EN", значит сейчас сайт на РУССКОМ (кнопка предлагает переключить на EN)
            // Если на кнопке написано "RU", значит сейчас сайт на АНГЛИЙСКОМ
            return btnText === "EN" ? "ru" : "en";
        }
        
        return "ru"; // Если ничего не нашлось, по умолчанию русский
    }

    // Функция рендера таблицы
    function openPriceModal(category) {
        const lang = getCurrentLang();
        const data = priceData[category];

        if (!data) return;

        // Заголовок
        modalTitle.textContent = data.title[lang];
        modalTitle.setAttribute("data-ru", data.title.ru);
        modalTitle.setAttribute("data-en", data.title.en);

        // Строки таблицы
        modalBody.innerHTML = "";
        data.services.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td data-ru="${item.name.ru}" data-en="${item.name.en}">${lang === 'ru' ? item.name.ru : item.name.en}</td>
                <td>${item.time}</td>
                <td>${item.price}</td>
            `;
            modalBody.appendChild(tr);
        });

        // Показываем окно
        modal.classList.add("is-active");
        document.body.style.overflow = "hidden"; // Запрещаем прокрутку фона
    }

    function closeModal() {
        modal.classList.remove("is-active");
        document.body.style.overflow = "";
    }

    // Навешиваем клики на твои кнопки с главной страницы
    document.querySelector(".visit-us__btn")?.addEventListener("click", () => openPriceModal("women"));
    document.querySelector(".men-hall__btn")?.addEventListener("click", () => openPriceModal("men"));
    document.querySelector(".manicure__btn")?.addEventListener("click", () => openPriceModal("manicure"));
    document.querySelector(".brow-service__btn")?.addEventListener("click", () => openPriceModal("brow"));

    // Закрытие
    closeBtn?.addEventListener("click", closeModal);
    modal?.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    // Связка кнопки внутри модалки с твоим скриптом онлайн-записи
    document.getElementById("price-modal-book")?.addEventListener("click", () => {
        closeModal();
        const mainBookingBtn = document.getElementById("btn-book-appointment");
        if (mainBookingBtn) mainBookingBtn.click(); // Имитируем нажатие на главную запись
    });
});