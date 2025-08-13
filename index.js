const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');

// ============================================================================
// 🔧 CONFIGURATION - CHANGE THESE VALUES FOR YOUR NEEDS
// ============================================================================

const CONFIG = {
  // 🌐 Base URL - replace with your domain
  BASE_URL: 'https://stage.club-of-wine.de',
  
  // 🏷️ Default product ID - replace with your ID
  DEFAULT_PRODUCT_ID: '148415',
  
  // ⏰ Link lifetime in days - you can set any number
  TOKEN_EXPIRES_DAYS: 30,
  
  // 🔐 JWT keys (generated automatically, don't touch)
  JWT_KEYS: null
};

// Load keys from files
function loadKeys() {
  try {
    // Try to load your keys
    const privateKey = fs.readFileSync('./google-automated-discounts-dev-private-key.pem', 'utf8');
    const publicKey = fs.readFileSync('./google-automated-discounts-dev-public-key.pem', 'utf8');
    console.log('🔑 Keys loaded from Google files');
    return { privateKey, publicKey };
  } catch (error) {
    // If files not found, generate new keys
    console.log('⚠️  Key files not found, generating new ones...');
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'prime256v1', // ES256 curve
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    console.log('🔑 Keys generated automatically');
    return { privateKey, publicKey };
  }
}

// Initialize keys
if (!CONFIG.JWT_KEYS) {
  CONFIG.JWT_KEYS = loadKeys();
}

/**
 * Generates JWT token with discount
 * @param {Object} options - generation options
 * @param {number} options.discountPercent - discount percentage
 * @param {number} options.price - product price
 * @param {string} options.productId - product ID (default from CONFIG)
 * @param {number} options.expiresInDays - lifetime in days (default from CONFIG)
 * @param {string} options.merchantId - merchant ID (default '103556247')
 * @param {string} options.currency - currency (default 'EUR')
 * @param {string} options.discountCode - discount code (default 'ABCDEF')
 * @returns {string} JWT token
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
 * MAIN FUNCTION: Adds discount parameter to full URL
 * @param {string} fullUrl - full URL (e.g., "https://stage.club-of-wine.de/product.html")
 * @param {number} discountPercent - discount percentage (e.g., 5 for 5%)
 * @param {number} price - product price (e.g., 11.25)
 * @param {Object} options - additional options
 * @param {string} options.productId - product ID (default from CONFIG)
 * @param {number} options.expiresInDays - lifetime in days (default from CONFIG)
 * @returns {string} URL with discount
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

  // Check if URL already has parameters
  const separator = fullUrl.includes('?') ? '&' : '?';
  return `${fullUrl}${separator}pv2=${token}`;
}

/**
 * Verifies and decodes JWT token
 * @param {string} token - JWT token
 * @returns {Object} decoded token data
 */
function verifyDiscountToken(token) {
  try {
    const decoded = jwt.verify(token, CONFIG.JWT_KEYS.publicKey, {
      algorithms: ['ES256']
    });
    return decoded;
  } catch (error) {
    throw new Error(`Token verification error: ${error.message}`);
  }
}

/**
 * Extracts token from URL
 * @param {string} url - full URL
 * @returns {string|null} JWT token or null
 */
function extractTokenFromUrl(url) {
  const match = url.match(/[?&]pv2=([^&]+)/);
  return match ? match[1] : null;
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

if (require.main === module) {
  console.log('🚀 Google Ads Discount Link Generator');
  console.log('===========================================');
  console.log('');
  
  // SIMPLE USAGE - change these values:
  
  // 1. YOUR PARAMETERS (CHANGE FOR YOUR NEEDS)
  const fullUrl = 'https://stage.club-of-wine.de/geldermann-carte-blanche-gp-148415.html';  // 👈 FULL URL
  const price = 11.25;                                                                      // 👈 PRICE
  const days = 30;                                                                          // 👈 DAYS VALID

  try {
    // Generate link with token (discount = 0%)
    const discountLink = createDiscountURL(fullUrl, 0, price, days);
    
    console.log('✅ RESULT:');
    console.log('=============');
    console.log(`🔗 Original URL: ${fullUrl}`);
    console.log(`💰 Price: ${price} EUR`);
    console.log(`⏰ Valid for: ${days} days`);
    console.log('');
    console.log('🔗 URL WITH TOKEN:');
    console.log(discountLink);
    console.log('');

    // Verify that token works
    const token = extractTokenFromUrl(discountLink);
    const decoded = verifyDiscountToken(token);
    
    console.log('✅ Token successfully verified!');
    console.log(`📅 Expires: ${new Date(decoded.exp * 1000).toLocaleString('en-US')}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('');
  console.log('💡 How to use:');
  console.log('   1. Change fullUrl - insert your full URL');
  console.log('   2. Change price, days for your needs');
  console.log('   3. Run: node index.js');
}

// ============================================================================
// 🚀 QUICK FUNCTION FOR CREATING LINKS
// ============================================================================

/**
 * SIMPLE FUNCTION: Adds discount to any URL
 * @param {string} fullUrl - full URL (e.g., "https://stage.club-of-wine.de/product.html")
 * @param {number} discount - discount percentage (e.g., 5 for 5%)
 * @param {number} price - product price
 * @param {number} days - how many days the link is valid (optional, default 30)
 * @returns {string} URL with discount
 */
function createDiscountURL(fullUrl, discount, price, days = CONFIG.TOKEN_EXPIRES_DAYS, productId = CONFIG.DEFAULT_PRODUCT_ID) {
  return addDiscountToUrl(fullUrl, discount, price, { 
    expiresInDays: days,
    productId: productId
  });
}

module.exports = {
  createDiscountURL,        // 👈 Simple function for quick use
  addDiscountToUrl,         // 👈 Main function for adding discount to URL
  generateDiscountToken,
  verifyDiscountToken,
  extractTokenFromUrl,
  CONFIG                    // 👈 Export CONFIG for changing settings
};
