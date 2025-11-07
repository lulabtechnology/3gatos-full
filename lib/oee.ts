export function computeRunTime(plannedMin: number, downtimeMin: number) {
return Math.max(0, plannedMin - Math.max(0, downtimeMin));
}


export function computeAvailability(runTimeMin: number, plannedMin: number) {
if (plannedMin <= 0) return 0;
return clamp(runTimeMin / plannedMin);
}


export function computePerformance(idealCycleSec: number, totalCount: number, runTimeMin: number) {
const runTimeSec = runTimeMin * 60;
if (runTimeSec <= 0 || idealCycleSec <= 0) return 0;
return clamp((idealCycleSec * totalCount) / runTimeSec);
}


export function computeQuality(totalCount: number, rejectCount: number) {
if (totalCount <= 0) return 0;
const good = totalCount - Math.max(0, rejectCount);
if (good < 0) return 0;
return clamp(good / totalCount);
}


export function computeOEE(A: number, P: number, Q: number) {
return clamp(A * P * Q);
}


function clamp(x: number) { return Math.max(0, Math.min(1, x)); }
