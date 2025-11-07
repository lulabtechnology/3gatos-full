import { MaintenanceBoard } from '@/components/maintenance-board';

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Mantenimiento</h1>
      <MaintenanceBoard />
    </div>
  );
}
