import { google } from 'googleapis';
import type { GoogleSheetsConfig } from '@/types';

export class GoogleSheetsService {
  private sheets;
  
  constructor(credentials?: any) {
    const auth = credentials 
      ? new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        })
      : null;
    
    this.sheets = google.sheets({ version: 'v4', auth: auth || undefined });
  }

  /**
   * Получить данные из Google Sheets
   */
  async getData(config: GoogleSheetsConfig): Promise<any[]> {
    try {
      const range = config.range || `${config.sheetName}!A1:ZZ`;
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      // Первая строка - заголовки
      const headers = rows[0];
      
      // Остальные строки - данные
      const data = rows.slice(1).map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || null;
        });
        return obj;
      });

      return data;
    } catch (error) {
      console.error('Error fetching Google Sheets data:', error);
      throw error;
    }
  }

  /**
   * Получить информацию о листе
   */
  async getSheetInfo(spreadsheetId: string, sheetName: string) {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
      });

      const sheet = response.data.sheets?.find(
        s => s.properties?.title === sheetName
      );

      return {
        title: sheet?.properties?.title,
        rowCount: sheet?.properties?.gridProperties?.rowCount,
        columnCount: sheet?.properties?.gridProperties?.columnCount,
      };
    } catch (error) {
      console.error('Error fetching sheet info:', error);
      throw error;
    }
  }

  /**
   * Парсинг Google Sheets URL
   */
  static parseSheetUrl(url: string): { spreadsheetId: string; sheetName?: string } | null {
    try {
      const spreadsheetIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      const sheetNameMatch = url.match(/[#&]gid=(\d+)/);
      
      if (!spreadsheetIdMatch) return null;

      return {
        spreadsheetId: spreadsheetIdMatch[1],
        sheetName: sheetNameMatch ? sheetNameMatch[1] : undefined,
      };
    } catch (error) {
      return null;
    }
  }
}

/**
 * Клиентская версия - использует публичные Google Sheets
 * Для приватных таблиц пользователю нужно сделать их публичными
 */
export async function fetchPublicGoogleSheet(
  spreadsheetId: string,
  sheetName: string,
  range?: string
): Promise<any[]> {
  try {
    const rangeParam = range || `${sheetName}!A1:ZZ10000`;
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}&range=${rangeParam}`;
    
    const response = await fetch(url);
    const text = await response.text();
    
    // Google Sheets API возвращает JSONP, нужно извлечь JSON
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
    if (!jsonMatch) {
      throw new Error('Invalid response from Google Sheets');
    }
    
    const data = JSON.parse(jsonMatch[1]);
    
    if (!data.table || !data.table.rows) {
      return [];
    }
    
    // Преобразуем в удобный формат
    const headers = data.table.cols.map((col: any) => col.label || col.id);
    const rows = data.table.rows.map((row: any) => {
      const obj: any = {};
      row.c.forEach((cell: any, index: number) => {
        obj[headers[index]] = cell ? cell.v : null;
      });
      return obj;
    });
    
    return rows;
  } catch (error) {
    console.error('Error fetching public Google Sheet:', error);
    throw error;
  }
}
