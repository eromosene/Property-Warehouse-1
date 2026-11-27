"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, Listing } from "../../lib/api";
import { teamWhatsAppHref } from "../../lib/contact";

type LandlordInquiries = {
    total: number;
    byListing: { listingId: string; title: string; count: number }[];
    recent: { id: string; listingId: string; title: string | null; createdAt: string }[];
};

/* Tenant enquiries are handled by the Property Warehouse team on WhatsApp (MoM 15 Sep 2026,
   Item 4): the team qualifies each enquiry and connects serious tenants with the landlord.
   Landlords see real interest in their listings — enquiries recorded via GET
   /api/landlord/inquiries, plus views — without tenant contact details. */
export default function InquiriesPage() {
    const [listings, setListings] = useState<Listing[] | null>(null);
    const [inquiries, setInquiries] = useState<LandlordInquiries | null>(null);

    useEffect(() => {
        api<{ listings: Listing[] }>("/api/landlord/listings")
            .then((data) => setListings(data.listings))
            .catch(() => setListings([]));
        api<LandlordInquiries>("/api/landlord/inquiries")
            .then(setInquiries)
            .catch(() => setInquiries(null));
    }, []);

    const enquiryCount = Object.fromEntries((inquiries?.byListing ?? []).map((row) => [row.listingId, row.count]));

    return (
        <div className="mx-auto max-w-7xl p-3.5 pb-19.5 lg:p-6 lg:pb-10">
            <div className="mb-5">
                <p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#a97e4b]">Tenant communication</p>
                <h1 className="mt-1 text-[24px] font-extrabold tracking-[-.04em]">Inquiries</h1>
            </div>

            <div className="grid max-w-[820px] gap-3">
                <div className="rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white p-6">
                    <h2 className="text-[15px] font-extrabold">How tenant enquiries reach you</h2>
                    <p className="mt-2 text-[13px] leading-[1.6] text-[#5d6876]">
                        Tenants contact the Property Warehouse team on WhatsApp about your listings. Our team answers their
                        questions, arranges inspections, and connects you with serious tenants — so you only deal with people
                        who are ready to move forward.
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
                            {inquiries && (
                                <p className="mt-1 text-[12px] text-[#5d6876]">
                                    {inquiries.total.toLocaleString()} enquir{inquiries.total === 1 ? "y" : "ies"} in total
                                </p>
                            )}
                            <table className="mt-3 w-full text-[13px]">
                                <thead>
                                    <tr className="text-left text-[10px] font-extrabold uppercase tracking-[.08em] text-[#5d6876]">
                                        <th className="pb-2">Listing</th>
                                        {inquiries && <th className="pb-2 text-right">Enquiries</th>}
                                        <th className="pb-2 text-right">Views</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listings.map((listing) => (
                                        <tr key={listing.id} className="border-t border-[rgba(9,24,42,.07)]">
                                            <td className="py-2.5">
                                                <Link href={`/listing/${listing.id}`} className="font-bold hover:text-[#a97e4b]">
                                                    {listing.title}
                                                </Link>
                                            </td>
                                            {inquiries && (
                                                <td className="py-2.5 text-right font-extrabold">{(enquiryCount[listing.id] || 0).toLocaleString()}</td>
                                            )}
                                            <td className="py-2.5 text-right font-semibold text-[#5d6876]">{(listing.views || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>

                {inquiries && inquiries.recent.length > 0 && (
                    <div className="rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white p-6">
                        <h2 className="text-[15px] font-extrabold">Recent enquiries</h2>
                        <ul className="mt-3 divide-y divide-[rgba(9,24,42,.07)] text-[13px]">
                            {inquiries.recent.map((row) => (
                                <li key={row.id} className="flex items-center justify-between gap-3 py-2.5">
                                    <span className="font-bold">{row.title || "Listing removed"}</span>
                                    <span className="whitespace-nowrap text-[12px] text-[#5d6876]">
                                        {new Date(row.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
