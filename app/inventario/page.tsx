import { InventoryTable } from '@/components/inventory-table';

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Inventario</h1>
      <InventoryTable />
    </div>
  );
}
