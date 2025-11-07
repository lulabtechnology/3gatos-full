'use client';
import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';

export function InventoryTable() {
  const { db, upsertProduct, addStockMovement } = useStore();
  const [filter, setFilter] = useState('');
  const [mov, setMov] = useState({
    productId: '',
    type: 'IN' as 'IN' | 'OUT' | 'ADJ',
    quantity: 0,
    reason: '',
  });

  const groups = useMemo(() => {
    const all = db.products.filter(
      (p) =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.sku.toLowerCase().includes(filter.toLowerCase())
    );
    return {
      EN_STOCK: all.filter((p) => p.status === 'EN_STOCK').length,
      BAJO: all.filter((p) => p.status === 'BAJO').length,
      FALTANTE: all.filter((p) => p.status === 'FALTANTE').length,
      list: all,
    };
  }, [db.products, filter]);

  return (
    <div className="space-y-4">
      {/* Resumen + búsqueda */}
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-3 shadow">
          EN_STOCK: <b>{groups.EN_STOCK}</b>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow">
          BAJO: <b>{groups.BAJO}</b>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow">
          FALTANTE: <b>{groups.FALTANTE}</b>
        </div>
        <Input
          placeholder="Buscar SKU/Nombre"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Tabla de productos */}
      <div className="overflow-auto rounded-2xl bg-white shadow">
        <table className="w-full min-w-[840px] text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2 text-left">SKU</th>
              <th className="p-2 text-left">Producto</th>
              <th className="p-2">Unidad</th>
              <th className="p-2">Stock</th>
              <th className="p-2">ROP</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {groups.list.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.sku}</td>
                <td className="p-2">
                  <Input
                    value={p.name}
                    onChange={(e) =>
                      upsertProduct({ ...p, name: e.target.value })
                    }
                  />
                </td>
                <td className="p-2 text-center">{p.unit}</td>
                <td className="p-2 text-center">
                  <Input
                    type="number"
                    value={p.currentStock}
                    onChange={(e) =>
                      upsertProduct({
                        ...p,
                        currentStock: Number(e.target.value),
                      })
                    }
                  />
                </td>
                <td className="p-2 text-center">
                  <Input
                    type="number"
                    value={p.reorderPoint}
                    onChange={(e) =>
                      upsertProduct({
                        ...p,
                        reorderPoint: Number(e.target.value),
                      })
                    }
                  />
                </td>
                <td className="p-2 text-center">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      p.status === 'EN_STOCK'
                        ? 'bg-green-100 text-green-700'
                        : p.status === 'BAJO'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="p-2 text-center">
                  <button
                    className="rounded-xl bg-slate-100 px-2 py-1 text-xs"
                    onClick={() =>
                      setMov((m) => ({ ...m, productId: p.id }))
                    }
                  >
                    Historial / Movimiento
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Movimiento rápido + historial */}
      {mov.productId && (
        <div className="rounded-2xl bg-white p-4 shadow">
          <div className="mb-2 text-sm font-semibold">Movimiento rápido</div>
          <div className="grid gap-2 md:grid-cols-4">
            <select
              className="rounded-xl border px-3 py-2 text-sm"
              value={mov.type}
              onChange={(e) =>
                setMov({ ...mov, type: e.target.value as 'IN' | 'OUT' | 'ADJ' })
              }
            >
              <option value="IN">Entrada (IN)</option>
              <option value="OUT">Salida (OUT)</option>
              <option value="ADJ">Ajuste (ADJ)</option>
            </select>
            <Input
              type="number"
              placeholder="Cantidad"
              value={mov.quantity}
              onChange={(e) =>
                setMov({ ...mov, quantity: Number(e.target.value) })
              }
            />
            <Input
              placeholder="Motivo"
              value={mov.reason}
              onChange={(e) => setMov({ ...mov, reason: e.target.value })}
            />
            <Button
              onClick={() => {
                if (!mov.productId) return;
                addStockMovement({
                  productId: mov.productId,
                  type: mov.type,
                  quantity: mov.quantity,
                  reason: mov.reason,
                });
                alert('Movimiento registrado');
              }}
            >
              Registrar
            </Button>
          </div>

          <div className="mt-4 text-sm font-semibold">Historial</div>
          <div className="mt-2 overflow-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2 text-left">Fecha</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2 text-right">Cantidad</th>
                  <th className="p-2 text-left">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {db.stockMovs
                  .filter((s) => s.productId === mov.productId)
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="p-2">
                        {new Date(s.createdAt).toLocaleString()}
                      </td>
                      <td className="p-2 text-center">{s.type}</td>
                      <td className="p-2 text-right">{s.quantity}</td>
                      <td className="p-2">{s.reason ?? ''}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
