const express = require('express');
const path = require('path');
const i18n = require('i18n');
const cookieParser = require('cookie-parser');
const { createDiscountURL } = require('./index.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка i18n
const localesDir = path.join(__dirname, 'locales');
console.log(`📁 Путь к локализации: ${localesDir}`);

i18n.configure({
  locales: ['en', 'ru', 'de'],
  defaultLocale: 'ru',
  directory: localesDir,
  queryParameter: 'lang',
  sessionParameter: 'lang',
  cookie: 'lang',
  autoReload: true,
  updateFiles: false
});

// Настройка Pug как шаблонизатора
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Cookie parser middleware (нужен для i18n)
app.use(cookieParser());

// i18n middleware
app.use(i18n.init);

// Middleware для обработки форм
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware для установки языка И глобальных переменных (ПОСЛЕ body parser)
app.use((req, res, next) => {
  // Приоритет: body.lang (для POST) > query.lang (для GET)
  const lang = req.body?.lang || req.query.lang;
  if (lang && ['en', 'ru', 'de'].includes(lang)) {
    res.setLocale(lang);
  }
  
  // Создаем функцию перевода, которая загружает файлы прямо
  res.locals.__ = function(key) {
    try {
      const currentLang = res.getLocale();
      const fs = require('fs');
      const translationFile = path.join(__dirname, 'locales', `${currentLang}.json`);
      const translations = JSON.parse(fs.readFileSync(translationFile, 'utf8'));
      
      // Поддерживаем вложенные ключи типа 'form.url_label'
      const keys = key.split('.');
      let result = translations;
      for (const k of keys) {
        result = result?.[k];
      }
      return result || key;
    } catch (e) {
      return key;
    }
  };
  
  res.locals.currentLang = res.getLocale();
  res.locals.availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'de', name: 'Deutsch' }
  ];
  
  next();
});

// Статические файлы (CSS, JS, изображения)
app.use(express.static('public'));

// Главная страница с формой
app.get('/', (req, res) => {
  res.render('index', {
    title: `🚀 ${res.__('title')}`
  });
});

// GET маршрут для /generate (перенаправляет на главную с сохранением языка)
app.get('/generate', (req, res) => {
  const lang = req.query.lang;
  if (lang) {
    res.redirect(`/?lang=${lang}`);
  } else {
    res.redirect('/');
  }
});

// Обработка генерации ссылки
app.post('/generate', (req, res) => {
  try {
    const { url, price, days, productId, lang } = req.body;
    
    // Валидация (язык уже установлен в middleware)
    if (!url || !price || !days || !productId) {
      throw new Error(res.__('error.validation.all_fields_required'));
    }
    
    const priceNum = parseFloat(price);
    const daysNum = parseInt(days);
    
    if (isNaN(priceNum) || priceNum <= 0) {
      throw new Error(res.__('error.validation.price_positive'));
    }
    
    if (isNaN(daysNum) || daysNum <= 0 || daysNum > 365) {
      throw new Error(res.__('error.validation.days_range'));
    }
    
    // Валидация Product ID (должен быть числом)
    if (!/^\d+$/.test(productId)) {
      throw new Error(res.__('error.validation.product_id_invalid'));
    }
    
    // Генерируем ссылку (скидка = 0%)
    const generatedLink = createDiscountURL(url, 0, priceNum, daysNum, productId);
    
    // Рендерим страницу результата
    res.render('result', {
      title: `✅ ${res.__('result.title')}`,
      url: url,
      price: priceNum,
      days: daysNum,
      productId: productId,
      generatedLink: generatedLink
    });
  } catch (error) {
    res.status(400).render('error', {
      title: `❌ ${res.__('error.title')}`,
      message: error.message
    });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log('🚀 Сервер запущен!');
  console.log('=================');
  console.log(`📱 Откройте в браузере: http://localhost:${PORT}`);
  console.log('✨ Используйте веб-форму для генерации ссылок');
  console.log('🔐 Ключи Google загружены автоматически');
  console.log('');
  console.log('💡 Для остановки нажмите Ctrl+C');
});

module.exports = app;
