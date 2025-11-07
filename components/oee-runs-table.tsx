'use client';
import { useStore } from '@/hooks/useStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';
import { toCSV, download } from '@/lib/csv';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';


export function OeeRunsTable() {
const { db } = useStore();
const [proc, setProc] = useState('');
const [from, setFrom] = useState('');
const [to, setTo] = useState('');


const rows = useMemo(() => {
return db.oeeRuns.filter(r => (
(!proc || r.processId === proc) &&
(!from || r.date >= from) &&
(!to || r.date <= to)
));
}, [db.oeeRuns, proc, from, to]);


function exportCSV() {
const data = rows.map(r => ({
id: r.id, fecha: r.date, proceso: nameOfProcess(r.processId),
A: (r.availability*100).toFixed(1), P: (r.performance*100).toFixed(1), Q: (r.quality*100).toFixed(1), OEE: (r.oee*100).toFixed(1),
total: r.totalCount, rechazos: r.rejectCount, buenos: r.goodCount
}));
download('oee-runs.csv', toCSV(data));
}


function nameOfProcess(id: string) { return db.processes.find(p=>p.id===id)?.name ?? id; }


const chartData = rows
.sort((a,b)=> a.date.localeCompare(b.date))
.map(r=> ({ date: r.date, oee: Math.round(r.oee*1000)/10 }));


return (
<div className="space-y-4">
<div className="grid gap-3 md:grid-cols-4">
<select className="rounded-xl border px-3 py-2 text-sm" value={proc} onChange={e=>setProc(e.target.value)}>
<option value="">Proceso (todos)</option>
{db.processes.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
</select>
<Input type="date" value={from} onChange={e=>setFrom(e.target.value)} />
<Input type="date" value={to} onChange={e=>setTo(e.target.value)} />
<Button onClick={exportCSV}>Exportar CSV</Button>
</div>


<div className="h-64 rounded-2xl bg-white p-3 shadow">
<ResponsiveContainer width="100%" height="100%">
<LineChart data={chartData}>
<XAxis dataKey="date" /><YAxis domain={[0,100]} /><Tooltip />
<Line type="monotone" dataKey="oee" dot={false} />
</LineChart>
</ResponsiveContainer>
</div>


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
}
