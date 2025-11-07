'use client';
import { useStore } from '@/hooks/useStore';
import { newId } from '@/lib/ids';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';


export function MaintenanceBoard() {
const { db, upsertTask, addLog } = useStore();
const [task, setTask] = useState({ equipmentId: db.equipments[0]?.id ?? '', type: 'PREVENTIVO' as 'PREVENTIVO'|'CORRECTIVO', title: '', description: '', scheduledDate: new Date().toISOString().slice(0,10) });


function createTask() {
const t = { id: newId(), equipmentId: task.equipmentId, type: task.type, title: task.title || 'Tarea', description: task.description, scheduledDate: task.scheduledDate, status: 'PENDIENTE' as const };
upsertTask(t);
}


function setStatus(id: string, status: 'PENDIENTE'|'EN_PROCESO'|'COMPLETADO') {
const t = db.maintTasks.find(x=>x.id===id)!;
upsertTask({ ...t, status });
}


function addQuickLog(id: string) {
const note = prompt('Nota del log:') ?? '';
addLog({ id: newId(), taskId: id, logDate: new Date().toISOString(), notes: note });
}


return (
<div className="space-y-4">
<div className="rounded-2xl bg-white p-4 shadow">
<div classNam
