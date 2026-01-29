'use client';

import Link from 'next/link';
import { Plus, TrendingUp, Edit, Trash2, Download } from 'lucide-react';
import { usePivotTables, useDatasets } from '@/lib/use-storage';

export default function PivotTablesPage() {
  const { pivotTables, remove } = usePivotTables();
  const { datasets } = useDatasets();

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить эту сводную таблицу?')) return;
    await remove(id);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Сводные таблицы
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Создавайте группировки и агрегации данных
          </p>
        </div>
        <Link href="/dashboard/pivot/new" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Создать таблицу
        </Link>
      </div>

      {pivotTables.length === 0 ? (
        <div className="glass-card text-center py-16">
          <div className="w-20 h-20 bg-dark-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Нет сводных таблиц
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Создайте сводную таблицу для анализа данных
          </p>
          <Link href="/dashboard/pivot/new" className="btn btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Создать первую таблицу
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pivotTables.map((table) => {
            const dataset = datasets.find(d => d.id === table.datasetId);
            return (
              <PivotTableCard 
                key={table.id} 
                table={table} 
                dataset={dataset}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function PivotTableCard({ 
  table, 
  dataset, 
  onDelete 
}: { 
  table: any; 
  dataset?: any;
  onDelete: (id: string) => void;
}) {
  const groupByFields = table.rows?.map((r: any) => r.field).join(', ') || 'Нет';
  const metricsFields = table.values?.map((v: any) => `${v.type}(${v.field})`).join(', ') || 'Нет';

  return (
    <div className="card group hover:shadow-2xl hover:shadow-orange-500/10 transition-all hover:-translate-y-1 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors"></div>
      
      <div className="relative flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white group-hover:text-gradient transition-colors mb-1">
              {table.name}
            </h3>
            <p className="text-sm text-gray-400 mb-1">
              Датасет: {dataset ? dataset.name : 'Неизвестно'}
            </p>
            <p className="text-sm text-gray-500 mb-2">
              Группировки: {groupByFields}
            </p>
            <p className="text-sm text-gray-500">
              Метрики: {metricsFields}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="btn btn-secondary p-2" title="Скачать">
            <Download className="w-4 h-4" />
          </button>
          <button className="btn btn-secondary p-2" title="Редактировать">
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(table.id)}
            className="btn btn-secondary p-2 text-red-600 hover:bg-red-500/10" 
            title="Удалить"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
