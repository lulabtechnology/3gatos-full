'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, Option } from '@/components/ui/select';
import { useStore } from '@/hooks/useStore';
import { newId } from '@/lib/ids';
import {
  computeRunTime,
  computeAvailability,
  computePerformance,
  computeQuality,
  computeOEE,
} from '@/lib/oee';

export function OeeWizard() {
  const { db, addOeeRun } = useStore();

  // --- Estado de formulario
  const [processId, setProcessId] = useState(db.processes[0]?.id ?? '');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [recipeId, setRecipeId] = useState<string>('');
  const [producedUnits, setProducedUnits] = useState<number>(0);

  const [planned, setPlanned] = useState<number>(480); // minutos planificados
  const [down, setDown] = useState<number>(0); // minutos de paro
  const runTime = useMemo(() => computeRunTime(planned, down), [planned, down]);

  const [idealCycle, setIdealCycle] = useState<number>(1.0); // segundos por unidad ideal
  const [total, setTotal] = useState<number>(0); // unidades totales
  const [reject, setReject] = useState<number>(0); // unidades rechazadas

  const good = useMemo(
    () => Math.max(0, total - Math.max(0, reject)),
    [total, reject]
  );

  // --- Cálculos OEE
  const A = useMemo(() => computeAvailability(runTime, planned), [runTime, planned]);
  const P = useMemo(
    () => computePerformance(idealCycle, total, runTime),
    [idealCycle, total, runTime]
  );
  const Q = useMemo(() => computeQuality(total, reject), [total, reject]);
  const OEE = useMemo(() => computeOEE(A, P, Q), [A, P, Q]);

  // --- Util
  function nameOfProduct(pid: string) {
    return db.products.find((p) => p.id === pid)?.name ?? pid;
  }

  // --- Validación rápida
  function validate(): string | null {
    if (!processId) return 'Selecciona un proceso.';
    if (planned <= 0) return '“Planificado” debe ser mayor que 0.';
    if (down < 0) return '“Paros” no puede ser negativo.';
    if (down > planned) return '“Paros” no puede ser mayor que “Planificado”.';
    if (idealCycle <= 0) return '“Ideal Cycle (seg/unidad)” debe ser mayor que 0.';
    if (total < 0) return '“Producción total” no puede ser negativa.';
    if (reject < 0) return '“Rechazos” no puede ser negativo.';
    if (reject > total) return '“Rechazos” no puede ser mayor que “Producción total”.';
    if (recipeId && (producedUnits ?? 0) <= 0) return 'Indica “Unidades producidas” para descontar inventario por receta.';
    return null;
  }

  // --- Registro
  function register() {
    const err = validate();
    if (err) return alert(err);

    const id = newId();
    const run = {
      id,
      processId,
      date,
      plannedTimeMin: planned,
      downtimeMin: down,
      runTimeMin: runTime,
      totalCount: total,
      rejectCount: reject,
      goodCount: good,
      idealCycleTimeSec: idealCycle,
      availability: A,
      performance: P,
      quality: Q,
      oee: OEE,
      recipeId: recipeId || undefined,
      producedUnits: recipeId ? producedUnits : undefined,
    };

    const { consumos, faltantes } = addOeeRun(run);

    // Resumen claro después de guardar
    const lines: string[] = [
      `✅ OEE registrado`,
      `• A: ${(A * 100).toFixed(1)}%  P: ${(P * 100).toFixed(1)}%  Q: ${(Q * 100).toFixed(1)}%`,
      `• OEE: ${(OEE * 100).toFixed(1)}%`,
    ];
    if (recipeId) {
      lines.push(`• Receta aplicada: ${db.recipes.find(r => r.id === recipeId)?.name} × ${producedUnits} u`);
      if (consumos.length > 0) {
        lines.push('• Consumos:');
        for (const c of consumos) {
          lines.push(`   - ${nameOfProduct(c.productId)}: ${c.quantity}`);
        }
      }
      if (faltantes.length > 0) {
        lines.push('• FALTANTES (se registró igual):');
        for (const f of faltantes) {
          lines.push(
            `   - ${nameOfProduct(f.productId)}: necesita ${f.needed} (disp. ${f.available})`
          );
        }
      }
    }
    alert(lines.join('\n'));
  }

  // --- Texto de ayuda expandible
  const [openHelp, setOpenHelp] = useState(false);

  return (
    <div className="space-y-4">
      {/* Guía rápida arriba */}
      <div className="rounded-2xl bg-white p-4 shadow">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Cómo llenar este formulario</h2>
            <p className="text-sm text-slate-600">
              1) Elige el proceso y la fecha. Opcional: selecciona una receta y cuántas unidades produciste
              (para descontar inventario automáticamente).
            </p>
            <p className="text-sm text-slate-600">
              2) Ingresa los minutos planificados y los minutos en paro. El tiempo de corrida (<b>RunTime</b>) se calcula solo.
            </p>
            <p className="text-sm text-slate-600">
              3) Ingresa el ciclo ideal en segundos por unidad, la producción total y los rechazos. La A/P/Q y el <b>OEE</b> se calculan en vivo.
            </p>
          </div>
          <Button className="bg-slate-200 text-slate-700" onClick={() => setOpenHelp((v) => !v)}>
            {openHelp ? 'Ocultar fórmulas' : 'Ver fórmulas'}
          </Button>
        </div>
        {openHelp && (
          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6">
            <div><b>RunTime</b> = Planificado − Paros</div>
            <div><b>Availability (A)</b> = RunTime / Planificado</div>
            <div><b>Performance (P)</b> = (IdealCycle × Total) / RunTime_en_seg</div>
            <div><b>Quality (Q)</b> = Buenos / Total, donde <b>Buenos</b> = Total − Rechazos</div>
            <div><b>OEE</b> = A × P × Q</div>
            <div className="mt-2 text-slate-500">
              Si asocias receta + <b>Unidades producidas</b>, al guardar se descontará inventario por cada ítem de la receta.
              Si faltan insumos, se marca como <b>FALTANTE</b> y se registra igual.
            </div>
          </div>
        )}
      </div>

      {/* Tres paneles */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Panel 1 */}
        <div className="rounded-2xl bg-white p-4 shadow">
          <h3 className="mb-3 text-lg font-semibold">1) Proceso & Fecha</h3>

          <Label>Proceso</Label>
          <Select value={processId} onChange={setProcessId}>
            {db.processes.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.name}
              </Option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-slate-500">Ej.: Molienda, Maceración, Cocción…</p>

          <Label className="mt-3">Fecha</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Fecha del registro"
          />

          <Label className="mt-3">Receta (opcional)</Label>
          <Select value={recipeId} onChange={setRecipeId}>
            <Option value="">—</Option>
            {db.recipes.map((r) => (
              <Option key={r.id} value={r.id}>
                {r.name}
              </Option>
            ))}
          </Select>

          {recipeId && (
            <>
              <Label className="mt-3">Unidades producidas</Label>
              <Input
                type="number"
                placeholder="Ej.: 100"
                value={producedUnits}
                onChange={(e) => setProducedUnits(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-slate-500">
                Se consumirá inventario según la receta × unidades.
              </p>
            </>
          )}
        </div>

        {/* Panel 2 */}
        <div className="rounded-2xl bg-white p-4 shadow">
          <h3 className="mb-3 text-lg font-semibold">2) Tiempos (min)</h3>

          <Label>Planificado</Label>
          <Input
            type="number"
            placeholder="Minutos planificados (ej.: 480)"
            value={planned}
            onChange={(e) => setPlanned(Number(e.target.value))}
          />
          <p className="mt-1 text-xs text-slate-500">Tiempo total destinado a producir.</p>

          <Label className="mt-3">Paros</Label>
          <Input
            type="number"
            placeholder="Minutos en paro (ej.: 30)"
            value={down}
            onChange={(e) => setDown(Number(e.target.value))}
          />
          <p className="mt-1 text-xs text-slate-500">Suma de detenciones no productivas.</p>

          <div className="mt-3 rounded-xl bg-slate-50 p-2 text-sm">
            RunTime calculado: <b>{runTime}</b> min
          </div>
        </div>

        {/* Panel 3 */}
        <div className="rounded-2xl bg-white p-4 shadow">
          <h3 className="mb-3 text-lg font-semibold">3) Rendimiento & Calidad</h3>

          <Label>Ideal Cycle (seg/unidad)</Label>
          <Input
            type="number"
            placeholder="Segundos por unidad ideal (ej.: 1.2)"
            value={idealCycle}
            onChange={(e) => setIdealCycle(Number(e.target.value))}
          />
          <p className="mt-1 text-xs text-slate-500">Tiempo teórico por unidad.</p>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <Label>Producción total</Label>
              <Input
                type="number"
                placeholder="Unidades totales"
                value={total}
                onChange={(e) => setTotal(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Rechazos</Label>
              <Input
                type="number"
                placeholder="Unidades rechazadas"
                value={reject}
                onChange={(e) => setReject(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-xl bg-slate-50 p-2">
              A: <b>{(A * 100).toFixed(1)}%</b>
              <div className="text-[11px] text-slate-500">Disponibilidad</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-2">
              P: <b>{(P * 100).toFixed(1)}%</b>
              <div className="text-[11px] text-slate-500">Rendimiento</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-2">
              Q: <b>{(Q * 100).toFixed(1)}%</b>
              <div className="text-[11px] text-slate-500">Calidad</div>
            </div>
          </div>

          <div className="mt-2 rounded-xl bg-blue-50 p-2 text-center text-lg font-semibold">
            OEE {(OEE * 100).toFixed(1)}%
          </div>

          <Button className="mt-3 w-full" onClick={register}>
            Registrar OEE
          </Button>
          <p className="mt-2 text-xs text-slate-500">
            Al registrar, el OEE quedará en <b>Registros OEE</b>. Si hay receta, se descuentan insumos.
          </p>
        </div>
      </div>
    </div>
  );
}
