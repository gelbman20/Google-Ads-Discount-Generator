# Google Ads Discount Link Generator

🚀 Node.js application for generating Google Ads discount links with JWT tokens.

## 🌟 Features

- ✅ JWT token generation with ES256 algorithm
- ✅ Multi-language support: EN, RU, DE  
- ✅ Modern web interface with Tailwind CSS
- ✅ Customizable Product ID, price, and validity period
- ✅ Form validation and error handling
- ✅ Responsive design for all devices

## 🚀 Free Deployment

### Render (Recommended)

1. Upload your code to GitHub
2. Go to [render.com](https://render.com)
3. Create a new Web Service
4. Connect your GitHub repository
5. Settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: 18+

6. **⚠️ IMPORTANT: Add Secret Files**
   - Go to your service dashboard
   - Navigate to **Environment** → **Secret Files**
   - Add two secret files:
     - **File Name**: `google-automated-discounts-dev-private-key.pem`
     - **Contents**: Your Google private key (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
     - **File Name**: `google-automated-discounts-dev-public-key.pem`  
     - **Contents**: Your Google public key (including `-----BEGIN PUBLIC KEY-----` and `-----END PUBLIC KEY-----`)

7. **Deploy**: Click "Create Web Service" and wait for deployment 

### Railway

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Railway will automatically detect settings

### Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login to your account
fly auth login

# Create application
fly launch

# Deploy
fly deploy
```

## 💻 Local Development

```bash
# Install dependencies
npm install

# Build CSS
npm run build

# Start server
npm start

# For development (with auto-reload)
npm run dev
```

## 🔑 API Keys

### Local Development
Place your Google API keys in the project root:
- `google-automated-discounts-dev-private-key.pem`
- `google-automated-discounts-dev-public-key.pem`

### Production Deployment
- **⚠️ NEVER commit `.pem` files to Git!**
- Use platform-specific secret management:
  - **Render**: Secret Files (see deployment instructions above)
  - **Railway**: Environment Variables or File Storage
  - **Fly.io**: Fly Secrets
- The `.gitignore` file already excludes `.pem` files for security

## 🌐 URLs

- Home: `http://localhost:3000`
- English: `http://localhost:3000/?lang=en`
- German: `http://localhost:3000/?lang=de`
- Russian: `http://localhost:3000/?lang=ru`

## 📱 Usage

1. Open the web interface
2. Fill out the form:
   - Product URL
   - Price (EUR)
   - Validity period (days)
   - Product ID
3. Click "Generate Link"
4. Copy the generated discount link

## 🛠 Technologies

- **Backend**: Node.js + Express
- **Templates**: Pug
- **Styling**: Tailwind CSS
- **Internationalization**: i18n
- **Authentication**: JWT (jsonwebtoken)
- **Cryptography**: ES256 algorithm

## 🔗 Live Demo

Visit the live application: [https://google-ads-discount-generator.onrender.com](https://google-ads-discount-generator.onrender.com)

## 👨‍💻 Developer

**Andrii Helever**
- GitHub: [@gelbman20](https://github.com/gelbman20)
- Website: [kosmonaut.io](https://kosmonaut.io)

## 📄 License

ISC License - see the [LICENSE](LICENSE) file for details.
