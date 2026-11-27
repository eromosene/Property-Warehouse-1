"use client";

/* Admin portal (MoM 31 Jul 2026, items 15 & 18): listing moderation, users and landlord
   verification, enquiries routed to the team, and feedback-bubble submissions — all from the
   real database. Finance has no backend data yet and says so. */

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, Listing, naira } from "../lib/api";
import { adminLogin, getSharedSession, logout, type SessionUser } from "../lib/auth";

type AdminUser = SessionUser & { listingCount: number; documentCount: number };
type Inquiry = {
    id: string;
    listingId: string | null;
    listingTitle: string | null;
    area: string | null;
    landlordName: string | null;
    landlordPhone: string | null;
    landlordWhatsApp: string | null;
    name: string | null;
    phone: string | null;
    message: string | null;
    createdAt: string;
};
type Feedback = {
    id: string;
    name: string | null;
    email: string | null;
    category: string | null;
    message: string;
    page: string | null;
    status: "new" | "reviewed";
    createdAt: string;
};

const TABS = ["Listings", "Users & Verification", "Enquiries", "Feedback", "Finance"] as const;
type Tab = (typeof TABS)[number];

const when = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function AdminPage() {
    const [status, setStatus] = useState<"checking" | "out" | "in">("checking");
    const [message, setMessage] = useState("");

    useEffect(() => {
        getSharedSession().then(({ user }) => setStatus(user?.role === "admin" ? "in" : "out"));
    }, []);

    const login = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const values = new FormData(event.currentTarget);
        setMessage("Signing in...");
        adminLogin({ email: String(values.get("email")), password: String(values.get("password")) })
            .then(() => {
                setStatus("in");
                setMessage("");
            })
            .catch((reason: Error) => setMessage(reason.message));
    };

    if (status === "checking") {
        return <main className="grid min-h-screen place-items-center bg-[#10263d] font-manrope text-white/70">Loading…</main>;
    }

    if (status === "out") {
        return (
            <main className="grid min-h-screen place-items-center bg-[#10263d] px-5 font-manrope">
                <form onSubmit={login} className="grid w-full max-w-md gap-4 rounded-2xl bg-white p-8">
                    <Link href="/" className="font-bold text-[#a97e4b]">Property Warehouse</Link>
                    <h1 className="font-playfair text-4xl font-bold">Admin portal</h1>
                    <input name="email" type="email" placeholder="Admin email" required className="h-11 rounded-lg border border-[#09182a20] px-3" />
                    <input name="password" type="password" placeholder="Password" required className="h-11 rounded-lg border border-[#09182a20] px-3" />
                    <button className="h-11 rounded-lg bg-[#09182a] font-bold text-white">Sign in</button>
                    {message && <p className="text-sm text-[#a33]">{message}</p>}
                </form>
            </main>
        );
    }

    return (
        <AdminDashboard
            onLogout={async () => {
                await logout();
                setStatus("out");
            }}
        />
    );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
    const [tab, setTab] = useState<Tab>("Listings");

    return (
        <main className="min-h-screen bg-[#f0f2f5] px-5 py-8 font-manrope text-[#09182a] md:px-12">
            <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
                <h1 className="font-playfair text-4xl font-bold">Admin</h1>
                <div className="flex gap-4 text-sm font-bold">
                    <Link href="/" className="text-[#a97e4b]">View site</Link>
                    <button type="button" onClick={onLogout} className="text-[#d9443b]">Log out</button>
                </div>
            </header>
            <nav className="mx-auto mt-6 flex max-w-6xl flex-wrap gap-2" aria-label="Admin sections">
                {TABS.map((name) => (
                    <button
                        key={name}
                        type="button"
                        onClick={() => setTab(name)}
                        className={`rounded-full px-4 py-2 text-[13px] font-extrabold ${tab === name ? "bg-[#09182a] text-white" : "bg-white text-[#5d6876]"}`}
                    >
                        {name}
                    </button>
                ))}
            </nav>
            <section className="mx-auto mt-5 max-w-6xl overflow-hidden rounded-xl bg-white">
                {tab === "Listings" && <ListingsTab />}
                {tab === "Users & Verification" && <UsersTab />}
                {tab === "Enquiries" && <EnquiriesTab />}
                {tab === "Feedback" && <FeedbackTab />}
                {tab === "Finance" && (
                    <Panel title="Finance">
                        <p className="p-6 text-sm text-[#5d6876]">
                            No payments are processed on the platform yet. Agent-fee income from successful rentals will appear
                            here once payment tracking is built.
                        </p>
                    </Panel>
                )}
            </section>
        </main>
    );
}

/* Loads a list from the API and exposes reload + an error message. */
function useAdminList<T>(path: string, key: string) {
    const [rows, setRows] = useState<T[] | null>(null);
    const [error, setError] = useState("");
    const load = useCallback(() => {
        api<Record<string, T[]>>(path)
            .then((data) => {
                setRows(data[key] ?? []);
                setError("");
            })
            .catch((reason: Error) => {
                setError(reason.message);
                setRows([]);
            });
    }, [path, key]);
    useEffect(load, [load]);
    return { rows, error, reload: load };
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#09182a12] px-6 py-5">
                <h2 className="font-extrabold">{title}</h2>
                {action}
            </div>
            {children}
        </>
    );
}

function Status({ rows, error, empty }: { rows: unknown[] | null; error: string; empty: string }) {
    if (rows === null) return <p className="p-6 text-sm text-[#5d6876]">Loading…</p>;
    if (error) return <p className="p-6 text-sm text-[#c0392b]">{error}</p>;
    if (!rows.length) return <p className="p-6 text-sm text-[#5d6876]">{empty}</p>;
    return null;
}

const btn = "rounded-lg px-3 py-1.5 text-xs font-extrabold disabled:opacity-50";

function ListingsTab() {
    const { rows, error, reload } = useAdminList<Listing>("/api/admin/listings", "listings");
    const [filter, setFilter] = useState<"pending" | "active" | "all">("pending");
    const [busy, setBusy] = useState<string | null>(null);

    const act = async (id: string, request: () => Promise<unknown>) => {
        setBusy(id);
        try {
            await request();
            reload();
        } catch (reason) {
            alert(reason instanceof Error ? reason.message : "Action failed");
        } finally {
            setBusy(null);
        }
    };

    const shown = (rows ?? []).filter((l) => filter === "all" || l.status === filter);
    const pendingCount = (rows ?? []).filter((l) => l.status === "pending").length;

    return (
        <Panel
            title={`Listings moderation${pendingCount ? ` · ${pendingCount} pending` : ""}`}
            action={
                <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="rounded-lg border border-[#09182a20] px-2 py-1.5 text-sm">
                    <option value="pending">Pending review</option>
                    <option value="active">Active</option>
                    <option value="all">All</option>
                </select>
            }
        >
            <Status rows={rows === null ? null : shown} error={error} empty="No listings in this view." />
            <div className="divide-y divide-[#09182a12]">
                {shown.map((listing) => (
                    <div key={listing.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                        <div className="min-w-0">
                            <Link href={`/listing/${listing.id}`} target="_blank" className="font-bold hover:text-[#a97e4b]">{listing.title}</Link>
                            <p className="mt-1 text-xs text-[#5d6876]">
                                {listing.area} · {naira(listing.rentPerYear)}/yr · {listing.landlordName} · {listing.ownershipDocCount} ownership doc
                                {listing.ownershipDocCount === 1 ? "" : "s"} · <b>{listing.status}</b>
                                {listing.isVerified ? " · verified" : ""}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {listing.status !== "active" && (
                                <button disabled={busy === listing.id} onClick={() => act(listing.id, () => api(`/api/admin/listings/${listing.id}/approve`, { method: "PATCH" }))} className={`${btn} bg-[#15935f] text-white`}>
                                    Approve
                                </button>
                            )}
                            {listing.status !== "rejected" && (
                                <button disabled={busy === listing.id} onClick={() => act(listing.id, () => api(`/api/admin/listings/${listing.id}/reject`, { method: "PATCH" }))} className={`${btn} bg-[#fff4df] text-[#8a6430]`}>
                                    Reject
                                </button>
                            )}
                            <button
                                disabled={busy === listing.id}
                                onClick={() => act(listing.id, () => api(`/api/admin/listings/${listing.id}`, { method: "PATCH", body: JSON.stringify({ isVerified: !listing.isVerified }) }))}
                                className={`${btn} bg-[#eef0f3] text-[#09182a]`}
                            >
                                {listing.isVerified ? "Unverify" : "Mark verified"}
                            </button>
                            <button
                                disabled={busy === listing.id}
                                onClick={() => {
                                    if (confirm(`Delete "${listing.title}"? This cannot be undone.`)) {
                                        act(listing.id, () => api(`/api/admin/listings/${listing.id}`, { method: "DELETE" }));
                                    }
                                }}
                                className={`${btn} text-[#d9443b]`}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </Panel>
    );
}

function UsersTab() {
    const { rows, error, reload } = useAdminList<AdminUser>("/api/admin/users", "users");
    const [role, setRole] = useState<"landlord" | "tenant" | "all">("landlord");
    const [busy, setBusy] = useState<string | null>(null);

    const setVerified = async (user: AdminUser, isVerified: boolean) => {
        setBusy(user.id);
        try {
            await api(`/api/admin/users/${user.id}/verify`, { method: "PATCH", body: JSON.stringify({ isVerified }) });
            reload();
        } catch (reason) {
            alert(reason instanceof Error ? reason.message : "Action failed");
        } finally {
            setBusy(null);
        }
    };

    const shown = (rows ?? []).filter((u) => (role === "all" ? u.role !== "admin" : u.role === role));

    return (
        <Panel
            title={`Users (${shown.length})`}
            action={
                <select value={role} onChange={(e) => setRole(e.target.value as typeof role)} className="rounded-lg border border-[#09182a20] px-2 py-1.5 text-sm">
                    <option value="landlord">Landlords</option>
                    <option value="tenant">Tenants</option>
                    <option value="all">Everyone</option>
                </select>
            }
        >
            {role === "landlord" && (
                <p className="border-b border-[#09182a12] px-6 py-3 text-xs text-[#5d6876]">
                    Verify a landlord after reviewing the ownership documents on their listings. Verifying also marks all their
                    listings verified.
                </p>
            )}
            <Status rows={rows === null ? null : shown} error={error} empty="No users in this view." />
            <div className="overflow-x-auto">
                {shown.length > 0 && (
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead className="text-[10px] font-extrabold uppercase tracking-[.08em] text-[#5d6876]">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-3 py-3">Contact</th>
                                <th className="px-3 py-3">Role</th>
                                <th className="px-3 py-3">Joined</th>
                                <th className="px-3 py-3 text-right">Listings</th>
                                <th className="px-3 py-3 text-right">Docs</th>
                                <th className="px-6 py-3 text-right">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#09182a12]">
                            {shown.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-3 font-bold">{`${user.firstName} ${user.lastName}`.trim()}</td>
                                    <td className="px-3 py-3 text-xs text-[#5d6876]">
                                        {user.email}
                                        <br />
                                        {user.phone || "—"}
                                    </td>
                                    <td className="px-3 py-3 capitalize">{user.role}</td>
                                    <td className="px-3 py-3 text-xs">{user.joinedDate ? new Date(user.joinedDate).toLocaleDateString("en-GB") : "—"}</td>
                                    <td className="px-3 py-3 text-right">{user.listingCount}</td>
                                    <td className="px-3 py-3 text-right">{user.documentCount}</td>
                                    <td className="px-6 py-3 text-right">
                                        {user.role === "landlord" ? (
                                            <button
                                                disabled={busy === user.id}
                                                onClick={() => setVerified(user, !user.isVerified)}
                                                className={`${btn} ${user.isVerified ? "bg-[#e8f8f0] text-[#15935f]" : "bg-[#15935f] text-white"}`}
                                            >
                                                {user.isVerified ? "Verified ✓ (undo)" : "Verify"}
                                            </button>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </Panel>
    );
}

function EnquiriesTab() {
    const { rows, error } = useAdminList<Inquiry>("/api/admin/inquiries", "inquiries");
    return (
        <Panel title={`Enquiries${rows ? ` (${rows.length})` : ""}`}>
            <p className="border-b border-[#09182a12] px-6 py-3 text-xs text-[#5d6876]">
                Every time someone opens the team WhatsApp chat from a listing. Use the landlord contact to connect serious tenants.
            </p>
            <Status rows={rows} error={error} empty="No enquiries yet." />
            <div className="divide-y divide-[#09182a12]">
                {(rows ?? []).map((row) => (
                    <div key={row.id} className="grid gap-1 px-6 py-4 text-sm md:grid-cols-[1fr_1fr_160px]">
                        <div>
                            {row.listingId ? (
                                <Link href={`/listing/${row.listingId}`} target="_blank" className="font-bold hover:text-[#a97e4b]">
                                    {row.listingTitle || "Listing"}
                                </Link>
                            ) : (
                                <b>Listing removed</b>
                            )}
                            <p className="text-xs text-[#5d6876]">{row.area || "—"}</p>
                        </div>
                        <div className="text-xs text-[#5d6876]">
                            <b className="text-[#09182a]">Tenant:</b> {row.name || "—"} {row.phone ? `· ${row.phone}` : ""}
                            {row.message && <p className="mt-1 italic">&ldquo;{row.message}&rdquo;</p>}
                            <p className="mt-1">
                                <b className="text-[#09182a]">Landlord:</b> {row.landlordName || "—"} {row.landlordPhone ? `· ${row.landlordPhone}` : ""}
                            </p>
                        </div>
                        <div className="text-xs text-[#5d6876] md:text-right">{when(row.createdAt)}</div>
                    </div>
                ))}
            </div>
        </Panel>
    );
}

function FeedbackTab() {
    const { rows, error, reload } = useAdminList<Feedback>("/api/admin/feedback", "feedback");
    const toggle = async (row: Feedback) => {
        try {
            await api(`/api/admin/feedback/${row.id}`, { method: "PATCH", body: JSON.stringify({ status: row.status === "new" ? "reviewed" : "new" }) });
            reload();
        } catch (reason) {
            alert(reason instanceof Error ? reason.message : "Action failed");
        }
    };
    const newCount = (rows ?? []).filter((r) => r.status === "new").length;
    return (
        <Panel title={`Feedback${newCount ? ` · ${newCount} new` : ""}`}>
            <Status rows={rows} error={error} empty="No feedback yet." />
            <div className="divide-y divide-[#09182a12]">
                {(rows ?? []).map((row) => (
                    <div key={row.id} className={`flex flex-wrap items-start justify-between gap-4 px-6 py-4 text-sm ${row.status === "new" ? "" : "opacity-60"}`}>
                        <div className="min-w-0 max-w-[720px]">
                            <span className="rounded-full bg-[#f3f1ee] px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#a97e4b]">{row.category || "other"}</span>
                            <p className="mt-2 whitespace-pre-wrap">{row.message}</p>
                            <p className="mt-1 text-xs text-[#5d6876]">
                                {row.name || "Anonymous"} {row.email ? `· ${row.email}` : ""} · {when(row.createdAt)} {row.page ? `· from ${row.page}` : ""}
                            </p>
                        </div>
                        <button onClick={() => toggle(row)} className={`${btn} bg-[#eef0f3]`}>
                            {row.status === "new" ? "Mark reviewed" : "Mark new"}
                        </button>
                    </div>
                ))}
            </div>
        </Panel>
    );
}
