# Supabase Setup

## Инициализация базы данных

1. Зайдите в ваш проект на [supabase.com](https://supabase.com)
2. Перейдите в SQL Editor
3. Скопируйте содержимое файла `schema.sql`
4. Выполните SQL-запрос для создания таблиц

## Настройка переменных окружения

После создания таблиц, добавьте в `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Найти эти значения можно в:
Project Settings → API

## Row Level Security (RLS)

Если вы используете Supabase Auth, раскомментируйте секцию RLS в `schema.sql` для настройки безопасности на уровне строк.

## Тестовые данные (опционально)

Для тестирования вы можете добавить тестовые данные:

```sql
-- Создать тестовый проект
INSERT INTO projects (name, description, user_id)
VALUES ('Тестовый проект', 'Проект для тестирования', 'test-user-id');
```
