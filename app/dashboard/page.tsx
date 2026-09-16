"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SiteHeader from "../components/site-header";
import ListingCard from "../components/listing-card";
import { api, Listing } from "../lib/api";

type User = { firstName?: string; lastName?: string; area?: string; role?: string };

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [saved, setSaved] = useState<Listing[]>([]);
  const [message, setMessage] = useState("Loading your dashboard...");
  useEffect(() => { Promise.all([api<{ user: User }>("/api/auth/me"), api<{ listings: Listing[] }>("/api/favourites")]).then(([session, favourites]) => { setUser(session.user); setSaved(favourites.listings); setMessage(""); }).catch((reason: Error) => setMessage(reason.message)); }, []);
  return <main className="min-h-screen bg-[#f7f4f0] font-manrope text-[#09182a]"><SiteHeader /><section className="mx-auto max-w-6xl px-5 pb-16 pt-32 md:px-12"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#a97e4b]">Tenant dashboard</p><h1 className="mt-2 font-playfair text-5xl font-bold">Welcome back{user?.firstName ? `, ${user.firstName}` : ""}</h1><p className="mt-3 text-sm text-[#5d6876]">Your saved homes and rental search in one place.</p></div><Link href="/listings" className="rounded-lg bg-[#09182a] px-5 py-3 text-sm font-extrabold text-white">Browse listings</Link></div>{message && <p className="mt-10 rounded-xl bg-white p-6 font-bold text-[#5d6876]">{message}</p>}<section className="mt-12"><div className="flex items-center justify-between"><h2 className="font-playfair text-3xl font-bold">Saved homes</h2><span className="text-sm font-bold text-[#5d6876]">{saved.length} saved</span></div>{saved.length ? <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{saved.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div> : !message && <div className="mt-6 rounded-xl bg-white p-10 text-center"><p className="font-bold">No saved homes yet.</p><Link href="/listings" className="mt-3 inline-block font-bold text-[#a97e4b]">Find a property →</Link></div>}</section></section></main>;
}
