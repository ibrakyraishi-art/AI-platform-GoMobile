# Деплой на Vercel

## Пошаговая инструкция

### 1. Подготовка GitHub репозитория

```bash
# Инициализация Git (если еще не сделано)
git init
git add .
git commit -m "Initial commit: AI GoMobile project"

# Создайте репозиторий на GitHub и подключите его
git remote add origin https://github.com/ваш-username/ai-gomobile.git
git branch -M main
git push -u origin main
```

### 2. Настройка Supabase

1. Зайдите на [supabase.com](https://supabase.com) и создайте новый проект
2. В SQL Editor выполните содержимое файла `supabase/schema.sql`
3. Скопируйте Project URL и Anon Key из Project Settings → API

### 3. Получение OpenAI API ключа

1. Зайдите на [platform.openai.com](https://platform.openai.com)
2. Перейдите в API Keys
3. Создайте новый API ключ
4. Скопируйте ключ (он показывается только один раз!)

### 4. Деплой на Vercel

#### Вариант 1: Через веб-интерфейс

1. Зайдите на [vercel.com](https://vercel.com)
2. Нажмите "Add New Project"
3. Импортируйте ваш GitHub репозиторий
4. В настройках Environment Variables добавьте:
   - `NEXT_PUBLIC_SUPABASE_URL` - ваш Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - ваш Supabase Anon Key
   - `OPENAI_API_KEY` - ваш OpenAI API ключ
5. Нажмите "Deploy"

#### Вариант 2: Через CLI

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Деплой
vercel

# Добавьте переменные окружения
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add OPENAI_API_KEY

# Редеплой с новыми переменными
vercel --prod
```

### 5. Проверка работы

После успешного деплоя:

1. Откройте ваш сайт (vercel предоставит URL)
2. Перейдите в Dashboard
3. Попробуйте добавить источник данных
4. Создайте датасет и сводную таблицу
5. Протестируйте AI-анализ

## Локальная разработка

```bash
# Установите зависимости
npm install

# Создайте .env.local
cp .env.local.example .env.local

# Заполните переменные окружения в .env.local

# Запустите dev-сервер
npm run dev
```

## Troubleshooting

### Ошибка: "OpenAI API key is not configured"

- Убедитесь, что добавили `OPENAI_API_KEY` в Environment Variables на Vercel
- После добавления переменной нужно сделать редеплой

### Ошибка подключения к Supabase

- Проверьте правильность URL и ключа
- Убедитесь, что выполнили SQL из `supabase/schema.sql`
- Проверьте, что таблицы созданы в SQL Editor → Tables

### Ошибка при подключении Google Sheets

- Убедитесь, что таблица публичная (доступна по ссылке)
- Проверьте правильность spreadsheet ID и названия листа
- Таблица должна содержать данные (хотя бы заголовки)

## Кастомный домен

1. В настройках проекта на Vercel перейдите в Domains
2. Добавьте ваш домен
3. Настройте DNS записи согласно инструкциям Vercel

## Мониторинг и логи

- Логи доступны в Vercel Dashboard → Project → Deployments → Logs
- Используйте Vercel Analytics для отслеживания производительности
