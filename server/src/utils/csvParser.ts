import { parse } from 'csv-parse';
import fs from 'fs';
import { CSVParseError } from './error';

// Common CSV parsing options
const CSV_PARSE_OPTIONS = {
    columns: true,
    delimiter: ',', // Ensure this matches your CSV delimiter
    trim: true,
    relax_quotes: true, // Allow for more lenient quoting
    skip_empty_lines: true, // Skip empty lines,
    cast: (value: string | any, _context: any) => {
      if (typeof value === 'string') {
        return value.replace(/"/g, ""); // Replace " with noting
      }
      return value;
    }
  };

// Utility function to read and parse CSV
export async function parseCSVFile<T>(filePath: string): Promise<T[]> {
  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    return new Promise((resolve, reject) => {
        parse(fileContent, CSV_PARSE_OPTIONS, (error, records: T[]) => {
        if (error) reject(error);
        resolve(records);
        });
    });
  } catch (error) {
    throw new CSVParseError(error instanceof Error ? error.message : 'Unknown error');
  }
}
