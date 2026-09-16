"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SiteHeader from "../../components/site-header";
import { api, Listing, naira } from "../../lib/api";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api<{ listing: Listing }>(`/api/listings/${encodeURIComponent(id)}`).then((data) => setListing(data.listing)).catch((reason: Error) => setError(reason.message));
    api(`/api/listings/${encodeURIComponent(id)}/view`, { method: "POST" }).catch(() => undefined);
  }, [id]);

  if (error) return <main className="min-h-screen bg-[#f7f4f0] p-10 text-center font-manrope"><Link href="/listings" className="font-bold text-[#a97e4b]">Back to listings</Link><p className="mt-8 font-bold text-red-700">{error}</p></main>;
  if (!listing) return <main className="min-h-screen bg-[#f7f4f0] p-10 text-center font-manrope text-[#5d6876]">Loading property details...</main>;
  const image = listing.images?.[0] || "/property-assets/IMG-20260512-WA0088.jpg";

  return <main className="min-h-screen bg-[#f7f4f0] font-manrope text-[#09182a]"><SiteHeader /><section className="mx-auto max-w-6xl px-5 pb-16 pt-32 md:px-12"><Link href="/listings" className="text-sm font-bold text-[#a97e4b]">← Back to listings</Link><div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]"><div><div className="relative aspect-[1.55] overflow-hidden rounded-2xl bg-[#ddd]"><Image src={image} alt={listing.title} fill priority sizes="(max-width: 1024px) 100vw, 65vw" className="object-cover" /></div><div className="mt-8"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#a97e4b]">{listing.area}, {listing.lga}</p><h1 className="mt-2 font-playfair text-4xl font-bold">{listing.title}</h1><p className="mt-4 text-base leading-7 text-[#5d6876]">{listing.description}</p><div className="mt-7 grid grid-cols-3 gap-3 rounded-xl bg-white p-5 text-center text-sm font-bold"><span>{listing.beds} bedrooms</span><span>{listing.baths} bathrooms</span><span>{listing.type}</span></div><h2 className="mt-8 text-xl font-extrabold">Amenities</h2><div className="mt-3 flex flex-wrap gap-2">{listing.amenities.map((amenity) => <span key={amenity} className="rounded-full bg-[#e9f3ed] px-3 py-1.5 text-xs font-bold text-[#16734f]">{amenity}</span>)}</div></div></div><aside className="h-fit rounded-2xl bg-white p-7 shadow-[0_14px_40px_rgba(9,24,42,0.08)]"><p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#5d6876]">Annual rent</p><strong className="mt-2 block text-3xl">{naira(listing.rentPerYear)}<small className="text-sm font-medium text-[#5d6876]">/yr</small></strong><div className="mt-5 grid gap-3 border-y border-[#09182a12] py-5 text-sm"><span className="flex justify-between"><b>Caution fee</b>{naira(listing.cautionFee)}</span><span className="flex justify-between"><b>Service charge</b>{naira(listing.serviceCharge)}</span><span className="flex justify-between text-base"><b>Total move-in</b><b>{naira(listing.totalMoveIn)}</b></span></div><p className="mt-6 text-sm text-[#5d6876]">Listed by <b className="text-[#09182a]">{listing.landlordName}</b></p><a href={`https://wa.me/${listing.landlordWhatsApp}?text=${encodeURIComponent(`Hello, I am interested in ${listing.title}`)}`} target="_blank" rel="noreferrer" className="mt-6 block rounded-lg bg-[#15935f] px-4 py-3 text-center text-sm font-extrabold text-white">Chat landlord on WhatsApp</a><Link href="/auth" className="mt-3 block rounded-lg border border-[#09182a25] px-4 py-3 text-center text-sm font-extrabold">Sign in to inquire</Link></aside></div></section></main>;
}
