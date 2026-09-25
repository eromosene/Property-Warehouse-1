"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import {
    AnalyticsIcon,
    ApplicationsIcon,
    ArrowIcon,
    ChevronIcon,
    DashboardHomeIcon,
    GlobeIcon,
    HeartIcon,
    HomeIcon,
    InquiryIcon,
    InspectionsIcon,
    LogoutIcon,
    MenuIcon,
    MessageIcon,
    NotificationIcon,
    PaymentIcon,
    ProfileIcon,
    PromoStarIcon,
    SearchIcon,
    SettingsIcon,
    StarIcon,
    UsersIcon,
    VerifiedIcon,
} from "../components/icons";

/* Temporary role flag — no auth API yet to determine this from a real
   session. Flip this manually to "landlord" or "tenant" while testing
   both views. Replace with real session data once the auth API exists. */
type Role = "landlord" | "tenant";
const role: Role = "tenant";

export default function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    const isActive = (path: string) => {
        if (path === "/dashboard") {
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

    const notifCount = role === "landlord" ? 3 : 6;

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
                    {role === "landlord" ? (
                        <>
                            <SidebarLink
                                href="/dashboard"
                                label="Dashboard"
                                active={isActive("/dashboard")}
                                onClick={closeSidebar}
                            >
                                <DashboardHomeIcon />
                            </SidebarLink>
                            <SidebarLink
                                href="/dashboard/listings"
                                label="My Listings"
                                active={isActive("/dashboard/listings")}
                                onClick={closeSidebar}
                            >
                                <HomeIcon />
                            </SidebarLink>
                            <SidebarLink
                                href="/dashboard/messages"
                                label="Messages"
                                active={isActive("/dashboard/messages")}
                                badge="8"
                                onClick={closeSidebar}
                            >
                                <MessageIcon />
                            </SidebarLink>
                            <SidebarLink
                                href="/dashboard/inquiries"
                                label="Inquiries"
                                active={isActive("/dashboard/inquiries")}
                                onClick={closeSidebar}
                            >
                                <InquiryIcon />
                            </SidebarLink>
                            <SidebarLink
                                href="/dashboard/tenants"
                                label="Tenants"
                                active={isActive("/dashboard/tenants")}
                                onClick={closeSidebar}
                            >
                                <UsersIcon />
                            </SidebarLink>
                            <SidebarLink
                                href="/dashboard/analytics"
                                label="Analytics"
                                active={isActive("/dashboard/analytics")}
                                onClick={closeSidebar}
                            >
                                <AnalyticsIcon />
                            </SidebarLink>
                            <SidebarLink
                                href="/dashboard/payments"
                                label="Payments"
                                active={isActive("/dashboard/payments")}
                                onClick={closeSidebar}
                            >
                                <PaymentIcon />
                            </SidebarLink>
                            <SidebarLink
                                href="/dashboard/reviews"
                                label="Reviews"
                                active={isActive("/dashboard/reviews")}
                                badge="3"
                                onClick={closeSidebar}
                            >
                                <StarIcon />
                            </SidebarLink>
                        </>
                    ) : (
                        <>
                            <SidebarLink
                                href="/dashboard"
                                label="Dashboard"
                                active={isActive("/dashboard")}
                                onClick={closeSidebar}
                            >
                                <DashboardHomeIcon />
                            </SidebarLink>
                            <SidebarLink
                                href="/dashboard/saved"
                                label="Saved Homes"
                                active={isActive("/dashboard/saved")}
                                onClick={closeSidebar}
                            >
                                <HeartIcon />
                            </SidebarLink>
                            <SidebarLink
                                href="/dashboard/messages"
                                label="Messages"
                                active={isActive("/dashboard/messages")}
                                badge="6"
                                onClick={closeSidebar}
                            >
                                <MessageIcon />
                            </SidebarLink>
                            <SidebarLink
                                href="/dashboard/applications"
                                label="Applications"
                                active={isActive("/dashboard/applications")}
                                onClick={closeSidebar}
                            >
                                <ApplicationsIcon />
                            </SidebarLink>
                            <SidebarLink
                                href="/dashboard/payments"
                                label="Payments"
                                active={isActive("/dashboard/payments")}
                                onClick={closeSidebar}
                            >
                                <PaymentIcon />
                            </SidebarLink>
                            <SidebarLink
                                href="/dashboard/inspections"
                                label="Inspections"
                                active={isActive("/dashboard/inspections")}
                                onClick={closeSidebar}
                            >
                                <InspectionsIcon />
                            </SidebarLink>
                            <SidebarLink
                                href="/dashboard/profile"
                                label="Profile"
                                active={isActive("/dashboard/profile")}
                                onClick={closeSidebar}
                            >
                                <ProfileIcon />
                            </SidebarLink>
                        </>
                    )}

                    {/* HEAT MAP — INTENTIONALLY OUTSIDE DASHBOARD SECTIONS, SHARED BY BOTH ROLES */}
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
                                role === "landlord"
                                    ? 'url("/property-assets/205A56A8-1549-4228-8254-4C4FAD5D441E.png")'
                                    : 'url("/property-assets/IMG-20260512-WA0088.jpg")',
                        }}
                    />
                    <p className="px-[14px] pb-[3px] pt-[11px] text-[11.5px] font-extrabold leading-[1.3] text-white">
                        {role === "landlord"
                            ? "Boost your property visibility"
                            : "Find your next dream home faster"}
                    </p>
                    <p className="px-[14px] pb-[11px] text-[10px] font-medium leading-[1.45] text-white/50">
                        {role === "landlord"
                            ? "Promote your listings and reach more quality tenants."
                            : "Get notified about new listings in your preferred areas instantly."}
                    </p>
                    <button
                        type="button"
                        onClick={() =>
                            alert(
                                role === "landlord"
                                    ? "Promotion feature coming soon!"
                                    : "Premium upgrade coming soon!",
                            )
                        }
                        className="mx-[14px] mb-[14px] flex h-[33px] w-[calc(100%-28px)] items-center justify-center gap-[6px] rounded-[7px] bg-[#a97e4b] text-[11px] font-extrabold text-white transition-opacity hover:opacity-[.88]"
                    >
                        {role === "landlord" ? <ArrowIcon /> : <PromoStarIcon />}
                        {role === "landlord" ? "Promote Listing" : "Upgrade to Premium"}
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
                <header className="sticky top-0 z-[100] flex h-[68px] items-center gap-[14px] border-b border-[rgba(9,24,42,.09)] bg-white/[0.97] px-6 shadow-[0_2px_14px_rgba(9,24,42,.05)] backdrop-blur-[12px] max-[860px]:fixed max-[860px]:left-0 max-[860px]:right-0 max-[860px]:top-0 max-[860px]:h-14 max-[860px]:gap-2 max-[860px]:px-[14px] max-[600px]:h-[72px] max-[600px]:border-b-0 max-[600px]:bg-[#f6f5f3] max-[600px]:px-4 max-[600px]:py-3 max-[600px]:shadow-none">
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
                            {role === "landlord"
                                ? "Here's what's happening with your properties today."
                                : "Let's help you find your perfect space in Lagos."}
                        </p>
                    </div>

                    {/* HEADER RIGHT */}
                    <div className="flex shrink-0 items-center gap-[10px] max-[860px]:gap-[6px]">
                        {/* DESKTOP SEARCH */}
                        <div className="flex h-9 items-center gap-2 rounded-[9px] border border-[rgba(9,24,42,.09)] bg-[#f6f7f9] px-[13px] max-[860px]:hidden">
                            <SearchIcon />
                            <input
                                type="search"
                                placeholder={
                                    role === "landlord"
                                        ? "Search anything…"
                                        : "Search properties, areas…"
                                }
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
                            onClick={() =>
                                alert(`You have ${notifCount} unread notifications.`)
                            }
                            className="relative grid h-9 w-9 shrink-0 place-items-center rounded-[9px] border border-[rgba(9,24,42,.09)] bg-[#f6f7f9] text-[#09182a] max-[600px]:h-[42px] max-[600px]:w-[42px] max-[600px]:rounded-[12px] max-[600px]:bg-white max-[600px]:shadow-[0_3px_10px_rgba(9,24,42,.05)]"
                        >
                            <NotificationIcon />
                            <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#15935f] px-[3px] text-[9px] font-extrabold text-white">
                                {notifCount}
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
                            {role === "landlord" ? (
                                <div className="h-[30px] w-[30px] shrink-0 overflow-hidden rounded-full max-[600px]:h-[42px] max-[600px]:w-[42px]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face"
                                        alt="Landlord avatar"
                                        className="block h-full w-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#15935f_0%,#0d6e48_100%)] text-[11px] font-extrabold tracking-[.04em] text-white max-[600px]:h-[42px] max-[600px]:w-[42px] max-[600px]:text-[14px]">
                                    DA
                                </div>
                            )}
                            <div className="grid leading-[1.2] max-[860px]:hidden">
                                <strong className="text-[12px] font-extrabold text-[#09182a]">
                                    {role === "landlord" ? "Adeyemi Johnson" : "Daniel Adewale"}
                                </strong>
                                {role === "landlord" ? (
                                    <span className="flex items-center gap-[3px] text-[10px] font-semibold text-[#15935f]">
                                        <VerifiedIcon />
                                        Verified Landlord
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-medium text-[#5d6876]">
                                        Tenant
                                    </span>
                                )}
                            </div>
                            <ChevronIcon />
                            {userDropdownOpen && (
                                <div
                                    onClick={(event) => event.stopPropagation()}
                                    className="absolute right-0 top-[calc(100%+8px)] z-[300] min-w-[180px] overflow-hidden rounded-[11px] border border-[rgba(9,24,42,.09)] bg-white shadow-[0_12px_40px_rgba(9,24,42,.12)]"
                                >
                                    <Link
                                        href="/dashboard/settings"
                                        onClick={() => setUserDropdownOpen(false)}
                                        className="flex items-center gap-[10px] px-[15px] py-[10px] text-[12.5px] font-semibold text-[#09182a] hover:bg-[#f5f7fa]"
                                    >
                                        <ProfileIcon />
                                        My Profile
                                    </Link>
                                    <Link
                                        href="/dashboard/settings"
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

