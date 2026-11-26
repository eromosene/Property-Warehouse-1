"use client";

import { useEffect, useState } from "react";
import { getCachedUser, getSharedSession, type SessionUser } from "../../lib/auth";
import { teamWhatsAppHref } from "../../lib/contact";
import { DashboardCard, DashboardPage } from "../../components/dashboard-page";

/* Read-only profile from GET /api/auth/me. There is no profile-update endpoint yet, so
   changes go through the team on WhatsApp. */
export default function ProfilePage() {
    const [user, setUser] = useState<SessionUser | null>(() => getCachedUser());

    useEffect(() => {
        if (user) return;
        getSharedSession().then(({ user: sessionUser }) => setUser(sessionUser));
    }, [user]);

    const rows: [string, string][] = [];
    if (user) {
        rows.push(["Name", `${user.firstName} ${user.lastName}`.trim()]);
        rows.push(["Email", user.email]);
        rows.push(["Phone", user.phone || "—"]);
        rows.push(["Account type", user.role === "landlord" ? "Landlord" : user.role === "tenant" ? "Tenant" : "Admin"]);
        if (user.role === "landlord") rows.push(["Verification", user.isVerified ? "Verified" : "Pending review"]);
        if (user.area) rows.push(["Preferred area", user.area]);
        if (user.joinedDate) {
            rows.push([
                "Member since",
                new Date(user.joinedDate).toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
            ]);
        }
    }

    return (
        <DashboardPage eyebrow={user?.role === "landlord" ? "Landlord dashboard" : "Tenant dashboard"} title="Profile">
            <DashboardCard>
                {!user ? (
                    "Loading…"
                ) : (
                    <>
                        <dl className="grid gap-y-3 sm:grid-cols-[180px_1fr]">
                            {rows.map(([label, value]) => (
                                <div key={label} className="contents">
                                    <dt className="text-[11px] font-extrabold uppercase tracking-[.08em]">{label}</dt>
                                    <dd className="font-semibold text-[#09182a]">{value}</dd>
                                </div>
                            ))}
                        </dl>
                        <p className="mt-6">
                            Need to change your details?{" "}
                            <a
                                href={teamWhatsAppHref(undefined, "I'd like to update my Property Warehouse profile details.")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-extrabold text-[#15935f]"
                            >
                                Message our team
                            </a>
                        </p>
                    </>
                )}
            </DashboardCard>
        </DashboardPage>
    );
}
