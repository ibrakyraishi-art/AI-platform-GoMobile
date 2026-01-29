'use client';

import { useState, useEffect } from 'react';
import { Save, Key, Database, CheckCircle, AlertCircle, Upload, RefreshCw } from 'lucide-react';
import { createSupabaseClient, isSupabaseConfigured, migrateFromLocalStorage } from '@/lib/supabase-client';

export default function SettingsPage() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrated, setMigrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка сохраненных ключей при загрузке страницы
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOpenaiKey = localStorage.getItem('openai_key') || '';
      const savedSupabaseUrl = localStorage.getItem('supabase_url') || '';
      const savedSupabaseKey = localStorage.getItem('supabase_key') || '';
      
      setOpenaiKey(savedOpenaiKey);
      setSupabaseUrl(savedSupabaseUrl);
      setSupabaseKey(savedSupabaseKey);
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Сохраняем ключи в localStorage браузера
      if (typeof window !== 'undefined') {
        localStorage.setItem('openai_key', openaiKey);
        localStorage.setItem('supabase_url', supabaseUrl);
        localStorage.setItem('supabase_key', supabaseKey);
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setError('Ошибка сохранения настроек');
    } finally {
      setSaving(false);
    }
  };

  const handleMigrate = async () => {
    if (!isSupabaseConfigured(supabaseUrl, supabaseKey)) {
      setError('Сначала настройте и сохраните ключи Supabase!');
      return;
    }

    const confirmed = confirm(
      'Вы уверены что хотите мигрировать данные из localStorage в Supabase?\n\n' +
      'Это действие скопирует все ваши источники данных, датасеты, сводные таблицы и правила в облако.\n\n' +
      'Убедитесь что вы выполнили SQL миграцию в Supabase (см. инструкцию ниже).'
    );

    if (!confirmed) return;

    setMigrating(true);
    setError(null);

    try {
      const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
      await migrateFromLocalStorage(supabase);
      
      setMigrated(true);
      alert('✅ Миграция завершена успешно!\n\nВаши данные теперь хранятся в Supabase.');
    } catch (error: any) {
      console.error('Migration error:', error);
      setError(`Ошибка миграции: ${error.message}`);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Настройки API ключей
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Ваши ключи сохраняются только в вашем браузере и никуда не передаются
        </p>
      </div>

      {/* Информационное сообщение */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
              💡 Важно знать
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Ваши API ключи хранятся только в вашем браузере (localStorage)</li>
              <li>• Они не отправляются на сервер и остаются конфиденциальными</li>
              <li>• Вы сами оплачиваете использование своих ключей</li>
              <li>• При очистке кеша браузера ключи нужно будет ввести заново</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* OpenAI */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Key className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              OpenAI API
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="input w-full"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Получите ключ на{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  platform.openai.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Supabase */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Supabase
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project URL
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Anon Key
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGci..."
                className="input w-full"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Найдите ключи в настройках вашего проекта Supabase
              </p>
            </div>
          </div>
        </div>

        {/* Миграция данных в Supabase */}
        {isSupabaseConfigured(supabaseUrl, supabaseKey) && (
          <div className="card bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-3 mb-4">
              <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-purple-900 dark:text-purple-200 mb-2">
                  Миграция данных в Supabase
                </h2>
                <p className="text-sm text-purple-800 dark:text-purple-300 mb-4">
                  Перенесите ваши данные из localStorage в облачную базу Supabase для:
                </p>
                <ul className="text-sm text-purple-800 dark:text-purple-300 space-y-1 mb-4">
                  <li>✅ Неограниченного хранилища (без лимита 5MB)</li>
                  <li>✅ Синхронизации между устройствами</li>
                  <li>✅ Резервного копирования</li>
                  <li>✅ Более быстрой работы</li>
                </ul>

                {!migrated ? (
                  <>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-900 dark:text-yellow-200 font-semibold mb-2">
                        ⚠️ Перед миграцией:
                      </p>
                      <ol className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1 ml-4 list-decimal">
                        <li>Откройте ваш проект в Supabase Dashboard</li>
                        <li>Перейдите в SQL Editor</li>
                        <li>Скопируйте и выполните SQL скрипт из файла: <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">supabase/migrations/001_initial_schema.sql</code></li>
                        <li>Убедитесь что все таблицы созданы</li>
                        <li>Нажмите кнопку "Мигрировать данные"</li>
                      </ol>
                    </div>

                    <button
                      onClick={handleMigrate}
                      disabled={migrating}
                      className="btn btn-primary flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                    >
                      {migrating ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Миграция...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Мигрировать данные в Supabase
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Миграция завершена!</span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      Ваши данные успешно перенесены в Supabase. Теперь вы можете очистить localStorage или продолжить использование.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ошибки */}
        {error && (
          <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                  Ошибка
                </h3>
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Сохранить */}
        <div className="flex justify-end gap-3">
          {saved && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span>Настройки сохранены!</span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </div>
      </div>
    </div>
  );
}
