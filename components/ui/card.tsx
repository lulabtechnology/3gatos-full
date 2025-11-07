export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
return <div className={`rounded-2xl bg-white p-4 shadow ${className ?? ""}`}>{children}</div>;
}
export function CardHeader({ children }: { children: React.ReactNode }) {
return <div className="mb-2 text-sm font-semibold text-slate-600">{children}</div>;
}
export function CardTitle({ children }: { children: React.ReactNode }) {
return <h3 className="text-lg font-semibold">{children}</h3>;
}
export function CardContent({ children }: { children: React.ReactNode }) {
return <div className="mt-2">{children}</div>;
}
