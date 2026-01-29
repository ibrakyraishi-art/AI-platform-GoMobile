'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Zap, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AutoRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedRules = JSON.parse(localStorage.getItem('autoRules') || '[]');
    const loadedDatasets = JSON.parse(localStorage.getItem('datasets') || '[]');
    setRules(loadedRules);
    setDatasets(loadedDatasets);
  };

  const toggleRule = (id: string) => {
    const updated = rules.map(r => 
      r.id === id ? { ...r, active: !r.active } : r
    );
    localStorage.setItem('autoRules', JSON.stringify(updated));
    setRules(updated);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Удалить это автоправило?')) return;
    
    const filtered = rules.filter(r => r.id !== id);
    localStorage.setItem('autoRules', JSON.stringify(filtered));
    setRules(filtered);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
            Автоправила
          </h1>
          <p className="text-gray-400 text-lg">
            Автоматические уведомления при достижении условий
          </p>
        </div>
        <Link href="/dashboard/rules/new" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Создать правило
        </Link>
      </div>

      {rules.length === 0 ? (
        <div className="glass-card text-center py-16">
          <div className="w-20 h-20 bg-dark-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Нет автоправил
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Создайте правило для автоматического мониторинга ваших метрик
          </p>
          <Link href="/dashboard/rules/new" className="btn btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Создать первое правило
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => {
            const dataset = datasets.find(d => d.id === rule.datasetId);
            return (
              <RuleCard 
                key={rule.id} 
                rule={rule} 
                dataset={dataset}
                onToggle={toggleRule}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function RuleCard({ 
  rule, 
  dataset, 
  onToggle, 
  onDelete 
}: { 
  rule: any; 
  dataset?: any;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="card group hover:shadow-2xl hover:shadow-orange-500/10 transition-all hover:-translate-y-1 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors"></div>
      
      <div className="relative flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className={`p-3 rounded-xl shadow-lg ${rule.active ? 'bg-gradient-to-br from-yellow-500 to-orange-600' : 'bg-gray-700'}`}>
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-white">
                {rule.name}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                rule.active 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-gray-700 text-gray-400 border border-gray-600'
              }`}>
                {rule.active ? 'Активно' : 'Отключено'}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-2">
              Датасет: {dataset ? dataset.name : 'Неизвестно'}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-dark-800 rounded-lg text-orange-400 font-mono">
                {rule.condition}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => onToggle(rule.id)}
            className="btn btn-secondary p-2" 
            title={rule.active ? "Отключить" : "Включить"}
          >
            {rule.active ? (
              <ToggleRight className="w-5 h-5 text-green-400" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <button className="btn btn-secondary p-2" title="Редактировать">
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(rule.id)}
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
