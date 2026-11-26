import type { ReactNode } from "react";

/* Shared shell for the smaller dashboard pages: eyebrow, title, optional intro, content. */
export function DashboardPage({
    eyebrow,
    title,
    intro,
    children,
}: {
    eyebrow: string;
    title: string;
    intro?: string;
    children: ReactNode;
}) {
    return (
        <div className="mx-auto max-w-7xl p-3.5 pb-19.5 lg:p-6 lg:pb-10">
            <p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#a97e4b]">{eyebrow}</p>
            <h1 className="mt-1 text-[24px] font-extrabold tracking-[-.04em]">{title}</h1>
            {intro && <p className="mt-1 max-w-[640px] text-[13px] text-[#5d6876]">{intro}</p>}
            <div className="mt-5">{children}</div>
        </div>
    );
}

export function DashboardCard({ children }: { children: ReactNode }) {
    return (
        <div className="max-w-[820px] rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white p-6 text-[13px] leading-[1.6] text-[#5d6876]">
            {children}
        </div>
    );
}
