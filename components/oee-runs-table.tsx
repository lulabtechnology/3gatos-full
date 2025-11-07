'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toCSV, download } from '@/lib/csv';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function OeeRunsTable() {
  const { db } = useStore();
  const [proc, setProc] = useState<string>('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  const rows = useMemo(() => {
    return db.oeeRuns.filter((r) => {
      const byProc = !proc || r.processId === proc;
      const byFrom = !from || r.date >= from;
      const byTo = !to || r.date <= to;
      return byProc && byFrom && byTo;
    });
  }, [db.oeeRuns, proc, from, to]);

  function nameOfProcess(id: string) {
    return db.processes.find((p) => p.id === id)?.name ?? id;
  }

  function exportCSV() {
    const data = rows.map((r) => ({
      id: r.id,
      fecha: r.date,
      proceso: nameOfProcess(r.processId),
      A: (r.availability * 100).toFixed(1),
      P: (r.performance * 100).toFixed(1),
      Q: (r.quality * 100).toFixed(1),
      OEE: (r.oee * 100).toFixed(1),
      total: r.totalCount,
      rechazos: r.rejectCount,
      buenos: r.goodCount,
    }));
    download('oee-runs.csv', toCSV(data));
  }

  const chartData = useMemo(
    () =>
      rows
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((r) => ({ date: r.date, oee: Math.round(r.oee * 1000) / 10 })),
    [rows]
  );

  return (
    <div className="space-y-4">
      {/* Filtros y exportación */}
      <div className="grid gap-3 md:grid-cols-4">
        <select
          className="rounded-xl border px-3 py-2 text-sm"
          value={proc}
          onChange={(e) => setProc(e.target.value)}
        >
          <option value="">Proceso (todos)</option>
          {db.processes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Button onClick={exportCSV}>Exportar CSV</Button>
      </div>

      {/* Gráfico OEE vs fecha */}
      <div className="h-64 rounded-2xl bg-white p-3 shadow">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="oee" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla */}
      <div className="overflow-auto rounded-2xl bg-white shadow">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Proceso</th>
              <th className="p-2">A%</th>
              <th className="p-2">P%</th>
              <th className="p-2">Q%</th>
              <th className="p-2">OEE%</th>
              <th className="p-2">Total</th>
              <th className="p-2">Rechazos</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.date}</td>
                <td className="p-2">{nameOfProcess(r.processId)}</td>
                <td className="p-2 text-center">{(r.availability * 100).toFixed(1)}</td>
                <td className="p-2 text-center">{(r.performance * 100).toFixed(1)}</td>
                <td className="p-2 text-center">{(r.quality * 100).toFixed(1)}</td>
                <td className="p-2 text-center font-semibold">{(r.oee * 100).toFixed(1)}</td>
                <td className="p-2 text-center">{r.totalCount}</td>
                <td className="p-2 text-center">{r.rejectCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
