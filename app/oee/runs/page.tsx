import { OeeRunsTable } from '@/components/oee-runs-table';

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Registros OEE</h1>
      <OeeRunsTable />
    </div>
  );
}
