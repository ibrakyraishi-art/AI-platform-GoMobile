'use client';

import { useState } from 'react';
import { Save, Key, Database } from 'lucide-react';

export default function SettingsPage() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Сохранить настройки
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Настройки сохранены!');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Настройки
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Настройте API ключи и подключения
        </p>
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

        {/* Сохранить */}
        <div className="flex justify-end">
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
