export function toCSV(rows: Record<string, string | number>[]): string {
if (rows.length === 0) return "";
const headers = Object.keys(rows[0]);
const esc = (v: any) => `"${String(v).replace(/"/g, '""')}"`;
const lines = [headers.join(",")].concat(
rows.map(r => headers.map(h => esc(r[h] ?? "")).join(","))
);
return lines.join("\n");
}


export function download(filename: string, content: string, type = "text/csv") {
const blob = new Blob([content], { type });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url; a.download = filename; a.click();
URL.revokeObjectURL(url);
}
