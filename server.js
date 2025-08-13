const express = require('express');
const path = require('path');
const i18n = require('i18n');
const cookieParser = require('cookie-parser');
const { createDiscountURL } = require('./index.js');

const app = express();
const PORT = process.env.PORT || 3000;

// i18n configuration
const localesDir = path.join(__dirname, 'locales');
console.log(`📁 Localization path: ${localesDir}`);

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

// Configure Pug as template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Cookie parser middleware (required for i18n)
app.use(cookieParser());

// i18n middleware
app.use(i18n.init);

// Middleware for form processing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware for setting language and global variables (AFTER body parser)
app.use((req, res, next) => {
  // Priority: body.lang (for POST) > query.lang (for GET)
  const lang = req.body?.lang || req.query.lang;
  if (lang && ['en', 'ru', 'de'].includes(lang)) {
    res.setLocale(lang);
  }
  
  // Create translation function that loads files directly
  res.locals.__ = function(key) {
    try {
      const currentLang = res.getLocale();
      const fs = require('fs');
      const translationFile = path.join(__dirname, 'locales', `${currentLang}.json`);
      const translations = JSON.parse(fs.readFileSync(translationFile, 'utf8'));
      
      // Support nested keys like 'form.url_label'
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
    { code: 'ru', name: 'Russian' },
    { code: 'de', name: 'Deutsch' }
  ];
  
  next();
});

// Static files (CSS, JS, images)
app.use(express.static('public'));

// Main page with form
app.get('/', (req, res) => {
  res.render('index', {
    title: `🚀 ${res.__('title')}`
  });
});

// GET route for /generate (redirects to home preserving language)
app.get('/generate', (req, res) => {
  const lang = req.query.lang;
  if (lang) {
    res.redirect(`/?lang=${lang}`);
  } else {
    res.redirect('/');
  }
});

// Handle link generation
app.post('/generate', (req, res) => {
  try {
    const { url, price, days, productId, lang } = req.body;
    
    // Validation (language already set in middleware)
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
    
    // Product ID validation (must be a number)
    if (!/^\d+$/.test(productId)) {
      throw new Error(res.__('error.validation.product_id_invalid'));
    }
    
    // Generate link (discount = 0%)
    const generatedLink = createDiscountURL(url, 0, priceNum, daysNum, productId);
    
    // Render result page
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

// Start server
app.listen(PORT, () => {
  console.log('🚀 Server started!');
  console.log('=================');
  console.log(`📱 Open in browser: http://localhost:${PORT}`);
  console.log('✨ Use web form to generate links');
  console.log('🔐 Google keys loaded automatically');
  console.log('');
  console.log('💡 Press Ctrl+C to stop');
});

module.exports = app;
