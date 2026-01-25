import { createClient } from '@supabase/supabase-js';

// Всегда используем placeholder значения
// Пользователь добавит свои ключи через настройки на сайте
const supabaseUrl = 'https://placeholder.supabase.co';
const supabaseAnonKey = 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Типы для Supabase таблиц
export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      data_sources: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          type: string;
          config: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          type: string;
          config: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          type?: string;
          config?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      datasets: {
        Row: {
          id: string;
          project_id: string;
          data_source_id: string;
          name: string;
          fields: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          data_source_id: string;
          name: string;
          fields: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          data_source_id?: string;
          name?: string;
          fields?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      pivot_tables: {
        Row: {
          id: string;
          project_id: string;
          dataset_id: string;
          name: string;
          config: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          dataset_id: string;
          name: string;
          config: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          dataset_id?: string;
          name?: string;
          config?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_analyses: {
        Row: {
          id: string;
          project_id: string;
          dataset_id: string | null;
          pivot_table_id: string | null;
          prompt: string;
          analysis: string;
          insights: string[];
          recommendations: string[];
          metadata: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          dataset_id?: string | null;
          pivot_table_id?: string | null;
          prompt: string;
          analysis: string;
          insights: string[];
          recommendations: string[];
          metadata?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          dataset_id?: string | null;
          pivot_table_id?: string | null;
          prompt?: string;
          analysis?: string;
          insights?: string[];
          recommendations?: string[];
          metadata?: any;
          created_at?: string;
        };
      };
    };
  };
};
