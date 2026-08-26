import * as XLSX from '@e965/xlsx';

export type RawWorkOrderRow = Record<string, string | number | Date | undefined>;

export async function parseWorkOrderWorkbook(file: File): Promise<RawWorkOrderRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json<RawWorkOrderRow>(sheet, { defval: '' });
}
