import type { 
  PivotTableConfig, 
  AggregationType, 
  GroupByPeriod,
  Field 
} from '@/types';
import { format, startOfWeek, startOfMonth, startOfQuarter, startOfYear } from 'date-fns';

export class PivotTableEngine {
  /**
   * Создание сводной таблицы из данных
   */
  static createPivotTable(data: any[], config: PivotTableConfig): any[] {
    // 1. Применяем фильтры
    let filteredData = this.applyFilters(data, config.filters || []);

    // 2. Вычисляем calculated fields
    if (config.calculatedFields && config.calculatedFields.length > 0) {
      filteredData = this.calculateFields(filteredData, config.calculatedFields);
    }

    // 3. Группируем данные
    const grouped = this.groupData(filteredData, config);

    // 4. Агрегируем значения
    const aggregated = this.aggregateData(grouped, config);

    return aggregated;
  }

  /**
   * Применение фильтров
   */
  private static applyFilters(data: any[], filters: any[]): any[] {
    return data.filter(row => {
      return filters.every(filter => {
        const value = row[filter.field];
        
        switch (filter.operator) {
          case 'eq':
            return value === filter.value;
          case 'ne':
            return value !== filter.value;
          case 'gt':
            return value > filter.value;
          case 'gte':
            return value >= filter.value;
          case 'lt':
            return value < filter.value;
          case 'lte':
            return value <= filter.value;
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value);
          case 'contains':
            return String(value).includes(String(filter.value));
          default:
            return true;
        }
      });
    });
  }

  /**
   * Вычисление calculated fields
   */
  private static calculateFields(data: any[], calculatedFields: Field[]): any[] {
    return data.map(row => {
      const newRow = { ...row };
      
      calculatedFields.forEach(field => {
        if (field.formula) {
          try {
            // Замена {fieldName} на row[fieldName]
            let formula = field.formula;
            const regex = /\{([^}]+)\}/g;
            let match;
            
            // Используем exec() вместо matchAll() для совместимости
            while ((match = regex.exec(field.formula)) !== null) {
              const fieldName = match[1];
              const value = row[fieldName] || 0;
              formula = formula.replace(`{${fieldName}}`, String(value));
            }
            
            // Вычисление формулы (осторожно с eval!)
            // В production лучше использовать безопасный парсер выражений
            newRow[field.name] = this.evaluateFormula(formula);
          } catch (error) {
            console.error(`Error calculating field ${field.name}:`, error);
            newRow[field.name] = null;
          }
        }
      });
      
      return newRow;
    });
  }

  /**
   * Безопасное вычисление формулы
   */
  private static evaluateFormula(formula: string): number | null {
    try {
      // Разрешаем только базовые математические операции
      const sanitized = formula.replace(/[^0-9+\-*/(). ]/g, '');
      return Function(`"use strict"; return (${sanitized})`)();
    } catch {
      return null;
    }
  }

  /**
   * Группировка данных
   */
  private static groupData(data: any[], config: PivotTableConfig): Map<string, any[]> {
    const grouped = new Map<string, any[]>();

    // Логируем первую строку данных для отладки
    if (data.length > 0) {
      console.log('🔍 [groupData] First row:', data[0]);
      console.log('🔍 [groupData] Available keys:', Object.keys(data[0]));
      console.log('🔍 [groupData] Looking for fields:', config.rows.map(r => r.field));
    }

    data.forEach((row, idx) => {
      // Создаем ключ группировки
      const groupKey = config.rows
        .map(groupBy => {
          const value = row[groupBy.field];
          
          // Логируем для первой строки
          if (idx === 0) {
            console.log(`🔍 [groupData] Field '${groupBy.field}' value:`, value, 'Type:', typeof value);
            if (value === undefined) {
              console.warn(`⚠️ Field '${groupBy.field}' is UNDEFINED! Available fields:`, Object.keys(row));
            }
          }
          
          // Если это дата и указан период
          if (groupBy.period && value instanceof Date) {
            return this.formatDateByPeriod(value, groupBy.period);
          }
          
          // Если значение undefined или null, используем 'N/A'
          if (value === undefined || value === null) {
            return 'N/A';
          }
          
          return String(value);
        })
        .join('|');

      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, []);
      }
      
      grouped.get(groupKey)!.push(row);
    });

    console.log('✅ [groupData] Grouped into', grouped.size, 'groups');
    return grouped;
  }

  /**
   * Форматирование даты по периоду
   */
  private static formatDateByPeriod(date: Date, period: GroupByPeriod): string {
    switch (period) {
      case 'day':
        return format(date, 'yyyy-MM-dd');
      case 'week':
        return format(startOfWeek(date), 'yyyy-MM-dd');
      case 'month':
        return format(startOfMonth(date), 'yyyy-MM');
      case 'quarter':
        return format(startOfQuarter(date), 'yyyy-QQQ');
      case 'year':
        return format(startOfYear(date), 'yyyy');
      default:
        return format(date, 'yyyy-MM-dd');
    }
  }

  /**
   * Агрегация данных
   */
  private static aggregateData(
    grouped: Map<string, any[]>, 
    config: PivotTableConfig
  ): any[] {
    const result: any[] = [];

    grouped.forEach((rows, groupKey) => {
      const groupKeyParts = groupKey.split('|');
      const aggregated: any = {};

      // Добавляем группировочные поля
      config.rows.forEach((groupBy, index) => {
        const displayName = groupBy.field;
        aggregated[displayName] = groupKeyParts[index];
      });

      // Вычисляем агрегации
      config.values.forEach(agg => {
        const fieldName = agg.alias || `${agg.type}_${agg.field}`;
        
        // Логируем для первой группы
        if (result.length === 0 && rows.length > 0) {
          console.log(`🔍 [aggregateData] Processing field '${agg.field}'`);
          console.log(`🔍 [aggregateData] First row in group:`, rows[0]);
          console.log(`🔍 [aggregateData] Value for '${agg.field}':`, rows[0][agg.field]);
        }
        
        const values = rows
          .map(row => {
            const val = row[agg.field];
            // Логируем первые 3 значения
            if (result.length === 0 && rows.indexOf(row) < 3) {
              console.log(`  - Row value for '${agg.field}':`, val, 'Type:', typeof val, 'IsNumber:', !isNaN(Number(val)));
            }
            return val;
          })
          .filter(v => v !== null && v !== undefined && !isNaN(Number(v)))
          .map(v => Number(v));

        if (result.length === 0) {
          console.log(`✅ [aggregateData] Filtered values for '${agg.field}':`, values.slice(0, 5));
          console.log(`✅ [aggregateData] Total valid values:`, values.length);
        }

        switch (agg.type) {
          case 'sum':
            aggregated[fieldName] = values.reduce((a, b) => a + b, 0);
            break;
          case 'avg':
            aggregated[fieldName] = values.length > 0 
              ? values.reduce((a, b) => a + b, 0) / values.length 
              : 0;
            break;
          case 'min':
            aggregated[fieldName] = values.length > 0 ? Math.min(...values) : 0;
            break;
          case 'max':
            aggregated[fieldName] = values.length > 0 ? Math.max(...values) : 0;
            break;
          case 'count':
            aggregated[fieldName] = values.length;
            break;
        }
        
        if (result.length === 0) {
          console.log(`✅ [aggregateData] Result for '${fieldName}':`, aggregated[fieldName]);
        }
      });

      result.push(aggregated);
    });

    return result;
  }

  /**
   * Экспорт в CSV
   */
  static exportToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Экранируем запятые и кавычки
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  }
}

/**
 * Упрощенная функция для создания сводной таблицы
 * Используется в real-time preview
 */
export function calculatePivotTable(
  data: any[], 
  rows: any[], 
  values: any[],
  calculatedFields?: any[],
  columns?: any[]
): { rows: any[], columnHeaders?: string[] } {
  console.log('🔄 calculatePivotTable called');
  console.log('📊 Data rows:', data?.length);
  console.log('📊 First data row:', data?.[0]);
  console.log('📊 Rows config:', rows);
  console.log('📊 Values config:', values);
  console.log('📊 Columns config:', columns);
  
  if (!data || data.length === 0 || rows.length === 0 || values.length === 0) {
    console.warn('⚠️ Missing data or configuration');
    return { rows: [] };
  }

  // Обрабатываем вычисляемые поля ПЕРЕД группировкой
  let processedData = data;
  if (calculatedFields && calculatedFields.length > 0) {
    processedData = data.map(row => {
      const newRow = { ...row };
      
      calculatedFields.forEach(field => {
        if (field.formula) {
          try {
            const { operand1, operator, operand2 } = field.formula;
            const val1 = Number(row[operand1]) || 0;
            const val2 = isNaN(Number(operand2)) ? Number(row[operand2]) || 0 : Number(operand2);
            
            let result = 0;
            switch (operator) {
              case '+':
                result = val1 + val2;
                break;
              case '-':
                result = val1 - val2;
                break;
              case '*':
                result = val1 * val2;
                break;
              case '/':
                result = val2 !== 0 ? val1 / val2 : 0;
                break;
            }
            
            newRow[field.name] = result;
          } catch (error) {
            console.error(`Error calculating field ${field.name}:`, error);
            newRow[field.name] = 0;
          }
        }
      });
      
      return newRow;
    });
  }

  // Если есть столбцы - используем двумерную группировку
  if (columns && columns.length > 0) {
    return calculatePivotTableWithColumns(processedData, rows, columns, values);
  }

  // Обычная группировка только по строкам
  const config: PivotTableConfig = {
    id: 'temp',
    name: 'temp',
    datasetId: 'temp',
    rows: rows.map(r => ({
      field: r.field,
      period: r.period
    })),
    values: values.map(v => ({
      field: v.field,
      type: v.type === 'calculated' ? 'avg' as AggregationType : v.type as AggregationType,
      alias: `${v.field}_${v.type}`
    })),
    filters: []
  };

  const result = PivotTableEngine.createPivotTable(processedData, config);
  
  return { rows: result };
}

/**
 * Полноценная сводная таблица со строками И столбцами (как в Excel)
 */
function calculatePivotTableWithColumns(
  data: any[],
  rows: any[],
  columns: any[],
  values: any[]
): { rows: any[], columnHeaders: string[] } {
  console.log('🔄 Creating pivot with ROWS and COLUMNS');
  console.log('📊 Data sample:', data[0]);
  console.log('📊 Row fields:', rows.map(r => r.field));
  console.log('📊 Column fields:', columns.map(c => c.field));
  console.log('📊 Value fields:', values.map(v => v.field));
  
  // Получаем уникальные значения для столбцов
  const columnValues = new Set<string>();
  data.forEach(row => {
    const colKey = columns.map(c => {
      const value = row[c.field];
      console.log(`Column field '${c.field}' value:`, value);
      return value ?? 'N/A';
    }).join(' | ');
    columnValues.add(colKey);
  });
  
  const columnHeaders = Array.from(columnValues).sort();
  console.log('✅ Column headers:', columnHeaders);
  
  // Группируем данные по строкам
  const rowGroups = new Map<string, any[]>();
  data.forEach(row => {
    const rowKey = rows.map(r => row[r.field] ?? 'N/A').join(' | ');
    if (!rowGroups.has(rowKey)) {
      rowGroups.set(rowKey, []);
    }
    rowGroups.get(rowKey)!.push(row);
  });
  
  // Создаем результирующие строки
  const result: any[] = [];
  
  rowGroups.forEach((groupData, rowKey) => {
    const resultRow: any = {};
    
    // Добавляем значения группировочных полей строк
    const rowKeyParts = rowKey.split(' | ');
    rows.forEach((r, i) => {
      resultRow[r.field] = rowKeyParts[i];
    });
    
    // Для каждого столбца вычисляем значения
    columnHeaders.forEach(colHeader => {
      // Фильтруем данные для этой комбинации строка+столбец
      const cellData = groupData.filter(row => {
        const rowColKey = columns.map(c => row[c.field] ?? 'N/A').join(' | ');
        return rowColKey === colHeader;
      });
      
      // Вычисляем каждую метрику для этой ячейки
      values.forEach(v => {
        const colKey = `${colHeader}__${v.field}_${v.type}`;
        
        if (cellData.length === 0) {
          resultRow[colKey] = null;
          console.log(`⚠️ No cell data for ${colKey}`);
          return;
        }
        
        console.log(`📊 Processing ${colKey}, cell data count:`, cellData.length);
        console.log(`📊 Sample cell data:`, cellData[0]);
        console.log(`📊 Field '${v.field}' value:`, cellData[0]?.[v.field]);
        
        const metricValues = cellData
          .map(row => {
            const val = row[v.field];
            console.log(`  - Raw value for '${v.field}':`, val, 'Type:', typeof val);
            return Number(val);
          })
          .filter(val => !isNaN(val) && val !== null && val !== undefined);
        
        console.log(`✅ Metric values for ${colKey}:`, metricValues);
        
        if (metricValues.length === 0) {
          resultRow[colKey] = null;
          return;
        }
        
        switch (v.type) {
          case 'sum':
            resultRow[colKey] = metricValues.reduce((a, b) => a + b, 0);
            break;
          case 'avg':
            resultRow[colKey] = metricValues.reduce((a, b) => a + b, 0) / metricValues.length;
            break;
          case 'count':
            resultRow[colKey] = metricValues.length;
            break;
          case 'min':
            resultRow[colKey] = Math.min(...metricValues);
            break;
          case 'max':
            resultRow[colKey] = Math.max(...metricValues);
            break;
          default:
            resultRow[colKey] = metricValues.reduce((a, b) => a + b, 0);
        }
      });
    });
    
    result.push(resultRow);
  });
  
  console.log('✅ Pivot with columns created:', result.length, 'rows');
  
  return { rows: result, columnHeaders };
}
