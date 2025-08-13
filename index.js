const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');

// ============================================================================
// 🔧 НАСТРОЙКИ - МЕНЯЙТЕ ЭТИ ЗНАЧЕНИЯ ПОД СВОИ НУЖДЫ
// ============================================================================

const CONFIG = {
  // 🌐 Базовый URL - замените на ваш домен
  BASE_URL: 'https://stage.club-of-wine.de',
  
  // 🏷️ ID продукта по умолчанию - замените на ваш ID
  DEFAULT_PRODUCT_ID: '148415',
  
  // ⏰ Время жизни ссылки в днях - можете поставить любое число
  TOKEN_EXPIRES_DAYS: 30,
  
  // 🔐 JWT ключи (генерируются автоматически, не трогайте)
  JWT_KEYS: null
};

// Загрузка ключей из файлов
function loadKeys() {
  try {
    // Пытаемся загрузить ваши ключи
    const privateKey = fs.readFileSync('./google-automated-discounts-dev-private-key.pem', 'utf8');
    const publicKey = fs.readFileSync('./google-automated-discounts-dev-public-key.pem', 'utf8');
    console.log('🔑 Ключи загружены из файлов Google');
    return { privateKey, publicKey };
  } catch (error) {
    // Если файлы не найдены, генерируем новые ключи
    console.log('⚠️  Файлы с ключами не найдены, генерируем новые...');
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'prime256v1', // ES256 curve
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    console.log('🔑 Ключи сгенерированы автоматически');
    return { privateKey, publicKey };
  }
}

// Инициализация ключей
if (!CONFIG.JWT_KEYS) {
  CONFIG.JWT_KEYS = loadKeys();
}

/**
 * Генерирует JWT токен со скидкой
 * @param {Object} options - опции для генерации
 * @param {number} options.discountPercent - процент скидки
 * @param {number} options.price - цена товара
 * @param {string} options.productId - ID продукта (по умолчанию из CONFIG)
 * @param {number} options.expiresInDays - время жизни в днях (по умолчанию из CONFIG)
 * @param {string} options.merchantId - ID мерчанта (по умолчанию '103556247')
 * @param {string} options.currency - валюта (по умолчанию 'EUR')
 * @param {string} options.discountCode - код скидки (по умолчанию 'ABCDEF')
 * @returns {string} JWT токен
 */
function generateDiscountToken(options = {}) {
  const now = Math.floor(Date.now() / 1000);
  const expiresInSeconds = (options.expiresInDays || CONFIG.TOKEN_EXPIRES_DAYS) * 24 * 60 * 60;
  
  const payload = {
    c: options.currency || 'EUR',
    dc: options.discountCode || 'ABCDEF', 
    dp: options.discountPercent,
    m: options.merchantId || '103556247',
    exp: now + expiresInSeconds,
    p: options.price,
    o: options.productId || CONFIG.DEFAULT_PRODUCT_ID,
    iat: now
  };

  const token = jwt.sign(payload, CONFIG.JWT_KEYS.privateKey, {
    algorithm: 'ES256'
  });

  return token;
}

/**
 * ОСНОВНАЯ ФУНКЦИЯ: Добавляет параметр скидки к полной ссылке
 * @param {string} fullUrl - полная ссылка (например, "https://stage.club-of-wine.de/product.html")
 * @param {number} discountPercent - процент скидки (например, 5 для 5%)
 * @param {number} price - цена товара (например, 11.25)
 * @param {Object} options - дополнительные опции
 * @param {string} options.productId - ID продукта (по умолчанию из CONFIG)
 * @param {number} options.expiresInDays - время жизни в днях (по умолчанию из CONFIG)
 * @returns {string} ссылка со скидкой
 */
function addDiscountToUrl(fullUrl, discountPercent, price, options = {}) {
  const token = generateDiscountToken({
    discountPercent,
    price,
    productId: options.productId,
    expiresInDays: options.expiresInDays,
    merchantId: options.merchantId,
    currency: options.currency,
    discountCode: options.discountCode
  });

  // Проверяем есть ли уже параметры в URL
  const separator = fullUrl.includes('?') ? '&' : '?';
  return `${fullUrl}${separator}pv2=${token}`;
}

/**
 * Проверяет и декодирует JWT токен
 * @param {string} token - JWT токен
 * @returns {Object} декодированные данные токена
 */
function verifyDiscountToken(token) {
  try {
    const decoded = jwt.verify(token, CONFIG.JWT_KEYS.publicKey, {
      algorithms: ['ES256']
    });
    return decoded;
  } catch (error) {
    throw new Error(`Ошибка верификации токена: ${error.message}`);
  }
}

/**
 * Извлекает токен из URL
 * @param {string} url - полный URL
 * @returns {string|null} JWT токен или null
 */
function extractTokenFromUrl(url) {
  const match = url.match(/[?&]pv2=([^&]+)/);
  return match ? match[1] : null;
}

// ============================================================================
// ПРИМЕР ИСПОЛЬЗОВАНИЯ
// ============================================================================

if (require.main === module) {
  console.log('🚀 Генератор Google Ads ссылок со скидками');
  console.log('===========================================');
  console.log('');
  
  // ПРОСТОЕ ИСПОЛЬЗОВАНИЕ - меняйте эти значения:
  
  // 1. ВАШИ ПАРАМЕТРЫ (МЕНЯЙТЕ ПОД СВОИ НУЖДЫ)
  const fullUrl = 'https://stage.club-of-wine.de/geldermann-carte-blanche-gp-148415.html';  // 👈 ПОЛНАЯ ССЫЛКА
  const price = 11.25;                                                                      // 👈 ЦЕНА
  const days = 30;                                                                          // 👈 ДНЕЙ ДЕЙСТВИЯ

  try {
    // Генерируем ссылку с токеном (скидка = 0%)
    const discountLink = createDiscountURL(fullUrl, 0, price, days);
    
    console.log('✅ РЕЗУЛЬТАТ:');
    console.log('=============');
    console.log(`🔗 Исходная ссылка: ${fullUrl}`);
    console.log(`💰 Цена: ${price} EUR`);
    console.log(`⏰ Действует: ${days} дней`);
    console.log('');
    console.log('🔗 ССЫЛКА С ТОКЕНОМ:');
    console.log(discountLink);
    console.log('');

    // Проверяем что токен работает
    const token = extractTokenFromUrl(discountLink);
    const decoded = verifyDiscountToken(token);
    
    console.log('✅ Токен успешно проверен!');
    console.log(`📅 Истекает: ${new Date(decoded.exp * 1000).toLocaleString('ru-RU')}`);
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
  
  console.log('');
  console.log('💡 Как использовать:');
  console.log('   1. Измените fullUrl - вставьте вашу полную ссылку');
  console.log('   2. Измените price, days под ваши нужды');
  console.log('   3. Запустите: node index.js');
}

// ============================================================================
// 🚀 БЫСТРАЯ ФУНКЦИЯ ДЛЯ СОЗДАНИЯ ССЫЛОК
// ============================================================================

/**
 * ПРОСТАЯ ФУНКЦИЯ: Добавляет скидку к любой ссылке
 * @param {string} fullUrl - полная ссылка (например, "https://stage.club-of-wine.de/product.html")
 * @param {number} discount - скидка в процентах (например, 5 для 5%)
 * @param {number} price - цена товара
 * @param {number} days - на сколько дней действует ссылка (опционально, по умолчанию 30)
 * @returns {string} ссылка со скидкой
 */
function createDiscountURL(fullUrl, discount, price, days = CONFIG.TOKEN_EXPIRES_DAYS, productId = CONFIG.DEFAULT_PRODUCT_ID) {
  return addDiscountToUrl(fullUrl, discount, price, { 
    expiresInDays: days,
    productId: productId
  });
}

module.exports = {
  createDiscountURL,        // 👈 Простая функция для быстрого использования
  addDiscountToUrl,         // 👈 Основная функция для добавления скидки к URL
  generateDiscountToken,
  verifyDiscountToken,
  extractTokenFromUrl,
  CONFIG                    // 👈 Экспортируем CONFIG для изменения настроек
};
