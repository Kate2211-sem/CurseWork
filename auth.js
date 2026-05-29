document.addEventListener('DOMContentLoaded', () => {
    // === СЕЛЕКТОРЫ ===
    const regForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const regBtn = regForm.querySelector('button[type="submit"]');
    const loginBtn = loginForm.querySelector('button[type="submit"]');
    
    // Поля регистрации
    const fields = {
        phone: document.getElementById('reg-phone'),
        email: document.getElementById('reg-email'),
        dob: document.getElementById('reg-dob'),
        fio: document.getElementById('reg-fio'),
        password: document.getElementById('reg-password'),
        confirm: document.getElementById('reg-password-confirm'),
        nickname: document.getElementById('reg-nickname'),
        agreement: document.getElementById('reg-agreement')
    };

    const pwdModeRadios = document.querySelectorAll('input[name="pwd-mode"]');
    const refreshBtn = document.getElementById('refresh-nickname');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');

    // === СОСТОЯНИЕ ===
    let nicknameRefreshCount = 0;
    let validationState = {
        phone: false, email: false, dob: false, fio: false,
        password: false, confirm: false, nickname: false, agreement: false
    };

    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
    const showError = (input, msg) => {
        const group = input.closest('.input-group');
        let errSpan = group.querySelector('.error-message');
        if (!errSpan) {
            errSpan = document.createElement('span');
            errSpan.classList.add('error-message');
            group.appendChild(errSpan);
        }
        errSpan.textContent = msg;
        errSpan.style.color = '#e74c3c';
    };

    const clearError = (input) => {
        const group = input.closest('.input-group');
        const errSpan = group.querySelector('.error-message');
        if (errSpan) errSpan.textContent = '';
    };

    const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    const validatePhone = (val) => /^\+375\d{9}$/.test(val.replace(/\s/g, ''));
    const validateAge = (val) => {
        const today = new Date();
        const birth = new Date(val);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age >= 16;
    };
    const validatePassword = async (val) => {
    if (!val || val.length === 0) return 'Введите пароль';
    if (val.length < 8 || val.length > 20) return 'Пароль от 8 до 20 символов';
    if (!/[A-Z]/.test(val)) return 'Нужна хотя бы одна заглавная буква';
    if (!/[a-z]/.test(val)) return 'Нужна хотя бы одна строчная буква';
    if (!/\d/.test(val)) return 'Нужна хотя бы одна цифра';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(val)) return 'Нужен спецсимвол';
    
    return null; // Всё OK
};

    const generateNickname = () => {
        const adj = ['Cool', 'Bright', 'Swift', 'Happy', 'Smart', 'Lucky', 'Magic', 'Cosmic'];
        const noun = ['Fox', 'Star', 'Wave', 'Dream', 'Pixel', 'Bloom', 'Spark', 'Zen'];
        const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
        return `${rand(adj)}${rand(noun)}${Math.floor(10 + Math.random() * 90)}`;
    };

    const updateSubmitState = () => {
        const isValid = Object.values(validationState).every(v => v === true);
        regBtn.disabled = !isValid;
        regBtn.style.opacity = isValid ? '1' : '0.6';
    };

    // === ВАЛИДАЦИЯ ПОЛЕЙ ===
    const validateField = async (field) => {
        const val = field.value.trim();
        let error = null;

        switch (field) {
            case fields.phone:
                error = validatePhone(val) ? null : 'Формат: +375XXXXXXXXX (только РБ)';
                break;
            case fields.email:
                error = validateEmail(val) ? null : 'Некорректный email';
                break;
            case fields.dob:
                error = validateAge(val) ? null : 'Регистрация доступна с 16 лет';
                break;
           // В js/auth.js найди валидацию поля fio и замени на:
case fields.fio:
    // Разрешает: "Иванов Иван" или "Иванов Иван Иванович" (кириллица, пробелы)
    const fioRegex = /^[А-Яа-яЁё]+(\s[А-Яа-яЁё]+){1,2}$/;
    error = fioRegex.test(val) ? null : 'Введите Фамилию и Имя (Отчество по желанию)';
    break;
            case fields.password:
                error = await validatePassword(val);
                // Если пароль изменился, проверим подтверждение
                if (fields.confirm.value) await validateField(fields.confirm);
                break;
            case fields.confirm:
                if (!fields.password.value) error = 'Сначала введите пароль';
                else if (val !== fields.password.value) error = 'Пароли не совпадают';
                break;
            case fields.agreement:
                error = !field.checked ? 'Необходимо согласие' : null;
                break;
            case fields.nickname:
                error = val.length >= 2 ? null : 'Минимум 2 символа';
                break;
        }

        if (error) {
            showError(field, error);
            validationState[field.id.replace('reg-', '') === 'password-confirm' ? 'confirm' : field.id.replace('reg-', '')] = false;
        } else {
            clearError(field);
            validationState[field.id.replace('reg-', '') === 'password-confirm' ? 'confirm' : field.id.replace('reg-', '')] = true;
        }
        updateSubmitState();
    };

    // Навешиваем обработчики `input` на все поля
    Object.values(fields).forEach(field => {
        if (field) {
            field.addEventListener('input', () => validateField(field));
            field.addEventListener('change', () => validateField(field));
        }
    });

   // === ПЕРЕКЛЮЧЕНИЕ СПОСОБА ПАРОЛЯ ===
pwdModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        const isAuto = e.target.value === 'auto';
        
        if (isAuto) {
            // 🔹 АВТО-режим: генерируем пароль
            const autoPassword = generateNickname() + 'Aa1!'; // Добавляем спецсимвол для валидности
            fields.password.value = autoPassword;
            fields.confirm.value = autoPassword;
            fields.password.readOnly = true;
            fields.confirm.readOnly = true;
            
            // Сбрасываем ошибки и ставим валидацию в ✅
            clearError(fields.password);
            clearError(fields.confirm);
            validationState.password = true;
            validationState.confirm = true;
        } else {
            // 🔹 РУЧНОЙ режим: очищаем поля и сбрасываем валидацию
            fields.password.value = '';
            fields.confirm.value = '';
            fields.password.readOnly = false;
            fields.confirm.readOnly = false;
            
            // ❗ Сбрасываем валидацию
            validationState.password = false;
            validationState.confirm = false;
            
            // Убираем ошибку, чтобы не мешала
            clearError(fields.password);
            clearError(fields.confirm);
        }
        
        updateSubmitState(); // Обновляем состояние кнопки
    });
});
    // === ГЕНЕРАЦИЯ НИКНЕЙМА ===
    fields.nickname.value = generateNickname();
    fields.nickname.readOnly = true;

    refreshBtn.addEventListener('click', () => {
        nicknameRefreshCount++;
        if (nicknameRefreshCount >= 5) {
            fields.nickname.readOnly = false;
            fields.nickname.value = '';
            fields.nickname.placeholder = 'Введите никнейм самостоятельно';
            refreshBtn.disabled = true;
            refreshBtn.title = 'Достигнут лимит генераций';
        } else {
            fields.nickname.value = generateNickname();
        }
        validateField(fields.nickname);
    });

    // === ОТПРАВКА РЕГИСТРАЦИИ ===
   // === ОТПРАВКА РЕГИСТРАЦИИ ===
regForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (regBtn.disabled) return;

    const userData = {
        phone: fields.phone.value.trim(),
        email: fields.email.value.trim(),
        dob: fields.dob.value,
        fio: fields.fio.value.trim(),
        password: fields.password.value,
        nickname: fields.nickname.value.trim(),
        role: 'user',
        createdAt: new Date().toISOString()
    };

    try {
        // 1. Проверка на дубликат
        const checkRes = await fetch(`http://localhost:3000/users?phone=${userData.phone}&email=${userData.email}`);
        const exists = await checkRes.json();
        
        if (exists.length > 0) {
            alert('Пользователь с таким телефоном или email уже существует.');
            return;
        }

        // 2. Создаём пользователя
        const res = await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        // 3. ✅ УСПЕШНАЯ РЕГИСТРАЦИЯ — только этот блок нужен здесь!
        if (res.ok) {
            const newUser = await res.json(); // Получаем пользователя с ID от сервера
            
            // Сохраняем сессию
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            localStorage.setItem('isLoggedIn', 'true');
            
            // Редирект на главную
            window.location.href = 'main.html';
        } else {
            alert('Ошибка при регистрации. Попробуйте ещё раз.');
        }
        
    } catch (err) {
        console.error('Ошибка регистрации:', err);
        alert('Ошибка сервера. Проверьте, запущен ли json-server.');
    }
});

    // === АВТОРИЗАЦИЯ (исправленная) ===
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = loginEmail.value.trim();
    const pass = loginPassword.value;

    if (!identifier || !pass) {
        alert('Заполните все поля');
        return;
    }

    try {
        // 🔍 Ищем по телефону ИЛИ по email (два отдельных запроса)
        const phoneRes = await fetch(`http://localhost:3000/users?phone=${identifier}`);
        const emailRes = await fetch(`http://localhost:3000/users?email=${identifier}`);
        
        const phoneUsers = await phoneRes.json();
        const emailUsers = await emailRes.json();
        
        // Объединяем результаты
        const users = [...phoneUsers, ...emailUsers];
        
        // Ищем пользователя с совпадающим паролем
        const foundUser = users.find(u => u.password === pass);
        
        if (foundUser) {
            localStorage.setItem('currentUser', JSON.stringify(foundUser));
            localStorage.setItem('isLoggedIn', 'true');
            
            alert(`Добро пожаловать, ${foundUser.fio}!`);
            window.location.href = 'main.html';
        } else {
            alert('Неверный логин или пароль');
            // 🔍 Отладка: раскомментируй, чтобы видеть, что нашлось
            // console.log('🔎 Найдено пользователей:', users);
        }
    } catch (err) {
        console.error('Ошибка входа:', err);
        alert('Ошибка сервера');
    }
});
    // === ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ===
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-form`).classList.add('active');
        });
    });
});