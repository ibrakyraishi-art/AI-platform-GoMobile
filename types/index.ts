// Типы источников данных
export type DataSourceType = 'google_sheets' | 'supabase' | 'postgresql' | 'mysql';

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  config: GoogleSheetsConfig | DatabaseConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  sheetName: string;
  range?: string;
  credentials?: any;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

// Типы полей
export type FieldType = 
  | 'string' 
  | 'number' 
  | 'float' 
  | 'integer'
  | 'date' 
  | 'datetime'
  | 'boolean'
  | 'currency';

export interface Field {
  id: string;
  name: string;
  displayName: string;
  type: FieldType;
  isCalculated: boolean;
  formula?: string; // Для вычисляемых полей, например: "{spend} / {clicks}"
  format?: string; // Формат отображения
}

export interface Dataset {
  id: string;
  name: string;
  dataSourceId: string;
  fields: Field[];
  rawData: any[];
  createdAt: Date;
  updatedAt: Date;
}

// Типы группировки
export type GroupByPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count';

export interface GroupByConfig {
  field: string;
  period?: GroupByPeriod; // Для дат
}

export interface AggregationConfig {
  field: string;
  type: AggregationType;
  alias?: string;
}

// Сводная таблица
export interface PivotTableConfig {
  id: string;
  name: string;
  datasetId: string;
  rows: GroupByConfig[];
  columns?: GroupByConfig[];
  values: AggregationConfig[];
  filters?: Filter[];
  calculatedFields?: Field[];
}

export interface Filter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
}

// AI-анализ
export interface AIAnalysisRequest {
  datasetId: string;
  pivotTableId?: string;
  prompt: string;
  context?: {
    dateRange?: { from: Date; to: Date };
    campaigns?: string[];
    metrics?: string[];
    customContext?: string;
  };
}

export interface AIAnalysisResponse {
  id: string;
  prompt: string;
  analysis: string;
  insights: string[];
  recommendations: string[];
  createdAt: Date;
  metadata?: {
    model: string;
    tokensUsed: number;
  };
}

// Проект/Workspace
export interface Project {
  id: string;
  name: string;
  description?: string;
  dataSources: DataSource[];
  datasets: Dataset[];
  pivotTables: PivotTableConfig[];
  analyses: AIAnalysisResponse[];
  createdAt: Date;
  updatedAt: Date;
}

// Пользователь
export interface User {
  id: string;
  email: string;
  name?: string;
  projects: Project[];
}
