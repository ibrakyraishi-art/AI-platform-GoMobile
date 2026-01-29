-- =====================================================
-- AI-GoMobile Platform - Database Schema
-- =====================================================

-- Включаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ТАБЛИЦА: data_sources (Источники данных)
-- =====================================================
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Для будущей авторизации
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'google_sheets', 'supabase', 'postgresql'
    config JSONB NOT NULL, -- Конфигурация подключения
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_data_sources_user_id ON data_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_created_at ON data_sources(created_at DESC);

-- =====================================================
-- 2. ТАБЛИЦА: datasets (Датасеты)
-- =====================================================
CREATE TABLE IF NOT EXISTS datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    data_source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    fields JSONB NOT NULL, -- Описание полей (название, тип, формат)
    row_count INTEGER DEFAULT 0, -- Количество строк (для отображения)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_datasets_data_source_id ON datasets(data_source_id);
CREATE INDEX IF NOT EXISTS idx_datasets_created_at ON datasets(created_at DESC);

-- =====================================================
-- 3. ТАБЛИЦА: pivot_tables (Сводные таблицы)
-- =====================================================
CREATE TABLE IF NOT EXISTS pivot_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    config JSONB NOT NULL, -- Конфигурация сводной (rows, values, filters)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_pivot_tables_user_id ON pivot_tables(user_id);
CREATE INDEX IF NOT EXISTS idx_pivot_tables_dataset_id ON pivot_tables(dataset_id);
CREATE INDEX IF NOT EXISTS idx_pivot_tables_created_at ON pivot_tables(created_at DESC);

-- =====================================================
-- 4. ТАБЛИЦА: auto_rules (Автоправила)
-- =====================================================
CREATE TABLE IF NOT EXISTS auto_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    field TEXT NOT NULL, -- Поле для проверки
    operator TEXT NOT NULL, -- '>', '<', '=', '>=', '<=', '!='
    value NUMERIC NOT NULL, -- Значение для сравнения
    period TEXT NOT NULL, -- 'last_7_days', 'last_month', etc.
    notification_type TEXT NOT NULL DEFAULT 'browser', -- 'browser', 'telegram', 'email'
    active BOOLEAN DEFAULT TRUE,
    condition TEXT NOT NULL, -- Читаемое условие для отображения
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_auto_rules_user_id ON auto_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_rules_dataset_id ON auto_rules(dataset_id);
CREATE INDEX IF NOT EXISTS idx_auto_rules_active ON auto_rules(active);

-- =====================================================
-- 5. ТАБЛИЦА: rule_events (События правил)
-- =====================================================
CREATE TABLE IF NOT EXISTS rule_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    rule_id UUID NOT NULL REFERENCES auto_rules(id) ON DELETE CASCADE,
    triggered_value NUMERIC NOT NULL, -- Значение которое вызвало правило
    metadata JSONB, -- Дополнительная информация (сегмент, кампания и т.д.)
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_rule_events_user_id ON rule_events(user_id);
CREATE INDEX IF NOT EXISTS idx_rule_events_rule_id ON rule_events(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_events_triggered_at ON rule_events(triggered_at DESC);

-- =====================================================
-- 6. ТАБЛИЦА: ai_analyses (AI анализы)
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
    pivot_table_id UUID REFERENCES pivot_tables(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    period_filter TEXT, -- 'last_7_days', 'last_month', etc.
    analysis TEXT, -- Результат анализа от AI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_ai_analyses_user_id ON ai_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_dataset_id ON ai_analyses(dataset_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created_at ON ai_analyses(created_at DESC);

-- =====================================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- =====================================================

-- Автоматическое обновление updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Применяем триггеры
CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_datasets_updated_at BEFORE UPDATE ON datasets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pivot_tables_updated_at BEFORE UPDATE ON pivot_tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auto_rules_updated_at BEFORE UPDATE ON auto_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS (Row Level Security) - Безопасность на уровне строк
-- =====================================================

-- Включаем RLS для всех таблиц
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pivot_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

-- Политики: каждый пользователь видит только свои данные
-- (пока используем временный user_id = 'demo-user', позже добавим авторизацию)

CREATE POLICY "Users can view own data_sources"
    ON data_sources FOR SELECT
    USING (user_id::text = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can insert own data_sources"
    ON data_sources FOR INSERT
    WITH CHECK (user_id::text = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can update own data_sources"
    ON data_sources FOR UPDATE
    USING (user_id::text = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can delete own data_sources"
    ON data_sources FOR DELETE
    USING (user_id::text = current_setting('app.current_user_id', TRUE));

-- Повторяем для остальных таблиц
CREATE POLICY "Users can view own datasets" ON datasets FOR SELECT USING (user_id::text = current_setting('app.current_user_id', TRUE));
CREATE POLICY "Users can insert own datasets" ON datasets FOR INSERT WITH CHECK (user_id::text = current_setting('app.current_user_id', TRUE));
CREATE POLICY "Users can update own datasets" ON datasets FOR UPDATE USING (user_id::text = current_setting('app.current_user_id', TRUE));
CREATE POLICY "Users can delete own datasets" ON datasets FOR DELETE USING (user_id::text = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can view own pivot_tables" ON pivot_tables FOR SELECT USING (user_id::text = current_setting('app.current_user_id', TRUE));
CREATE POLICY "Users can insert own pivot_tables" ON pivot_tables FOR INSERT WITH CHECK (user_id::text = current_setting('app.current_user_id', TRUE));
CREATE POLICY "Users can update own pivot_tables" ON pivot_tables FOR UPDATE USING (user_id::text = current_setting('app.current_user_id', TRUE));
CREATE POLICY "Users can delete own pivot_tables" ON pivot_tables FOR DELETE USING (user_id::text = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can view own auto_rules" ON auto_rules FOR SELECT USING (user_id::text = current_setting('app.current_user_id', TRUE));
CREATE POLICY "Users can insert own auto_rules" ON auto_rules FOR INSERT WITH CHECK (user_id::text = current_setting('app.current_user_id', TRUE));
CREATE POLICY "Users can update own auto_rules" ON auto_rules FOR UPDATE USING (user_id::text = current_setting('app.current_user_id', TRUE));
CREATE POLICY "Users can delete own auto_rules" ON auto_rules FOR DELETE USING (user_id::text = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can view own rule_events" ON rule_events FOR SELECT USING (user_id::text = current_setting('app.current_user_id', TRUE));
CREATE POLICY "Users can insert own rule_events" ON rule_events FOR INSERT WITH CHECK (user_id::text = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can view own ai_analyses" ON ai_analyses FOR SELECT USING (user_id::text = current_setting('app.current_user_id', TRUE));
CREATE POLICY "Users can insert own ai_analyses" ON ai_analyses FOR INSERT WITH CHECK (user_id::text = current_setting('app.current_user_id', TRUE));

-- =====================================================
-- ГОТОВО!
-- =====================================================
