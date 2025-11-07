'use client';
import { useStore } from '@/hooks/useStore';
import { newId } from '@/lib/ids';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';

export function RecipeEditor() {
  const { db, upsertRecipe, setRecipeItems } = useStore();

  const [selected, setSelected] = useState<string>(db.recipes[0]?.id ?? '');
  const [name, setName] = useState<string>('');
  const [processId, setProcessId] = useState<string>(db.processes[0]?.id ?? '');

  const items = useMemo(
    () => db.recipeItems.filter((i) => i.recipeId === selected),
    [db.recipeItems, selected]
  );

  function createRecipe() {
    const id = newId();
    upsertRecipe({
      id,
      name: name || `Receta ${db.recipes.length + 1}`,
      processId,
      notes: '',
    });
    setSelected(id);
    setName('');
  }

  function updateQty(itemId: string, qty: number) {
    const newItems = items.map((i) =>
      i.id === itemId ? { ...i, qtyPerUnit: qty } : i
    );
    setRecipeItems(selected, newItems);
  }

  function addItem(productId: string) {
    if (!selected || !productId) return;
    const newItems = items.concat([
      { id: newId(), recipeId: selected, productId, qtyPerUnit: 0 },
    ]);
    setRecipeItems(selected, newItems);
  }

  function simulate(units: number) {
    const lines = items.map((i) => {
      const p = db.products.find((p) => p.id === i.productId)!;
      const need = i.qtyPerUnit * units;
      const diff = p.currentStock - need;
      return `${p.name}: necesita ${need} ${p.unit} (disp ${p.currentStock})${
        diff < 0 ? ` ➡ FALTANTE ${-diff}` : ''
      }`;
    });
    alert([`Simulación para ${units} unidades:`, ...lines].join('\n'));
  }

  return (
    <div className="space-y-4">
      {/* Selector / creación */}
      <div className="grid gap-3 md:grid-cols-3">
        <select
          className="rounded-xl border px-3 py-2 text-sm"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {db.recipes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <Input
          placeholder="Nombre nueva receta"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="rounded-xl border px-3 py-2 text-sm"
          value={processId}
          onChange={(e) => setProcessId(e.target.value)}
        >
          {db.processes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="md:col-span-3 flex justify-end">
          <Button onClick={createRecipe}>Crear receta</Button>
        </div>
      </div>

      {/* Items de la receta */}
      <div className="overflow-auto rounded-2xl bg-white shadow">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2 text-left">Producto</th>
              <th className="p-2 text-right">Qty por unidad</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const p = db.products.find((p) => p.id === i.productId)!;
              return (
                <tr key={i.id} className="border-t">
                  <td className="p-2">
                    {p.sku} — {p.name}
                  </td>
                  <td className="p-2 text-right">
                    <Input
                      type="number"
                      value={i.qtyPerUnit}
                      onChange={(e) => updateQty(i.id, Number(e.target.value))}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Agregar ítem + simulación */}
      <div className="grid gap-2 md:grid-cols-3">
        <select
          className="rounded-xl border px-3 py-2 text-sm"
          defaultValue=""
          onChange={(e) => {
            addItem(e.target.value);
            e.currentTarget.value = '';
          }}
        >
          <option value="" disabled>
            Añadir ítem…
          </option>
          {db.products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} — {p.name}
            </option>
          ))}
        </select>

        <div className="md:col-span-2 flex items-center justify-end">
          <Button onClick={() => simulate(100)}>Probar receta (100 u)</Button>
        </div>
      </div>
    </div>
  );
}
