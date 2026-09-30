import { Design, Page, TextElement } from '../types.js';

export interface BulkCreateRow {
  [key: string]: string;
}

export function parseCSV(csvContent: string): BulkCreateRow[] {
  const lines = csvContent.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const rows: BulkCreateRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
    const row: BulkCreateRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

export function bulkCreatePages(
  templateDesign: Design,
  rows: BulkCreateRow[],
  sourcePageIndex: number = 0
): Design {
  const result: Design = JSON.parse(JSON.stringify(templateDesign));
  const basePage = result.pages[sourcePageIndex] || result.pages[0];
  if (!basePage) throw new Error('No base page found to duplicate for bulk create');

  const generatedPages: Page[] = [];

  rows.forEach((row, idx) => {
    const newPage: Page = JSON.parse(JSON.stringify(basePage));
    newPage.id = `bulk_page_${idx + 1}_${Date.now()}`;
    newPage.name = `Bulk Item ${idx + 1} (${Object.values(row)[0] || 'Entry'})`;

    for (const el of newPage.elements) {
      if (el.type === 'text') {
        const textEl = el as TextElement;
        let modifiedText = textEl.text;

        for (const [key, value] of Object.entries(row)) {
          // Replaces {{key}} or ${key} or [key]
          modifiedText = modifiedText
            .replace(new RegExp(`{{${key}}}`, 'gi'), value)
            .replace(new RegExp(`\\$\\{${key}\\}`, 'gi'), value)
            .replace(new RegExp(`\\[${key}\\]`, 'gi'), value);
        }
        textEl.text = modifiedText;
      }
    }

    generatedPages.push(newPage);
  });

  result.pages = generatedPages;
  result.updatedAt = new Date().toISOString();
  return result;
}
