'use client';

import { useState, useMemo } from 'react';
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

  const [processId, setProcessId] = useState(db.processes[0]?.id ?? '');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [recipeId, setRecipeId] = useState<string>('');
  const [producedUnits, setProducedUnits] = useState<number>(0);

  const [planned, setPlanned] = useState<number>(480);
  const [down, setDown] = useState<number>(0);
  const runTime = useMemo(() => computeRunTime(planned, down), [planned, down]);

  const [idealCycle, setIdealCycle] = useState<number>(1.0);
  const [total, setTotal] = useState<number>(0);
  const [reject, setReject] = useState<number>(0);
  const good = useMemo(
    () => Math.max(0, total - Math.max(0, reject)),
    [total, reject]
  );

  const A = useMemo(() => computeAvailability(runTime, planned), [runTime, planned]);
  const P = useMemo(
    () => computePerformance(idealCycle, total, runTime),
    [idealCycle, total, runTime]
  );
  const Q = useMemo(() => computeQuality(total, reject), [total, reject]);
  const OEE = useMemo(() => computeOEE(A, P, Q), [A, P, Q]);

  function nameOf(pid: string) {
    return db.products.find((p) => p.id === pid)?.name ?? pid;
  }

  function register() {
    if (!processId) return alert('Seleccione proceso');
    if (total < 0 || reject < 0 || good < 0) return alert('Verifique cantidades');

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

    const lines = [
      `OEE registrado. OEE ${(OEE * 100).toFixed(1)}%`,
      recipeId ? `Consumos: ${consumos.length} ítems` : 'Sin receta asociada.',
    ];
    if (faltantes.length > 0)
      lines.push(
        'FALTANTES: ' +
          faltantes
            .map(
              (f) => `${nameOf(f.productId)} (disp ${f.available}) necesita ${f.needed}`
            )
            .join(', ')
      );
    alert(lines.join('\n'));
  }

  return (
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

        <Label className="mt-3">Fecha</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

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
              value={producedUnits}
              onChange={(e) => setProducedUnits(Number(e.target.value))}
            />
          </>
        )}
      </div>

      {/* Panel 2 */}
      <div className="rounded-2xl bg-white p-4 shadow">
        <h3 className="mb-3 text-lg font-semibold">2) Tiempos (min)</h3>

        <Label>Planificado</Label>
        <Input
          type="number"
          value={planned}
          onChange={(e) => setPlanned(Number(e.target.value))}
        />

        <Label className="mt-3">Paros</Label>
        <Input type="number" value={down} onChange={(e) => setDown(Number(e.target.value))} />

        <div className="mt-3 rounded-xl bg-slate-50 p-2 text-sm">
          RunTime: <b>{runTime}</b> min
        </div>
      </div>

      {/* Panel 3 */}
      <div className="rounded-2xl bg-white p-4 shadow">
        <h3 className="mb-3 text-lg font-semibold">3) Rendimiento & Calidad</h3>

        <Label>Ideal Cycle (seg/unidad)</Label>
        <Input
          type="number"
          value={idealCycle}
          onChange={(e) => setIdealCycle(Number(e.target.value))}
        />

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <Label>Producción total</Label>
            <Input
              type="number"
              value={total}
              onChange={(e) => setTotal(Number(e.target.value))}
            />
          </div>

          <div>
            <Label>Rechazos</Label>
            <Input
              type="number"
              value={reject}
              onChange={(e) => setReject(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-xl bg-slate-50 p-2">
            A: <b>{(A * 100).toFixed(1)}%</b>
          </div>
          <div className="rounded-xl bg-slate-50 p-2">
            P: <b>{(P * 100).toFixed(1)}%</b>
          </div>
          <div className="rounded-xl bg-slate-50 p-2">
            Q: <b>{(Q * 100).toFixed(1)}%</b>
          </div>
        </div>

        <div className="mt-2 rounded-xl bg-blue-50 p-2 text-center text-lg font-semibold">
          OEE {(OEE * 100).toFixed(1)}%
        </div>

        <Button className="mt-3 w-full" onClick={register}>
          Registrar OEE
        </Button>
      </div>
    </div>
  );
}
