/**
 * Supabase Client Utility
 * Обертка для работы с Supabase вместо localStorage
 */

import { createClient } from '@supabase/supabase-js';

// Временный demo user ID (позже заменим на реальную авторизацию)
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

// Создаем клиент Supabase
export function createSupabaseClient(url?: string, key?: string) {
  // Используем ключи из настроек или placeholder
  const supabaseUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  
  return createClient(supabaseUrl, supabaseKey);
}

// Проверка настройки Supabase
export function isSupabaseConfigured(url?: string, key?: string): boolean {
  const supabaseUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  return !!(
    supabaseUrl &&
    !supabaseUrl.includes('placeholder') &&
    supabaseKey &&
    !supabaseKey.includes('placeholder')
  );
}

// =====================================================
// DATA SOURCES
// =====================================================

export async function getDataSources(supabase: any) {
  const { data, error } = await supabase
    .from('data_sources')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createDataSource(supabase: any, dataSource: any) {
  const { data, error } = await supabase
    .from('data_sources')
    .insert([{ ...dataSource, user_id: DEMO_USER_ID }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDataSource(supabase: any, id: string) {
  const { error } = await supabase
    .from('data_sources')
    .delete()
    .eq('id', id)
    .eq('user_id', DEMO_USER_ID);

  if (error) throw error;
}

// =====================================================
// DATASETS
// =====================================================

export async function getDatasets(supabase: any) {
  const { data, error } = await supabase
    .from('datasets')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createDataset(supabase: any, dataset: any) {
  const { data, error } = await supabase
    .from('datasets')
    .insert([{ ...dataset, user_id: DEMO_USER_ID }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDataset(supabase: any, id: string, updates: any) {
  const { data, error } = await supabase
    .from('datasets')
    .update(updates)
    .eq('id', id)
    .eq('user_id', DEMO_USER_ID)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDataset(supabase: any, id: string) {
  const { error } = await supabase
    .from('datasets')
    .delete()
    .eq('id', id)
    .eq('user_id', DEMO_USER_ID);

  if (error) throw error;
}

// =====================================================
// PIVOT TABLES
// =====================================================

export async function getPivotTables(supabase: any) {
  const { data, error } = await supabase
    .from('pivot_tables')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createPivotTable(supabase: any, pivotTable: any) {
  const { data, error } = await supabase
    .from('pivot_tables')
    .insert([{ ...pivotTable, user_id: DEMO_USER_ID }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePivotTable(supabase: any, id: string) {
  const { error } = await supabase
    .from('pivot_tables')
    .delete()
    .eq('id', id)
    .eq('user_id', DEMO_USER_ID);

  if (error) throw error;
}

// =====================================================
// AUTO RULES
// =====================================================

export async function getAutoRules(supabase: any) {
  const { data, error } = await supabase
    .from('auto_rules')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createAutoRule(supabase: any, rule: any) {
  const { data, error } = await supabase
    .from('auto_rules')
    .insert([{ ...rule, user_id: DEMO_USER_ID }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAutoRule(supabase: any, id: string, updates: any) {
  const { data, error } = await supabase
    .from('auto_rules')
    .update(updates)
    .eq('id', id)
    .eq('user_id', DEMO_USER_ID)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAutoRule(supabase: any, id: string) {
  const { error } = await supabase
    .from('auto_rules')
    .delete()
    .eq('id', id)
    .eq('user_id', DEMO_USER_ID);

  if (error) throw error;
}

// =====================================================
// RULE EVENTS
// =====================================================

export async function getRuleEvents(supabase: any) {
  const { data, error } = await supabase
    .from('rule_events')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .order('triggered_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createRuleEvent(supabase: any, event: any) {
  const { data, error } = await supabase
    .from('rule_events')
    .insert([{ ...event, user_id: DEMO_USER_ID }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =====================================================
// AI ANALYSES
// =====================================================

export async function getAIAnalyses(supabase: any) {
  const { data, error } = await supabase
    .from('ai_analyses')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createAIAnalysis(supabase: any, analysis: any) {
  const { data, error } = await supabase
    .from('ai_analyses')
    .insert([{ ...analysis, user_id: DEMO_USER_ID }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =====================================================
// МИГРАЦИЯ ИЗ LOCALSTORAGE
// =====================================================

export async function migrateFromLocalStorage(supabase: any) {
  console.log('🔄 Starting migration from localStorage to Supabase...');

  try {
    // 1. Мигрируем источники данных
    const localDataSources = JSON.parse(localStorage.getItem('dataSources') || '[]');
    if (localDataSources.length > 0) {
      console.log(`📦 Migrating ${localDataSources.length} data sources...`);
      for (const source of localDataSources) {
        await createDataSource(supabase, {
          id: source.id,
          name: source.name,
          type: source.type,
          config: source.config,
        });
      }
    }

    // 2. Мигрируем датасеты
    const localDatasets = JSON.parse(localStorage.getItem('datasets') || '[]');
    if (localDatasets.length > 0) {
      console.log(`📦 Migrating ${localDatasets.length} datasets...`);
      for (const dataset of localDatasets) {
        await createDataset(supabase, {
          id: dataset.id,
          data_source_id: dataset.dataSourceId,
          name: dataset.name,
          fields: dataset.fields,
          row_count: dataset.rowCount || 0,
        });
      }
    }

    // 3. Мигрируем сводные таблицы
    const localPivotTables = JSON.parse(localStorage.getItem('pivotTables') || '[]');
    if (localPivotTables.length > 0) {
      console.log(`📦 Migrating ${localPivotTables.length} pivot tables...`);
      for (const pivot of localPivotTables) {
        await createPivotTable(supabase, {
          id: pivot.id,
          dataset_id: pivot.datasetId,
          name: pivot.name,
          config: {
            rows: pivot.rows,
            values: pivot.values,
            filters: pivot.filters || [],
          },
        });
      }
    }

    // 4. Мигрируем автоправила
    const localAutoRules = JSON.parse(localStorage.getItem('autoRules') || '[]');
    if (localAutoRules.length > 0) {
      console.log(`📦 Migrating ${localAutoRules.length} auto rules...`);
      for (const rule of localAutoRules) {
        await createAutoRule(supabase, {
          id: rule.id,
          dataset_id: rule.datasetId,
          name: rule.name,
          field: rule.field,
          operator: rule.operator,
          value: rule.value,
          period: rule.period,
          notification_type: rule.notificationType,
          active: rule.active,
          condition: rule.condition,
        });
      }
    }

    // 5. Мигрируем события правил
    const localRuleEvents = JSON.parse(localStorage.getItem('ruleEvents') || '[]');
    if (localRuleEvents.length > 0) {
      console.log(`📦 Migrating ${localRuleEvents.length} rule events...`);
      for (const event of localRuleEvents) {
        await createRuleEvent(supabase, {
          id: event.id,
          rule_id: event.ruleId,
          triggered_value: event.triggeredValue,
          metadata: event.metadata,
        });
      }
    }

    console.log('✅ Migration completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}
