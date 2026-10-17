/**
 * Utilities for Excel and Spreadsheet handling:
 * - Native .xls table download: Opens in MS Excel with actual columns A, B, C, D (no comma delimiter needed)
 * - Semicolon CSV with UTF-8 BOM: Opens in Excel with Indonesian regional settings in separate columns
 * - Robust parser supporting Tabs (direct Excel copy-paste), semicolons, commas with quote handling
 */

export function parseDelimitedText(text: string): string[][] {
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!cleanText) return [];

  const rawLines = cleanText.split('\n').filter((l) => l.trim().length > 0);
  if (rawLines.length === 0) return [];

  // Detect primary delimiter: check the first 3 lines
  let tabCount = 0;
  let semiCount = 0;
  let commaCount = 0;

  for (let i = 0; i < Math.min(3, rawLines.length); i++) {
    const line = rawLines[i];
    tabCount += (line.match(/\t/g) || []).length;
    semiCount += (line.match(/;/g) || []).length;
    commaCount += (line.match(/,/g) || []).length;
  }

  let delimiter = ',';
  if (tabCount >= semiCount && tabCount >= commaCount && tabCount > 0) {
    delimiter = '\t';
  } else if (semiCount >= commaCount && semiCount > 0) {
    delimiter = ';';
  }

  // Parse lines with proper quote awareness
  const result: string[][] = [];

  for (const line of rawLines) {
    // If delimiter is tab, simple split is usually safe and cleanest
    if (delimiter === '\t') {
      const cols = line.split('\t').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      result.push(cols);
      continue;
    }

    // Tokenize considering quotes
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        cols.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current.trim().replace(/^["']|["']$/g, ''));
    result.push(cols);
  }

  return result;
}

/**
 * Generates an Excel-compatible XML/HTML spreadsheet (.xls)
 * When opened in MS Excel, every item is guaranteed to appear in its own separate column
 * without any comma delimiter mess!
 */
export function downloadNativeExcel(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
  sheetTitle: string = 'Sheet1'
) {
  let tableHtml = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>${escapeXml(sheetTitle)}</x:Name>
            <x:WorksheetOptions>
              <x:DisplayGridlines/>
            </x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
      table { border-collapse: collapse; font-family: Calibri, sans-serif; font-size: 11pt; }
      th { background-color: #0F766E; color: #FFFFFF; font-weight: bold; border: 1px solid #CBD5E1; padding: 8px 12px; text-align: left; }
      td { border: 1px solid #CBD5E1; padding: 6px 10px; }
      .num { text-align: right; }
      .center { text-align: center; }
      .text { mso-number-format:"\\@"; }
    </style>
  </head>
  <body>
    <table>
      <thead>
        <tr>
          ${headers.map((h) => `<th>${escapeXml(h)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
          <tr>
            ${row
              .map((cell) => {
                const val = cell ?? '';
                const isNum = typeof val === 'number';
                return `<td class="${isNum ? 'num' : 'text'}">${escapeXml(String(val))}</td>`;
              })
              .join('')}
          </tr>`
          )
          .join('')}
      </tbody>
    </table>
  </body>
  </html>`;

  const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xls') ? filename : `${filename}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a CSV formatted specifically for Excel Indonesian/Windows regional settings
 * Using semicolon (;) and UTF-8 BOM so Excel opens each item in its own column (Kolom A, B, C...)
 */
export function downloadSemicolonCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const bom = '\uFEFF';
  const headerLine = headers.map(escapeCsvValue).join(';');
  const rowLines = rows.map((r) => r.map(escapeCsvValue).join(';')).join('\r\n');
  const csvContent = `${bom}sep=;\r\n${headerLine}\r\n${rowLines}\r\n`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsvValue(val: string | number): string {
  const str = String(val ?? '');
  if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes(',')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
