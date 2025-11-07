import { RecipeEditor } from '@/components/recipe-editor';

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Recetas (BOM)</h1>
      <RecipeEditor />
    </div>
  );
}
