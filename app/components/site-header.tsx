"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  ["Listings", "/listings"],
  ["Heat Map", "/heat-map"],
  ["How It Works", "/how-it-works"],
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-3 top-3 z-30 flex min-h-16 items-center gap-5 rounded-xl border border-white/80 bg-white/95 px-5 shadow-[0_18px_55px_rgba(9,24,42,0.08)] lg:inset-x-[5%] lg:px-6">
      <Link href="/" className="flex min-w-0 items-center gap-2.5" onClick={() => setOpen(false)}>
        <span className="font-cormorant text-4xl font-bold leading-none tracking-[-0.1em] text-[#a97e4b]">P<span className="inline-block translate-y-2">W</span></span>
        <span className="grid text-xs font-extrabold leading-none tracking-[-0.04em]"><span>PROPERTY</span><span>WAREHOUSE</span></span>
      </Link>
      <nav className={`${open ? "flex" : "hidden"} absolute inset-x-4 top-20 flex-col rounded-xl bg-white p-3 shadow-xl lg:static lg:flex lg:flex-1 lg:flex-row lg:items-center lg:justify-center lg:gap-8 lg:bg-transparent lg:p-0 lg:shadow-none`}>
        {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="px-3 py-3 text-sm font-bold lg:p-0">{label}</Link>)}
        <Link href="/#landlords" onClick={() => setOpen(false)} className="px-3 py-3 text-sm font-bold lg:p-0">Landlords</Link>
      </nav>
      <div className="ml-auto hidden items-center gap-5 lg:flex">
        <Link href="/auth" className="text-sm font-bold">Log in</Link>
        <Link href="/auth#landlord" className="rounded-lg bg-[#09182a] px-4 py-2.5 text-xs font-bold text-white">+ List Property</Link>
      </div>
      <button type="button" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(value => !value)} className="ml-auto grid size-9 place-items-center lg:hidden">
        <span className="grid gap-1"><i className="block h-0.5 w-6 bg-[#09182a]" /><i className="block h-0.5 w-6 bg-[#09182a]" /><i className="block h-0.5 w-6 bg-[#09182a]" /></span>
      </button>
    </header>
  );
}
