export function toCSV<T extends Record<string, string | number>>(
  rows: ReadonlyArray<T>
): string {
  if (!rows || rows.length === 0) return "";

  // Aseguramos a TS que el primer elemento existe y es un objeto
  const first = rows[0] as Record<string, string | number>;
  const headers = Object.keys(first);

  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return `"${s.replace(/"/g, '""')}"`;
  };

  const lines = [headers.join(",")].concat(
    rows.map((r) =>
      headers
        // cast seguro por índice dinámico
        .map((h) => esc((r as Record<string, unknown>)[h]))
        .join(",")
    )
  );

  return lines.join("\n");
}

export function download(
  filename: string,
  content: string,
  type = "text/csv"
): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
