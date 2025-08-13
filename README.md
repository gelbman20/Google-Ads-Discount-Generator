# Google Ads Discount Link Generator

🚀 Node.js приложение для генерации ссылок Google Ads со скидками с JWT токенами.

## 🌟 Возможности

- ✅ Генерация JWT токенов с ES256 алгоритмом
- ✅ Поддержка 3 языков: EN, RU, DE  
- ✅ Веб-интерфейс с Tailwind CSS
- ✅ Настраиваемые Product ID, цена, срок действия
- ✅ Валидация форм

## 🚀 Бесплатное развертывание

### Render (рекомендуем)

1. Загрузите код на GitHub
2. Зайдите на [render.com](https://render.com)
3. Создайте новый Web Service
4. Подключите GitHub репозиторий
5. Настройки:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: 18+ 

### Railway

1. Зайдите на [railway.app](https://railway.app)
2. Подключите GitHub репозиторий
3. Railway автоматически определит настройки

### Fly.io

```bash
# Установите Fly CLI
curl -L https://fly.io/install.sh | sh

# Войдите в аккаунт
fly auth login

# Создайте приложение
fly launch

# Деплойте
fly deploy
```

## 💻 Локальная разработка

```bash
# Установка зависимостей
npm install

# Сборка CSS
npm run build

# Запуск сервера
npm start

# Для разработки (с автоперезагрузкой)
npm run dev
```

## 🔑 Ключи

Поместите ваши Google ключи в корень проекта:
- `google-automated-discounts-dev-private-key.pem`
- `google-automated-discounts-dev-public-key.pem`

## 🌐 URLs

- Главная: `http://localhost:3000`
- Английский: `http://localhost:3000/?lang=en`
- Немецкий: `http://localhost:3000/?lang=de`

## 📱 Использование

1. Откройте веб-интерфейс
2. Заполните форму:
   - URL товара
   - Цена (EUR)
   - Срок действия (дни)
   - Product ID
3. Нажмите "Generate Link"
4. Скопируйте готовую ссылку

## 🛠 Технологии

- Node.js + Express
- Pug templates
- Tailwind CSS
- i18n (многоязычность)
- JWT (jsonwebtoken)
- ES256 криптография
