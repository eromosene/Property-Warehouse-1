import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/site-header";

export const metadata: Metadata = {
    title: "Heat Map — Coming Soon | Property Warehouse",
};

/* The demand heat map is on hold for launch (MoM 15 Sep 2026, Item 1 & Summary): it needs real
   search/enquiry data before it can show anything trustworthy, so it appears as "coming soon".
   The previous version rendered invented demand scores and rents — see git history if the map
   UI is needed again once real activity data is available from the backend. */
const PREVIEW = [
    {
        title: "Where tenants are searching",
        copy: "See which Lagos neighbourhoods renters are looking at most, based on real searches on Property Warehouse.",
    },
    {
        title: "Rent trends by area",
        copy: "Compare typical rents across areas so you know what is fair before you commit.",
    },
    {
        title: "Insight for landlords",
        copy: "Understand demand around your property and price it to rent faster.",
    },
];

export default function HeatmapComingSoonPage() {
    return (
        <main className="min-h-screen bg-[#f6f4f1] font-manrope text-[#09182a]">
            <SiteHeader />
            <section className="mx-auto max-w-[880px] px-5 pb-20 pt-16 text-center">
                <span className="inline-flex rounded-full bg-[#a97e4b]/15 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[.14em] text-[#a97e4b]">
                    Coming soon
                </span>
                <h1 className="mt-5 font-playfair text-[38px] font-bold leading-[1.15] tracking-[-.02em] sm:text-[48px]">
                    Lagos Rental Heat Map
                </h1>
                <p className="mx-auto mt-4 max-w-[560px] text-[15px] leading-[1.65] text-[#5d6876]">
                    We&rsquo;re building a live map of rental demand across Lagos, powered by real activity on
                    Property Warehouse. It will be available here soon.
                </p>

                <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
                    {PREVIEW.map((item) => (
                        <div key={item.title} className="rounded-[16px] border border-[#e8e5de] bg-white p-5">
                            <h2 className="text-[14px] font-extrabold">{item.title}</h2>
                            <p className="mt-2 text-[13px] leading-[1.6] text-[#5d6876]">{item.copy}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-wrap justify-center gap-3">
                    <Link
                        href="/listings"
                        className="rounded-[10px] bg-[#09182a] px-5 py-3 text-[13px] font-extrabold text-white transition-opacity hover:opacity-85"
                    >
                        Browse listings
                    </Link>
                    <Link
                        href="/how-it-works"
                        className="rounded-[10px] border border-[#09182a26] bg-white px-5 py-3 text-[13px] font-extrabold text-[#09182a] transition-colors hover:border-[#a97e4b]"
                    >
                        How it works
                    </Link>
                </div>
            </section>
        </main>
    );
}
