import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 ${className}`}>{children}</div>;
}

export function StatCard({
  label,
  value,
  sub,
  tone = "default",
  onClick,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "warning" | "danger" | "success";
  onClick?: () => void;
}) {
  const toneClasses: Record<string, string> = {
    default: "text-slate-900",
    warning: "text-amber-600",
    danger: "text-red-600",
    success: "text-brand-600",
  };
  const content = (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClasses[tone]}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </>
  );
  if (!onClick) return <Card>{content}</Card>;
  return (
    <button type="button" onClick={onClick} className="text-left">
      <Card className="h-full transition-shadow hover:ring-brand-200 hover:shadow-md">{content}</Card>
    </button>
  );
}
