import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { appointmentLabels, clinicalDisclaimer } from "@/lib/constants";
import type { AppointmentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Button({ children, href, variant = "primary", type = "button", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: string; variant?: "primary" | "secondary" | "ghost" }) {
  const className = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    variant === "primary" && "bg-brand text-white hover:bg-brand-dark",
    variant === "secondary" && "border border-line bg-white text-brand-dark hover:bg-mint",
    variant === "ghost" && "text-muted hover:bg-mint",
    props.className,
  );
  if (href)
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  return (
    <button {...props} className={className} type={type}>
      {children}
    </button>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.04)]", className)}>{children}</div>;
}

export function StatusBadge({ status }: { status: AppointmentStatus | string }) {
  const tone = ["completed", "confirmed", "sent"].includes(status)
    ? "bg-emerald-100 text-emerald-700"
    : ["missed", "failed"].includes(status)
      ? "bg-red-100 text-red-700"
      : ["cancelled"].includes(status)
        ? "bg-slate-100 text-slate-600"
        : "bg-amber-100 text-amber-700";
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold", tone)}>
      {appointmentLabels[status as AppointmentStatus] ?? ({ pending: "Dijadwalkan", sent: "Terkirim", failed: "Gagal terkirim", cancelled: "Dibatalkan" } as Record<string, string>)[status] ?? status}
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
      <CircleAlert className="mx-auto mb-3 text-brand" />
      <h3 className="font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  );
}

export function ClinicalDisclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-mint p-4 text-sm text-brand-dark">
      <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
      <p>{clinicalDisclaimer}</p>
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <Loader2 className="size-4 animate-spin" />
      Memuat data...
    </div>
  );
}

export function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>}
        <h1 className="text-2xl font-extrabold tracking-tight text-[#17243d] sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ArrowLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Link className="inline-flex items-center gap-2 font-bold text-brand hover:text-brand-dark" href={href}>
      {children}
      <ArrowRight className="size-4" />
    </Link>
  );
}
