import { newId, ID } from "@/lib/ids";


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


const NS = "tresgatos";
const KEY = `${NS}.db`;
const CURRENT_VERSION = 1;


// =================== Core I/O ===================
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


function emptyDB(): DB {
return {
schemaVersion: CURRENT_VERSION,
processes: [], products: [], stockMovs: [],
recipes: [], recipeItems: [], oeeRuns: [],
equipments: [], maintTasks: [], maintLogs: []
};
}
};
