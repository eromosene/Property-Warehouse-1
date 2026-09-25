"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, Listing, naira } from "../../lib/api";

const CREATE_LISTING_HREF = "/dashboard/listings/create";

export default function LandlordListingsPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [message, setMessage] = useState("Loading your listings...");

    const load = () => {
        api<{ listings: Listing[] }>("/api/landlord/listings")
            .then((data) => {
                setListings(data.listings);
                setMessage("");
            })
            .catch((reason: Error) => setMessage(reason.message));
    };

    useEffect(() => {
        void load();
    }, []);

    const deleteListing = async (listing: Listing) => {
        if (
            !confirm(
                `Delete "${listing.title || "Untitled"}"? This cannot be undone.`,
            )
        ) {
            return;
        }

        try {
            await api(`/api/listings/${encodeURIComponent(listing.id)}`, {
                method: "DELETE",
            });

            setListings((current) =>
                current.filter((item) => item.id !== listing.id),
            );
        } catch {
            alert("Failed to delete listing.");
        }
    };

    return (
        <div className="mx-auto max-w-7xl p-3.5 pb-19.5 lg:p-6 lg:pb-10">
            <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#a97e4b]">
                        Properties
                    </p>

                    <h1 className="mt-1 text-[24px] font-extrabold tracking-[-.04em]">
                        My Listings
                    </h1>
                </div>

                <Link
                    href={CREATE_LISTING_HREF}
                    className="flex h-[34px] items-center gap-[6px] rounded-lg bg-[#09182a] px-[14px] text-[12px] font-bold text-white"
                >
                    + Add New Property
                </Link>
            </div>

            {message && (
                <div className="rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white p-6 text-[13px] font-bold text-[#5d6876]">
                    {message}
                </div>
            )}

            {!message && !listings.length && (
                <div className="rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white p-12 text-center">
                    <p className="text-[15px] font-bold text-[#5d6876]">
                        You haven&apos;t listed any properties yet.
                    </p>

                    <Link
                        href={CREATE_LISTING_HREF}
                        className="mt-4 inline-flex rounded-xl bg-[#a97e4b] px-6 py-3 text-[14px] font-extrabold text-white"
                    >
                        + Add Your First Property
                    </Link>
                </div>
            )}

            {!!listings.length && (
                <div className="overflow-hidden rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[760px] border-collapse">
                            <thead>
                                <tr className="border-b border-[rgba(9,24,42,.09)]">
                                    {[
                                        "PROPERTY",
                                        "AREA",
                                        "STATUS",
                                        "MONTHLY INQUIRIES",
                                        "ANNUAL RENT",
                                        "OCCUPANCY",
                                        "PERFORMANCE",
                                        "",
                                    ].map((heading, index) => (
                                        <th
                                            key={index}
                                            className="px-4 py-3 text-left text-[9.5px] font-extrabold tracking-[.04em] text-[#5d6876]"
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {listings.map((listing) => {
                                    const image =
                                        listing.images?.[0] ||
                                        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=80&q=60";

                                    return (
                                        <tr
                                            key={listing.id}
                                            className="border-b border-[rgba(9,24,42,.05)] hover:bg-[#f8f9fb]"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={image}
                                                        alt={listing.title}
                                                        className="h-10 w-12 rounded-lg object-cover"
                                                    />

                                                    <Link
                                                        href={`/listing?id=${listing.id}`}
                                                        className="text-[12px] font-extrabold hover:text-[#a97e4b]"
                                                    >
                                                        {listing.title || "Untitled"}
                                                    </Link>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 text-[11px] font-semibold text-[#5d6876]">
                                                {listing.area || "—"}
                                            </td>

                                            <td className="px-4 py-3">
                                                <span className="rounded-md bg-[rgba(21,147,95,.1)] px-2 py-1 text-[10px] font-extrabold text-[#15935f]">
                                                    {listing.isVerified
                                                        ? "Verified"
                                                        : "Pending review"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-[11.5px] font-bold">
                                                {listing.views || 0}
                                            </td>

                                            <td className="px-4 py-3 text-[11.5px] font-bold">
                                                {naira(listing.rentPerYear || 0)}
                                            </td>

                                            <td className="px-4 py-3 text-[11px] font-bold">
                                                —
                                            </td>

                                            <td className="px-4 py-3 text-[11px] font-extrabold text-[#2563eb]">
                                                Active
                                            </td>

                                            <td className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => void deleteListing(listing)}
                                                    className="text-[#c0392b] hover:opacity-70"
                                                    aria-label="Delete listing"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}