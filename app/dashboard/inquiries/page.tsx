"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, Listing } from "../../lib/api";
import { teamWhatsAppHref } from "../../lib/contact";

/* Tenant enquiries are handled by the Property Warehouse team on WhatsApp (MoM 15 Sep 2026,
   Item 4: one messaging channel, bot + human handover). The team qualifies each enquiry and
   connects serious tenants with the landlord, so there is no per-landlord inbox here — instead
   the landlord sees real interest in their listings (views) and a direct line to the team. */
export default function InquiriesPage() {
    const [listings, setListings] = useState<Listing[] | null>(null);

    useEffect(() => {
        api<{ listings: Listing[] }>("/api/landlord/listings")
            .then((data) => setListings(data.listings))
            .catch(() => setListings([]));
    }, []);

    const totalViews = (listings ?? []).reduce((sum, listing) => sum + (listing.views || 0), 0);

    return (
        <div className="mx-auto max-w-7xl p-3.5 pb-19.5 lg:p-6 lg:pb-10">
            <div className="mb-5">
                <p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#a97e4b]">
                    Tenant communication
                </p>
                <h1 className="mt-1 text-[24px] font-extrabold tracking-[-.04em]">Inquiries</h1>
            </div>

            <div className="grid max-w-[820px] gap-3">
                <div className="rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white p-6">
                    <h2 className="text-[15px] font-extrabold">How tenant enquiries reach you</h2>
                    <p className="mt-2 text-[13px] leading-[1.6] text-[#5d6876]">
                        Tenants contact the Property Warehouse team on WhatsApp about your listings. Our team
                        answers their questions, arranges inspections, and connects you with serious tenants — so
                        you only deal with people who are ready to move forward.
                    </p>
                    <a
                        href={teamWhatsAppHref(undefined, "I'm a landlord on Property Warehouse and I'd like an update on enquiries for my listings.")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex rounded-lg bg-[#15935f] px-4 py-2 text-[11px] font-extrabold text-white"
                    >
                        Ask the team about my enquiries
                    </a>
                </div>

                <div className="rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white p-6">
                    <h2 className="text-[15px] font-extrabold">Interest in your listings</h2>
                    {listings === null ? (
                        <p className="mt-3 text-[13px] font-bold text-[#5d6876]">Loading…</p>
                    ) : !listings.length ? (
                        <p className="mt-3 text-[13px] text-[#5d6876]">
                            You have no listings yet.{" "}
                            <Link href="/dashboard/listings/create" className="font-extrabold text-[#15935f]">
                                Create your first listing
                            </Link>
                        </p>
                    ) : (
                        <>
                            <p className="mt-1 text-[12px] text-[#5d6876]">
                                {totalViews.toLocaleString()} total view{totalViews === 1 ? "" : "s"} across {listings.length} listing{listings.length === 1 ? "" : "s"}
                            </p>
                            <ul className="mt-3 divide-y divide-[rgba(9,24,42,.07)]">
                                {listings.map((listing) => (
                                    <li key={listing.id} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                                        <Link href={`/listing/${listing.id}`} className="font-bold hover:text-[#a97e4b]">
                                            {listing.title}
                                        </Link>
                                        <span className="whitespace-nowrap text-[12px] font-semibold text-[#5d6876]">
                                            {(listing.views || 0).toLocaleString()} views
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
