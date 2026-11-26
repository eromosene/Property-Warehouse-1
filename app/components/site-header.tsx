"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getSharedSession, type SessionUser } from "../lib/auth";

const LINKS = [
    { label: "Listings", href: "/listings" },
    { label: "Heat Map", href: "/heatmap" },
    { label: "Landlords", href: "/how-it-works#landlords" },
    { label: "How It Works", href: "/how-it-works" },
] as const;

type Props = {
    /* how-it-works lays its hero out for an out-of-flow header; every other page keeps it in flow. */
    position?: "sticky" | "fixed";
};

export default function SiteHeader({ position = "sticky" }: Props) {
    const pathname = usePathname();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<SessionUser | null>(null);

    const drawerRef = useRef<HTMLDivElement>(null);
    const menuBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        let active = true;
        getSharedSession().then(({ user: sessionUser }) => {
            if (active) setUser(sessionUser);
        });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* Close the mobile drawer when tapping outside it (or outside the hamburger). */
    useEffect(() => {
        if (!drawerOpen) return;
        const onClick = (event: MouseEvent) => {
            if (
                drawerRef.current &&
                menuBtnRef.current &&
                !drawerRef.current.contains(event.target as Node) &&
                !menuBtnRef.current.contains(event.target as Node)
            ) {
                setDrawerOpen(false);
            }
        };
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, [drawerOpen]);

    const isActive = (href: string) => {
        if (href.includes("#")) return false;
        if (href === "/listings") return pathname === "/listings" || pathname.startsWith("/listing/");
        return pathname === href;
    };

    const closeDrawer = () => setDrawerOpen(false);

    const authCta = user ? "/dashboard/listings/create" : "/auth#landlord";

    return (
        <>
            <header
                className={[
                    "z-[100] flex h-[68px] items-center gap-8 border-b border-black/[0.07] bg-[rgba(255,255,255,0.97)] px-5 backdrop-blur-[12px] max-[900px]:gap-0 max-[900px]:px-5 min-[901px]:px-10",
                    position === "fixed" ? "fixed inset-x-0 top-0" : "sticky top-0",
                    scrolled ? "shadow-[0_2px_20px_rgba(0,0,0,.10)]" : "",
                ].join(" ")}
            >
                <Link
                    href="/"
                    aria-label="Property Warehouse home"
                    className="inline-flex shrink-0 items-center gap-2.5"
                >
                    <span className="inline-block font-cormorant text-[34px] font-bold leading-[0.82] tracking-[-0.09em] text-[#a97e4b]">
                        P <span className="inline-block -ml-[3px] translate-y-[11px]">W</span>
                    </span>
                    <span className="grid gap-px text-[13px] font-extrabold leading-none tracking-[-0.04em] text-[#09182a] max-[420px]:hidden">
                        <span>PROPERTY</span>
                        <span>WAREHOUSE</span>
                    </span>
                </Link>

                <nav
                    aria-label="Primary navigation"
                    className="hidden min-[901px]:flex min-w-0 flex-1 items-center justify-center gap-6 min-[1140px]:gap-9"
                >
                    {LINKS.map(({ label, href }) => (
                        <Link
                            key={label}
                            href={href}
                            className={[
                                "whitespace-nowrap border-b-2 pb-1 text-[14px] font-semibold transition-colors duration-200 hover:text-[#a97e4b]",
                                isActive(href)
                                    ? "border-[#09182a] text-[#09182a]"
                                    : "border-transparent text-[#09182a]",
                            ].join(" ")}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden shrink-0 items-center gap-4 min-[901px]:flex">
                    {user ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex min-h-[37px] items-center gap-[9px] rounded-[7px] border border-[#15935f]/30 bg-[#15935f]/[0.07] pl-[6px] pr-[15px] text-[12px] font-bold text-[#0f7a52] transition-colors hover:border-[#15935f] hover:bg-[#15935f] hover:text-white"
                        >
                            <span className="grid h-[25px] w-[25px] place-items-center rounded-[5px] bg-[#15935f] text-[10px] font-extrabold tracking-[.03em] text-white">
                                {user.firstName.charAt(0)}
                                {user.lastName.charAt(0)}
                            </span>
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            href="/auth"
                            className="whitespace-nowrap text-[13px] font-bold text-[#101b2a]"
                        >
                            Log in
                        </Link>
                    )}
                    <Link
                        href={authCta}
                        className="inline-flex min-h-[37px] min-w-[106px] items-center justify-center whitespace-nowrap rounded-[7px] bg-[#09182a] px-[17px] text-[12px] font-bold text-white shadow-[0_14px_30px_rgba(9,24,42,0.16)] transition hover:opacity-85"
                    >
                        + List Property
                    </Link>
                </div>

                <button
                    ref={menuBtnRef}
                    type="button"
                    aria-label="Open menu"
                    aria-expanded={drawerOpen}
                    onClick={() => setDrawerOpen((open) => !open)}
                    className="ml-auto hidden max-[900px]:flex cursor-pointer flex-col gap-[5px] border-none bg-none p-1.5"
                >
                    <span className="block h-0.5 w-[22px] rounded-[2px] bg-[#09182a]" />
                    <span className="block h-0.5 w-[22px] rounded-[2px] bg-[#09182a]" />
                    <span className="block h-0.5 w-[22px] rounded-[2px] bg-[#09182a]" />
                </button>
            </header>

            {/* MOBILE DRAWER */}
            <div
                ref={drawerRef}
                className={[
                    "fixed inset-x-0 bottom-0 top-[68px] z-[99] flex-col border-t border-[#eee] bg-white px-6 py-5",
                    drawerOpen ? "max-[900px]:flex" : "hidden",
                ].join(" ")}
            >
                {LINKS.map(({ label, href }) => (
                    <Link
                        key={label}
                        href={href}
                        onClick={closeDrawer}
                        className={[
                            "block border-b border-[#f0eeeb] py-3.5 text-[16px] font-semibold no-underline",
                            isActive(href) ? "text-[#a97e4b]" : "text-[#09182a]",
                        ].join(" ")}
                    >
                        {label}
                    </Link>
                ))}
                {user && (
                    <Link
                        href="/dashboard"
                        onClick={closeDrawer}
                        className="flex items-center gap-[10px] border-b border-[#f0eeeb] py-3.5 text-[16px] font-semibold text-[#09182a] no-underline"
                    >
                        <span className="grid h-[26px] w-[26px] place-items-center rounded-[6px] bg-[#15935f] text-[10px] font-extrabold text-white">
                            {user.firstName.charAt(0)}
                            {user.lastName.charAt(0)}
                        </span>
                        Dashboard
                    </Link>
                )}
                <Link
                    href={authCta}
                    onClick={closeDrawer}
                    className="block border-b border-[#f0eeeb] py-3.5 text-[16px] font-semibold text-[#09182a] no-underline"
                >
                    {user ? "+ List Property" : "Log in / Sign up"}
                </Link>
            </div>
        </>
    );
}
