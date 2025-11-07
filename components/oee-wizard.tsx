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
          {db.pro
