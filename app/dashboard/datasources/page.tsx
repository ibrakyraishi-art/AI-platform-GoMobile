'use client';

import Link from 'next/link';
import { Plus, Database, Trash2, RefreshCw, FileSpreadsheet, Loader } from 'lucide-react';
import { useDataSources } from '@/lib/use-storage';

export default function DataSourcesPage() {
  const { dataSources, loading, remove, reload } = useDataSources();

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот источник данных?')) return;
    await remove(id);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card text-center py-16">
          <Loader className="w-12 h-12 text-orange-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Загрузка источников данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Источники данных
          </h1>
          <p className="text-gray-400">
            Подключите Google Sheets, Supabase или базу данных
          </p>
        </div>
        <Link href="/dashboard/datasources/new" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Добавить источник
        </Link>
      </div>

      {dataSources.length === 0 ? (
        <div className="glass-card text-center py-16">
          <div className="w-20 h-20 bg-dark-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Database className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Нет подключенных источников
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Начните с подключения Google Sheets или базы данных для анализа ваших данных
          </p>
          <Link href="/dashboard/datasources/new" className="btn btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Добавить первый источник
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataSources.map((source) => (
            <DataSourceCard 
              key={source.id} 
              source={source} 
              onDelete={handleDelete}
              onRefresh={reload}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DataSourceCard({ source, onDelete, onRefresh }: { 
  source: any; 
  onDelete: (id: string) => void;
  onRefresh: () => void;
}) {
  const getIcon = () => {
    if (source.type === 'google_sheets') {
      return <FileSpreadsheet className="w-6 h-6" />;
    }
    return <Database className="w-6 h-6" />;
  };

  const getTypeLabel = () => {
    if (source.type === 'google_sheets') return 'Google Sheets';
    if (source.type === 'supabase') return 'Supabase';
    if (source.type === 'postgresql') return 'PostgreSQL';
    return source.type;
  };

  const getGradient = () => {
    if (source.type === 'google_sheets') return 'from-green-500 to-emerald-600';
    if (source.type === 'supabase') return 'from-blue-500 to-cyan-600';
    return 'from-purple-500 to-pink-600';
  };

  return (
    <div className="card group hover:shadow-2xl hover:shadow-orange-500/10 transition-all hover:-translate-y-1 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors"></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 bg-gradient-to-br ${getGradient()} rounded-xl shadow-lg`}>
              <div className="text-white">
                {getIcon()}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-gradient transition-colors">
                {source.name}
              </h3>
              <p className="text-sm text-gray-400">
                {getTypeLabel()}
              </p>
            </div>
          </div>
        </div>
        
        {source.type === 'google_sheets' && source.config && (
          <div className="mb-4 p-3 bg-dark-800/50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Лист</p>
            <p className="text-sm text-gray-300 font-medium">{source.config.sheetName}</p>
          </div>
        )}
        
        <div className="flex gap-2 mt-4">
          <button 
            onClick={onRefresh}
            className="btn btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Обновить
          </button>
          <button 
            onClick={() => onDelete(source.id)}
            className="btn btn-secondary px-4 text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
