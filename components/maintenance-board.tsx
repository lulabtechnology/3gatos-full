'use client';
import { useStore } from '@/hooks/useStore';
import { newId } from '@/lib/ids';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function MaintenanceBoard() {
  const { db, upsertTask, addLog } = useStore();
  const [task, setTask] = useState({
    equipmentId: db.equipments[0]?.id ?? '',
    type: 'PREVENTIVO' as 'PREVENTIVO' | 'CORRECTIVO',
    title: '',
    description: '',
    scheduledDate: new Date().toISOString().slice(0, 10),
  });

  function createTask() {
    const t = {
      id: newId(),
      equipmentId: task.equipmentId,
      type: task.type,
      title: task.title || 'Tarea',
      description: task.description,
      scheduledDate: task.scheduledDate,
      status: 'PENDIENTE' as const,
    };
    upsertTask(t);
  }

  function setStatus(
    id: string,
    status: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO'
  ) {
    const t = db.maintTasks.find((x) => x.id === id);
    if (!t) return;
    upsertTask({ ...t, status });
  }

  function addQuickLog(id: string) {
    const note = typeof window !== 'undefined' ? (prompt('Nota del log:') ?? '') : '';
    addLog({ id: newId(), taskId: id, logDate: new Date().toISOString(), notes: note });
  }

  return (
    <div className="space-y-4">
      {/* NUEVA TAREA */}
      <div className="rounded-2xl bg-white p-4 shadow">
        <div className="mb-2 text-sm font-semibold">Nueva tarea</div>
        <div className="grid gap-2 md:grid-cols-5">
          <select
            className="rounded-xl border px-3 py-2 text-sm"
            value={task.equipmentId}
            onChange={(e) => setTask({ ...task, equipmentId: e.target.value })}
          >
            {db.equipments.map((e) => (
              <option key={e.id} value={e.id}>
                {e.code} — {e.name}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border px-3 py-2 text-sm"
            value={task.type}
            onChange={(e) => setTask({ ...task, type: e.target.value as 'PREVENTIVO' | 'CORRECTIVO' })}
          >
            <option value="PREVENTIVO">Preventivo</option>
            <option value="CORRECTIVO">Correctivo</option>
          </select>

          <Input
            placeholder="Título"
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
          />
          <Input
            placeholder="Descripción"
            value={task.description}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
          />
          <Input
            type="date"
            value={task.scheduledDate}
            onChange={(e) => setTask({ ...task, scheduledDate: e.target.value })}
          />
        </div>

        <div className="mt-2 flex justify-end">
          <Button onClick={createTask}>Crear tarea</Button>
        </div>
      </div>

      {/* TABLERO POR ESTADO */}
      <div className="grid gap-4 md:grid-cols-3">
        {(['PENDIENTE', 'EN_PROCESO', 'COMPLETADO'] as const).map((col) => (
          <div key={col} className="rounded-2xl bg-white p-3 shadow">
            <div className="mb-2 text-sm font-semibold">{col}</div>

            <div className="space-y-2">
              {db.maintTasks
                .filter((t) => t.status === col)
                .map((t) => (
                  <div key={t.id} className="rounded-xl border p-3">
                    <div className="text-sm font-semibold">{t.title}</div>
                    <div className="text-xs text-slate-600">
                      {t.scheduledDate} — {db.equipments.find((e) => e.id === t.equipmentId)?.name}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {col !== 'PENDIENTE' && (
                        <Button
                          className="bg-slate-200 text-slate-700"
                          onClick={() => setStatus(t.id, 'PENDIENTE')}
                        >
                          A Pendiente
                        </Button>
                      )}
                      {col !== 'EN_PROCESO' && (
                        <Button
                          className="bg-yellow-500"
                          onClick={() => setStatus(t.id, 'EN_PROCESO')}
                        >
                          A En Proceso
                        </Button>
                      )}
                      {col !== 'COMPLETADO' && (
                        <Button
                          className="bg-green-600"
                          onClick={() => setStatus(t.id, 'COMPLETADO')}
                        >
                          A Completado
                        </Button>
                      )}
                      <Button className="bg-slate-800" onClick={() => addQuickLog(t.id)}>
                        Log
                      </Button>
                    </div>

                    <div className="mt-2 text-xs">
                      <b>Logs:</b>
                      <ul className="list-disc pl-5">
                        {db.maintLogs
                          .filter((l) => l.taskId === t.id)
                          .map((l) => (
                            <li key={l.id}>
                              {new Date(l.logDate).toLocaleString()} — {l.notes}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
