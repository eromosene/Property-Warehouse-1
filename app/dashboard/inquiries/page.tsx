"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";

type Inquiry = {
    senderName?: string;
    senderPhone?: string;
    listingId?: string;
    listingTitle?: string;
    message?: string;
    sentAt?: string;
};

function relativeTime(value?: string) {
    if (!value) return "";

    const diff = Date.now() - new Date(value).getTime();
    const mins = Math.floor(diff / 60000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;

    const hrs = Math.floor(mins / 60);

    if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;

    const days = Math.floor(hrs / 24);

    if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;

    const months = Math.floor(days / 30);

    return `${months} month${months > 1 ? "s" : ""} ago`;
}

export default function InquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const listingsRes = await api<{ listings: { id: string }[] }>(
                    "/api/landlord/listings",
                );

                const listingIds = listingsRes.listings.map((listing) => listing.id);

                const all = JSON.parse(
                    localStorage.getItem("pw_inquiries") || "[]",
                ) as Inquiry[];

                setInquiries(
                    all.filter((inquiry) =>
                        listingIds.includes(String(inquiry.listingId)),
                    ),
                );
            } catch {
                setInquiries([]);
            } finally {
                setLoading(false);
            }
        }

        void load();
    }, []);

    return (
        <div className="mx-auto max-w-7xl p-3.5 pb-19.5 lg:p-6 lg:pb-10">
            <div className="mb-5">
                <p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#a97e4b]">
                    Tenant communication
                </p>

                <h1 className="mt-1 text-[24px] font-extrabold tracking-[-.04em]">
                    Inquiries
                </h1>
            </div>

            {loading ? (
                <div className="rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white p-6 text-[13px] font-bold text-[#5d6876]">
                    Loading inquiries...
                </div>
            ) : !inquiries.length ? (
                <div className="rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white p-12 text-center">
                    <p className="text-[14px] font-bold text-[#5d6876]">
                        No inquiries yet. Share your listings to get messages!
                    </p>
                </div>
            ) : (
                <div className="grid max-w-[820px] gap-3">
                    {inquiries.map((inquiry, index) => {
                        const phone = (inquiry.senderPhone || "").replace(/\D/g, "");

                        const message = encodeURIComponent(
                            `Hello ${inquiry.senderName || ""}, thank you for your interest in my property on Property Warehouse.`,
                        );

                        return (
                            <article
                                key={`${inquiry.sentAt}-${index}`}
                                className="rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white p-[18px]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <strong className="text-[13px] font-extrabold">
                                            {inquiry.senderName || "Unknown"}
                                        </strong>

                                        <a
                                            href={`tel:${inquiry.senderPhone || ""}`}
                                            className="mt-1 block text-[11px] font-semibold text-[#15935f]"
                                        >
                                            {inquiry.senderPhone || ""}
                                        </a>
                                    </div>

                                    <span className="text-[10px] text-[#5d6876]">
                                        {relativeTime(inquiry.sentAt)}
                                    </span>
                                </div>

                                <div className="mt-3 text-[11px] font-extrabold text-[#09182a]">
                                    {inquiry.listingTitle || inquiry.listingId || "—"}
                                </div>

                                <p className="mt-2 text-[12px] leading-[1.5] text-[#5d6876]">
                                    {inquiry.message || ""}
                                </p>

                                <a
                                    href={`https://wa.me/${phone}?text=${message}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-flex rounded-lg bg-[#15935f] px-4 py-2 text-[11px] font-extrabold text-white"
                                >
                                    Reply on WhatsApp
                                </a>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}