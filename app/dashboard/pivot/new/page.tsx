'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, GripVertical, TrendingUp, Layers, Calculator, Eye, Save, ArrowLeft, Loader, ArrowUpDown, ArrowUp, ArrowDown, HelpCircle, MoveHorizontal } from 'lucide-react';
import { calculatePivotTable } from '@/lib/pivot';
import { useDatasets, useDataSources } from '@/lib/use-storage';

type SortConfig = {
  field: string;
  direction: 'asc' | 'desc';
} | null;

export default function NewPivotTablePage() {
  const router = useRouter();
  
  // Шаг 1: Выбор датасета и название
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [datasetId, setDatasetId] = useState('');
  
  // Загружаем датасеты и источники из Supabase или localStorage
  const { datasets, loading: datasetsLoading } = useDatasets();
  const { dataSources } = useDataSources();
  
  // Шаг 2: Конструктор сводной
  const [rows, setRows] = useState<any[]>([]);
  const [values, setValues] = useState<any[]>([]);
  const [calculatedFields, setCalculatedFields] = useState<any[]>([]);
  const [showCalcFieldModal, setShowCalcFieldModal] = useState(false);
  
  // Новые состояния для улучшений
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [showTotals, setShowTotals] = useState(true);
  
  // Состояния для визуального конструктора вычисляемых полей
  const [calcFieldName, setCalcFieldName] = useState('');
  const [calcFieldFormula, setCalcFieldFormula] = useState<{
    operand1: string;
    operator: '+' | '-' | '*' | '/';
    operand2: string | number;
  }>({
    operand1: '',
    operator: '/',
    operand2: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [rawData, setRawData] = useState<any[]>([]);

  const selectedDataset = datasets.find(d => d.id === datasetId);

  // Автоматически загружаем данные из источника если их нет в датасете
  useEffect(() => {
    const loadDataFromSource = async () => {
      if (!selectedDataset) {
        setRawData([]);
        return;
      }

      // Если данные уже есть в датасете
      if (selectedDataset.data && selectedDataset.data.length > 0) {
        console.log('✅ Using cached data from dataset:', selectedDataset.data.length, 'rows');
        setRawData(selectedDataset.data);
        return;
      }

      // Загружаем из источника
      console.log('📥 Loading data from source...');
      setLoadingData(true);
      
      try {
        const dataSource = dataSources.find((ds: any) => ds.id === selectedDataset.dataSourceId);
        
        if (!dataSource) {
          console.warn('⚠️ Data source not found');
          console.log('Available data sources:', dataSources.length);
          console.log('Looking for:', selectedDataset.dataSourceId);
          setRawData([]);
          setLoadingData(false);
          return;
        }

        // Строим URL для загрузки данных из Google Sheets
        const { spreadsheetId, sheetName } = dataSource.config;
        const googleSheetsUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
        
        console.log('📊 Fetching from Google Sheets:', { spreadsheetId, sheetName });

        // Загружаем данные из Google Sheets
        const response = await fetch(`/api/datasources/fetch?url=${encodeURIComponent(googleSheetsUrl)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
          console.warn('⚠️ No data returned from source');
          setRawData([]);
          return;
        }

        console.log('✅ Data loaded:', data.data.length, 'rows');
        setRawData(data.data);
      } catch (error) {
        console.error('❌ Error loading data from source:', error);
        setRawData([]);
      } finally {
        setLoadingData(false);
      }
    };

    loadDataFromSource();
  }, [selectedDataset, datasets, dataSources]);
  
  // Разделяем поля на группировки и метрики
  const groupingFields = selectedDataset?.fields?.filter((f: any) => 
    f.type === 'string' || f.type === 'date' || f.type === 'boolean'
  ) || [];
  
  const metricFields = selectedDataset?.fields?.filter((f: any) => 
    f.type === 'number' || f.type === 'integer' || f.type === 'float' || f.type === 'currency'
  ) || [];

  // REAL-TIME вычисление сводной таблицы
  const pivotData = useMemo(() => {
    if (!selectedDataset || rows.length === 0 || values.length === 0 || loadingData) {
      return null;
    }

    console.log('📊 Calculating pivot table...');
    console.log('Raw data rows:', rawData?.length || 0);
    console.log('Groupings:', rows);
    console.log('Metrics:', values);
    console.log('Calculated fields:', calculatedFields);

    if (!rawData || rawData.length === 0) {
      console.warn('⚠️ No data available in dataset');
      return null;
    }

    try {
      const result = calculatePivotTable(rawData, rows, values, calculatedFields);
      console.log('✅ Pivot result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error calculating pivot:', error);
      return null;
    }
  }, [rawData, rows, values, calculatedFields, selectedDataset, loadingData]);

  // Сортировка данных
  const sortedPivotData = useMemo(() => {
    if (!pivotData || !sortConfig) return pivotData;

    const sorted = [...pivotData.rows].sort((a, b) => {
      const aVal = a[sortConfig.field];
      const bVal = b[sortConfig.field];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortConfig.direction === 'asc' 
        ? aStr.localeCompare(bStr, 'ru-RU')
        : bStr.localeCompare(aStr, 'ru-RU');
    });

    return { ...pivotData, rows: sorted };
  }, [pivotData, sortConfig]);

  // Вычисление итоговой строки
  const totalsRow = useMemo(() => {
    if (!sortedPivotData || sortedPivotData.rows.length === 0) return null;

    const totals: any = {};
    
    values.forEach(v => {
      const key = `${v.field}_${v.type}`;
      
      if (v.type === 'sum') {
        totals[key] = sortedPivotData.rows.reduce((sum, row) => sum + (row[key] || 0), 0);
      } else if (v.type === 'avg') {
        const sum = sortedPivotData.rows.reduce((s, row) => s + (row[key] || 0), 0);
        totals[key] = sum / sortedPivotData.rows.length;
      } else if (v.type === 'count') {
        totals[key] = sortedPivotData.rows.reduce((sum, row) => sum + (row[key] || 0), 0);
      } else if (v.type === 'min') {
        totals[key] = Math.min(...sortedPivotData.rows.map(row => row[key] || Infinity));
      } else if (v.type === 'max') {
        totals[key] = Math.max(...sortedPivotData.rows.map(row => row[key] || -Infinity));
      }
    });

    return totals;
  }, [sortedPivotData, values]);

  // Шаг 1: Создание проекта
  const handleCreateProject = () => {
    if (!name || !datasetId) return;
    setStep(2);
  };

  // Добавить группировку
  const addGrouping = (field: any) => {
    if (rows.find(r => r.field === field.name)) return; // Уже добавлено
    setRows([...rows, { field: field.name, period: undefined }]);
  };

  // Добавить метрику
  const addMetric = (field: any) => {
    if (values.find(v => v.field === field.name)) return; // Уже добавлено
    setValues([...values, { field: field.name, type: 'sum' }]);
  };

  // Удалить группировку
  const removeGrouping = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  // Удалить метрику
  const removeMetric = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  // Обработчик сортировки
  const handleSort = (field: string) => {
    setSortConfig(current => {
      if (!current || current.field !== field) {
        return { field, direction: 'desc' };
      }
      if (current.direction === 'desc') {
        return { field, direction: 'asc' };
      }
      return null; // Убрать сортировку
    });
  };

  // Добавить вычисляемое поле
  const handleAddCalculatedField = () => {
    if (!calcFieldName || !calcFieldFormula.operand1 || !calcFieldFormula.operand2) {
      alert('Заполните все поля');
      return;
    }

    const newField = {
      id: crypto.randomUUID(),
      name: calcFieldName,
      formula: calcFieldFormula,
      displayName: calcFieldName
    };

    setCalculatedFields([...calculatedFields, newField]);
    
    // Добавляем вычисляемое поле как метрику
    setValues([...values, { 
      field: calcFieldName, 
      type: 'calculated',
      formula: calcFieldFormula
    }]);

    // Сброс формы
    setCalcFieldName('');
    setCalcFieldFormula({
      operand1: '',
      operator: '/',
      operand2: ''
    });
    setShowCalcFieldModal(false);
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const pivotTable = {
        id: crypto.randomUUID(),
        name,
        datasetId,
        rows,
        values,
        calculatedFields,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Сохраняем через универсальное хранилище
      const supabaseUrl = localStorage.getItem('supabase_url') || '';
      const supabaseKey = localStorage.getItem('supabase_key') || '';
      
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
        const { createSupabaseClient, createPivotTable } = await import('@/lib/supabase-client');
        const client = createSupabaseClient(supabaseUrl, supabaseKey);
        await createPivotTable(client, {
          id: pivotTable.id,
          dataset_id: pivotTable.datasetId,
          name: pivotTable.name,
          config: { rows, values, filters: [] },
        });
        console.log('✅ Pivot table saved to Supabase');
      } else {
        const existingPivotTables = JSON.parse(localStorage.getItem('pivotTables') || '[]');
        existingPivotTables.push(pivotTable);
        localStorage.setItem('pivotTables', JSON.stringify(existingPivotTables));
        console.log('✅ Pivot table saved to localStorage');
      }

      router.push('/dashboard/pivot');
    } catch (error) {
      console.error('Failed to save pivot table:', error);
      alert('Не удалось сохранить сводную таблицу');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="glass p-8 rounded-2xl border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => router.push('/dashboard/pivot')}
                className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <h1 className="text-2xl font-bold text-white">
                Создание сводной таблицы
              </h1>
            </div>

            <p className="text-gray-400 mb-8">
              Выберите датасет и задайте название проекта
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Название сводной таблицы <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Анализ кампаний за январь"
                  className="input w-full text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Датасет <span className="text-orange-400">*</span>
                </label>
                <select
                  value={datasetId}
                  onChange={(e) => setDatasetId(e.target.value)}
                  className="input w-full text-lg"
                  disabled={datasetsLoading}
                >
                  <option value="">
                    {datasetsLoading ? 'Загрузка датасетов...' : 'Выберите датасет'}
                  </option>
                  {datasets.map((dataset) => (
                    <option key={dataset.id} value={dataset.id}>
                      {dataset.name} ({dataset.fields?.length || 0} полей{dataset.rowCount ? `, ${dataset.rowCount} строк` : ''})
                    </option>
                  ))}
                </select>
                {datasetsLoading && (
                  <p className="text-sm text-blue-400 mt-2 flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Загрузка датасетов из Supabase...
                  </p>
                )}
                {!datasetsLoading && datasets.length === 0 && (
                  <p className="text-sm text-yellow-400 mt-2">
                    ⚠️ Сначала создайте датасет
                  </p>
                )}
              </div>

              {datasetId && selectedDataset && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <p className="text-sm text-blue-300 mb-2">
                    <strong>Доступно:</strong>
                  </p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-white">
                      🔤 {groupingFields.length} группировок
                    </span>
                    <span className="text-white">
                      🔢 {metricFields.length} показателей
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => router.push('/dashboard/pivot')}
                className="btn flex-1"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!name || !datasetId}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                Далее: Создать сводную →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-dark-900">
      {/* Шапка */}
      <div className="glass border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStep(1)}
              className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{name}</h1>
              <p className="text-sm text-gray-400">
                {selectedDataset?.name} • {rawData.length} строк
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading || rows.length === 0 || values.length === 0}
            className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Левая панель: Доступные поля */}
        <div className="w-80 glass border-r border-gray-800 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Группировки */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                Группировки
              </h3>
              <div className="space-y-2">
                {groupingFields.length === 0 ? (
                  <p className="text-sm text-gray-500">Нет доступных полей</p>
                ) : (
                  groupingFields.map((field: any) => (
                    <button
                      key={field.name}
                      onClick={() => addGrouping(field)}
                      disabled={rows.find(r => r.field === field.name)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        rows.find(r => r.field === field.name)
                          ? 'border-gray-700 bg-dark-800 text-gray-500 cursor-not-allowed'
                          : 'border-gray-700 hover:border-blue-500 hover:bg-dark-800 text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{field.displayName || field.name}</span>
                        <span className="text-xs text-gray-500">{field.type}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Показатели */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                Показатели
              </h3>
              <div className="space-y-2">
                {metricFields.length === 0 ? (
                  <p className="text-sm text-gray-500">Нет доступных полей</p>
                ) : (
                  metricFields.map((field: any) => (
                    <button
                      key={field.name}
                      onClick={() => addMetric(field)}
                      disabled={values.find(v => v.field === field.name)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        values.find(v => v.field === field.name)
                          ? 'border-gray-700 bg-dark-800 text-gray-500 cursor-not-allowed'
                          : 'border-gray-700 hover:border-orange-500 hover:bg-dark-800 text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{field.displayName || field.name}</span>
                        <span className="text-xs text-gray-500">{field.type}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Вычисляемые поля */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-green-400" />
                Вычисляемые поля
              </h3>
              <button
                onClick={() => setShowCalcFieldModal(true)}
                className="w-full p-3 rounded-lg border border-dashed border-gray-700 hover:border-green-500 hover:bg-dark-800 text-gray-400 hover:text-white transition-all"
              >
                <Plus className="w-5 h-5 mx-auto" />
              </button>
              
              {calculatedFields.length > 0 && (
                <div className="mt-3 space-y-2">
                  {calculatedFields.map((field: any) => (
                    <div
                      key={field.id}
                      className="p-3 rounded-lg border border-green-500/30 bg-green-500/5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">{field.displayName}</span>
                        <button
                          onClick={() => setCalculatedFields(calculatedFields.filter(f => f.id !== field.id))}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {field.formula.operand1} {field.formula.operator} {field.formula.operand2}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Правая панель: Конструктор и превью */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Конфигурация */}
          <div className="glass border-b border-gray-800 p-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Группировки */}
              <div>
                <h3 className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Выбранные группировки ({rows.length})
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {rows.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Добавьте группировки</p>
                  ) : (
                    rows.map((row, index) => {
                      const field = groupingFields.find((f: any) => f.name === row.field);
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg"
                        >
                          <GripVertical className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-white flex-1">
                            {field?.displayName || row.field}
                          </span>
                          <button
                            onClick={() => removeGrouping(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Показатели */}
              <div>
                <h3 className="text-sm font-semibold text-orange-300 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Выбранные показатели ({values.length})
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {values.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Добавьте показатели</p>
                  ) : (
                    values.map((value, index) => {
                      const field = metricFields.find((f: any) => f.name === value.field);
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg"
                        >
                          <GripVertical className="w-4 h-4 text-gray-500" />
                          <select
                            value={value.type}
                            onChange={(e) => {
                              const newValues = [...values];
                              newValues[index].type = e.target.value;
                              setValues(newValues);
                            }}
                            className="text-xs bg-dark-800 border border-gray-700 rounded px-2 py-1 text-white"
                          >
                            <option value="sum">Сумма</option>
                            <option value="avg">Среднее</option>
                            <option value="count">Количество</option>
                            <option value="min">Минимум</option>
                            <option value="max">Максимум</option>
                          </select>
                          <span className="text-sm text-white flex-1">
                            {field?.displayName || value.field}
                          </span>
                          <button
                            onClick={() => removeMetric(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Опции отображения */}
            <div className="mt-4 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTotals}
                  onChange={(e) => setShowTotals(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-700 bg-dark-800 text-orange-500 focus:ring-orange-500"
                />
                Показывать итоги
              </label>
            </div>
          </div>

          {/* Превью таблицы */}
          <div className="flex-1 overflow-auto p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                Предпросмотр (Real-time)
              </h3>
            </div>

            {rows.length === 0 || values.length === 0 ? (
              <div className="p-8 bg-gray-800/30 border border-gray-700 rounded-xl">
                <p className="text-gray-400 text-center">
                  💡 Добавьте группировки и показатели, чтобы увидеть таблицу
                </p>
              </div>
            ) : loadingData ? (
              <div className="p-8 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div className="flex items-center justify-center gap-3">
                  <Loader className="w-6 h-6 animate-spin text-blue-400" />
                  <p className="text-blue-300">Загрузка данных из источника...</p>
                </div>
              </div>
            ) : !rawData || rawData.length === 0 ? (
              <div className="p-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <p className="text-yellow-300 text-center">
                  ⚠️ Не удалось загрузить данные. Проверьте что источник данных доступен.
                </p>
              </div>
            ) : !sortedPivotData || sortedPivotData.rows.length === 0 ? (
              <div className="p-8 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-blue-300 text-center">
                  🔄 Вычисление данных... ({rawData.length} строк в датасете)
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-between">
                  <p className="text-sm text-green-300">
                    ✅ Показано {Math.min(100, sortedPivotData.rows.length)} из {sortedPivotData.rows.length} строк • Исходных данных: {rawData.length}
                  </p>
                  <button
                    onClick={() => setSortConfig(null)}
                    className="text-xs text-gray-400 hover:text-white"
                    disabled={!sortConfig}
                  >
                    Сбросить сортировку
                  </button>
                </div>
                <div className="overflow-x-auto border border-gray-800 rounded-xl">
                  <table className="w-full">
                    <thead className="bg-dark-800 sticky top-0 z-10">
                      <tr className="border-b border-gray-700">
                        {rows.map((row, i) => {
                          const field = groupingFields.find((f: any) => f.name === row.field);
                          return (
                            <th 
                              key={i} 
                              className="text-left p-4 text-sm font-semibold text-blue-300 group cursor-pointer hover:bg-dark-700 transition-colors"
                              onClick={() => handleSort(row.field)}
                            >
                              <div className="flex items-center gap-2">
                                <MoveHorizontal className="w-4 h-4 text-gray-600 group-hover:text-blue-400" />
                                <span>{field?.displayName || row.field}</span>
                                {sortConfig?.field === row.field && (
                                  sortConfig.direction === 'asc' 
                                    ? <ArrowUp className="w-4 h-4" />
                                    : <ArrowDown className="w-4 h-4" />
                                )}
                                {!sortConfig || sortConfig.field !== row.field && (
                                  <ArrowUpDown className="w-4 h-4 opacity-0 group-hover:opacity-50" />
                                )}
                              </div>
                            </th>
                          );
                        })}
                        {values.map((value, i) => {
                          const field = metricFields.find((f: any) => f.name === value.field);
                          const key = `${value.field}_${value.type}`;
                          return (
                            <th 
                              key={i} 
                              className="text-right p-4 text-sm font-semibold text-orange-300 group cursor-pointer hover:bg-dark-700 transition-colors"
                              onClick={() => handleSort(key)}
                            >
                              <div className="flex items-center justify-end gap-2">
                                {sortConfig?.field === key && (
                                  sortConfig.direction === 'asc' 
                                    ? <ArrowUp className="w-4 h-4" />
                                    : <ArrowDown className="w-4 h-4" />
                                )}
                                {!sortConfig || sortConfig.field !== key && (
                                  <ArrowUpDown className="w-4 h-4 opacity-0 group-hover:opacity-50" />
                                )}
                                <span>
                                  {value.type === 'sum' && 'Σ '}
                                  {value.type === 'avg' && 'Ø '}
                                  {value.type === 'count' && '# '}
                                  {value.type === 'min' && 'Min '}
                                  {value.type === 'max' && 'Max '}
                                  {field?.displayName || value.field}
                                </span>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPivotData.rows.slice(0, 100).map((row: any, i: number) => (
                        <tr key={i} className="border-b border-gray-800 hover:bg-dark-800/50 transition-colors">
                          {rows.map((r, j) => (
                            <td key={j} className="p-4 text-white">
                              {row[r.field] ?? '-'}
                            </td>
                          ))}
                          {values.map((v, j) => (
                            <td key={j} className="p-4 text-right font-mono text-orange-300">
                              {typeof row[`${v.field}_${v.type}`] === 'number'
                                ? row[`${v.field}_${v.type}`].toLocaleString('ru-RU', { maximumFractionDigits: 2 })
                                : row[`${v.field}_${v.type}`] ?? '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                      
                      {/* Итоговая строка */}
                      {showTotals && totalsRow && (
                        <tr className="bg-orange-500/10 border-t-2 border-orange-500/50 font-bold">
                          {rows.map((_, j) => (
                            <td key={j} className="p-4 text-white">
                              {j === 0 ? 'ИТОГО' : ''}
                            </td>
                          ))}
                          {values.map((v, j) => (
                            <td key={j} className="p-4 text-right font-mono text-orange-400">
                              {typeof totalsRow[`${v.field}_${v.type}`] === 'number'
                                ? totalsRow[`${v.field}_${v.type}`].toLocaleString('ru-RU', { maximumFractionDigits: 2 })
                                : '-'}
                            </td>
                          ))}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно вычисляемых полей */}
      {showCalcFieldModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="glass p-8 rounded-2xl border border-gray-800 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Calculator className="w-6 h-6 text-green-400" />
                Создать вычисляемое поле
              </h2>
              <button
                onClick={() => setShowCalcFieldModal(false)}
                className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Инструкция */}
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-300 font-semibold mb-2">
                    Как создать вычисляемое поле:
                  </p>
                  <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                    <li>Выберите первое поле (например, "Расход")</li>
                    <li>Выберите операцию: + - * /</li>
                    <li>Выберите второе поле или введите число</li>
                    <li>Примеры: Расход / Клики = CPC, Клики / Показы * 100 = CTR%</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Название поля */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Название поля <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  value={calcFieldName}
                  onChange={(e) => setCalcFieldName(e.target.value)}
                  placeholder="Например: CPC, CTR%, Конверсия"
                  className="input w-full"
                />
              </div>

              {/* Визуальный конструктор формулы */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Формула <span className="text-orange-400">*</span>
                </label>
                
                <div className="flex items-center gap-3">
                  {/* Первый операнд */}
                  <div className="flex-1">
                    <select
                      value={calcFieldFormula.operand1}
                      onChange={(e) => setCalcFieldFormula({ ...calcFieldFormula, operand1: e.target.value })}
                      className="input w-full"
                    >
                      <option value="">Выберите поле</option>
                      <optgroup label="📊 Числовые поля">
                        {metricFields.map((field: any) => (
                          <option key={field.name} value={field.name}>
                            {field.displayName || field.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Оператор */}
                  <div className="flex gap-1">
                    {['+', '-', '*', '/'].map(op => (
                      <button
                        key={op}
                        onClick={() => setCalcFieldFormula({ ...calcFieldFormula, operator: op as any })}
                        className={`w-12 h-12 rounded-lg border-2 transition-all font-bold text-lg ${
                          calcFieldFormula.operator === op
                            ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                            : 'border-gray-700 hover:border-gray-600 text-gray-400'
                        }`}
                      >
                        {op}
                      </button>
                    ))}
                  </div>

                  {/* Второй операнд */}
                  <div className="flex-1">
                    <select
                      value={calcFieldFormula.operand2}
                      onChange={(e) => setCalcFieldFormula({ ...calcFieldFormula, operand2: e.target.value })}
                      className="input w-full"
                    >
                      <option value="">Выберите поле или введите число</option>
                      <optgroup label="📊 Числовые поля">
                        {metricFields.map((field: any) => (
                          <option key={field.name} value={field.name}>
                            {field.displayName || field.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🔢 Числа">
                        <option value="100">100</option>
                        <option value="1000">1000</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Предпросмотр формулы */}
                {calcFieldFormula.operand1 && calcFieldFormula.operand2 && (
                  <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-300 font-mono">
                      {calcFieldName || 'Новое поле'} = {calcFieldFormula.operand1} {calcFieldFormula.operator} {calcFieldFormula.operand2}
                    </p>
                  </div>
                )}
              </div>

              {/* Примеры */}
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                <p className="text-sm font-semibold text-white mb-2">💡 Примеры формул:</p>
                <div className="space-y-1 text-sm text-gray-400">
                  <p>• <strong className="text-white">CPC</strong>: Расход / Клики</p>
                  <p>• <strong className="text-white">CTR%</strong>: Клики / Показы * 100</p>
                  <p>• <strong className="text-white">Конверсия%</strong>: Конверсии / Клики * 100</p>
                  <p>• <strong className="text-white">CPM</strong>: Расход / Показы * 1000</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowCalcFieldModal(false)}
                className="btn flex-1"
              >
                Отмена
              </button>
              <button
                onClick={handleAddCalculatedField}
                disabled={!calcFieldName || !calcFieldFormula.operand1 || !calcFieldFormula.operand2}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                <Plus className="w-5 h-5 mr-2" />
                Добавить поле
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
