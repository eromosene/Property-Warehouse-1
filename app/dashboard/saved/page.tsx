"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, Listing } from "../../lib/api";
import ListingCard from "../../components/listing-card";
import { DashboardCard, DashboardPage } from "../../components/dashboard-page";

/* Tenant's saved homes from GET /api/favourites (this route previously rendered a
   "Settings" placeholder). */
export default function SavedHomesPage() {
    const [saved, setSaved] = useState<Listing[] | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        api<{ listings: Listing[] }>("/api/favourites")
            .then((data) => setSaved(data.listings))
            .catch((reason: Error) => {
                setError(reason.message);
                setSaved([]);
            });
    }, []);

    return (
        <DashboardPage eyebrow="Tenant dashboard" title="Saved Homes">
            {saved === null ? (
                <DashboardCard>Loading your saved homes…</DashboardCard>
            ) : error ? (
                <DashboardCard>{error}</DashboardCard>
            ) : !saved.length ? (
                <DashboardCard>
                    No saved homes yet. Tap the heart on any listing to save it here.{" "}
                    <Link href="/listings" className="font-extrabold text-[#15935f]">
                        Browse listings
                    </Link>
                </DashboardCard>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {saved.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            )}
        </DashboardPage>
    );
}
