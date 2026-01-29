'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Table2, Edit, Trash2, Eye, Loader } from 'lucide-react';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    cleanupOldDatasets();
  }, []);

  const loadData = () => {
    try {
      const loadedDatasets = JSON.parse(localStorage.getItem('datasets') || '[]');
      const loadedSources = JSON.parse(localStorage.getItem('dataSources') || '[]');
      setDatasets(loadedDatasets);
      setDataSources(loadedSources);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Очистка старых датасетов с сохраненными данными (для экономии места)
  const cleanupOldDatasets = () => {
    try {
      const loadedDatasets = JSON.parse(localStorage.getItem('datasets') || '[]');
      let cleaned = false;
      
      const cleanedDatasets = loadedDatasets.map((ds: any) => {
        if (ds.data) {
          console.log(`🧹 Cleaning old data from dataset: ${ds.name}`);
          cleaned = true;
          const { data, ...rest } = ds;
          return { ...rest, rowCount: data.length };
        }
        return ds;
      });

      if (cleaned) {
        localStorage.setItem('datasets', JSON.stringify(cleanedDatasets));
        console.log('✅ Cleaned old datasets to save space');
      }
    } catch (error) {
      console.error('Error cleaning datasets:', error);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Удалить этот датасет?')) return;
    
    const filtered = datasets.filter(d => d.id !== id);
    localStorage.setItem('datasets', JSON.stringify(filtered));
    setDatasets(filtered);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card text-center py-16">
          <Loader className="w-12 h-12 text-orange-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Загрузка датасетов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Датасеты
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Настройте поля и создайте вычисляемые метрики
          </p>
        </div>
        <Link href="/dashboard/datasets/new" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Создать датасет
        </Link>
      </div>

      {datasets.length === 0 ? (
        <div className="glass-card text-center py-16">
          <div className="w-20 h-20 bg-dark-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Table2 className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Нет датасетов
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Создайте датасет на основе подключенного источника данных
          </p>
          <Link href="/dashboard/datasets/new" className="btn btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Создать первый датасет
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {datasets.map((dataset) => {
            const source = dataSources.find(s => s.id === dataset.dataSourceId);
            return (
              <DatasetCard 
                key={dataset.id} 
                dataset={dataset} 
                source={source}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function DatasetCard({ dataset, source, onDelete }: { 
  dataset: any; 
  source?: any;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="card group hover:shadow-2xl hover:shadow-orange-500/10 transition-all hover:-translate-y-1 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors"></div>
      
      <div className="relative flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
            <Table2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white group-hover:text-gradient transition-colors mb-1">
              {dataset.name}
            </h3>
            <p className="text-sm text-gray-400 mb-1">
              Источник: {source ? source.name : 'Неизвестно'}
            </p>
            <p className="text-sm text-gray-500 mb-3">
              {dataset.fields?.length || 0} полей
              {dataset.rowCount && ` • ${dataset.rowCount.toLocaleString('ru-RU')} строк`}
            </p>
            <div className="flex flex-wrap gap-2">
              {dataset.fields?.slice(0, 5).map((field: any, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded"
                >
                  {field.name}
                </span>
              ))}
              {dataset.fields?.length > 5 && (
                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                  +{dataset.fields.length - 5} еще
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/dashboard/datasets/${dataset.id}`} className="btn btn-secondary p-2" title="Просмотр">
            <Eye className="w-4 h-4" />
          </Link>
          <Link href={`/dashboard/datasets/${dataset.id}/edit`} className="btn btn-secondary p-2" title="Редактировать">
            <Edit className="w-4 h-4" />
          </Link>
          <button 
            onClick={() => onDelete(dataset.id)}
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
