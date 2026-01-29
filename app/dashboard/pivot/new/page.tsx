'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, GripVertical, TrendingUp, Layers, Calculator, Eye, Save, ArrowLeft } from 'lucide-react';
import { calculatePivotTable } from '@/lib/pivot';

export default function NewPivotTablePage() {
  const router = useRouter();
  
  // Шаг 1: Выбор датасета и название
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [datasetId, setDatasetId] = useState('');
  const [datasets, setDatasets] = useState<any[]>([]);
  
  // Шаг 2: Конструктор сводной
  const [rows, setRows] = useState<any[]>([]);
  const [values, setValues] = useState<any[]>([]);
  const [calculatedFields, setCalculatedFields] = useState<any[]>([]);
  const [showCalcFieldModal, setShowCalcFieldModal] = useState(false);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadedDatasets = JSON.parse(localStorage.getItem('datasets') || '[]');
    setDatasets(loadedDatasets);
  }, []);

  const selectedDataset = datasets.find(d => d.id === datasetId);
  const rawData = selectedDataset?.data || [];
  
  // Разделяем поля на группировки и метрики
  const groupingFields = selectedDataset?.fields?.filter((f: any) => 
    f.type === 'string' || f.type === 'date' || f.type === 'boolean'
  ) || [];
  
  const metricFields = selectedDataset?.fields?.filter((f: any) => 
    f.type === 'number' || f.type === 'integer' || f.type === 'float' || f.type === 'currency'
  ) || [];

  // REAL-TIME вычисление сводной таблицы
  const pivotData = useMemo(() => {
    if (!selectedDataset || rows.length === 0 || values.length === 0) {
      return null;
    }

    try {
      return calculatePivotTable(rawData, rows, values);
    } catch (error) {
      console.error('Error calculating pivot:', error);
      return null;
    }
  }, [rawData, rows, values, selectedDataset]);

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

  // Изменить тип агрегации
  const updateMetricType = (index: number, type: string) => {
    const newValues = [...values];
    newValues[index] = { ...newValues[index], type };
    setValues(newValues);
  };

  // Сохранить сводную таблицу
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

      const existingPivotTables = JSON.parse(localStorage.getItem('pivotTables') || '[]');
      existingPivotTables.push(pivotTable);
      localStorage.setItem('pivotTables', JSON.stringify(existingPivotTables));
      
      router.push('/dashboard/pivot');
    } catch (error) {
      console.error('Error saving pivot table:', error);
    } finally {
      setLoading(false);
    }
  };

  // ШАГ 1: Выбор датасета
  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Layers className="w-8 h-8 text-white" />
            </div>
            Создать сводную таблицу
          </h1>
          <p className="text-gray-400 text-lg">
            Выберите датасет и задайте название проекта
          </p>
        </div>

        <div className="glass-card space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Название сводной таблицы <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Анализ кампаний за январь"
              className="input w-full text-lg"
              autoFocus
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
            >
              <option value="">Выберите датасет</option>
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.name} ({dataset.fields?.length || 0} полей, {dataset.data?.length || 0} строк)
                </option>
              ))}
            </select>
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
                  📊 {metricFields.length} метрик
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleCreateProject}
              disabled={!name || !datasetId}
              className="btn btn-primary flex-1 disabled:opacity-50"
            >
              Далее: Создать сводную →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ШАГ 2: Конструктор сводной таблицы
  return (
    <div className="h-screen flex flex-col">
      {/* Хедер */}
      <div className="glass border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStep(1)}
              className="btn btn-secondary p-2"
              title="Назад"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{name}</h1>
              <p className="text-sm text-gray-400">
                Датасет: {selectedDataset?.name}
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
                          ? 'bg-dark-800 border-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-dark-800 border-gray-700 text-white hover:border-blue-500 hover:bg-blue-500/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{field.displayName || field.name}</span>
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                          {field.type}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Метрики */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                Метрики
              </h3>
              <div className="space-y-2">
                {metricFields.length === 0 ? (
                  <p className="text-sm text-gray-500">Нет доступных метрик</p>
                ) : (
                  metricFields.map((field: any) => (
                    <button
                      key={field.name}
                      onClick={() => addMetric(field)}
                      disabled={values.find(v => v.field === field.name)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        values.find(v => v.field === field.name)
                          ? 'bg-dark-800 border-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-dark-800 border-gray-700 text-white hover:border-orange-500 hover:bg-orange-500/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{field.displayName || field.name}</span>
                        <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded">
                          {field.type}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Вычисляемые поля */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-400" />
                Вычисляемые поля
              </h3>
              <button
                onClick={() => setShowCalcFieldModal(true)}
                className="w-full p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Создать поле
              </button>
            </div>
          </div>
        </div>

        {/* Правая панель: Конструктор и Preview */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Область сборки */}
            <div className="glass-card">
              <h2 className="text-2xl font-bold text-white mb-6">Настройка сводной</h2>

              {/* Группировки */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">ГРУППИРОВКИ (СТРОКИ)</h3>
                {rows.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-gray-700 rounded-xl text-center">
                    <p className="text-gray-500">
                      Выберите поля для группировки слева
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {rows.map((row, index) => {
                      const field = [...groupingFields, ...metricFields].find((f: any) => f.name === row.field);
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-4 bg-dark-800 rounded-lg border border-blue-500/30"
                        >
                          <GripVertical className="w-5 h-5 text-gray-600" />
                          <div className="flex-1">
                            <span className="font-medium text-white">
                              {field?.displayName || row.field}
                            </span>
                          </div>
                          <button
                            onClick={() => removeGrouping(index)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Метрики */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">МЕТРИКИ (ЗНАЧЕНИЯ)</h3>
                {values.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-gray-700 rounded-xl text-center">
                    <p className="text-gray-500">
                      Выберите метрики для расчета слева
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {values.map((value, index) => {
                      const field = metricFields.find((f: any) => f.name === value.field);
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-4 bg-dark-800 rounded-lg border border-orange-500/30"
                        >
                          <GripVertical className="w-5 h-5 text-gray-600" />
                          <div className="flex-1">
                            <span className="font-medium text-white">
                              {field?.displayName || value.field}
                            </span>
                          </div>
                          <select
                            value={value.type}
                            onChange={(e) => updateMetricType(index, e.target.value)}
                            className="input py-2 px-3"
                          >
                            <option value="sum">Сумма</option>
                            <option value="avg">Среднее</option>
                            <option value="count">Количество</option>
                            <option value="min">Минимум</option>
                            <option value="max">Максимум</option>
                          </select>
                          <button
                            onClick={() => removeMetric(index)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* LIVE PREVIEW */}
            {pivotData && (
              <div className="glass-card">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-green-400" />
                  Live Preview
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full">
                    Обновляется в реальном времени
                  </span>
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        {rows.map((row, i) => {
                          const field = groupingFields.find((f: any) => f.name === row.field);
                          return (
                            <th key={i} className="text-left p-3 text-sm font-semibold text-blue-300">
                              {field?.displayName || row.field}
                            </th>
                          );
                        })}
                        {values.map((value, i) => {
                          const field = metricFields.find((f: any) => f.name === value.field);
                          return (
                            <th key={i} className="text-right p-3 text-sm font-semibold text-orange-300">
                              {value.type === 'sum' && 'Σ '}
                              {value.type === 'avg' && 'Ø '}
                              {value.type === 'count' && '# '}
                              {value.type === 'min' && 'Min '}
                              {value.type === 'max' && 'Max '}
                              {field?.displayName || value.field}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {pivotData.rows.slice(0, 20).map((row: any, i: number) => (
                        <tr key={i} className="border-b border-gray-800 hover:bg-dark-800">
                          {rows.map((r, j) => (
                            <td key={j} className="p-3 text-white">
                              {row[r.field] ?? '-'}
                            </td>
                          ))}
                          {values.map((v, j) => (
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
                  {pivotData.rows.length > 20 && (
                    <p className="text-center text-gray-500 text-sm mt-4">
                      Показано 20 из {pivotData.rows.length} строк
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Подсказка если нет данных */}
            {(!rows.length || !values.length) && (
              <div className="glass-card text-center py-12">
                <div className="w-16 h-16 bg-dark-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Добавьте группировки и метрики
                </h3>
                <p className="text-gray-400">
                  Выберите поля слева, и таблица будет формироваться в реальном времени
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
