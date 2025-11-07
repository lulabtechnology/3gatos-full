import { newId, type ID } from "@/lib/ids";

// Tipos
export type Unit = "kg" | "L" | "u";
export interface Process { id: ID; name: string; description?: string; isActive: boolean; }
export interface Product { id: ID; sku: string; name: string; unit: Unit; currentStock: number; reorderPoint: number; status: "EN_STOCK"|"BAJO"|"FALTANTE"; }
export interface StockMovement { id: ID; productId: ID; type: "IN"|"OUT"|"ADJ"; quantity: number; reason?: string; linkedOeeRunId?: ID; createdAt: string; }
export interface Recipe { id: ID; name: string; processId: ID; notes?: string; }
export interface RecipeItem { id: ID; recipeId: ID; productId: ID; qtyPerUnit: number; }
export interface OeeRun {
  id: ID; processId: ID; date: string;
  plannedTimeMin: number; downtimeMin: number; runTimeMin: number;
  totalCount: number; rejectCount: number; goodCount: number;
  idealCycleTimeSec: number; availability: number; performance: number; quality: number; oee: number;
  recipeId?: ID; producedUnits?: number; notes?: string;
}
export interface Equipment { id: ID; code: string; name: string; area: string; criticality: "ALTA"|"MEDIA"|"BAJA"; }
export interface MaintenanceTask {
  id: ID; equipmentId: ID; type: "PREVENTIVO"|"CORRECTIVO";
  title: string; description?: string; scheduledDate: string;
  status: "PENDIENTE"|"EN_PROCESO"|"COMPLETADO";
}
export interface MaintenanceLog { id: ID; taskId: ID; logDate: string; notes?: string; durationMin?: number; costReal?: number; }

export interface DB {
  schemaVersion: number;
  processes: Process[];
  products: Product[];
  stockMovs: StockMovement[];
  recipes: Recipe[];
  recipeItems: RecipeItem[];
  oeeRuns: OeeRun[];
  equipments: Equipment[];
  maintTasks: MaintenanceTask[];
  maintLogs: MaintenanceLog[];
}

const KEY = "tresgatos.db";
const CURRENT_VERSION = 1;

// Persistencia básica
export function readDB(): DB {
  if (typeof window === "undefined") return emptyDB();
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const seeded = seedDB(emptyDB());
    localStorage.setItem(KEY, JSON.stringify(seeded));
    return seeded;
  }
  let db: DB = JSON.parse(raw);
  db = migrate(db);
  return db;
}
export function writeDB(db: DB) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(db));
}
export function exportJSON(): string {
  return JSON.stringify(readDB(), null, 2);
}
export function importJSON(json: string) {
  const incoming = JSON.parse(json) as DB;
  const migrated = migrate(incoming);
  writeDB(migrated);
}

// Helpers internos
function emptyDB(): DB {
  return {
    schemaVersion: CURRENT_VERSION,
    processes: [], products: [], stockMovs: [],
    recipes: [], recipeItems: [], oeeRuns: [],
    equipments: [], maintTasks: [], maintLogs: []
  };
}
function migrate(db: DB): DB {
  let out = { ...db } as DB;
  if (!out.schemaVersion) out.schemaVersion = 0;
  if (out.schemaVersion < 1) {
    out.products = (out.products ?? []).map(p => ({ ...p, status: computeStatus(p.currentStock, p.reorderPoint) }));
    out.schemaVersion = 1;
  }
  return out;
}
function seedDB(db: DB): DB {
  if (db.processes.length > 0) return db;
  const proc = ["Molienda","Maceración","Cocción","Fermentación","Maduración","Filtrado","Empaque"].map(name => ({ id: newId(), name, isActive: true } as Process));
  const prods: Product[] = [
    ["MALTA","Malta","kg", 500, 100],
    ["LUP","Lúpulo","kg", 50, 10],
    ["LEV","Levadura","kg", 30, 5],
    ["AGT","Agua tratada","L", 10000, 2000],
    ["B330","Botellas 330ml","u", 2000, 500],
    ["TPA","Tapas","u", 2000, 500],
    ["ETQ","Etiquetas","u", 2000, 500],
    ["CO2","CO₂","kg", 100, 20],
    ["CJ24","Caja 24u","u", 200, 50]
  ].map(([sku,name,unit,stock,rop]) => ({
    id: newId(), sku: sku as string, name: name as string, unit: unit as Unit, currentStock: stock as number, reorderPoint: rop as number,
    status: computeStatus(stock as number, rop as number)
  }));

  const lagerProcessId = proc.find(p => p.name === "Cocción")!.id;
  const recipeId = newId();
  const rec: Recipe = { id: recipeId, name: "Lager Base", processId: lagerProcessId, notes: "Receta estándar" };
  const find = (sku: string) => prods.find(p => p.sku === sku)!;
  const items: RecipeItem[] = [
    ["MALTA", 0.18],["LUP", 0.01],["LEV", 0.005],["AGT", 3.5],
    ["B330", 24],["TPA", 24],["ETQ", 24],["CO2", 0.02],["CJ24", 1]
  ].map(([sku, qty]) => ({ id: newId(), recipeId, productId: find(sku as string).id, qtyPerUnit: qty as number }));

  const equipments: Equipment[] = [
    { id: newId(), code: "M-01", name: "Molino M-01", area: "Molienda", criticality: "ALTA" },
    { id: newId(), code: "HB-200", name: "Hervidor HB-200", area: "Cocción", criticality: "ALTA" },
    { id: newId(), code: "F-1000", name: "Fermentador F-1000", area: "Fermentación", criticality: "ALTA" },
    { id: newId(), code: "LN-6", name: "Llenadora LN-6", area: "Empaque", criticality: "MEDIA" },
    { id: newId(), code: "EQ-3", name: "Etiquetadora EQ-3", area: "Empaque", criticality: "MEDIA" }
  ];

  const now = new Date().toISOString();
  const stockMovs: StockMovement[] = [
    { id: newId(), productId: find("MALTA").id, type: "IN", quantity: 200, reason: "Compra inicial", createdAt: now },
    { id: newId(), productId: find("B330").id, type: "IN", quantity: 1000, reason: "Compra inicial", createdAt: now }
  ];

  return {
    ...db,
    processes: proc,
    products: prods,
    recipes: [rec],
    recipeItems: items,
    equipments,
    stockMovs,
    schemaVersion: CURRENT_VERSION
  };
}
export function computeStatus(current: number, rop: number): Product["status"] {
  if (current <= 0) return "FALTANTE";
  if (current <= rop) return "BAJO";
  return "EN_STOCK";
}

// REPOSITORIO — ¡exportado!
export const repo = {
  getAll(): DB { return readDB(); },
  saveAll(db: DB) { writeDB(db); },

  upsertProduct(p: Product) {
    const db = readDB();
    const idx = db.products.findIndex(x => x.id === p.id);
    p.status = computeStatus(p.currentStock, p.reorderPoint);
    if (idx >= 0) db.products[idx] = p; else db.products.push(p);
    writeDB(db);
  },

  addStockMovement(m: Omit<StockMovement,"id"|"createdAt"> & { createdAt?: string }) {
    const db = readDB();
    const mov: StockMovement = { id: newId(), createdAt: m.createdAt ?? new Date().toISOString(), ...m };
    db.stockMovs.push(mov);
    const prod = db.products.find(p => p.id === mov.productId)!;
    if (mov.type === "IN") prod.currentStock += mov.quantity;
    if (mov.type === "OUT") prod.currentStock -= mov.quantity;
    if (mov.type === "ADJ") prod.currentStock += mov.quantity; // (+/-) según signo
    prod.status = computeStatus(prod.currentStock, prod.reorderPoint);
    writeDB(db);
    return mov;
  },

  upsertRecipe(r: Recipe) {
    const db = readDB();
    const i = db.recipes.findIndex(x => x.id === r.id);
    if (i >= 0) db.recipes[i] = r; else db.recipes.push(r);
    writeDB(db);
  },
  deleteRecipe(id: ID) {
    const db = readDB();
    db.recipes = db.recipes.filter(r => r.id !== id);
    db.recipeItems = db.recipeItems.filter(it => it.recipeId !== id);
    writeDB(db);
  },
  setRecipeItems(recipeId: ID, items: RecipeItem[]) {
    const db = readDB();
    db.recipeItems = db.recipeItems.filter(i => i.recipeId !== recipeId).concat(items);
    writeDB(db);
  },

  addOeeRun(run: OeeRun) {
    const db = readDB();
    db.oeeRuns.push(run);
    const consumos: { productId: ID; quantity: number }[] = [];
    const faltantes: { productId: ID; needed: number; available: number }[] = [];

    if (run.recipeId && run.producedUnits && run.producedUnits > 0) {
      const items = db.recipeItems.filter(i => i.recipeId === run.recipeId);
      for (const it of items) {
        const qty = it.qtyPerUnit * run.producedUnits;
        consumos.push({ productId: it.productId, quantity: qty });
        const prod = db.products.find(p => p.id === it.productId)!;
        const available = prod.currentStock;
        if (available < qty) faltantes.push({ productId: it.productId, needed: qty, available });
      }
      for (const c of consumos) {
        db.stockMovs.push({
          id: newId(), productId: c.productId, type: "OUT", quantity: c.quantity,
          linkedOeeRunId: run.id, reason: "Consumo receta", createdAt: new Date().toISOString()
        });
        const prod = db.products.find(p => p.id === c.productId)!;
        prod.currentStock -= c.quantity;
        prod.status = computeStatus(prod.currentStock, prod.reorderPoint);
      }
    }

    writeDB(db);
    return { consumos, faltantes };
  },

  upsertTask(t: MaintenanceTask) {
    const db = readDB();
    const i = db.maintTasks.findIndex(x => x.id === t.id);
    if (i >= 0) db.maintTasks[i] = t; else db.maintTasks.push(t);
    writeDB(db);
  },
  addLog(l: MaintenanceLog) {
    const db = readDB();
    db.maintLogs.push(l);
    writeDB(db);
  }
};
