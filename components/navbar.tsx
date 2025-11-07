'use client';
import Link from 'next/link';
import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { Upload, Download } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { useState } from 'react';


export function Navbar() {
const exportAll = useStore(s => s.exportAll);
const importAll = useStore(s => s.importAll);
const [open, setOpen] = useState(false);
const [text, setText] = useState('');


return (
<div className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
<div className="container mx-auto flex max-w-6xl items-center justify-between gap-4 p-3">
<div className="flex items-center gap-3">
<Link href="/" className="flex items-center gap-2">
<img src="/logo.svg" alt="logo" className="h-6 w-6"/>
<span className="text-sm font-semibold">Tres Gatos OPS</span>
</Link>
<nav className="ml-4 hidden gap-3 md:flex text-sm">
<Link href="/oee" className="hover:underline">OEE</Link>
<Link href="/oee/runs" className="hover:underline">Registros OEE</Link>
<Link href="/inventario" className="hover:underline">Inventario</Link>
<Link href="/recetas" className="hover:underline">Recetas</Link>
<Link href="/mantenimiento" className="hover:underline">Mantenimiento</Link>
</nav>
</div>
<div className="flex items-center gap-2">
<Button onClick={() => exportAll()} title="Exportar JSON"><Download className="mr-2 h-4 w-4"/>Exportar JSON</Button>
<Button onClick={() => setOpen(true)} title="Importar JSON"><Upload className="mr-2 h-4 w-4"/>Importar JSON</Button>
</div>
</div>
<Dialog open={open} onClose={() => setOpen(false)}>
<h3 className="mb-2 text-lg font-semibold">Importar JSON</h3>
<p className="text-sm text-slate-600">Pega el contenido del respaldo (esto <b>reemplaza</b> todos los datos).</p>
<textarea value={text} onChange={(e)=>setText(e.target.value)} className="mt-3 h-60 w-full rounded-xl border p-2 text-sm font-mono"/>
<div className="mt-3 flex justify-end gap-2">
<Button onClick={()=>setOpen(false)} className="bg-slate-200 text-slate-700 hover:opacity-90">Cancelar</Button>
<Button onClick={()=>{ if(confirm('Esto reemplazará todos los datos. ¿Continuar?')) { importAll(text); setOpen(false);} }}>Importar</Button>
</div>
</Dialog>
</div>
);
}
