"use client";

import { useEffect, useState } from "react";
import SiteHeader from "../components/site-header";
import ListingCard from "../components/listing-card";
import { api, Listing } from "../lib/api";

const areas = ["Yaba", "Lekki Phase 1", "Surulere", "Ajah", "Gbagada", "Ikeja GRA", "Victoria Island"];
const types = ["", "Self-contain", "1 Bedroom", "2 Bedroom", "3 Bedroom", "Duplex"];

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ limit: "100", sort });
    if (query) params.set("q", query);
    if (area) params.set("area", area);
    if (type) params.set("type", type);
    setLoading(true);
    api<{ listings: Listing[] }>(`/api/listings?${params}`)
      .then((data) => { setListings(data.listings); setError(""); })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [area, query, sort, type]);

  return (
    <main className="min-h-screen bg-[#f7f4f0] font-manrope text-[#09182a]">
      <SiteHeader />
      <section className="bg-[#10263d] px-5 pb-14 pt-36 text-white md:px-12">
        <div className="mx-auto max-w-6xl"><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#d8b17f]">Browse all properties</p><h1 className="mt-3 font-playfair text-5xl font-bold">Lagos Listings</h1><p className="mt-3 max-w-xl text-sm text-white/70">Verified homes directly from landlords. No agents. No hidden fees.</p>
          <div className="mt-8 flex max-w-3xl flex-col gap-3 rounded-xl bg-white p-3 md:flex-row"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by area, type, or keyword..." className="h-12 flex-1 px-3 text-sm text-[#09182a] outline-none" /><button className="rounded-lg bg-[#a97e4b] px-6 text-sm font-extrabold text-white" type="button">Search</button></div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[220px_1fr] md:px-12">
        <aside className="h-fit rounded-xl border border-[#09182a12] bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-extrabold">Filters</h2><button type="button" onClick={() => { setArea(""); setType(""); setQuery(""); }} className="text-xs font-bold text-[#a97e4b]">Clear all</button></div><label className="mt-6 grid gap-2 text-xs font-extrabold uppercase tracking-[0.12em]">Area<select value={area} onChange={(event) => setArea(event.target.value)} className="h-10 rounded border border-[#09182a20] px-2 text-sm font-medium normal-case tracking-normal"><option value="">All areas</option>{areas.map((item) => <option key={item}>{item}</option>)}</select></label><label className="mt-5 grid gap-2 text-xs font-extrabold uppercase tracking-[0.12em]">Property type<select value={type} onChange={(event) => setType(event.target.value)} className="h-10 rounded border border-[#09182a20] px-2 text-sm font-medium normal-case tracking-normal">{types.map((item) => <option key={item} value={item}>{item || "All types"}</option>)}</select></label></aside>
        <div><div className="mb-5 flex items-center justify-between gap-4"><p className="text-sm font-bold text-[#5d6876]">{loading ? "Loading properties..." : `${listings.length} properties found`}</p><select value={sort} onChange={(event) => setSort(event.target.value)} className="h-9 rounded border border-[#09182a20] bg-white px-2 text-xs font-bold"><option value="newest">Newest</option><option value="price-asc">Price low-high</option><option value="price-desc">Price high-low</option><option value="views">Most viewed</option></select></div>{error ? <div className="rounded-xl bg-white p-10 text-center font-bold text-red-700">{error}</div> : loading ? <div className="rounded-xl bg-white p-10 text-center font-bold text-[#5d6876]">Loading listings...</div> : listings.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div> : <div className="rounded-xl bg-white p-10 text-center font-bold text-[#5d6876]">No properties match your filters.</div>}</div>
      </section>
    </main>
  );
}
