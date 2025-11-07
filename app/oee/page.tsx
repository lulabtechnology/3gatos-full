import { OeeWizard } from '@/components/oee-wizard';

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">OEE (Asistente de Cálculo)</h1>
      <OeeWizard />
    </div>
  );
}
