'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Clock, Trash2 } from 'lucide-react';

export default function StatusPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedEvents = JSON.parse(localStorage.getItem('ruleEvents') || '[]');
    const loadedRules = JSON.parse(localStorage.getItem('autoRules') || '[]');
    const loadedDatasets = JSON.parse(localStorage.getItem('datasets') || '[]');
    setEvents(loadedEvents.sort((a: any, b: any) => 
      new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime()
    ));
    setRules(loadedRules);
    setDatasets(loadedDatasets);
  };

  const clearEvents = () => {
    if (!confirm('Очистить всю историю событий?')) return;
    localStorage.setItem('ruleEvents', JSON.stringify([]));
    setEvents([]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Bell className="w-8 h-8 text-white" />
            </div>
            Статус и события
          </h1>
          <p className="text-gray-400 text-lg">
            История сработавших автоправил и уведомлений
          </p>
        </div>
        {events.length > 0 && (
          <button 
            onClick={clearEvents}
            className="btn btn-secondary flex items-center gap-2 text-red-400"
          >
            <Trash2 className="w-4 h-4" />
            Очистить историю
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="glass-card text-center py-16">
          <div className="w-20 h-20 bg-dark-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Bell className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Нет событий
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Здесь будут отображаться сработавшие автоправила и уведомления
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const rule = rules.find(r => r.id === event.ruleId);
            const dataset = datasets.find(d => d.id === event.datasetId);
            return (
              <EventCard 
                key={event.id} 
                event={event} 
                rule={rule}
                dataset={dataset}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function EventCard({ 
  event, 
  rule, 
  dataset 
}: { 
  event: any; 
  rule?: any;
  dataset?: any;
}) {
  const isWarning = event.severity === 'warning';
  const isCritical = event.severity === 'critical';

  return (
    <div className="card group hover:shadow-2xl hover:shadow-orange-500/10 transition-all relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
      }`}></div>
      
      <div className="relative flex items-start justify-between pl-6">
        <div className="flex items-start gap-4 flex-1">
          <div className={`p-3 rounded-xl shadow-lg ${
            isCritical 
              ? 'bg-gradient-to-br from-red-500 to-pink-600' 
              : isWarning 
              ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
              : 'bg-gradient-to-br from-green-500 to-blue-600'
          }`}>
            {isCritical ? (
              <AlertCircle className="w-6 h-6 text-white" />
            ) : isWarning ? (
              <AlertCircle className="w-6 h-6 text-white" />
            ) : (
              <CheckCircle className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">
              {rule ? rule.name : 'Правило удалено'}
            </h3>
            <p className="text-sm text-gray-400 mb-2">
              Датасет: {dataset ? dataset.name : 'Неизвестно'}
            </p>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-dark-800 rounded-lg text-orange-400 font-mono text-sm">
                  {event.condition}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {formatDate(event.triggered_at)}
              </div>
            </div>
            {event.value && (
              <p className="text-sm text-gray-300">
                Текущее значение: <span className="font-bold text-orange-400">{event.value}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
