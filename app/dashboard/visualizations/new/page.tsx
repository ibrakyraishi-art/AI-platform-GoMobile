'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, BarChart3, PieChart, LineChart, Table2, Layers, 
  TrendingUp, Activity, ScatterChart, AreaChart, Save, Loader,
  Plus, X, GripVertical, Calculator, HelpCircle, ArrowUpDown, Eye
} from 'lucide-react';
import { useDatasets, useDataSources } from '@/lib/use-storage';
import { calculatePivotTable } from '@/lib/pivot';
import {
  BarChart, Bar, LineChart as RechartsLine, Line, PieChart as RechartsPie, Pie,
  AreaChart as RechartsArea, Area, ScatterChart as RechartsScatter, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

type VisualizationType = 'pivot' | 'table' | 'bar' | 'line' | 'area' | 'pie' | 'donut' | 'scatter';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899'];

export default function NewVisualizationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Выбор типа, 2: Выбор данных, 3: Конфигурация

  // Шаг 1: Тип визуализации
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('bar');
  const [name, setName] = useState('');
  
  // Шаг 2: Выбор данных
  const [datasetId, setDatasetId] = useState('');
  const { datasets, loading: datasetsLoading } = useDatasets();
  const { dataSources } = useDataSources();
  
  // Загрузка данных
  const [rawData, setRawData] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Конфигурация визуализации
  const [config, setConfig] = useState<any>({
    // Для графиков
    xAxis: '',
    yAxis: [],
    
    // Для сводных
    rows: [],
    columns: [],
    values: [],
    calculatedFields: [],
    showTotals: true,
    
    // Для таблиц
    visibleColumns: [],
    sortBy: null,
    sortDirection: 'asc'
  });

  const [loading, setLoading] = useState(false);
  
  const selectedDataset = datasets.find(d => d.id === datasetId);

  // Загрузка данных из источника
  useEffect(() => {
    const loadDataFromSource = async () => {
      if (!selectedDataset) {
        setRawData([]);
        return;
      }

      if (selectedDataset.data && selectedDataset.data.length > 0) {
        console.log('✅ Using cached data from dataset:', selectedDataset.data.length, 'rows');
        setRawData(selectedDataset.data);
        return;
      }

      console.log('📥 Loading data from source...');
      setLoadingData(true);
      
      try {
        const dataSource = dataSources.find((ds: any) => ds.id === selectedDataset.dataSourceId);
        
        if (!dataSource) {
          console.warn('⚠️ Data source not found');
          setRawData([]);
          setLoadingData(false);
          return;
        }

        const { spreadsheetId, sheetName } = dataSource.config;
        const googleSheetsUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
        
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

  // Разделяем поля
  const groupingFields = selectedDataset?.fields?.filter((f: any) => 
    f.type === 'string' || f.type === 'date' || f.type === 'boolean'
  ) || [];
  
  const metricFields = selectedDataset?.fields?.filter((f: any) => 
    f.type === 'number' || f.type === 'integer' || f.type === 'float' || f.type === 'currency'
  ) || [];

  const allFields = [...groupingFields, ...metricFields];

  // Вычисление данных для превью
  const previewData = useMemo(() => {
    if (!rawData || rawData.length === 0) return null;

    if (visualizationType === 'pivot') {
      if (config.rows.length === 0 || config.values.length === 0) return null;
      return calculatePivotTable(rawData, config.rows, config.values, config.calculatedFields);
    }

    if (visualizationType === 'table') {
      return { rows: rawData.slice(0, 100) };
    }

    // Для графиков
    if (['bar', 'line', 'area', 'pie', 'scatter'].includes(visualizationType)) {
      if (!config.xAxis || config.yAxis.length === 0) return null;
      
      // Группируем данные по X-оси
      const grouped = rawData.reduce((acc: any, row: any) => {
        const key = row[config.xAxis];
        if (!acc[key]) {
          acc[key] = { [config.xAxis]: key };
          config.yAxis.forEach((y: string) => {
            acc[key][y] = 0;
            acc[key][`${y}_count`] = 0;
          });
        }
        config.yAxis.forEach((y: string) => {
          const value = Number(row[y]) || 0;
          acc[key][y] += value;
          acc[key][`${y}_count`]++;
        });
        return acc;
      }, {});

      return { rows: Object.values(grouped).slice(0, 50) };
    }

    return null;
  }, [rawData, visualizationType, config]);

  // Типы визуализаций
  const visualizationTypes = [
    {
      id: 'bar' as VisualizationType,
      name: 'Столбчатая диаграмма',
      description: 'Сравнение значений по категориям',
      icon: BarChart3,
      color: 'orange'
    },
    {
      id: 'line' as VisualizationType,
      name: 'Линейный график',
      description: 'Динамика изменения во времени',
      icon: LineChart,
      color: 'blue'
    },
    {
      id: 'area' as VisualizationType,
      name: 'График с областью',
      description: 'Накопленные значения',
      icon: AreaChart,
      color: 'green'
    },
    {
      id: 'pie' as VisualizationType,
      name: 'Круговая диаграмма',
      description: 'Доли от целого',
      icon: PieChart,
      color: 'purple'
    },
    {
      id: 'scatter' as VisualizationType,
      name: 'Точечная диаграмма',
      description: 'Корреляция между показателями',
      icon: ScatterChart,
      color: 'pink'
    },
    {
      id: 'pivot' as VisualizationType,
      name: 'Сводная таблица',
      description: 'Многомерный анализ данных',
      icon: Layers,
      color: 'indigo'
    },
    {
      id: 'table' as VisualizationType,
      name: 'Таблица данных',
      description: 'Просмотр и фильтрация данных',
      icon: Table2,
      color: 'gray'
    }
  ];

  const handleSave = async () => {
    if (!name || !datasetId) {
      alert('Заполните все обязательные поля');
      return;
    }

    setLoading(true);

    try {
      const visualization = {
        id: crypto.randomUUID(),
        name,
        type: visualizationType,
        datasetId,
        datasetName: selectedDataset?.name,
        config,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const stored = localStorage.getItem('visualizations') || '[]';
      const visualizations = JSON.parse(stored);
      visualizations.push(visualization);
      localStorage.setItem('visualizations', JSON.stringify(visualizations));

      console.log('✅ Visualization saved');
      router.push('/dashboard/visualizations');
    } catch (error) {
      console.error('Failed to save visualization:', error);
      alert('Не удалось сохранить визуализацию');
    } finally {
      setLoading(false);
    }
  };

  // Шаг 1: Выбор типа
  if (step === 1) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => router.push('/dashboard/visualizations')}
              className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Создание визуализации</h1>
              <p className="text-gray-400">Выберите тип визуализации</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visualizationTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setVisualizationType(type.id);
                  setStep(2);
                }}
                className={`glass p-6 rounded-xl border-2 transition-all text-left hover:scale-105 ${
                  visualizationType === type.id
                    ? 'border-orange-500 bg-orange-500/5'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className={`w-14 h-14 bg-${type.color}-500/10 rounded-xl flex items-center justify-center mb-4`}>
                  <type.icon className={`w-7 h-7 text-${type.color}-400`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {type.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {type.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Шаг 2: Выбор данных и название
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="glass p-8 rounded-2xl border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setStep(1)}
                className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <h1 className="text-2xl font-bold text-white">
                Настройка визуализации
              </h1>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Название <span className="text-orange-400">*</span>
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
                      {dataset.name} ({dataset.fields?.length || 0} полей)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(1)}
                className="btn flex-1"
              >
                Назад
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!name || !datasetId}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                Далее: Настроить →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Шаг 3: Конфигурация визуализации
  return (
    <div className="h-screen flex flex-col bg-dark-900">
      {/* Шапка */}
      <div className="glass border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStep(2)}
              className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{name}</h1>
              <p className="text-sm text-gray-400">
                {visualizationTypes.find(t => t.id === visualizationType)?.name} • {selectedDataset?.name}
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Левая панель: Настройки */}
        <div className="w-80 glass border-r border-gray-800 overflow-y-auto p-6">
          <h3 className="text-lg font-bold text-white mb-4">Настройки</h3>
          
          {/* Настройки для графиков */}
          {['bar', 'line', 'area', 'scatter'].includes(visualizationType) && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Ось X (категории) <span className="text-orange-400">*</span>
                </label>
                <select
                  value={config.xAxis}
                  onChange={(e) => setConfig({ ...config, xAxis: e.target.value })}
                  className="input w-full"
                >
                  <option value="">Выберите поле</option>
                  {allFields.map((field: any) => (
                    <option key={field.name} value={field.name}>
                      {field.displayName || field.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Ось Y (значения) <span className="text-orange-400">*</span>
                </label>
                <div className="space-y-2">
                  {metricFields.map((field: any) => (
                    <label key={field.name} className="flex items-center gap-2 text-sm text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.yAxis.includes(field.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig({ ...config, yAxis: [...config.yAxis, field.name] });
                          } else {
                            setConfig({ ...config, yAxis: config.yAxis.filter((y: string) => y !== field.name) });
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-700 bg-dark-800 text-orange-500"
                      />
                      {field.displayName || field.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Настройки для круговой */}
          {visualizationType === 'pie' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Категории <span className="text-orange-400">*</span>
                </label>
                <select
                  value={config.xAxis}
                  onChange={(e) => setConfig({ ...config, xAxis: e.target.value })}
                  className="input w-full"
                >
                  <option value="">Выберите поле</option>
                  {groupingFields.map((field: any) => (
                    <option key={field.name} value={field.name}>
                      {field.displayName || field.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Значение <span className="text-orange-400">*</span>
                </label>
                <select
                  value={config.yAxis[0] || ''}
                  onChange={(e) => setConfig({ ...config, yAxis: [e.target.value] })}
                  className="input w-full"
                >
                  <option value="">Выберите поле</option>
                  {metricFields.map((field: any) => (
                    <option key={field.name} value={field.name}>
                      {field.displayName || field.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Настройки для сводной */}
          {visualizationType === 'pivot' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-blue-300 mb-2">Строки</h4>
                <div className="space-y-2">
                  {groupingFields.map((field: any) => (
                    <button
                      key={field.name}
                      onClick={() => {
                        if (!config.rows.find((r: any) => r.field === field.name)) {
                          setConfig({
                            ...config,
                            rows: [...config.rows, { field: field.name, period: undefined }]
                          });
                        }
                      }}
                      disabled={config.rows.find((r: any) => r.field === field.name)}
                      className="w-full text-left p-2 rounded-lg border border-gray-700 hover:border-blue-500 text-white text-sm disabled:opacity-50"
                    >
                      {field.displayName || field.name}
                    </button>
                  ))}
                </div>
                {config.rows.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {config.rows.map((row: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-blue-500/10 rounded text-sm text-white">
                        <span className="flex-1">{row.field}</span>
                        <button
                          onClick={() => setConfig({ ...config, rows: config.rows.filter((_: any, idx: number) => idx !== i) })}
                          className="text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-orange-300 mb-2">Значения</h4>
                <div className="space-y-2">
                  {metricFields.map((field: any) => (
                    <button
                      key={field.name}
                      onClick={() => {
                        if (!config.values.find((v: any) => v.field === field.name)) {
                          setConfig({
                            ...config,
                            values: [...config.values, { field: field.name, type: 'sum' }]
                          });
                        }
                      }}
                      disabled={config.values.find((v: any) => v.field === field.name)}
                      className="w-full text-left p-2 rounded-lg border border-gray-700 hover:border-orange-500 text-white text-sm disabled:opacity-50"
                    >
                      {field.displayName || field.name}
                    </button>
                  ))}
                </div>
                {config.values.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {config.values.map((value: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-orange-500/10 rounded text-sm">
                        <select
                          value={value.type}
                          onChange={(e) => {
                            const newValues = [...config.values];
                            newValues[i].type = e.target.value;
                            setConfig({ ...config, values: newValues });
                          }}
                          className="text-xs bg-dark-800 border border-gray-700 rounded px-1 py-0.5 text-white"
                        >
                          <option value="sum">Σ</option>
                          <option value="avg">Ø</option>
                          <option value="count">#</option>
                        </select>
                        <span className="flex-1 text-white">{value.field}</span>
                        <button
                          onClick={() => setConfig({ ...config, values: config.values.filter((_: any, idx: number) => idx !== i) })}
                          className="text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Правая панель: Превью */}
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              Предпросмотр
            </h3>
          </div>

          {loadingData ? (
            <div className="flex items-center justify-center h-96">
              <Loader className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : !previewData ? (
            <div className="p-8 bg-gray-800/30 border border-gray-700 rounded-xl">
              <p className="text-gray-400 text-center">
                💡 Настройте параметры для предпросмотра
              </p>
            </div>
          ) : (
            <div className="glass p-6 rounded-xl border border-gray-800">
              {/* График - Bar Chart */}
              {visualizationType === 'bar' && previewData && (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={previewData.rows}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey={config.xAxis} stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Legend />
                    {config.yAxis.map((y: string, i: number) => (
                      <Bar key={y} dataKey={y} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}

              {/* График - Line Chart */}
              {visualizationType === 'line' && previewData && (
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsLine data={previewData.rows}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey={config.xAxis} stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Legend />
                    {config.yAxis.map((y: string, i: number) => (
                      <Line key={y} type="monotone" dataKey={y} stroke={COLORS[i % COLORS.length]} strokeWidth={2} />
                    ))}
                  </RechartsLine>
                </ResponsiveContainer>
              )}

              {/* График - Area Chart */}
              {visualizationType === 'area' && previewData && (
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsArea data={previewData.rows}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey={config.xAxis} stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Legend />
                    {config.yAxis.map((y: string, i: number) => (
                      <Area key={y} type="monotone" dataKey={y} fill={COLORS[i % COLORS.length]} stroke={COLORS[i % COLORS.length]} />
                    ))}
                  </RechartsArea>
                </ResponsiveContainer>
              )}

              {/* Круговая диаграмма */}
              {visualizationType === 'pie' && previewData && (
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsPie>
                    <Pie
                      data={previewData.rows}
                      dataKey={config.yAxis[0]}
                      nameKey={config.xAxis}
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      label
                    >
                      {previewData.rows.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              )}

              {/* Сводная таблица */}
              {visualizationType === 'pivot' && previewData && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-dark-800">
                      <tr className="border-b border-gray-700">
                        {config.rows.map((row: any, i: number) => (
                          <th key={i} className="text-left p-3 text-sm font-semibold text-blue-300">
                            {row.field}
                          </th>
                        ))}
                        {config.values.map((value: any, i: number) => (
                          <th key={i} className="text-right p-3 text-sm font-semibold text-orange-300">
                            {value.type === 'sum' && 'Σ '}
                            {value.type === 'avg' && 'Ø '}
                            {value.type === 'count' && '# '}
                            {value.field}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.rows.slice(0, 20).map((row: any, i: number) => (
                        <tr key={i} className="border-b border-gray-800 hover:bg-dark-800/50">
                          {config.rows.map((r: any, j: number) => (
                            <td key={j} className="p-3 text-white">
                              {row[r.field] ?? '-'}
                            </td>
                          ))}
                          {config.values.map((v: any, j: number) => (
                            <td key={j} className="p-3 text-right font-mono text-orange-300">
                              {typeof row[`${v.field}_${v.type}`] === 'number'
                                ? row[`${v.field}_${v.type}`].toLocaleString('ru-RU', { maximumFractionDigits: 2 })
                                : row[`${v.field}_${v.type}`] ?? '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Таблица данных */}
              {visualizationType === 'table' && previewData && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-dark-800">
                      <tr className="border-b border-gray-700">
                        {allFields.map((field: any) => (
                          <th key={field.name} className="text-left p-3 text-sm font-semibold text-white">
                            {field.displayName || field.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.rows.slice(0, 20).map((row: any, i: number) => (
                        <tr key={i} className="border-b border-gray-800 hover:bg-dark-800/50">
                          {allFields.map((field: any) => (
                            <td key={field.name} className="p-3 text-white">
                              {row[field.name] ?? '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
