import { langRu } from './lang_ru.js';
import { langKz } from './lang_kz.js';
import { langEn } from './lang_en.js';

const translations = {
    "ru": langRu,
    "kz": langKz,
    "eng": langEn
};

window.changeLanguage = function(lang) {
    if (!translations[lang]) return;
    
    // Сохраняем выбор в локальное хранилище и обновляем атрибут lang у html
    localStorage.setItem("selectedLanguage", lang);
    document.documentElement.lang = lang === "eng" ? "en" : lang;

    // 1. Стандартный перевод по атрибуту data-i18n
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[lang][key]) {
            if (translations[lang][key].includes("<") || translations[lang][key].includes("&")) {
                el.innerHTML = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }
        }
    });

    // 2. Автоматический перевод текста без атрибутов data-i18n
    // Ищем совпадения с базовым русским словарем langRu на лету
    const selectors = "a, h1, h2, h3, h4, th, p, span, .button-text, .site-info";
    document.querySelectorAll(selectors).forEach(el => {
        // Пропускаем элементы, у которых уже есть data-i18n или дочерние элементы с data-i18n
        if (el.hasAttribute("data-i18n") || el.querySelector("[data-i18n]")) return;

        const originalText = el.textContent.trim();
        if (!originalText) return;

        // Сравниваем текст на странице с русским словарем
        for (const [key, ruValue] of Object.entries(langRu)) {
            if (ruValue.trim() === originalText && translations[lang][key]) {
                const targetText = translations[lang][key];
                if (targetText.includes("<") || targetText.includes("&")) {
                    el.innerHTML = targetText;
                } else {
                    el.textContent = targetText;
                }
                break;
            }
        }
    });

    // 3. Автоперевод alt у изображений (например, логотипа)
    const images = document.querySelectorAll("img");
    images.forEach(img => {
        const alt = img.getAttribute("alt");
        if (!alt) return;
        for (const [key, ruValue] of Object.entries(langRu)) {
            if (ruValue.trim() === alt.trim() && translations[lang][key]) {
                img.alt = translations[lang][key];
                break;
            }
        }
    });
};

// Автоматический запуск перевода при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    const savedLang = localStorage.getItem("selectedLanguage") || "ru";
    const selectElement = document.getElementById("language-select");
    
    if (selectElement) {
        selectElement.value = savedLang;
    }
    
    window.changeLanguage(savedLang);
});
