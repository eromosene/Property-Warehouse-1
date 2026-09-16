import Link from "next/link";
import Image from "next/image";
import { Listing, naira } from "../lib/api";

export default function ListingCard({ listing }: { listing: Listing }) {
  const image = listing.images?.[0] || "/property-assets/IMG-20260512-WA0088.jpg";
  return (
    <article className="overflow-hidden rounded-xl border border-[#09182a18] bg-white shadow-[0_10px_30px_rgba(9,24,42,0.06)]">
      <Link href={`/listing/${listing.id}`} className="relative block aspect-[1.45] bg-[#eee]">
        <Image src={image} alt={listing.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
        <div className="absolute left-3 top-3 flex gap-2">{listing.isVerified && <span className="rounded-full bg-[#15935f] px-2.5 py-1 text-[10px] font-bold text-white">Verified</span>}{listing.isMonthly && <span className="rounded-full bg-[#fff] px-2.5 py-1 text-[10px] font-bold text-[#09182a]">Monthly</span>}</div>
      </Link>
      <div className="p-4">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#a97e4b]">{listing.area}, Lagos</p>
        <h2 className="mt-1 text-lg font-extrabold">{listing.title}</h2>
        <p className="mt-2 text-sm text-[#5d6876]">{listing.beds} bed · {listing.baths} bath · {listing.type}</p>
        <div className="mt-4 flex items-end justify-between gap-3"><strong className="text-lg">{naira(listing.rentPerYear)}<small className="text-xs font-medium text-[#5d6876]">/yr</small></strong><Link href={`/listing/${listing.id}`} className="text-xs font-extrabold text-[#a97e4b]">View details →</Link></div>
      </div>
    </article>
  );
}
