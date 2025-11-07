export default function NotFound() {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Página no encontrada</h2>
      <p className="text-slate-600">Verifica la URL o vuelve al inicio.</p>
      <a
        href="/"
        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-white hover:opacity-90"
      >
        Volver al inicio
      </a>
    </div>
  );
}
