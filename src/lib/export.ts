/** Client-side table exporters (CSV + Excel-compatible .xls). No dependencies. */

function download(filename: string, mime: string, content: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string): string {
  if (/[",\n;]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** Export rows as CSV (BOM prefixed so Excel reads UTF-8 / Turkish chars). */
export function exportCsv(filename: string, headers: string[], rows: string[][]): void {
  const lines = [headers.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))];
  const bom = String.fromCharCode(0xfeff); // UTF-8 BOM so Excel detects Turkish characters
  download(filename.endsWith('.csv') ? filename : `${filename}.csv`, 'text/csv', `${bom}${lines.join('\n')}`);
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Export rows as an Excel-openable .xls (HTML table — widely supported). */
export function exportXls(filename: string, headers: string[], rows: string[][]): void {
  const thead = `<tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`;
  const tbody = rows
    .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`)
    .join('');
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table>${thead}${tbody}</table></body></html>`;
  download(filename.endsWith('.xls') ? filename : `${filename}.xls`, 'application/vnd.ms-excel', html);
}
