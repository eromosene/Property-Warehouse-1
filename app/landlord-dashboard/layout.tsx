"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

export default function LandlordDashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    const isActive = (path: string) => {
        if (path === "/landlord-dashboard") {
            return pathname === path;
        }

        return pathname.startsWith(path);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const handleLogout = async () => {
        try {
            const { api } = await import("../lib/api");
            await api("/api/auth/logout", {
                method: "POST",
            });
        } catch {
            // Keep the original navigation behavior even if logout request fails.
        }

        router.push("/auth");
    };

    useEffect(() => {
        setSidebarOpen(false);
        setUserDropdownOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!userDropdownOpen) return;

        const handleOutsideClick = () => {
            setUserDropdownOpen(false);
        };

        document.addEventListener("click", handleOutsideClick);

        return () => {
            document.removeEventListener("click", handleOutsideClick);
        };
    }, [userDropdownOpen]);

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f0f2f5] font-['Manrope'] text-[#09182a]">
            {/* SIDEBAR */}
            <aside
                className={[
                    "fixed left-0 top-0 bottom-0 z-[200] flex w-[220px] flex-col overflow-x-hidden overflow-y-auto bg-[#0d1f35] py-[22px] transition-transform duration-[280ms]",
                    "scrollbar-none",
                    "max-[860px]:-translate-x-[220px]",
                    "max-[860px]:z-[9999]",
                    "max-[600px]:w-[280px]",
                    "max-[600px]:-translate-x-full",
                    sidebarOpen
                        ? "max-[860px]:translate-x-0"
                        : "max-[860px]:-translate-x-[220px]",
                    sidebarOpen ? "max-[600px]:translate-x-0" : "max-[600px]:-translate-x-full",
                ].join(" ")}
            >
                {/* BRAND */}
                <Link
                    href="/"
                    aria-label="Property Warehouse home"
                    className="mb-[10px] flex shrink-0 items-center gap-[9px] border-b border-white/[0.07] px-5 pb-5"
                >
                    <span className="font-['Cormorant_Garamond'] text-[28px] font-bold leading-[.85] tracking-[-.09em] text-[#a97e4b]">
                        P<span className="ml-[-2px] inline-block translate-y-[9px]">W</span>
                    </span>

                    <span className="grid gap-px text-[10px] font-extrabold leading-none tracking-[-.03em] text-white/[0.9]">
                        <span>PROPERTY</span>
                        <span>WAREHOUSE</span>
                    </span>
                </Link>

                {/* NAVIGATION */}
                <nav
                    className="flex flex-1 flex-col gap-[2px] px-[10px]"
                    aria-label="Landlord navigation"
                >
                    <SidebarLink
                        href="/landlord-dashboard"
                        label="Dashboard"
                        active={isActive("/landlord-dashboard")}
                        onClick={closeSidebar}
                    >
                        <DashboardIcon />
                    </SidebarLink>

                    <SidebarLink
                        href="/landlord-dashboard/listings"
                        label="My Listings"
                        active={isActive("/landlord-dashboard/listings")}
                        onClick={closeSidebar}
                    >
                        <HomeIcon />
                    </SidebarLink>

                    <SidebarLink
                        href="/landlord-dashboard/messages"
                        label="Messages"
                        active={isActive("/landlord-dashboard/messages")}
                        badge="8"
                        onClick={closeSidebar}
                    >
                        <MessageIcon />
                    </SidebarLink>

                    <SidebarLink
                        href="/landlord-dashboard/inquiries"
                        label="Inquiries"
                        active={isActive("/landlord-dashboard/inquiries")}
                        onClick={closeSidebar}
                    >
                        <InquiryIcon />
                    </SidebarLink>

                    <SidebarLink
                        href="/landlord-dashboard/tenants"
                        label="Tenants"
                        active={isActive("/landlord-dashboard/tenants")}
                        onClick={closeSidebar}
                    >
                        <UsersIcon />
                    </SidebarLink>

                    <SidebarLink
                        href="/landlord-dashboard/analytics"
                        label="Analytics"
                        active={isActive("/landlord-dashboard/analytics")}
                        onClick={closeSidebar}
                    >
                        <AnalyticsIcon />
                    </SidebarLink>

                    <SidebarLink
                        href="/landlord-dashboard/payments"
                        label="Payments"
                        active={isActive("/landlord-dashboard/payments")}
                        onClick={closeSidebar}
                    >
                        <PaymentIcon />
                    </SidebarLink>

                    <SidebarLink
                        href="/landlord-dashboard/reviews"
                        label="Reviews"
                        active={isActive("/landlord-dashboard/reviews")}
                        badge="3"
                        onClick={closeSidebar}
                    >
                        <StarIcon />
                    </SidebarLink>

                    <SidebarLink
                        href="/landlord-dashboard/settings"
                        label="Settings"
                        active={isActive("/landlord-dashboard/settings")}
                        onClick={closeSidebar}
                    >
                        <SettingsIcon />
                    </SidebarLink>

                    {/* HEAT MAP — INTENTIONALLY OUTSIDE DASHBOARD SECTIONS */}
                    <Link
                        href="/heatmap"
                        onClick={closeSidebar}
                        className="relative flex items-center gap-[11px] rounded-[9px] px-[13px] py-[10px] text-[13px] font-semibold text-white/50 transition-colors hover:bg-white/[0.07] hover:text-white/[0.85]"
                    >
                        <GlobeIcon />
                        <span>Heat Map</span>
                    </Link>
                </nav>

                {/* PROMO */}
                <div className="mx-[10px] mt-4 shrink-0 overflow-hidden rounded-[13px] border border-white/[0.07] bg-[linear-gradient(160deg,#1a3a5e_0%,#0d2540_100%)]">
                    <div
                        className="h-[78px] bg-cover bg-center opacity-[.55]"
                        style={{
                            backgroundImage:
                                'url("/dashboard homes sample images assets/205A56A8-1549-4228-8254-4C4FAD5D441E.png")',
                        }}
                    />

                    <p className="px-[14px] pb-[3px] pt-[11px] text-[11.5px] font-extrabold leading-[1.3] text-white">
                        Boost your property visibility
                    </p>

                    <p className="px-[14px] pb-[11px] text-[10px] font-medium leading-[1.45] text-white/50">
                        Promote your listings and reach more quality tenants.
                    </p>

                    <button
                        type="button"
                        onClick={() => alert("Promotion feature coming soon!")}
                        className="mx-[14px] mb-[14px] flex h-[33px] w-[calc(100%-28px)] items-center justify-center gap-[6px] rounded-[7px] bg-[#a97e4b] text-[11px] font-extrabold text-white transition-opacity hover:opacity-[.88]"
                    >
                        <ArrowIcon />
                        Promote Listing
                    </button>
                </div>
            </aside>

            {/* SIDEBAR OVERLAY */}
            <div
                onClick={closeSidebar}
                className={[
                    "fixed inset-0 z-[199] hidden bg-[rgba(9,24,42,.45)] backdrop-blur-[2px]",
                    sidebarOpen ? "max-[860px]:block" : "",
                ].join(" ")}
            />

            {/* WRAPPER */}
            <div className="ml-[220px] flex min-h-screen min-w-0 flex-1 flex-col max-[860px]:ml-0 max-[860px]:pt-14 max-[600px]:pt-[72px]">
                {/* HEADER */}
                <header className="sticky top-0 z-[100] flex h-[68px] items-center gap-[14px] border-b border-[rgba(9,24,42,.09)] bg-white/[0.97] px-6 shadow-[0_2px_14px_rgba(9,24,42,.05)] backdrop-blur-[12px] max-[860px]:fixed max-[860px]:left-0 max-[860px]:right-0 max-[860px]:top-0 max-[860px]:h-14 max-[860px]:gap-2 max-[860px]:px-[14px] max-[600px]:h-[72px] max-[600px]:border-b-0 max-[600px]:bg-[#f6f5f3] max-[600px]:px-4 max-[600px]:py-3 max-[600px]:shadow-none"
                >
                    {/* MENU */}
                    <button
                        type="button"
                        aria-label="Toggle menu"
                        onClick={() => setSidebarOpen((value) => !value)}
                        className="hidden h-[34px] w-[34px] shrink-0 place-items-center rounded-[8px] text-[#09182a] transition-colors hover:bg-black/[0.06] max-[860px]:!grid max-[600px]:h-[42px] max-[600px]:w-[42px] max-[600px]:rounded-[12px] max-[600px]:border max-[600px]:border-[rgba(9,24,42,.09)] max-[600px]:bg-white max-[600px]:shadow-[0_3px_10px_rgba(9,24,42,.05)]"
                    >
                        <MenuIcon />
                    </button>

                    {/* MOBILE LOGO */}
                    <Link
                        href="/"
                        aria-label="Property Warehouse"
                        className="hidden shrink-0 items-center gap-2 max-[860px]:flex max-[860px]:flex-1"
                    >
                        <span className="font-['Cormorant_Garamond'] text-[28px] font-bold leading-[.85] tracking-[-.09em] text-[#a97e4b]">
                            P<span className="ml-[-2px] inline-block translate-y-[9px]">W</span>
                        </span>

                        <span className="grid gap-px text-[10px] font-extrabold leading-none tracking-[-.03em] text-[#09182a]">
                            <span>PROPERTY</span>
                            <span>WAREHOUSE</span>
                        </span>
                    </Link>

                    {/* DESKTOP GREETING */}
                    <div className="min-w-0 flex-1 max-[860px]:hidden">
                        <h1 className="overflow-hidden text-ellipsis whitespace-nowrap text-[17px] font-extrabold tracking-[-.03em]">
                            Welcome back <span>👋</span>
                        </h1>

                        <p className="mt-px text-[12px] font-medium text-[#5d6876]">
                            Here's what's happening with your properties today.
                        </p>
                    </div>

                    {/* HEADER RIGHT */}
                    <div className="flex shrink-0 items-center gap-[10px] max-[860px]:gap-[6px]">
                        {/* DESKTOP SEARCH */}
                        <div className="flex h-9 items-center gap-2 rounded-[9px] border border-[rgba(9,24,42,.09)] bg-[#f6f7f9] px-[13px] max-[860px]:hidden">
                            <SearchIcon />

                            <input
                                type="search"
                                placeholder="Search anything…"
                                aria-label="Search"
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" &&
                                        event.currentTarget.value.trim()
                                    ) {
                                        alert(
                                            `Searching for "${event.currentTarget.value.trim()}"…`,
                                        );
                                    }
                                }}
                                className="w-[190px] border-none bg-transparent text-[12.5px] text-[#09182a] outline-none placeholder:text-[#9aa4b2] max-[1160px]:w-[140px]"
                            />
                        </div>

                        {/* NOTIFICATIONS */}
                        <button
                            type="button"
                            aria-label="Notifications"
                            onClick={() => alert("You have 3 unread notifications.")}
                            className="relative grid h-9 w-9 shrink-0 place-items-center rounded-[9px] border border-[rgba(9,24,42,.09)] bg-[#f6f7f9] text-[#09182a] max-[600px]:h-[42px] max-[600px]:w-[42px] max-[600px]:rounded-[12px] max-[600px]:bg-white max-[600px]:shadow-[0_3px_10px_rgba(9,24,42,.05)]"
                        >
                            <NotificationIcon />

                            <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#15935f] px-[3px] text-[9px] font-extrabold text-white">
                                3
                            </span>
                        </button>

                        {/* USER */}
                        <div
                            className="relative flex cursor-pointer select-none items-center gap-2 rounded-[10px] border border-[rgba(9,24,42,.09)] bg-[#f6f7f9] px-[9px] py-1 pl-[5px] max-[860px]:border-0 max-[860px]:bg-transparent max-[860px]:p-[3px] max-[600px]:p-0"
                            onClick={(event) => {
                                event.stopPropagation();
                                setUserDropdownOpen((value) => !value);
                            }}
                        >
                            <div className="h-[30px] w-[30px] shrink-0 overflow-hidden rounded-full max-[600px]:h-[42px] max-[600px]:w-[42px]">
                                <img
                                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face"
                                    alt="Landlord avatar"
                                    className="block h-full w-full object-cover"
                                />
                            </div>

                            <div className="grid leading-[1.2] max-[860px]:hidden">
                                <strong className="text-[12px] font-extrabold text-[#09182a]">
                                    Adeyemi Johnson
                                </strong>

                                <span className="flex items-center gap-[3px] text-[10px] font-semibold text-[#15935f]">
                                    <VerifiedIcon />
                                    Verified Landlord
                                </span>
                            </div>

                            <ChevronIcon />

                            {userDropdownOpen && (
                                <div
                                    onClick={(event) => event.stopPropagation()}
                                    className="absolute right-0 top-[calc(100%+8px)] z-[300] min-w-[180px] overflow-hidden rounded-[11px] border border-[rgba(9,24,42,.09)] bg-white shadow-[0_12px_40px_rgba(9,24,42,.12)]"
                                >
                                    <Link
                                        href="/landlord-dashboard/settings"
                                        onClick={() => setUserDropdownOpen(false)}
                                        className="flex items-center gap-[10px] px-[15px] py-[10px] text-[12.5px] font-semibold text-[#09182a] hover:bg-[#f5f7fa]"
                                    >
                                        <ProfileIcon />
                                        My Profile
                                    </Link>

                                    <Link
                                        href="/landlord-dashboard/settings"
                                        onClick={() => setUserDropdownOpen(false)}
                                        className="flex items-center gap-[10px] px-[15px] py-[10px] text-[12.5px] font-semibold text-[#09182a] hover:bg-[#f5f7fa]"
                                    >
                                        <SettingsIcon />
                                        Settings
                                    </Link>

                                    <div className="h-px bg-[rgba(9,24,42,.09)]" />

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-[10px] px-[15px] py-[10px] text-left text-[12.5px] font-semibold text-[#d9443b] hover:bg-[#f5f7fa]"
                                    >
                                        <LogoutIcon />
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="min-w-0 flex-1">{children}</main>

            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   SIDEBAR LINK
───────────────────────────────────────────── */

function SidebarLink({
    href,
    label,
    active,
    badge,
    onClick,
    children,
}: {
    href: string;
    label: string;
    active: boolean;
    badge?: string;
    onClick?: () => void;
    children: ReactNode;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={[
                "relative flex items-center gap-[11px] rounded-[9px] px-[13px] py-[10px] text-[13px] font-semibold transition-colors",
                active
                    ? "bg-[rgba(21,147,95,.18)] text-white"
                    : "text-white/50 hover:bg-white/[0.07] hover:text-white/[0.85]",
            ].join(" ")}
        >
            {children}

            <span>{label}</span>

            {badge && (
                <span className="ml-auto grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#15935f] px-1 text-[10px] font-extrabold text-white">
                    {badge}
                </span>
            )}
        </Link>
    );
}

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */

function Icon({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={`block h-[17px] w-[17px] shrink-0 fill-none stroke-current stroke-[1.8] stroke-linecap-round stroke-linejoin-round ${className}`}
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

function DashboardIcon() {
    return (
        <Icon>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </Icon>
    );
}

function HomeIcon() {
    return (
        <Icon>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </Icon>
    );
}

function MessageIcon() {
    return (
        <Icon>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </Icon>
    );
}

function InquiryIcon() {
    return (
        <Icon>
            <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
            <line x1="8" y1="10" x2="16" y2="10" />
            <line x1="8" y1="14" x2="13" y2="14" />
        </Icon>
    );
}

function UsersIcon() {
    return (
        <Icon>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </Icon>
    );
}

function AnalyticsIcon() {
    return (
        <Icon>
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </Icon>
    );
}

function PaymentIcon() {
    return (
        <Icon>
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
        </Icon>
    );
}

function StarIcon() {
    return (
        <Icon>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </Icon>
    );
}

function SettingsIcon() {
    return (
        <Icon>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </Icon>
    );
}

function GlobeIcon() {
    return (
        <Icon>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 0 1 0 20" />
            <path d="M2 12h20" />
            <path d="M12 2c-2.5 3-4 6.5-4 10s1.5 7 4 10" />
            <path d="M12 2c2.5 3 4 6.5 4 10s-1.5 7-4 10" />
        </Icon>
    );
}

function MenuIcon() {
    return (
        <Icon className="h-5 w-5">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </Icon>
    );
}

function SearchIcon() {
    return (
        <Icon className="h-[15px] w-[15px] text-[#5d6876]">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </Icon>
    );
}

function NotificationIcon() {
    return (
        <Icon>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </Icon>
    );
}

function VerifiedIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-[9px] w-[9px] fill-[rgba(21,147,95,.15)] stroke-[#15935f] stroke-2"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}

function ChevronIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-[14px] w-[14px] shrink-0 fill-none stroke-[#5d6876] stroke-2 max-[860px]:hidden"
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

function ProfileIcon() {
    return (
        <Icon className="text-[#5d6876]">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </Icon>
    );
}

function LogoutIcon() {
    return (
        <Icon className="text-[#d9443b]">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </Icon>
    );
}

function ArrowIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-[14px] w-[14px] fill-none stroke-white stroke-2"
        >
            <path d="M5 12h13m-5-5 5 5-5 5" />
        </svg>
    );
}