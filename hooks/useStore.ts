'use client';
import { create } from 'zustand';
import { repo, type DB, type Product, type Process, type Recipe, type RecipeItem, type StockMovement, type OeeRun, type Equipment, type MaintenanceTask, type MaintenanceLog, exportJSON, importJSON } from '@/lib/store';


interface UIState { jsonImportOpen: boolean; }


interface AppState {
db: DB;
ui: UIState;
hydrate: () => void;
exportAll: () => void;
importAll: (json: string) => void;
// Actions (subset for UI)
upsertProduct: (p: Product) => void;
addStockMovement: (m: Omit<StockMovement, 'id'|'createdAt'> & { createdAt?: string }) => void;
upsertRecipe: (r: Recipe) => void;
setRecipeItems: (rid: string, items: RecipeItem[]) => void;
addOeeRun: (r: OeeRun) => { consumos: any[]; faltantes: any[] };
upsertTask: (t: MaintenanceTask) => void;
addLog: (l: MaintenanceLog) => void;
setJsonImportOpen: (open: boolean) => void;
}


export const useStore = create<AppState>((set, get) => ({
db: repo.getAll(),
ui: { jsonImportOpen: false },
hydrate: () => set({ db: repo.getAll() }),
exportAll: () => {
const data = exportJSON();
const blob = new Blob([data], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url; a.download = 'tres-gatos-ops.json'; a.click();
URL.revokeObjectURL(url);
},
importAll: (json) => { importJSON(json); set({ db: repo.getAll() }); },
upsertProduct: (p) => { repo.upsertProduct(p); set({ db: repo.getAll() }); },
addStockMovement: (m) => { repo.addStockMovement(m); set({ db: repo.getAll() }); },
upsertRecipe: (r) => { repo.upsertRecipe(r); set({ db: repo.getAll() }); },
setRecipeItems: (rid, items) => { repo.setRecipeItems(rid, items); set({ db: repo.getAll() }); },
addOeeRun: (r) => { const res = repo.addOeeRun(r); set({ db: repo.getAll() }); return res; },
upsertTask: (t) => { repo.upsertTask(t); set({ db: repo.getAll() }); },
addLog: (l) => { repo.addLog(l); set({ db: repo.getAll() }); },
setJsonImportOpen: (open) => set((s) => ({ ui: { ...s.ui, jsonImportOpen: open } }))
}));
