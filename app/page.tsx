export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tres Gatos OPS</h1>
      <p className="text-slate-600">
        Bienvenido. Usa las pestañas del menú para navegar o entra directo al asistente de OEE.
      </p>
      <div className="flex gap-3">
        <a
          href="/oee"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-white hover:opacity-90"
        >
          Ir a OEE
        </a>
        <a
          href="/oee/runs"
          className="inline-flex items-center justify-center rounded-xl bg-slate-800 px-4 py-2 text-white hover:opacity-90"
        >
          Registros OEE
        </a>
        <a
          href="/inventario"
          className="inline-flex items-center justify-center rounded-xl bg-slate-600 px-4 py-2 text-white hover:opacity-90"
        >
          Inventario
        </a>
        <a
          href="/recetas"
          className="inline-flex items-center justify-center rounded-xl bg-slate-600 px-4 py-2 text-white hover:opacity-90"
        >
          Recetas
        </a>
        <a
          href="/mantenimiento"
          className="inline-flex items-center justify-center rounded-xl bg-slate-600 px-4 py-2 text-white hover:opacity-90"
        >
          Mantenimiento
        </a>
      </div>
      <p className="text-xs text-slate-500">
        Tip: también puedes usar los botones “Importar JSON / Exportar JSON” en la barra superior.
      </p>
    </div>
  );
}
