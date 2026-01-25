'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database, FileSpreadsheet, Server } from 'lucide-react';

type DataSourceType = 'google_sheets' | 'supabase' | 'postgresql';

export default function NewDataSourcePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState<DataSourceType | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Реализовать подключение к источнику данных
      console.log('Подключение источника:', { sourceType, sheetUrl, sheetName, dbConfig });
      
      // Имитация задержки
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push('/dashboard/datasources');
    } catch (error) {
      console.error('Error connecting data source:', error);
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
          <form onSubmit={handleSubmit}>
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
                onClick={() => setStep(1)}
                className="btn btn-secondary"
              >
                Назад
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Подключение...' : 'Подключить'}
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
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Настройка Google Sheets
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL Google Sheets <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            className="input w-full"
            required
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Таблица должна быть доступна по ссылке (публичная или для всех с доступом)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Название листа <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="Лист1"
            className="input w-full"
            required
          />
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
