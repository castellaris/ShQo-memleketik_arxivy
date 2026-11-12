// Функция навигации назад
function NavigateBack() {
    window.history.back();
}

// Единое управление версией для слабовидящих, шрифтами и серверным API
document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("accessibility-toggle");
    const increaseBtn = document.getElementById("font-increase");
    const decreaseBtn = document.getElementById("font-decrease");
    
    let currentFontSize = parseInt(localStorage.getItem("fontSize")) || 16;
    let isAccessibilityMode = localStorage.getItem("accessibility") === "enabled" || localStorage.getItem("accessibilityMode") === "true";

    function applyAccessibilitySettings() {
        if (isAccessibilityMode) {
            document.documentElement.classList.add("accessibility-mode");
            document.body.classList.add("accessibility-mode");
        } else {
            document.documentElement.classList.remove("accessibility-mode");
            document.body.classList.remove("accessibility-mode");
        }
        document.body.style.fontSize = currentFontSize + "px";
    }

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            isAccessibilityMode = !isAccessibilityMode;
            localStorage.setItem("accessibility", isAccessibilityMode ? 'enabled' : 'disabled');
            localStorage.setItem("accessibilityMode", isAccessibilityMode);
            applyAccessibilitySettings();
        });
    }

    if (increaseBtn) {
        increaseBtn.addEventListener("click", () => {
            if (currentFontSize < 24) {
                currentFontSize += 2;
                localStorage.setItem("fontSize", currentFontSize);
                applyAccessibilitySettings();
            }
        });
    }

    if (decreaseBtn) {
        decreaseBtn.addEventListener("click", () => {
            if (currentFontSize > 12) {
                currentFontSize -= 2;
                localStorage.setItem("fontSize", currentFontSize);
                applyAccessibilitySettings();
            }
        });
    }

    // Применение сохраненных настроек при загрузке
    applyAccessibilitySettings();

    // Обработка отправки формы опроса
    const answerOkBtn = document.getElementById("answer-ok");
    if (answerOkBtn) {
        answerOkBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const selectedOption = document.querySelector('input[name="answer[]"]:checked');
            if (selectedOption) {
                alert("Спасибо за Ваш голос!");
            } else {
                alert("Пожалуйста, выберите вариант ответа.");
            }
        });
    }

    // Интеграция с бэкендом: отправка формы гостевой книги
    const guestbookForm = document.querySelector('form[action="#"]');
    if (guestbookForm && document.getElementById("gbMsg")) {
        guestbookForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = {
                gbName: document.getElementById("gbName").value,
                gbEmail: document.getElementById("gbEmail").value,
                gbCountry: document.getElementById("gbCountry").value,
                gbMsg: document.getElementById("gbMsg").value
            };

            try {
                const response = await fetch('/api/guestbook', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const result = await response.json();
                if (response.ok) {
                    alert("Отзыв успешно отправлен!");
                    location.reload();
                } else {
                    alert("Ошибка: " + (result.error || "Не удалось отправить отзыв"));
                }
            } catch (err) {
                console.error("Ошибка сети:", err);
            }
        });
    }

    // --- Автоматическая загрузка данных с сервера для различных страниц ---

    // 1. Загрузка глоссария
    const glossaryContainer = document.querySelector('.site-page table tbody');
    if (glossaryContainer && window.location.pathname.includes('glossary.html')) {
        fetch('/api/glossary')
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    glossaryContainer.innerHTML = '';
                    data.forEach(item => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td style="width: 25%;"><strong>${item.term}</strong></td>
                            <td>${item.definition}</td>
                        `;
                        glossaryContainer.appendChild(row);
                    });
                }
            })
            .catch(err => console.error('Ошибка загрузки глоссария с сервера:', err));
    }

    // 2. Загрузка фотогалереи
    const galleryContainer = document.querySelector('.list-items');
    if (galleryContainer && window.location.pathname.includes('gallery.html')) {
        fetch('/api/gallery')
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    galleryContainer.innerHTML = '';
                    data.forEach(album => {
                        const col = document.createElement('div');
                        col.className = 'col-md-4 col-sm-6';
                        col.innerHTML = `
                            <div class="list-item card h-100 shadow-sm" data-id="${album.album_id}" onclick="ShowAlbum(this)" style="cursor: pointer;">
                                <div class="item-content card-img-top" style="height: 190px; background-size: cover; background-position: center; background-image:url('${album.thumb_url}')"></div>
                                <div class="card-body p-2">
                                    <header class="item-title card-title fs-6">${album.title}</header>
                                </div>
                            </div>
                        `;
                        galleryContainer.appendChild(col);
                    });
                }
            })
            .catch(err => console.error('Ошибка загрузки галереи с сервера:', err));
    }

    // 3. Загрузка метрических книг
    const metricsTableBody = document.querySelector('.site-page table tbody');
    if (metricsTableBody && (window.location.pathname.includes('metrics.html') || window.location.pathname.includes('metrics_2.html'))) {
        fetch('/api/metrics')
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    metricsTableBody.innerHTML = '';
                    data.forEach(item => {
                        const row = document.createElement('tr');
                        let notesContent = item.notes ? item.notes : '&nbsp;';
                        row.innerHTML = `
                            <td style="border-color: #990000; text-align: center;"><strong>${item.church_name}</strong></td>
                            <td style="border-color: #990000; text-align: center;">${item.date_range}</td>
                            <td style="border-color: #990000; text-align: center;">${item.location}</td>
                            <td style="border-color: #990000;">${notesContent}</td>
                        `;
                        metricsTableBody.appendChild(row);
                    });
                }
            })
            .catch(err => console.error('Ошибка при загрузке метрических книг с сервера:', err));
    }

});

document.addEventListener("DOMContentLoaded", () => {
    // Создаем и внедряем стили для кнопок навигации динамически
    const style = document.createElement('style');
    style.innerHTML = `
        .site-nav-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .site-nav-btn {
            background-color: #1b365d;
            color: #ffffff;
            border: none;
            border-radius: 50%;
            width: 45px;
            height: 45px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            transition: background-color 0.3s, transform 0.2s;
            text-decoration: none;
            font-size: 18px;
        }
        .site-nav-btn:hover {
            background-color: #2c4d7d;
            transform: scale(1.05);
            color: #ffffff;
        }
    `;
    document.head.appendChild(style);

    // Создаем контейнер для кнопок
    const navContainer = document.createElement('div');
    navContainer.className = 'site-nav-container';

    // Кнопка «На главную» (перенаправляет на index.html)
    const homeBtn = document.createElement('a');
    homeBtn.href = 'index.html';
    homeBtn.className = 'site-nav-btn';
    homeBtn.title = 'На главную';
    homeBtn.innerHTML = '🏠';
    navContainer.appendChild(homeBtn);

    // Кнопка «Назад» (возврат на предыдущую страницу в истории браузера)
    const backBtn = document.createElement('button');
    backBtn.className = 'site-nav-btn';
    backBtn.title = 'Назад';
    backBtn.innerHTML = '←';
    backBtn.onclick = () => {
        window.history.back();
    };
    navContainer.appendChild(backBtn);

    // Добавляем панель навигации в тело страницы
    document.body.appendChild(navContainer);
});

document.addEventListener("DOMContentLoaded", function () {
    // Удаляем старую кнопку, если она осталась от прошлых попыток
    const oldBtn = document.getElementById("floating-admin-btn");
    if (oldBtn) oldBtn.remove();

    // Создаем элемент ссылки
    const adminBtn = document.createElement("a");
    adminBtn.id = "floating-admin-btn";
    adminBtn.href = "admin.html";
    adminBtn.title = "Панель администратора";
    
    // Задаем стили напрямую через JS, чтобы они точно перекрыли любые другие правила
    adminBtn.style.cssText = `
        position: fixed !important;
        bottom: 190px !important;
        right: 15px !important;
        z-index: 999999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 50px !important;
        height: 50px !important;
        background-color: #1a365d !important;
        border-radius: 50% !important;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3) !important;
        cursor: pointer !important;
        text-decoration: none !important;
    `;

    // Иконка шестеренки (SVG) внутри кнопки
    adminBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24px" height="24px">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.3L5.24,5.34c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.88 c-0.11,0.21-0.06,0.47,0.12,0.61l2.03,1.58c-0.05,0.3-0.07,0.62-0.07,0.94s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.11-0.21,0.06-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>
    `;

    // Эффект наведения мыши
    adminBtn.onmouseover = () => adminBtn.style.opacity = '0.8';
    adminBtn.onmouseout = () => adminBtn.style.opacity = '1';

    // Добавляем кнопку в тело страницы
    document.body.appendChild(adminBtn);
});

document.addEventListener("DOMContentLoaded", function () {
    // 1. Удаляем старый виджет, если он остался от предыдущих запусков
    const oldAiBtn = document.getElementById("floating-ai-assistant-btn");
    if (oldAiBtn) oldAiBtn.remove();
    const oldChatWindow = document.getElementById("ai-chat-window");
    if (oldChatWindow) oldChatWindow.remove();

    // 2. Создаем плавающую кнопку ИИ-ассистента
    const aiBtn = document.createElement("button");
    aiBtn.id = "floating-ai-assistant-btn";
    aiBtn.title = "ИИ-помощник по сайту";
    aiBtn.style.cssText = `
        position: fixed !important;
        bottom: 125px !important;
        right: 15px !important;
        z-index: 999999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 50px !important;
        height: 50px !important;
        background-color: #1a365d !important;
        border: 2px solid #ffffff !important;
        border-radius: 50% !important;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3) !important;
        cursor: pointer !important;
        outline: none !important;
        transition: transform 0.2s ease;
    `;
    aiBtn.onmouseover = () => aiBtn.style.transform = 'scale(1.05)';
    aiBtn.onmouseout = () => aiBtn.style.transform = 'scale(1)';

    aiBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24px" height="24px">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0-2-.9-2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
        </svg>
    `;

    // 3. Создаем окно чата с блоком подсказок
    const chatWindow = document.createElement("div");
    chatWindow.id = "ai-chat-window";
    chatWindow.style.cssText = `
        position: fixed !important;
        bottom: 185px !important;
        right: 15px !important;
        width: 340px !important;
        height: 480px !important;
        background: #ffffff !important;
        border-radius: 12px !important;
        box-shadow: 0 5px 25px rgba(0,0,0,0.25) !important;
        z-index: 999999 !important;
        display: none !important;
        flex-direction: column !important;
        overflow: hidden !important;
        font-family: Arial, sans-serif !important;
        border: 1px solid #cbd5e1;
    `;

    chatWindow.innerHTML = `
        <div style="background: #1a365d; color: white; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; font-size: 14px;">🤖 ИИ-Архивариус</span>
            <button id="ai-close-chat" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 0 5px;">&times;</button>
        </div>
        <div id="ai-chat-messages" style="flex: 1; padding: 12px; overflow-y: auto; font-size: 13px; background: #f8fafc; display: flex; flex-direction: column; gap: 8px;">
            <div style="background: #e2e8f0; color: #1e293b; padding: 10px 12px; border-radius: 8px; max-width: 90%; line-height: 1.4;">
                Здравствуйте! Я виртуальный помощник архива. Выберите подсказку ниже или задайте вопрос в чате:
            </div>
        </div>
        <!-- Быстрые подсказки (чипсы) -->
        <div style="padding: 6px 10px; background: #f1f5f9; border-top: 1px solid #e2e8f0; display: flex; flex-wrap: wrap; gap: 5px;">
            <button class="ai-chip" data-text="Где найти личные фонды?">📂 Личные фонды</button>
            <button class="ai-chip" data-text="Покажи метрические книги">📖 Метрические книги</button>
            <button class="ai-chip" data-text="Виртуальные выставки архива">🖼️ Выставки</button>
            <button class="ai-chip" data-text="Как с вами связаться (контакты)?">📞 Контакты</button>
        </div>
        <div style="padding: 10px; background: #ffffff; border-top: 1px solid #e2e8f0; display: flex; gap: 6px;">
            <input type="text" id="ai-chat-input" placeholder="Введите ваш вопрос..." style="flex: 1; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; outline: none;">
            <button id="ai-chat-send" style="background: #1a365d; color: white; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: bold;">Спросить</button>
        </div>
    `;

    // Стили для чипсов-подсказок
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        .ai-chip {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            color: #1a365d;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .ai-chip:hover {
            background: #1a365d;
            color: #ffffff;
            border-color: #1a365d;
        }
    `;
    document.head.appendChild(styleSheet);
    document.body.appendChild(aiBtn);
    document.body.appendChild(chatWindow);

    // 4. Управление видимостью окна чата
    aiBtn.onclick = () => {
        const isVisible = chatWindow.style.display === 'flex';
        chatWindow.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) document.getElementById('ai-chat-input').focus();
    };

    document.getElementById('ai-close-chat').onclick = () => {
        chatWindow.style.display = 'none';
    };

    const messagesContainer = document.getElementById('ai-chat-messages');
    const inputField = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send');

    // 5. Настройки Google AI Studio (Gemini API)
    const API_KEY = "AQ.Ab8RN6L-EWaCc123v6D8VcckAql2YDqVRc9LOwgjFahsL7cAGQ"; 
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    async function askAI(userQuery) {
        const systemPrompt = `Ты — вежливый виртуальный помощник Государственного архива Восточно-Казахстанской области. 
Помогай посетителям находить разделы сайта. Используй ссылки в ответах:
- Личные фонды: <a href="funds.html" style="color: #1a365d; font-weight: bold;">Личные фонды</a>
- Метрические книги: <a href="metrics.html" style="color: #1a365d; font-weight: bold;">Метрические книги</a>
- Выставки: <a href="exhibitions.html" style="color: #1a365d; font-weight: bold;">Виртуальные выставки</a>
- Гостевая книга: <a href="guestbook.html" style="color: #1a365d; font-weight: bold;">Гостевая книга</a>
- Контакты: <a href="contacts.html" style="color: #1a365d; font-weight: bold;">Контакты</a>
- Календарь дат: <a href="calendar.html" style="color: #1a365d; font-weight: bold;">Календарь памятных дат</a>
- Документы: <a href="documents.html" style="color: #1a365d; font-weight: bold;">Документы</a>

Отвечай кратко, вежливо и на русском языке. Вопрос посетителя: ${userQuery}`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: systemPrompt }
                            ]
                        }
                    ]
                })
            });

            if (!response.ok) throw new Error('Ошибка запроса к Gemini API');

            const data = await response.json();
            return data.candidates[0].content.parts[0].text.trim();
        } catch (error) {
            console.error(error);
            return fallbackSearch(userQuery);
        }
    }

    // Резервный поиск по ключевым словам (на случай, если ключ не введен)
    function fallbackSearch(query) {
        const q = query.toLowerCase();
        if (q.includes('фонд')) return 'Рекомендуем перейти в раздел <a href="funds.html" style="color: #1a365d; font-weight: bold;">Личные фонды</a>.';
        if (q.includes('метр') || q.includes('книг')) return 'Информация по книгам доступна в разделе <a href="metrics.html" style="color: #1a365d; font-weight: bold;">Метрические книги</a>.';
        if (q.includes('выстав')) return 'Виртуальные экспозиции в разделе <a href="exhibitions.html" style="color: #1a365d; font-weight: bold;">Виртуальные выставки</a>.';
        if (q.includes('контакт')|| q.includes('адрес')) return 'Наши данные на странице <a href="contacts.html" style="color: #1a365d; font-weight: bold;">Контакты</a>.';
        return 'Воспользуйтесь меню сайта для поиска нужного раздела.';
    }

    async function handleQueryText(queryText) {
        if (!queryText.trim()) return;

        // Сообщение пользователя
        const userMsg = document.createElement('div');
        userMsg.style.cssText = "background: #1a365d; color: white; padding: 8px 12px; border-radius: 8px; align-self: flex-end; max-width: 90%; word-break: break-word;";
        userMsg.textContent = queryText;
        messagesContainer.appendChild(userMsg);

        inputField.value = '';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Индикатор загрузки
        const loadingMsg = document.createElement('div');
        loadingMsg.id = "ai-loading";
        loadingMsg.style.cssText = "background: #e2e8f0; color: #64748b; padding: 8px 12px; border-radius: 8px; align-self: flex-start; font-style: italic;";
        loadingMsg.textContent = "ИИ формирует ответ...";
        messagesContainer.appendChild(loadingMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        const aiAnswer = await askAI(queryText);

        document.getElementById("ai-loading")?.remove();

        // Вывод ответа ИИ
        const aiMsg = document.createElement('div');
        aiMsg.style.cssText = "background: #e2e8f0; color: #1e293b; padding: 10px 12px; border-radius: 8px; align-self: flex-start; max-width: 90%; word-break: break-word; line-height: 1.4;";
        aiMsg.innerHTML = aiAnswer;
        messagesContainer.appendChild(aiMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendBtn.onclick = () => handleQueryText(inputField.value);
    inputField.onkeypress = (e) => {
        if (e.key === 'Enter') handleQueryText(inputField.value);
    };

    // Обработка кликов по подсказкам
    document.querySelectorAll('.ai-chip').forEach(chip => {
        chip.onclick = () => {
            handleQueryText(chip.getAttribute('data-text'));
        };
    });
});

// Логика для Гостевой книги (guestbook.html)
document.addEventListener("DOMContentLoaded", function () {
    const guestListContainer = document.getElementById("guest-list");
    const guestbookForm = document.getElementById("guestbook-form");

    // Функция загрузки отзывов с сервера
    async function loadGuestbookEntries() {
        if (!guestListContainer) return;
        try {
            const response = await fetch('/api/guestbook'); // Эндпоинт вашего server.js
            if (!response.ok) throw new Error('Ошибка загрузки отзывов');
            const entries = await response.json();

            if (entries.length === 0) {
                guestListContainer.innerHTML = '<p class="text-muted">Пока нет ни одного отзыва. Будьте первыми!</p>';
                return;
            }

            guestListContainer.innerHTML = '<h3 class="mb-3">Оставленные отзывы:</h3>';
            entries.forEach(entry => {
                const item = document.createElement('div');
                item.className = "card mb-3 shadow-sm";
                item.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title text-primary">${escapeHtml(entry.name || entry.gbName)} <small class="text-muted fs-6">(${escapeHtml(entry.country || entry.gbCountry)})</small></h5>
                        <h6 class="card-subtitle mb-2 text-muted fs-7">${escapeHtml(entry.email || entry.gbEmail)}</h6>
                        <p class="card-text mt-2">${escapeHtml(entry.message || entry.gbMsg)}</p>
                    </div>
                `;
                guestListContainer.appendChild(item);
            });
        } catch (error) {
            console.error(error);
            guestListContainer.innerHTML = '<p class="text-danger">Не удалось загрузить отзывы из базы данных.</p>';
        }
    }

    // Обработка отправки формы отзыва
    if (guestbookForm) {
        guestbookForm.onsubmit = async function (e) {
            e.preventDefault();

            const formData = {
                gbName: document.getElementById('gbName').value,
                gbEmail: document.getElementById('gbEmail').value,
                gbCountry: document.getElementById('gbCountry').value,
                gbMsg: document.getElementById('gbMsg').value
            };

            try {
                const response = await fetch('/api/guestbook', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    guestbookForm.reset();
                    loadGuestbookEntries(); // Перезагружаем список отзывов
                    alert('Спасибо! Ваш отзыв успешно добавлен.');
                } else {
                    alert('Ошибка при отправке отзыва.');
                }
            } catch (error) {
                console.error(error);
                alert('Ошибка соединения с сервером.');
            }
        };
    }

    // Вспомогательная функция защиты от XSS
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    // Запускаем загрузку при открытии страницы гостевой книги
    if (guestListContainer) {
        loadGuestbookEntries();
    }
});