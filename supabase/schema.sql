-- Создание таблиц для AI GoMobile

-- Проекты
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Источники данных
CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'google_sheets', 'supabase', 'postgresql', 'mysql'
  config JSONB NOT NULL, -- Конфигурация подключения
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Датасеты
CREATE TABLE IF NOT EXISTS datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  data_source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fields JSONB NOT NULL, -- Массив полей с типами и настройками
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Сводные таблицы
CREATE TABLE IF NOT EXISTS pivot_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  config JSONB NOT NULL, -- Конфигурация сводной таблицы (rows, columns, values)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- AI-анализы
CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  dataset_id UUID REFERENCES datasets(id) ON DELETE SET NULL,
  pivot_table_id UUID REFERENCES pivot_tables(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  analysis TEXT NOT NULL,
  insights TEXT[] NOT NULL,
  recommendations TEXT[] NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_data_sources_project_id ON data_sources(project_id);
CREATE INDEX IF NOT EXISTS idx_datasets_project_id ON datasets(project_id);
CREATE INDEX IF NOT EXISTS idx_datasets_data_source_id ON datasets(data_source_id);
CREATE INDEX IF NOT EXISTS idx_pivot_tables_project_id ON pivot_tables(project_id);
CREATE INDEX IF NOT EXISTS idx_pivot_tables_dataset_id ON pivot_tables(dataset_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_project_id ON ai_analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_dataset_id ON ai_analyses(dataset_id);

-- Триггеры для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_datasets_updated_at BEFORE UPDATE ON datasets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pivot_tables_updated_at BEFORE UPDATE ON pivot_tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - раскомментируйте, если используете Supabase Auth
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pivot_tables ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

-- Политики RLS (примеры)
-- CREATE POLICY "Users can view their own projects" ON projects
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Users can create projects" ON projects
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update their own projects" ON projects
--   FOR UPDATE USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete their own projects" ON projects
--   FOR DELETE USING (auth.uid() = user_id);
