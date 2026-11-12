const express = require('express');
const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Указываем, что все HTML-файлы и статические ресурсы находятся в папке public
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к облачной базе данных Turso
const db = createClient({
    url: 'libsql://database-castellaris.aws-eu-north-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTQ0OTU0OTUsImlkIjoiMDFhMWQwNDMtMDgwMS03M2U3LWIxNDctMzM4MTVhMDQyMTgxIiwia2lkIjoiNEdFM0RobkpEYmpabDRmX2dhYl80dmFYdG9JYnJMWlYtd3BNb1JpSnI1OCIsInJpZCI6IjJmZmQxNTk2LTQ1ZjMtNGYzNi1hNTc0LTNmMmU1ZmVjMmY5NSJ9.ZX5tUPxYqERHhJi3bXKAgyJhWWhO_G8XiSfeXyP0m0sDnl1o7BVNvXuP6VVH7oeWgP02-XTsgyJxUShnvV3cAA'
});

console.log('Подключение к облачной базе данных Turso настроено.');
initDatabase();

async function initDatabase() {
    try {
        // 1. Гостевая книга
        await db.execute(`CREATE TABLE IF NOT EXISTS guestbook (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            country TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        let gbCount = await db.execute("SELECT COUNT(*) as count FROM guestbook");
        if (gbCount.rows[0].count === 0) {
            await db.execute({
                sql: "INSERT INTO guestbook (name, email, country, message, created_at) VALUES (?, ?, ?, ?, ?)",
                args: ["Шолпан", "sbai335577@gmail.com", "Казахстан", "Добрый день! Регулярно пользуюсь вашим сайтом...", "20.10.2026 20:32:00"]
            });
            await db.execute({
                sql: "INSERT INTO guestbook (name, email, country, message, created_at) VALUES (?, ?, ?, ?, ?)",
                args: ["Зарима", "dzhankhotova.zarima@mail.ru", "Казахстан", "Прошу выдать дубликат свидетельства о рождении...", "20.08.2026 21:38:31"]
            });
        }

        // 2. Личные фонды
        await db.execute(`CREATE TABLE IF NOT EXISTS personal_funds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            founder_name TEXT NOT NULL,
            fund_details TEXT NOT NULL
        )`);
        let pfCount = await db.execute("SELECT COUNT(*) as count FROM personal_funds");
        if (pfCount.rows[0].count === 0) {
            const fundsToInsert = [
                { name: "АКСЕНОВ В.С.", details: "ГАВКО, ф.1514, оп.1, 67 ед.хр., 1956-2004 г.г." },
                { name: "АЛЕКСЕЕНКО Н.В.", details: "ГАВКО: ф.1466, оп.7, 100 ед.хр., 1915-2004 г.г." },
                { name: "АМАНЖОЛОВ С.А.", details: "ГАВКО: ф.1299, оп.1, 48 ед.хр., 1915-2004 г.г." },
                { name: "АФАНАСЬЕВ А.А.", details: "ГАВКО, ф.742, оп.1, 29 ед.хр., 1927-1985г.г., каталог" },
                { name: "АУБАКИРОВ А.А.", details: "ГАВКО: ф.1388, оп.1, 85 ед.хр., 1905-2004 г.г." },
                { name: "БЕЛОСЛЮДОВ А.Н., БЕЛОСЛЮДОВ Б.А.", details: "ГАВКО: ф.132, оп.1, 223 ед.хр., 1870-1985 г.г." },
                { name: "БЕРДУС И.В.", details: "ГАВКО: ф.77, оп.1, 125 ед.хр., 1926-1970 г.г." },
                { name: "БИТИБАЕВА К.О.", details: "ГАВКО, ф.1455, опись 1, 31 ед.хр., 1977-2007г.г." },
                { name: "БӨКЕЕВ О.", details: "ГАВКО: ф.1407, оп.1, 39 ед.хр., 1961- 2004 г.г." },
                { name: "КУЗНЕЦОВ П.Н.", details: "ГАВКО: ф.180, оп.1, 703 ед.хр., 1913-1971 г.г." }
            ];
            for (let item of fundsToInsert) {
                await db.execute({ sql: "INSERT INTO personal_funds (founder_name, fund_details) VALUES (?, ?)", args: [item.name, item.details] });
            }
        }

        // 3. Календарь памятных дат
        await db.execute(`CREATE TABLE IF NOT EXISTS calendar_years (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year_title TEXT NOT NULL,
            page_link TEXT NOT NULL
        )`);
        let cyCount = await db.execute("SELECT COUNT(*) as count FROM calendar_years");
        if (cyCount.rows[0].count === 0) {
            const years = [
                { title: "2026 год", link: "52775" }, { title: "2025 год", link: "52774" },
                { title: "2024 год", link: "52773" }, { title: "2023 год", link: "52772" },
                { title: "2022 год", link: "52771" }, { title: "2021 год", link: "42488" },
                { title: "2019 год", link: "42487" }, { title: "2018 год", link: "32287" },
                { title: "2017 год", link: "32286" }, { title: "2016 год", link: "32285" },
                { title: "2014 год", link: "32284" }, { title: "2013 год", link: "1733" },
                { title: "2012 год", link: "1628" }, { title: "2011 год", link: "1600" },
                { title: "2010 год", link: "1497" }
            ];
            for (let y of years) {
                await db.execute({ sql: "INSERT INTO calendar_years (year_title, page_link) VALUES (?, ?)", args: [y.title, y.link] });
            }
        }

        // 4. Выставки
        await db.execute(`CREATE TABLE IF NOT EXISTS exhibitions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            album_id INTEGER NOT NULL
        )`);
        let exCount = await db.execute("SELECT COUNT(*) as count FROM exhibitions");
        if (exCount.rows[0].count === 0) {
            const exhibitionsData = [
                { title: "ВОСТОЧНЫЙ КАЗАХСТАН: ВЕХИ ИСТОРИИ", desc: "К 80-летию образования Восточно-Казахстанской области...", album_id: 54 },
                { title: "ВЕЛИКИЙ ПОДВИГ СОВЕТСКОГО НАРОДА (к 70-летию битвы за Москву)", desc: "Битва под Москвой стала главным военным событием...", album_id: 58 },
                { title: "НАШ КРАЙ: ХРОНИКА ИСТОРИИ ВОСТОЧНО-КАЗАХСТАНСКОЙ ОБЛАСТИ", desc: "В экспозицию выставки включено свыше 100 документов...", album_id: 56 },
                { title: "ГОСУДАРСТВЕННОМУ АРХИВУ ВКО - 70 ЛЕТ", desc: "70 лет - возраст для учреждения небольшой...", album_id: 57 },
                { title: "Қазақтың қайталанбас тұлғасы", desc: "Посвящено выдающимся историческим личностям Казахстана.", album_id: 63 },
                { title: "Подвиг – наследие народа, гимн будущему!", desc: "В канун празднования 75-летия Победы советского народа...", album_id: 64 },
                { title: "Усть-Каменогорск в фотографиях (к 300-летию города)", desc: "Фотовыставка к юбилею города Усть-Каменогорска.", album_id: 65 }
            ];
            for (let item of exhibitionsData) {
                await db.execute({ sql: "INSERT INTO exhibitions (title, description, album_id) VALUES (?, ?, ?)", args: [item.title, item.desc, item.album_id] });
            }
        }

        // 5. Создание остальных таблиц
        await db.execute(`CREATE TABLE IF NOT EXISTS documents_files (id INTEGER PRIMARY KEY AUTOINCREMENT, file_key TEXT UNIQUE NOT NULL, title TEXT NOT NULL, file_data BLOB NOT NULL, mimetype TEXT NOT NULL, filename TEXT NOT NULL)`);
        await db.execute(`CREATE TABLE IF NOT EXISTS site_gallery (id INTEGER PRIMARY KEY AUTOINCREMENT, album_id INTEGER NOT NULL, title TEXT NOT NULL, image_data BLOB NOT NULL, mimetype TEXT NOT NULL, filename TEXT NOT NULL)`);
        await db.execute(`CREATE TABLE IF NOT EXISTS laws_files (id INTEGER PRIMARY KEY AUTOINCREMENT, file_key TEXT UNIQUE NOT NULL, title TEXT NOT NULL, details TEXT NOT NULL, file_data BLOB NOT NULL, mimetype TEXT NOT NULL, filename TEXT NOT NULL)`);
        await db.execute(`CREATE TABLE IF NOT EXISTS reading_gallery (id INTEGER PRIMARY KEY AUTOINCREMENT, image_url TEXT NOT NULL, caption TEXT)`);
        await db.execute(`CREATE TABLE IF NOT EXISTS metrics_books (id INTEGER PRIMARY KEY AUTOINCREMENT, church_name TEXT NOT NULL, date_range TEXT NOT NULL, location TEXT NOT NULL, notes TEXT)`);
        await db.execute(`CREATE TABLE IF NOT EXISTS glossary (id INTEGER PRIMARY KEY AUTOINCREMENT, term TEXT NOT NULL, definition TEXT NOT NULL)`);
        await db.execute(`CREATE TABLE IF NOT EXISTS gallery_albums (id INTEGER PRIMARY KEY AUTOINCREMENT, album_id INTEGER NOT NULL, title TEXT NOT NULL, thumb_url TEXT NOT NULL)`);
        await db.execute(`CREATE TABLE IF NOT EXISTS laws (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, details TEXT, file_url TEXT)`);
        await db.execute(`CREATE TABLE IF NOT EXISTS publicism_articles (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, page_url TEXT)`);
        
        await db.execute(`CREATE TABLE IF NOT EXISTS collections_books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, details TEXT, file_url TEXT)`);
        let cbCount = await db.execute("SELECT COUNT(*) as count FROM collections_books");
        if (cbCount.rows[0].count === 0) {
            await db.execute({ sql: "INSERT INTO collections_books (title, details, file_url) VALUES (?, ?, ?)", args: ["Восточный Казахстан в годы Великой Отечественной войны (1941-1945 гг.)", "Сборник документов и материалов", "#"] });
        }

        await db.execute(`CREATE TABLE IF NOT EXISTS scientific_methods (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, details TEXT, file_url TEXT)`);
        let smCount = await db.execute("SELECT COUNT(*) as count FROM scientific_methods");
        if (smCount.rows[0].count === 0) {
            await db.execute({ sql: "INSERT INTO scientific_methods (title, details, file_url) VALUES (?, ?, ?)", args: ["Правила организации хранения, комплектования, учета и использования документов", "Методические рекомендации для архивов и организаций", "#"] });
        }

        console.log('Инициализация базы данных Turso завершена успешно.');
    } catch (e) {
        console.error('Ошибка инициализации БД:', e);
    }
}

// --- REST API Эндпоинты сайта ---
app.get('/api/exhibitions', async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM exhibitions ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/calendar-years', async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM calendar_years ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/personal-funds', async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM personal_funds ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/site-gallery', async (req, res) => {
    try {
        const result = await db.execute("SELECT id, album_id, title FROM site_gallery ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/gallery-photo/:id', async (req, res) => {
    try {
        const result = await db.execute({ sql: "SELECT image_data, mimetype FROM site_gallery WHERE id = ?", args: [req.params.id] });
        if (result.rows.length === 0) return res.status(404).send("Фотография не найдена");
        res.setHeader('Content-Type', result.rows[0].mimetype);
        res.send(Buffer.from(result.rows[0].image_data));
    } catch (err) { res.status(404).send("Фотография не найдена"); }
});

app.get('/api/download/:key', async (req, res) => {
    try {
        const result = await db.execute({ sql: "SELECT title, file_data, mimetype, filename FROM documents_files WHERE file_key = ?", args: [req.params.key] });
        if (result.rows.length === 0) return res.status(404).send("Файл не найден");
        const row = result.rows[0];
        res.setHeader('Content-Type', row.mimetype);
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(row.filename)}`);
        res.send(Buffer.from(row.file_data));
    } catch (err) { res.status(404).send("Файл не найден"); }
});

app.get('/api/laws-list', async (req, res) => {
    try {
        const result = await db.execute("SELECT file_key, title, details FROM laws_files ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/reading-gallery', async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM reading_gallery");
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/guestbook', async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM guestbook ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/guestbook', async (req, res) => {
    const { gbName, gbEmail, gbCountry, gbMsg } = req.body;
    if (!gbName || !gbEmail || !gbCountry || !gbMsg) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    try {
        const result = await db.execute({
            sql: `INSERT INTO guestbook (name, email, country, message, created_at) VALUES (?, ?, ?, ?, ?)`,
            args: [gbName, gbEmail, gbCountry, gbMsg, formattedDate]
        });
        res.json({ success: true, id: Number(result.lastInsertRowid) });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/metrics', async (req, res) => { const r = await db.execute("SELECT * FROM metrics_books"); res.json(r.rows); });
app.get('/api/glossary', async (req, res) => { const r = await db.execute("SELECT * FROM glossary"); res.json(r.rows); });
app.get('/api/gallery', async (req, res) => { const r = await db.execute("SELECT * FROM gallery_albums"); res.json(r.rows); });
app.get('/api/collections', async (req, res) => { const r = await db.execute("SELECT * FROM collections_books ORDER BY id ASC"); res.json(r.rows); });
app.get('/api/methods', async (req, res) => { const r = await db.execute("SELECT * FROM scientific_methods ORDER BY id ASC"); res.json(r.rows); });


// --- REST API ДЛЯ ПАНЕЛИ АДМИНИСТРАТОРА (admin.html) ---

const allowedTables = [
    'calendar_years', 'glossary', 'personal_funds', 'reading_gallery', 
    'collections_books', 'laws', 'publicism_articles', 'scientific_methods', 
    'metrics_books', 'documents_files', 'laws_files'
];

// 1. Получение структуры и записей таблицы
app.get('/api/admin/table/:tableName', async (req, res) => {
    const tableName = req.params.tableName;
    if (!allowedTables.includes(tableName)) {
        return res.status(400).json({ error: 'Неверное имя таблицы' });
    }

    try {
        const colsResult = await db.execute(`PRAGMA table_info("${tableName}")`);
        const columns = colsResult.rows.map(c => c.name);

        const rowsResult = await db.execute(`SELECT * FROM "${tableName}"`);
        res.json({ columns, rows: rowsResult.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Добавление новой строки в таблицу
app.post('/api/admin/table/:tableName', async (req, res) => {
    const tableName = req.params.tableName;
    if (!allowedTables.includes(tableName)) {
        return res.status(400).json({ error: 'Неверное имя таблицы' });
    }

    const data = req.body;
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    if (keys.length === 0) return res.status(400).json({ error: 'Нет данных для добавления' });

    const placeholders = keys.map(() => '?').join(',');
    const query = `INSERT INTO "${tableName}" (${keys.join(',')}) VALUES (${placeholders})`;

    try {
        const result = await db.execute({ sql: query, args: values });
        res.json({ success: true, id: Number(result.lastInsertRowid) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3. Обновление строки по ID
app.put('/api/admin/table/:tableName/:id', async (req, res) => {
    const tableName = req.params.tableName;
    const id = req.params.id;
    if (!allowedTables.includes(tableName)) {
        return res.status(400).json({ error: 'Неверное имя таблицы' });
    }

    const data = req.body;
    const keys = Object.keys(data);
    const values = Object.values(data);

    if (keys.length === 0) return res.status(400).json({ error: 'Нет данных для обновления' });

    const setString = keys.map(k => `"${k}" = ?`).join(', ');
    const query = `UPDATE "${tableName}" SET ${setString} WHERE id = ?`;

    try {
        await db.execute({ sql: query, args: [...values, id] });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 4. Удаление строки по ID
app.delete('/api/admin/table/:tableName/:id', async (req, res) => {
    const tableName = req.params.tableName;
    const id = req.params.id;
    if (!allowedTables.includes(tableName)) {
        return res.status(400).json({ error: 'Неверное имя таблицы' });
    }

    try {
        await db.execute({ sql: `DELETE FROM "${tableName}" WHERE id = ?`, args: [id] });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер успешно запущен и слушает порт ${PORT}`);
    console.log(`Перейдите в браузере: http://localhost:${PORT}/index.html`);
});