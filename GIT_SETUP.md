# Настройка Git и деплой на Vercel

## 1. Инициализация Git репозитория

Откройте Git Bash в папке проекта и выполните:

```bash
# Инициализация Git
git init

# Добавление всех файлов
git add .

# Первый коммит
git commit -m "Initial commit: AI GoMobile - аналитическая платформа с AI"
```

## 2. Создание репозитория на GitHub

### Вариант A: Через веб-интерфейс

1. Зайдите на [github.com](https://github.com)
2. Нажмите "+" в правом верхнем углу → "New repository"
3. Название: `ai-gomobile`
4. Описание: `Аналитическая платформа для байеров с AI-анализом`
5. Выберите "Public" или "Private"
6. **НЕ** добавляйте README, .gitignore или license (они уже есть)
7. Нажмите "Create repository"

### Вариант B: Через GitHub CLI

```bash
# Установите GitHub CLI (если еще не установлен)
# https://cli.github.com/

# Создайте репозиторий
gh repo create ai-gomobile --public --source=. --remote=origin

# Загрузите код
git push -u origin main
```

## 3. Подключение репозитория

После создания репозитория на GitHub:

```bash
# Добавьте remote (замените YOUR_USERNAME на ваш username)
git remote add origin https://github.com/YOUR_USERNAME/ai-gomobile.git

# Убедитесь, что вы на ветке main
git branch -M main

# Загрузите код
git push -u origin main
```

## 4. Деплой на Vercel

### Через веб-интерфейс (рекомендуется)

1. Зайдите на [vercel.com](https://vercel.com)
2. Нажмите "Add New" → "Project"
3. Импортируйте ваш GitHub репозиторий `ai-gomobile`
4. Vercel автоматически определит Next.js
5. Добавьте Environment Variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
   OPENAI_API_KEY = sk-your-api-key
   ```

6. Нажмите "Deploy"
7. Ждите завершения деплоя (2-3 минуты)
8. Получите ссылку на ваш сайт!

### Через Vercel CLI

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Инициализация проекта
vercel

# Следуйте инструкциям:
# - Set up and deploy? Yes
# - Which scope? Выберите ваш аккаунт
# - Link to existing project? No
# - What's your project's name? ai-gomobile
# - In which directory is your code located? ./

# Добавьте переменные окружения
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Введите значение

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Введите значение

vercel env add OPENAI_API_KEY production
# Введите значение

# Production деплой
vercel --prod
```

## 5. Настройка автодеплоя

После первого деплоя Vercel автоматически настроит:

- **Production деплой**: При push в ветку `main`
- **Preview деплой**: При создании Pull Request

Теперь при каждом push в `main` сайт будет автоматически обновляться!

```bash
# Пример workflow
git add .
git commit -m "Added new feature"
git push origin main

# Vercel автоматически задеплоит изменения
```

## 6. Проверка деплоя

После успешного деплоя:

1. Откройте URL вашего проекта (например, `ai-gomobile.vercel.app`)
2. Проверьте главную страницу
3. Перейдите в Dashboard
4. Попробуйте подключить Google Sheets
5. Протестируйте AI-анализ

## 7. Кастомный домен (опционально)

1. Купите домен (например, на [namecheap.com](https://namecheap.com))
2. В Vercel Dashboard → Settings → Domains
3. Добавьте ваш домен
4. Настройте DNS записи согласно инструкциям Vercel
5. Подождите несколько часов для распространения DNS

## Полезные команды Git

```bash
# Посмотреть статус
git status

# Добавить файлы
git add .

# Сделать коммит
git commit -m "Описание изменений"

# Загрузить на GitHub
git push origin main

# Посмотреть историю
git log --oneline

# Создать новую ветку
git checkout -b feature-name

# Переключиться на main
git checkout main
```

## Troubleshooting

### Ошибка: "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/ai-gomobile.git
```

### Ошибка при push: "failed to push some refs"

```bash
git pull origin main --rebase
git push origin main
```

### Vercel: Build failed

1. Проверьте логи в Vercel Dashboard
2. Убедитесь, что все зависимости в `package.json`
3. Проверьте Environment Variables

### Vercel: Runtime error

1. Проверьте, что добавили все Environment Variables
2. Убедитесь, что Supabase URL и ключи правильные
3. Проверьте логи в Vercel Dashboard → Functions

## Дальнейшие шаги

1. Настройте Supabase (выполните SQL из `supabase/schema.sql`)
2. Добавьте свою Google таблицу с данными
3. Протестируйте все функции
4. Поделитесь ссылкой с коллегами!

## Полезные ссылки

- [Git документация](https://git-scm.com/doc)
- [GitHub документация](https://docs.github.com)
- [Vercel документация](https://vercel.com/docs)
- [Next.js deployment](https://nextjs.org/docs/deployment)
