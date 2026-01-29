/**
 * Universal Storage Hook
 * Автоматически использует Supabase если настроен, иначе localStorage
 */

import { useState, useEffect } from 'react';
import { 
  createSupabaseClient, 
  isSupabaseConfigured,
  getDataSources,
  createDataSource,
  deleteDataSource,
  getDatasets,
  createDataset,
  updateDataset,
  deleteDataset,
  getPivotTables,
  createPivotTable,
  deletePivotTable,
  getAutoRules,
  createAutoRule,
  updateAutoRule,
  deleteAutoRule,
  getRuleEvents,
  createRuleEvent,
  getAIAnalyses,
  createAIAnalysis,
} from './supabase-client';

// Проверяем настроен ли Supabase
function getSupabaseConfig() {
  if (typeof window === 'undefined') return null;
  
  const url = localStorage.getItem('supabase_url') || '';
  const key = localStorage.getItem('supabase_key') || '';
  
  if (isSupabaseConfigured(url, key)) {
    return { url, key, client: createSupabaseClient(url, key) };
  }
  
  return null;
}

// =====================================================
// DATA SOURCES
// =====================================================

export function useDataSources() {
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = getSupabaseConfig();
      
      if (supabase) {
        // Используем Supabase
        const data = await getDataSources(supabase.client);
        setDataSources(data);
      } else {
        // Используем localStorage
        const data = JSON.parse(localStorage.getItem('dataSources') || '[]');
        setDataSources(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const create = async (dataSource: any) => {
    const supabase = getSupabaseConfig();
    
    if (supabase) {
      const created = await createDataSource(supabase.client, dataSource);
      await load();
      return created;
    } else {
      const newSource = { ...dataSource, id: dataSource.id || crypto.randomUUID() };
      const existing = JSON.parse(localStorage.getItem('dataSources') || '[]');
      existing.push(newSource);
      localStorage.setItem('dataSources', JSON.stringify(existing));
      await load();
      return newSource;
    }
  };

  const remove = async (id: string) => {
    const supabase = getSupabaseConfig();
    
    if (supabase) {
      await deleteDataSource(supabase.client, id);
    } else {
      const existing = JSON.parse(localStorage.getItem('dataSources') || '[]');
      const filtered = existing.filter((ds: any) => ds.id !== id);
      localStorage.setItem('dataSources', JSON.stringify(filtered));
    }
    
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return { dataSources, loading, error, reload: load, create, remove };
}

// =====================================================
// DATASETS
// =====================================================

export function useDatasets() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = getSupabaseConfig();
      
      if (supabase) {
        const data = await getDatasets(supabase.client);
        setDatasets(data.map((d: any) => ({
          ...d,
          dataSourceId: d.data_source_id,
          rowCount: d.row_count,
        })));
      } else {
        const data = JSON.parse(localStorage.getItem('datasets') || '[]');
        setDatasets(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const create = async (dataset: any) => {
    const supabase = getSupabaseConfig();
    
    if (supabase) {
      const created = await createDataset(supabase.client, {
        id: dataset.id,
        data_source_id: dataset.dataSourceId,
        name: dataset.name,
        fields: dataset.fields,
        row_count: dataset.rowCount || 0,
      });
      await load();
      return created;
    } else {
      const newDataset = { ...dataset, id: dataset.id || crypto.randomUUID() };
      const existing = JSON.parse(localStorage.getItem('datasets') || '[]');
      existing.push(newDataset);
      localStorage.setItem('datasets', JSON.stringify(existing));
      await load();
      return newDataset;
    }
  };

  const update = async (id: string, updates: any) => {
    const supabase = getSupabaseConfig();
    
    if (supabase) {
      await updateDataset(supabase.client, id, {
        data_source_id: updates.dataSourceId,
        name: updates.name,
        fields: updates.fields,
        row_count: updates.rowCount,
      });
    } else {
      const existing = JSON.parse(localStorage.getItem('datasets') || '[]');
      const updated = existing.map((d: any) => 
        d.id === id ? { ...d, ...updates } : d
      );
      localStorage.setItem('datasets', JSON.stringify(updated));
    }
    
    await load();
  };

  const remove = async (id: string) => {
    const supabase = getSupabaseConfig();
    
    if (supabase) {
      await deleteDataset(supabase.client, id);
    } else {
      const existing = JSON.parse(localStorage.getItem('datasets') || '[]');
      const filtered = existing.filter((d: any) => d.id !== id);
      localStorage.setItem('datasets', JSON.stringify(filtered));
    }
    
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return { datasets, loading, error, reload: load, create, update, remove };
}

// =====================================================
// PIVOT TABLES
// =====================================================

export function usePivotTables() {
  const [pivotTables, setPivotTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = getSupabaseConfig();
      
      if (supabase) {
        const data = await getPivotTables(supabase.client);
        setPivotTables(data.map((p: any) => ({
          ...p,
          datasetId: p.dataset_id,
          rows: p.config?.rows || [],
          values: p.config?.values || [],
          filters: p.config?.filters || [],
        })));
      } else {
        const data = JSON.parse(localStorage.getItem('pivotTables') || '[]');
        setPivotTables(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const create = async (pivotTable: any) => {
    const supabase = getSupabaseConfig();
    
    if (supabase) {
      const created = await createPivotTable(supabase.client, {
        id: pivotTable.id,
        dataset_id: pivotTable.datasetId,
        name: pivotTable.name,
        config: {
          rows: pivotTable.rows,
          values: pivotTable.values,
          filters: pivotTable.filters || [],
        },
      });
      await load();
      return created;
    } else {
      const newPivot = { ...pivotTable, id: pivotTable.id || crypto.randomUUID() };
      const existing = JSON.parse(localStorage.getItem('pivotTables') || '[]');
      existing.push(newPivot);
      localStorage.setItem('pivotTables', JSON.stringify(existing));
      await load();
      return newPivot;
    }
  };

  const remove = async (id: string) => {
    const supabase = getSupabaseConfig();
    
    if (supabase) {
      await deletePivotTable(supabase.client, id);
    } else {
      const existing = JSON.parse(localStorage.getItem('pivotTables') || '[]');
      const filtered = existing.filter((p: any) => p.id !== id);
      localStorage.setItem('pivotTables', JSON.stringify(filtered));
    }
    
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return { pivotTables, loading, error, reload: load, create, remove };
}

// =====================================================
// AUTO RULES
// =====================================================

export function useAutoRules() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = getSupabaseConfig();
      
      if (supabase) {
        const data = await getAutoRules(supabase.client);
        setRules(data.map((r: any) => ({
          ...r,
          datasetId: r.dataset_id,
          notificationType: r.notification_type,
        })));
      } else {
        const data = JSON.parse(localStorage.getItem('autoRules') || '[]');
        setRules(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const create = async (rule: any) => {
    const supabase = getSupabaseConfig();
    
    if (supabase) {
      const created = await createAutoRule(supabase.client, {
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
      await load();
      return created;
    } else {
      const newRule = { ...rule, id: rule.id || crypto.randomUUID() };
      const existing = JSON.parse(localStorage.getItem('autoRules') || '[]');
      existing.push(newRule);
      localStorage.setItem('autoRules', JSON.stringify(existing));
      await load();
      return newRule;
    }
  };

  const update = async (id: string, updates: any) => {
    const supabase = getSupabaseConfig();
    
    if (supabase) {
      await updateAutoRule(supabase.client, id, updates);
    } else {
      const existing = JSON.parse(localStorage.getItem('autoRules') || '[]');
      const updated = existing.map((r: any) => 
        r.id === id ? { ...r, ...updates } : r
      );
      localStorage.setItem('autoRules', JSON.stringify(updated));
    }
    
    await load();
  };

  const remove = async (id: string) => {
    const supabase = getSupabaseConfig();
    
    if (supabase) {
      await deleteAutoRule(supabase.client, id);
    } else {
      const existing = JSON.parse(localStorage.getItem('autoRules') || '[]');
      const filtered = existing.filter((r: any) => r.id !== id);
      localStorage.setItem('autoRules', JSON.stringify(filtered));
    }
    
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return { rules, loading, error, reload: load, create, update, remove };
}
