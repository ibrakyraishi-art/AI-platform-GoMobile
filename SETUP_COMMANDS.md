# Команды для настройки и деплоя

## Все команды для копирования

Просто копируйте и выполняйте в Git Bash по порядку.

### 1. Инициализация Git

```bash
# Переход в папку проекта
cd /c/Users/User/Downloads/AI-GoMobile

# Инициализация Git
git init

# Добавление всех файлов
git add .

# Первый коммит
git commit -m "Initial commit: AI GoMobile - аналитическая платформа с AI"
```

### 2. Создание репозитория на GitHub

Выполните один из вариантов:

**Вариант A: Через GitHub CLI (если установлен)**
```bash
gh repo create ai-gomobile --public --source=. --remote=origin
git push -u origin main
```

**Вариант B: Вручную**
```bash
# 1. Создайте репозиторий на github.com вручную
# 2. Затем выполните (замените YOUR_USERNAME на ваш username):

git remote add origin https://github.com/YOUR_USERNAME/ai-gomobile.git
git branch -M main
git push -u origin main
```

### 3. Установка зависимостей

```bash
npm install
```

### 4. Настройка переменных окружения

```bash
# Создание .env.local из примера
cp .env.local.example .env.local

# Откройте .env.local в текстовом редакторе и заполните:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - OPENAI_API_KEY
```

### 5. Запуск локального сервера

```bash
npm run dev
```

Откройте http://localhost:3000

### 6. Деплой на Vercel (через CLI)

```bash
# Установка Vercel CLI
npm i -g vercel

# Вход в аккаунт
vercel login

# Инициализация и деплой
vercel

# Добавление переменных окружения
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Введите значение

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Введите значение

vercel env add OPENAI_API_KEY production
# Введите значение

# Production деплой
vercel --prod
```

## Полная последовательность команд

Скопируйте все и выполните по очереди:

```bash
# 1. Переход в папку
cd /c/Users/User/Downloads/AI-GoMobile

# 2. Git инициализация
git init
git add .
git commit -m "Initial commit: AI GoMobile"

# 3. Создание репозитория на GitHub (замените YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ai-gomobile.git
git branch -M main
git push -u origin main

# 4. Установка зависимостей
npm install

# 5. Настройка env
cp .env.local.example .env.local
# Теперь откройте .env.local и заполните переменные

# 6. Запуск
npm run dev
```

## Проверка после запуска

```bash
# Проверить статус Git
git status

# Проверить remote
git remote -v

# Проверить текущую ветку
git branch

# Посмотреть историю коммитов
git log --oneline

# Проверить версию Node.js
node --version

# Проверить версию npm
npm --version
```

## Дополнительные команды

### Работа с Git

```bash
# Посмотреть изменения
git status

# Добавить файлы
git add .

# Сделать коммит
git commit -m "Описание изменений"

# Загрузить на GitHub
git push origin main

# Получить изменения
git pull origin main

# Посмотреть удаленные репозитории
git remote -v
```

### Работа с npm

```bash
# Установить зависимости
npm install

# Запустить dev сервер
npm run dev

# Собрать проект
npm run build

# Запустить production сервер
npm start

# Проверить на ошибки
npm run lint
```

### Vercel команды

```bash
# Войти в аккаунт
vercel login

# Dev деплой
vercel

# Production деплой
vercel --prod

# Посмотреть список деплоев
vercel list

# Посмотреть логи
vercel logs

# Добавить переменную окружения
vercel env add VARIABLE_NAME

# Посмотреть переменные
vercel env ls
```

## Troubleshooting

### Если Git не работает

```bash
# Проверить установку Git
git --version

# Если не установлен, скачайте с https://git-scm.com/
```

### Если npm не работает

```bash
# Проверить установку Node.js
node --version
npm --version

# Если не установлен, скачайте с https://nodejs.org/
```

### Если ошибка "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/ai-gomobile.git
```

### Если не можете загрузить на GitHub

```bash
# Настройте Git credentials
git config --global user.name "Ваше Имя"
git config --global user.email "your-email@example.com"

# Попробуйте снова
git push origin main
```

## Полезные ссылки

- Git Bash скачать: https://git-scm.com/
- Node.js скачать: https://nodejs.org/
- GitHub: https://github.com/
- Vercel: https://vercel.com/
- Supabase: https://supabase.com/
- OpenAI: https://platform.openai.com/
