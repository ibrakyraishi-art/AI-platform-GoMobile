'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Calculator, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import type { Field, FieldType } from '@/types';
import { useDataSources } from '@/lib/use-storage';

export default function NewDatasetPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [dataSourceId, setDataSourceId] = useState('');
  const [rawData, setRawData] = useState<any[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем источники данных из Supabase или localStorage
  const { dataSources, loading: sourcesLoading } = useDataSources();

  // Автоматическое определение типа поля по данным
  const detectFieldType = (values: any[]): FieldType => {
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    
    if (nonNullValues.length === 0) return 'string';

    // Проверяем на число
    const allNumbers = nonNullValues.every(v => !isNaN(Number(v)));
    if (allNumbers) {
      const hasDecimals = nonNullValues.some(v => String(v).includes('.') || String(v).includes(','));
      return hasDecimals ? 'float' : 'integer';
    }

    // Проверяем на дату
    const allDates = nonNullValues.every(v => !isNaN(Date.parse(v)));
    if (allDates) {
      return 'date';
    }

    // Проверяем на boolean
    const allBooleans = nonNullValues.every(v => 
      String(v).toLowerCase() === 'true' || 
      String(v).toLowerCase() === 'false' ||
      v === 'да' ||
      v === 'нет'
    );
    if (allBooleans) return 'boolean';

    return 'string';
  };

  // Загрузка данных из источника
  const loadDataFromSource = async () => {
    if (!dataSourceId) return;

    setLoadingData(true);
    setError(null);

    try {
      const source = dataSources.find(s => s.id === dataSourceId);
      if (!source) {
        throw new Error('Источник данных не найден');
      }

      if (source.type === 'google_sheets') {
        // Загружаем данные из Google Sheets
        const { spreadsheetId, sheetName } = source.config;
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
        
        const response = await fetch(url);
        const text = await response.text();
        
        const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
        if (!jsonMatch) {
          throw new Error('Не удалось загрузить данные из Google Sheets');
        }
        
        const data = JSON.parse(jsonMatch[1]);
        
        if (!data.table || !data.table.rows) {
          throw new Error('Таблица пуста');
        }
        
        // Получаем заголовки и данные
        const headers = data.table.cols.map((col: any) => col.label || `Колонка ${col.id}`);
        const rows = data.table.rows.map((row: any) => {
          const obj: any = {};
          row.c.forEach((cell: any, index: number) => {
            obj[headers[index]] = cell ? cell.v : null;
          });
          return obj;
        });
        
        setRawData(rows);

        // Автоматически создаем поля на основе заголовков
        const autoFields: Field[] = headers.map((header: string, index: number) => {
          const columnValues = rows.map((row: any) => row[header]);
          const detectedType = detectFieldType(columnValues);
          
          return {
            id: crypto.randomUUID(),
            name: header,
            displayName: header,
            type: detectedType,
            isCalculated: false,
          };
        });

        setFields(autoFields);
        setStep(2);
        
        if (!name) {
          setName(`${source.name} - Датасет`);
        }
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Не удалось загрузить данные из источника');
    } finally {
      setLoadingData(false);
    }
  };


  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (fields.length === 0) {
      setError('Добавьте хотя бы одно поле');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Создаем датасет БЕЗ сохранения данных (чтобы не переполнять localStorage)
      // Данные будут загружаться динамически из источника при необходимости
      const dataset = {
        id: crypto.randomUUID(),
        name,
        dataSourceId,
        fields: fields.filter(f => !f.isCalculated), // Только не вычисляемые поля
        rowCount: rawData.length, // Сохраняем только количество строк
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('💾 Saving dataset (without data):', dataset);

      // Сохраняем через универсальное хранилище (Supabase или localStorage)
      const supabaseUrl = localStorage.getItem('supabase_url') || '';
      const supabaseKey = localStorage.getItem('supabase_key') || '';
      
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
        // Используем Supabase
        const { createSupabaseClient, createDataset } = await import('@/lib/supabase-client');
        const client = createSupabaseClient(supabaseUrl, supabaseKey);
        await createDataset(client, {
          id: dataset.id,
          data_source_id: dataset.dataSourceId,
          name: dataset.name,
          fields: dataset.fields,
          row_count: dataset.rowCount,
        });
        console.log('✅ Dataset saved to Supabase');
      } else {
        // Используем localStorage
        const existingDatasets = JSON.parse(localStorage.getItem('datasets') || '[]');
        existingDatasets.push(dataset);
        localStorage.setItem('datasets', JSON.stringify(existingDatasets));
        console.log('✅ Dataset saved to localStorage');
      }
      
      router.push('/dashboard/datasets');
    } catch (error: any) {
      console.error('❌ Error creating dataset:', error);
      
      // Специальная обработка ошибки переполнения localStorage
      if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
        setError('Недостаточно места в хранилище браузера. Попробуйте удалить старые датасеты.');
      } else {
        setError(error.message || 'Не удалось создать датасет');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Создать датасет
        </h1>
        <p className="text-gray-400">
          Шаг {step} из 2: {step === 1 ? 'Выберите источник данных' : 'Настройте поля'}
        </p>
      </div>

      {error && (
        <div className="glass-card mb-6 bg-red-500/10 border-red-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold mb-1">Ошибка</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* ШАГ 1: Выбор источника */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-6">
              Выберите источник данных
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Название датасета <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Рекламные кампании - январь 2026"
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Источник данных <span className="text-orange-400">*</span>
                </label>
                <select
                  value={dataSourceId}
                  onChange={(e) => setDataSourceId(e.target.value)}
                  className="input w-full"
                  required
                  disabled={sourcesLoading}
                >
                  <option value="">
                    {sourcesLoading ? 'Загрузка источников...' : 'Выберите источник'}
                  </option>
                  {dataSources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name} ({source.type === 'google_sheets' ? 'Google Sheets' : source.type})
                    </option>
                  ))}
                </select>
                {!sourcesLoading && dataSources.length === 0 && (
                  <p className="text-sm text-gray-400 mt-2">
                    Сначала подключите источник данных
                  </p>
                )}
                {sourcesLoading && (
                  <p className="text-sm text-blue-400 mt-2 flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Загрузка источников из Supabase...
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-secondary"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={loadDataFromSource}
                disabled={!dataSourceId || !name || loadingData}
                className="btn btn-primary disabled:opacity-50"
              >
                {loadingData ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Загрузка данных...
                  </>
                ) : (
                  'Загрузить данные →'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ШАГ 2: Предпросмотр таблицы и настройка полей */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Предпросмотр данных */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Предпросмотр данных
                </h2>
                <p className="text-gray-400 text-sm">
                  Загружено {rawData.length} строк из источника
                </p>
              </div>
              <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-semibold">Данные загружены</span>
              </div>
            </div>

            {/* Таблица с данными */}
            <div className="overflow-x-auto bg-dark-800 rounded-xl border border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-dark-700">
                  <tr>
                    {fields.map((field) => (
                      <th key={field.id} className="px-4 py-3 text-left text-white font-semibold border-b border-gray-700">
                        {field.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rawData.slice(0, 10).map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-gray-800 hover:bg-dark-700/50 transition-colors">
                      {fields.map((field) => {
                        let displayValue = row[field.name] ?? '-';
                        
                        // Форматируем даты
                        if (field.type === 'date' && displayValue !== '-') {
                          try {
                            // Если это Excel серийный номер (число > 40000)
                            if (typeof displayValue === 'number' && displayValue > 40000 && displayValue < 50000) {
                              const excelEpoch = new Date(1899, 11, 30);
                              const date = new Date(excelEpoch.getTime() + displayValue * 86400000);
                              displayValue = date.toLocaleDateString('ru-RU', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              });
                            } else {
                              // Обычная дата
                              const date = new Date(displayValue);
                              if (!isNaN(date.getTime())) {
                                displayValue = date.toLocaleDateString('ru-RU', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric'
                                });
                              }
                            }
                          } catch (e) {
                            // Оставляем как есть при ошибке
                          }
                        }
                        
                        return (
                          <td key={field.id} className="px-4 py-3 text-gray-300">
                            {displayValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rawData.length > 10 && (
              <p className="text-sm text-gray-500 mt-3 text-center">
                Показаны первые 10 из {rawData.length} строк
              </p>
            )}
          </div>

          {/* Настройка полей */}
          <div className="card">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">
                Настройка полей
              </h2>
              <p className="text-gray-400 text-sm">
                Типы определены автоматически. Вы можете изменить их или удалить ненужные столбцы.
              </p>
            </div>

            <div className="space-y-3">
              {fields.map((field) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  onUpdate={(updates) => updateField(field.id, updates)}
                  onRemove={() => removeField(field.id)}
                />
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300">
                💡 <strong>Совет:</strong> Вычисляемые поля (CPC, CTR, ROI и др.) можно будет создать при построении сводной таблицы.
              </p>
            </div>
          </div>

          {/* Действия */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setRawData([]);
                setFields([]);
              }}
              className="btn btn-secondary"
            >
              ← Назад
            </button>
            <button
              type="submit"
              disabled={loading || fields.length === 0}
              className="btn btn-primary disabled:opacity-50 flex-1"
            >
              {loading ? 'Создание датасета...' : 'Создать датасет'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function FieldEditor({
  field,
  onUpdate,
  onRemove,
}: {
  field: Field;
  onUpdate: (updates: Partial<Field>) => void;
  onRemove: () => void;
}) {
  const fieldTypes: { value: FieldType; label: string; icon: string }[] = [
    { value: 'string', label: 'Строка', icon: 'Aa' },
    { value: 'number', label: 'Число', icon: '123' },
    { value: 'float', label: 'Дробное', icon: '1.5' },
    { value: 'integer', label: 'Целое', icon: '42' },
    { value: 'date', label: 'Дата', icon: '📅' },
    { value: 'datetime', label: 'Дата+Время', icon: '🕐' },
    { value: 'boolean', label: 'Да/Нет', icon: '✓' },
    { value: 'currency', label: 'Валюта', icon: '$' },
  ];

  const getTypeColor = (type: FieldType) => {
    const colors: Record<FieldType, string> = {
      string: 'blue',
      number: 'green',
      float: 'emerald',
      integer: 'cyan',
      date: 'purple',
      datetime: 'violet',
      boolean: 'pink',
      currency: 'yellow',
    };
    return colors[type] || 'gray';
  };

  const color = getTypeColor(field.type);

  return (
    <div className={`bg-dark-800 border ${field.isCalculated ? 'border-orange-500/30' : 'border-gray-700'} rounded-xl p-4 hover:border-orange-500/50 transition-all group`}>
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Иконка типа */}
        <div className="col-span-1 flex justify-center">
          <div className={`w-10 h-10 rounded-lg bg-${color}-500/10 border border-${color}-500/30 flex items-center justify-center text-${color}-400 font-bold`}>
            {fieldTypes.find(t => t.value === field.type)?.icon || 'A'}
          </div>
        </div>

        {/* Название */}
        <div className="col-span-3">
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Название поля
          </label>
          <input
            type="text"
            value={field.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="clicks"
            className="input w-full text-sm bg-dark-900"
            required
            disabled={!field.isCalculated}
          />
        </div>

        {/* Отображаемое имя */}
        <div className="col-span-3">
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Отображаемое имя
          </label>
          <input
            type="text"
            value={field.displayName}
            onChange={(e) => onUpdate({ displayName: e.target.value })}
            placeholder="Клики"
            className="input w-full text-sm bg-dark-900"
          />
        </div>

        {/* Тип */}
        <div className="col-span-3">
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Тип данных
          </label>
          <select
            value={field.type}
            onChange={(e) => onUpdate({ type: e.target.value as FieldType })}
            className="input w-full text-sm bg-dark-900"
          >
            {fieldTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Кнопки */}
        <div className="col-span-2 flex items-end justify-end gap-2">
          <button
            type="button"
            onClick={() => onUpdate({ isCalculated: !field.isCalculated })}
            className={`p-2.5 rounded-lg transition-all ${
              field.isCalculated
                ? 'bg-orange-500/20 border border-orange-500/30 text-orange-400 shadow-lg shadow-orange-500/20'
                : 'bg-dark-900 border border-gray-700 text-gray-400 hover:text-orange-400 hover:border-orange-500/30'
            }`}
            title="Вычисляемое поле"
          >
            <Calculator className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-2.5 rounded-lg bg-dark-900 border border-gray-700 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Формула (если вычисляемое) */}
        {field.isCalculated && (
          <div className="col-span-12 pt-4 border-t border-gray-700">
            <label className="block text-xs font-medium text-orange-400 mb-2">
              Формула вычисления
            </label>
            <input
              type="text"
              value={field.formula || ''}
              onChange={(e) => onUpdate({ formula: e.target.value })}
              placeholder="{spend} / {clicks}"
              className="input w-full text-sm font-mono bg-dark-900 text-orange-300"
            />
            <p className="text-xs text-gray-500 mt-2">
              Используйте {'{fieldName}'} для ссылки на другие поля. Доступные операции: + - * / ( )
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
