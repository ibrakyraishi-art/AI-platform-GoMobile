-- =====================================================
-- FIX RLS Policies для работы с UUID demo-user
-- =====================================================

-- Удаляем старые политики
DROP POLICY IF EXISTS "Users can view own data_sources" ON data_sources;
DROP POLICY IF EXISTS "Users can insert own data_sources" ON data_sources;
DROP POLICY IF EXISTS "Users can update own data_sources" ON data_sources;
DROP POLICY IF EXISTS "Users can delete own data_sources" ON data_sources;

DROP POLICY IF EXISTS "Users can view own datasets" ON datasets;
DROP POLICY IF EXISTS "Users can insert own datasets" ON datasets;
DROP POLICY IF EXISTS "Users can update own datasets" ON datasets;
DROP POLICY IF EXISTS "Users can delete own datasets" ON datasets;

DROP POLICY IF EXISTS "Users can view own pivot_tables" ON pivot_tables;
DROP POLICY IF EXISTS "Users can insert own pivot_tables" ON pivot_tables;
DROP POLICY IF EXISTS "Users can update own pivot_tables" ON pivot_tables;
DROP POLICY IF EXISTS "Users can delete own pivot_tables" ON pivot_tables;

DROP POLICY IF EXISTS "Users can view own auto_rules" ON auto_rules;
DROP POLICY IF EXISTS "Users can insert own auto_rules" ON auto_rules;
DROP POLICY IF EXISTS "Users can update own auto_rules" ON auto_rules;
DROP POLICY IF EXISTS "Users can delete own auto_rules" ON auto_rules;

DROP POLICY IF EXISTS "Users can view own rule_events" ON rule_events;
DROP POLICY IF EXISTS "Users can insert own rule_events" ON rule_events;

DROP POLICY IF EXISTS "Users can view own ai_analyses" ON ai_analyses;
DROP POLICY IF EXISTS "Users can insert own ai_analyses" ON ai_analyses;

-- Создаем новые политики с фиксированным demo UUID
-- Используем фиксированный UUID для demo пользователя
CREATE POLICY "Demo user can view data_sources"
    ON data_sources FOR SELECT
    USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Demo user can insert data_sources"
    ON data_sources FOR INSERT
    WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Demo user can update data_sources"
    ON data_sources FOR UPDATE
    USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Demo user can delete data_sources"
    ON data_sources FOR DELETE
    USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Datasets
CREATE POLICY "Demo user can view datasets" ON datasets FOR SELECT USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
CREATE POLICY "Demo user can insert datasets" ON datasets FOR INSERT WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
CREATE POLICY "Demo user can update datasets" ON datasets FOR UPDATE USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
CREATE POLICY "Demo user can delete datasets" ON datasets FOR DELETE USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Pivot Tables
CREATE POLICY "Demo user can view pivot_tables" ON pivot_tables FOR SELECT USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
CREATE POLICY "Demo user can insert pivot_tables" ON pivot_tables FOR INSERT WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
CREATE POLICY "Demo user can update pivot_tables" ON pivot_tables FOR UPDATE USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
CREATE POLICY "Demo user can delete pivot_tables" ON pivot_tables FOR DELETE USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Auto Rules
CREATE POLICY "Demo user can view auto_rules" ON auto_rules FOR SELECT USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
CREATE POLICY "Demo user can insert auto_rules" ON auto_rules FOR INSERT WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
CREATE POLICY "Demo user can update auto_rules" ON auto_rules FOR UPDATE USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
CREATE POLICY "Demo user can delete auto_rules" ON auto_rules FOR DELETE USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Rule Events
CREATE POLICY "Demo user can view rule_events" ON rule_events FOR SELECT USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
CREATE POLICY "Demo user can insert rule_events" ON rule_events FOR INSERT WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- AI Analyses
CREATE POLICY "Demo user can view ai_analyses" ON ai_analyses FOR SELECT USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
CREATE POLICY "Demo user can insert ai_analyses" ON ai_analyses FOR INSERT WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- =====================================================
-- ГОТОВО!
-- =====================================================
