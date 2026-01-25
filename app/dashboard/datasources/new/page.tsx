'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database, FileSpreadsheet, Server, AlertCircle } from 'lucide-react';

type DataSourceType = 'google_sheets' | 'supabase' | 'postgresql';

export default function NewDataSourcePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState<DataSourceType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState('');

  // Google Sheets
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('');

  // Database
  const [dbConfig, setDbConfig] = useState({
    host: '',
    port: 5432,
    database: '',
    username: '',
    password: '',
  });

  // Парсинг Google Sheets URL
  const parseGoogleSheetsUrl = (url: string): string | null => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let config: any = {};
      let name = sourceName;

      if (sourceType === 'google_sheets') {
        const spreadsheetId = parseGoogleSheetsUrl(sheetUrl);
        
        if (!spreadsheetId) {
          setError('Неверный формат URL Google Sheets. Убедитесь, что вы скопировали полную ссылку.');
          setLoading(false);
          return;
        }

        if (!sheetName.trim()) {
          setError('Укажите название листа (например: Лист1, Sheet1)');
          setLoading(false);
          return;
        }

        config = {
          spreadsheetId,
          sheetName: sheetName.trim(),
        };
        
        if (!name) {
          name = `Google Sheets - ${sheetName}`;
        }
      } else if (sourceType === 'supabase') {
        config = {
          url: dbConfig.host,
          key: dbConfig.password,
          table: dbConfig.database,
        };
        
        if (!name) {
          name = `Supabase - ${dbConfig.database}`;
        }
      } else if (sourceType === 'postgresql') {
        config = dbConfig;
        
        if (!name) {
          name = `PostgreSQL - ${dbConfig.database}`;
        }
      }

      // Отправка запроса на сервер
      const response = await fetch('/api/datasources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: 'default-project', // В будущем заменить на реальный ID проекта
          name,
          type: sourceType,
          config,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Не удалось подключить источник данных');
      }

      // Сохраняем в localStorage
      const existingSources = JSON.parse(localStorage.getItem('dataSources') || '[]');
      existingSources.push(result.data);
      localStorage.setItem('dataSources', JSON.stringify(existingSources));

      // Успешно подключено
      router.push('/dashboard/datasources');
    } catch (err: any) {
      console.error('Error connecting data source:', err);
      setError(err.message || 'Произошла ошибка при подключении. Проверьте, что таблица доступна по ссылке.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Добавить источник данных
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Шаг {step} из 2
        </p>
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Выберите тип источника данных
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <SourceTypeCard
              icon={<FileSpreadsheet className="w-8 h-8" />}
              title="Google Sheets"
              description="Подключите Google таблицу с данными"
              selected={sourceType === 'google_sheets'}
              onClick={() => setSourceType('google_sheets')}
            />
            <SourceTypeCard
              icon={<Database className="w-8 h-8" />}
              title="Supabase"
              description="Подключите таблицу из Supabase"
              selected={sourceType === 'supabase'}
              onClick={() => setSourceType('supabase')}
            />
            <SourceTypeCard
              icon={<Server className="w-8 h-8" />}
              title="PostgreSQL"
              description="Подключите PostgreSQL базу данных"
              selected={sourceType === 'postgresql'}
              onClick={() => setSourceType('postgresql')}
            />
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={() => setStep(2)}
              disabled={!sourceType}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Далее
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          {error && (
            <div className="glass-card mb-6 bg-red-500/10 border-red-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-semibold mb-1">Ошибка подключения</p>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Название источника */}
            <div className="card mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                Название источника (необязательно)
              </label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="Будет создано автоматически"
                className="input w-full"
              />
            </div>

            {sourceType === 'google_sheets' && (
              <GoogleSheetsForm
                url={sheetUrl}
                setUrl={setSheetUrl}
                sheetName={sheetName}
                setSheetName={setSheetName}
              />
            )}

            {sourceType === 'supabase' && (
              <SupabaseForm
                config={dbConfig}
                setConfig={setDbConfig}
              />
            )}

            {sourceType === 'postgresql' && (
              <PostgreSQLForm
                config={dbConfig}
                setConfig={setDbConfig}
              />
            )}

            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError(null);
                }}
                className="btn btn-secondary"
                disabled={loading}
              >
                Назад
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Подключение...' : 'Подключить источник'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function SourceTypeCard({
  icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`card text-left hover:shadow-lg transition-all ${
        selected ? 'ring-2 ring-primary-600' : ''
      }`}
    >
      <div className="text-primary-600 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </button>
  );
}

function GoogleSheetsForm({
  url,
  setUrl,
  sheetName,
  setSheetName,
}: {
  url: string;
  setUrl: (url: string) => void;
  sheetName: string;
  setSheetName: (name: string) => void;
}) {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-white mb-6">
        Настройка Google Sheets
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            URL Google Sheets <span className="text-orange-400">*</span>
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/1ABC..."
            className="input w-full"
            required
          />
          <div className="mt-3 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <p className="text-sm text-orange-300 font-medium mb-2">
              📌 Важно! Сделайте таблицу публичной:
            </p>
            <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
              <li>Откройте вашу Google таблицу</li>
              <li>Нажмите «Настройки доступа» (правый верхний угол)</li>
              <li>Выберите «Доступ по ссылке» → «Все, у кого есть ссылка»</li>
              <li>Права доступа: «Читатель»</li>
              <li>Скопируйте ссылку и вставьте сюда</li>
            </ol>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Название листа <span className="text-orange-400">*</span>
          </label>
          <input
            type="text"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="Лист1 или Sheet1"
            className="input w-full"
            required
          />
          <p className="text-sm text-gray-400 mt-2">
            Точное название листа в вашей таблице (обычно «Лист1» или «Sheet1»)
          </p>
        </div>
      </div>
    </div>
  );
}

function SupabaseForm({
  config,
  setConfig,
}: {
  config: any;
  setConfig: (config: any) => void;
}) {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Настройка Supabase
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Supabase URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={config.host}
            onChange={(e) => setConfig({ ...config, host: e.target.value })}
            placeholder="https://your-project.supabase.co"
            className="input w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Anon Key <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={config.password}
            onChange={(e) => setConfig({ ...config, password: e.target.value })}
            placeholder="eyJhbGci..."
            className="input w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Таблица <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={config.database}
            onChange={(e) => setConfig({ ...config, database: e.target.value })}
            placeholder="campaign_data"
            className="input w-full"
            required
          />
        </div>
      </div>
    </div>
  );
}

function PostgreSQLForm({
  config,
  setConfig,
}: {
  config: any;
  setConfig: (config: any) => void;
}) {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Настройка PostgreSQL
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Host <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              placeholder="localhost"
              className="input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Port <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
              placeholder="5432"
              className="input w-full"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Database <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={config.database}
            onChange={(e) => setConfig({ ...config, database: e.target.value })}
            placeholder="my_database"
            className="input w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={config.username}
            onChange={(e) => setConfig({ ...config, username: e.target.value })}
            placeholder="postgres"
            className="input w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={config.password}
            onChange={(e) => setConfig({ ...config, password: e.target.value })}
            className="input w-full"
            required
          />
        </div>
      </div>
    </div>
  );
}
