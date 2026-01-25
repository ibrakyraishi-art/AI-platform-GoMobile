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

    data.forEach(row => {
      // Создаем ключ группировки
      const groupKey = config.rows
        .map(groupBy => {
          const value = row[groupBy.field];
          
          // Если это дата и указан период
          if (groupBy.period && value instanceof Date) {
            return this.formatDateByPeriod(value, groupBy.period);
          }
          
          return String(value);
        })
        .join('|');

      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, []);
      }
      
      grouped.get(groupKey)!.push(row);
    });

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
        const values = rows
          .map(row => row[agg.field])
          .filter(v => v !== null && v !== undefined && !isNaN(Number(v)))
          .map(v => Number(v));

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
