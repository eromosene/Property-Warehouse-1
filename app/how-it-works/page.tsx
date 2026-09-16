"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type ToggleTarget = "tenant" | "landlord";

const problemCards = [
  {
    title: "Agents charging 10–15% commission upfront",
    copy: "You pay huge fees before you even see a property.",
  },
  {
    title: "Fake listings wasting your time",
    copy: "Many listings are outdated or don't even exist.",
  },
  {
    title: "Hidden fees discovered at move-in",
    copy: "Unexpected charges that blow your budget.",
  },
];

const tenantSteps = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: "Search",
    copy: "Browse listings, filtered by area, type, and budget that fit you.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Check Affordability",
    copy: "Enter your income range. The calculator tells you instantly if you can afford it.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: "View Full Details",
    copy: "See rent breakdown, caution fee, service charge. No surprises.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.73 2.04z" />
      </svg>
    ),
    title: "Contact Landlord",
    copy: "Send a WhatsApp message directly with the landlord. Zero agent involved.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    title: "Inspect Property",
    copy: "Schedule a physical visit directly with the landlord.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "Move In",
    copy: "Sign agreement directly with your landlord and move in.",
  },
];

const landlordSteps = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: "Create Listing",
    copy: "Fill in your property details, rent, fees, and availability.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    title: "Add Photos",
    copy: "Upload property photos and set your WhatsApp number for visibility.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3 5 6v5.5c0 4.1 2.8 7.9 7 9.5 4.2-1.6 7-5.4 7-9.5V6l-7-3Z" />
        <path d="m9.5 12 1.7 1.7 3.6-4" />
      </svg>
    ),
    title: "Get Verified",
    copy: "Apply for a verification badge to build trust and boost listing visibility.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Receive Inquiries",
    copy: "Tenants contact you directly on WhatsApp. You choose who fits.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: "Collect Rent",
    copy: "No commission. No agent. 100% goes to you.",
  },
];

const featureCards = [
  {
    variant: "teal" as const,
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3 5 6v5.5c0 4.1 2.8 7.9 7 9.5 4.2-1.6 7-5.4 7-9.5V6l-7-3Z" />
        <path d="m9.5 12 1.7 1.7 3.6-4" />
      </svg>
    ),
    title: "Verified Listings",
    copy: "Every verified listing has been reviewed for authenticity and quality to keep you safe.",
  },
  {
    variant: "navy" as const,
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Rent Burden Calculator",
    copy: "Know before you commit whether the rent fits your income.",
  },
  {
    variant: "gold" as const,
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: "Pay Monthly Option",
    copy: "Spread your rent payments monthly instead of yearly.",
  },
  {
    variant: "red" as const,
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: "Heat Map Insights",
    copy: "See which Lagos areas are rising, falling or affordable right now.",
  },
];

const featureIconClasses: Record<string, string> = {
  teal: "bg-[#e6f4f1] text-[#0d9e87]",
  navy: "bg-[#e8eef7] text-[#2255b8]",
  gold: "bg-[#fdf3e6] text-[#a97e4b]",
  red: "bg-[#fdecea] text-[#c0392b]",
};

const comparisonRows = [
  { feature: "Agent Commission", pw: "NO ✓", agent: "10–15% ✕" },
  { feature: "Listing Verification", pw: "Yes ✓", agent: "Rarely ✕" },
  { feature: "Transparent Pricing", pw: "Always ✓", agent: "Hidden fees ✕" },
  { feature: "Direct Communication", pw: "Yes ✓", agent: "No agent ✕" },
  { feature: "Pay Monthly Option", pw: "Available ✓", agent: "Never ✕" },
  { feature: "Fake Listing Risk", pw: "Very Low ✓", agent: "Very High ✕" },
  { feature: "Speed of Finding a Home", pw: "Fast ✓", agent: "Slow ✕" },
];

const trustItems = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="#a97e4b" stroke="#a97e4b" strokeWidth="1">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    value: "4.8",
    denom: "/5",
    label: "Rating from users",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#a97e4b" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    value: "500+",
    label: "Listings across Lagos",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#a97e4b" strokeWidth="2">
        <path d="M12 3 5 6v5.5c0 4.1 2.8 7.9 7 9.5 4.2-1.6 7-5.4 7-9.5V6l-7-3Z" />
        <path d="m9.5 12 1.7 1.7 3.6-4" />
      </svg>
    ),
    value: "200+",
    label: "Verified Landlords",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#a97e4b" strokeWidth="2">
        <path d="M19 10.5c0 5-7 10-7 10s-7-5-7-10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10.5" r="2.5" />
      </svg>
    ),
    value: "12",
    label: "LGAs Covered",
  },
];

const faqLeft = [
  {
    q: "Is Property Warehouse really free for tenants?",
    a: "Yes. Tenants pay zero fees to Property Warehouse. You only pay the rent and agreed fees directly to the landlord — no agent commission ever.",
  },
  {
    q: "How do I know a listing is real and not fake?",
    a: "Every listing undergoes a review process. Verified landlords display a badge. We also cross-check addresses and contact details before a listing goes live.",
  },
  {
    q: 'What does the "verified" badge mean?',
    a: "A verified landlord has submitted valid ID, proof of property ownership, and passed our quality check. Their listings are guaranteed to be genuine.",
  },
  {
    q: "How does the Pay Monthly option work?",
    a: "Select listings offer a monthly payment plan. Instead of paying a full year upfront, your rent is split into monthly instalments agreed directly with the landlord.",
  },
];

const faqRight = [
  {
    q: "Can I list more than one property as a landlord?",
    a: "Absolutely. You can add and manage multiple listings from your landlord dashboard with no limit on the number of properties.",
  },
  {
    q: "What if I have a dispute with a landlord?",
    a: "Contact our support team through your dashboard. We facilitate mediation between tenants and landlords and can suspend listings that violate our standards.",
  },
  {
    q: "Which areas of Lagos are currently covered?",
    a: "We currently cover 12 LGAs including Lekki, Ikoyi, Victoria Island, Yaba, Surulere, Gbagada, Ajah, Sangotedo, Ikeja, Agege, Isale-Eko, and Apapa.",
  },
  {
    q: "Is my personal information safe?",
    a: "Yes. We only share your WhatsApp contact with landlords when you initiate a conversation. We never sell your data to third parties.",
  },
];

const ArrowUpRightIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#a97e4b" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

export default function HowItWorksPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeToggle, setActiveToggle] = useState<ToggleTarget>("tenant");
  const [scrolled, setScrolled] = useState(false);
  const [openFaqLeft, setOpenFaqLeft] = useState<number | null>(null);
  const [openFaqRight, setOpenFaqRight] = useState<number | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const journeySectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        drawerRef.current &&
        menuBtnRef.current &&
        !drawerRef.current.contains(e.target as Node) &&
        !menuBtnRef.current.contains(e.target as Node)
      ) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const handleToggle = (target: ToggleTarget) => {
    setActiveToggle(target);
    journeySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#f0eeeb] font-manrope text-[#09182a]">
      {/* ═══ HEADER ═══ */}
      <header
        className="fixed inset-x-0 top-0 z-[100] flex h-[68px] items-center gap-8 border-b border-black/[0.07] bg-white/[0.96] px-10 backdrop-blur-[12px] transition-shadow max-[860px]:gap-0 max-[860px]:px-5"
        style={{ boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,.10)" : "" }}
      >
        <Link href="/" className="inline-flex shrink-0 items-center gap-2.5 text-[#09182a]" aria-label="Property Warehouse home">
          <span className="inline-block shrink-0 font-cormorant text-[34px] font-bold leading-[0.82] tracking-[-0.09em] text-[#a97e4b]">
            P <span className="ml-[-3px] inline-block translate-y-[11px]">W</span>
          </span>
          <span className="grid gap-px text-[13px] font-extrabold leading-none tracking-[-0.04em] text-[#09182a]">
            <span>PROPERTY</span>
            <span>WAREHOUSE</span>
          </span>
        </Link>

        <nav
          className="flex flex-1 justify-center gap-8 max-[860px]:hidden"
          aria-label="Primary navigation"
        >
          <Link href="/#listings" className="border-b-2 border-transparent pb-1 text-sm font-semibold text-[#09182a] transition hover:text-[#a97e4b]">
            Listings
          </Link>
          <Link href="/heatmap" className="border-b-2 border-transparent pb-1 text-sm font-semibold text-[#09182a] transition hover:text-[#a97e4b]">
            Heat Map
          </Link>
          <Link href="/#landlords" className="border-b-2 border-transparent pb-1 text-sm font-semibold text-[#09182a] transition hover:text-[#a97e4b]">
            Landlords
          </Link>
          <Link href="/how-it-works" className="border-b-2 border-[#09182a] pb-1 text-sm font-semibold text-[#09182a] transition hover:text-[#a97e4b]">
            How It Works
          </Link>
          <Link href="/#about-us" className="border-b-2 border-transparent pb-1 text-sm font-semibold text-[#09182a] transition hover:text-[#a97e4b]">
            About Us
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-4 max-[860px]:hidden">
          <Link href="/auth" className="text-sm font-semibold text-[#09182a]">
            Log in
          </Link>
          <Link
            href="/auth#landlord"
            className="whitespace-nowrap rounded-[10px] bg-[#09182a] px-[18px] py-2.5 text-sm font-bold text-white transition hover:opacity-85"
          >
            + List Property
          </Link>
        </div>

        <button
          ref={menuBtnRef}
          type="button"
          aria-label="Open menu"
          onClick={() => setDrawerOpen((open) => !open)}
          className="ml-auto hidden flex-col gap-[5px] p-1.5 max-[860px]:flex"
        >
          <span className="block h-0.5 w-[22px] rounded-sm bg-[#09182a]" />
          <span className="block h-0.5 w-[22px] rounded-sm bg-[#09182a]" />
          <span className="block h-0.5 w-[22px] rounded-sm bg-[#09182a]" />
        </button>
      </header>

      {/* Mobile drawer */}
      <div
        ref={drawerRef}
        className={`fixed inset-0 top-[68px] z-[99] ${drawerOpen ? "flex" : "hidden"} flex-col border-t border-[#eee] bg-white p-6`}
      >
        <Link href="/#listings" className="block border-b border-[#f0eeeb] py-4 text-base font-semibold text-[#09182a]">
          Listings
        </Link>
        <Link href="/heatmap" className="block border-b border-[#f0eeeb] py-4 text-base font-semibold text-[#09182a]">
          Heat Map
        </Link>
        <Link href="/#landlords" className="block border-b border-[#f0eeeb] py-4 text-base font-semibold text-[#09182a]">
          Landlords
        </Link>
        <Link href="/how-it-works" className="block border-b border-[#f0eeeb] py-4 text-base font-semibold text-[#a97e4b]">
          How It Works
        </Link>
        <Link href="/#about-us" className="block border-b border-[#f0eeeb] py-4 text-base font-semibold text-[#09182a]">
          About Us
        </Link>
        <Link href="/auth" className="block border-b border-[#f0eeeb] py-4 text-base font-semibold text-[#09182a]">
          Log in / Sign up
        </Link>
      </div>

      {/* ═══ HERO ═══ */}
      <section className="relative flex min-h-[480px] items-center overflow-hidden px-[60px] pb-20 pt-[120px] max-[860px]:min-h-[420px] max-[860px]:px-6 max-[860px]:pb-[60px] max-[860px]:pt-[100px]">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1600&q=80&fit=crop"
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: "center 40%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(9,24,42,0.82) 0%, rgba(9,24,42,0.55) 60%, rgba(9,24,42,0.35) 100%)",
            }}
          />
        </div>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-[-10px] top-1/2 z-[1] -translate-y-1/2 select-none font-cormorant text-[clamp(80px,18vw,240px)] font-bold leading-none tracking-[-6px] text-white/[0.06] max-[860px]:right-[-20px]"
        >
          SIMPLE
        </span>

        <div className="relative z-[2] max-w-[600px]">
          <h1 className="mb-4 font-cormorant text-[clamp(38px,6vw,68px)] font-bold leading-[1.05] text-white">
            How Property
            <br />
            Warehouse Works
          </h1>
          <p className="mb-8 text-base leading-[1.6] text-white/75">
            No agents. No confusion. Just a smarter way to rent in Lagos.
          </p>

          <div
            role="group"
            aria-label="User type"
            className="inline-flex rounded-xl border border-white/20 bg-white/[0.12] p-1 max-[560px]:flex-col"
          >
            <button
              type="button"
              onClick={() => handleToggle("tenant")}
              className="flex items-center gap-2 rounded-[9px] px-[22px] py-[11px] text-sm font-bold transition"
              style={{
                background: activeToggle === "tenant" ? "#fff" : "transparent",
                color: activeToggle === "tenant" ? "#09182a" : "rgba(255,255,255,0.7)",
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              I&apos;m a Tenant
            </button>
            <button
              type="button"
              onClick={() => handleToggle("landlord")}
              className="flex items-center gap-2 rounded-[9px] px-[22px] py-[11px] text-sm font-bold transition"
              style={{
                background: activeToggle === "landlord" ? "#fff" : "transparent",
                color: activeToggle === "landlord" ? "#09182a" : "rgba(255,255,255,0.7)",
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              I&apos;m a Landlord
            </button>
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM STRIP ═══ */}
      <section className="bg-[#0d1f35] px-[60px] pb-10 pt-[52px] text-center max-[860px]:px-6 max-[860px]:pb-8 max-[860px]:pt-10">
        <p className="mb-8 text-[11px] font-extrabold uppercase tracking-[2px] text-white/40">
          THE PROBLEM WE SOLVE
        </p>

        <div className="mx-auto mb-9 grid max-w-[900px] grid-cols-3 gap-5 max-[860px]:max-w-[420px] max-[860px]:grid-cols-1">
          {problemCards.map((card) => (
            <div
              key={card.title}
              className="rounded-[18px] border border-white/[0.08] bg-white/[0.05] p-6 text-left"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#c0392b] text-sm font-extrabold text-white">
                ✕
              </div>
              <h3 className="mb-2 text-[15px] font-bold leading-[1.4] text-white">
                {card.title}
              </h3>
              <p className="text-[13px] leading-[1.6] text-white/50">{card.copy}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2.5">
          <ArrowUpRightIcon />
          <p className="font-cormorant text-2xl font-bold tracking-[-0.02em] text-[#a97e4b] max-[560px]:text-xl">
            Property Warehouse fixes all of this.
          </p>
        </div>
      </section>

      {/* ═══ JOURNEYS ═══ */}
      <div
        ref={journeySectionRef}
        className="mx-auto grid max-w-[1200px] grid-cols-[1fr_auto_1fr] px-[60px] py-16 max-[1024px]:px-8 max-[860px]:grid-cols-1 max-[860px]:gap-10 max-[860px]:px-6 max-[860px]:py-10"
      >
        <div className="min-w-0">
          <div className="mb-9 flex items-center gap-2.5 text-[#09182a]">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-[11px] font-extrabold uppercase tracking-[1.5px]">
              TENANT JOURNEY
            </span>
          </div>

          <div className="flex flex-col">
            {tenantSteps.map((step, index) => (
              <div
                key={step.title}
                className="relative grid grid-cols-[36px_56px_1fr] gap-x-4"
                style={{ paddingBottom: index === tenantSteps.length - 1 ? 0 : 32 }}
              >
                <div className="z-[1] col-start-1 row-start-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#09182a] text-[13px] font-extrabold text-white">
                  {index + 1}
                </div>
                <div className="col-start-2 row-start-1 flex h-[52px] w-[52px] shrink-0 items-center justify-center self-start rounded-[14px] bg-white text-[#09182a] shadow-[0_2px_8px_rgba(0,0,0,.07)]">
                  {step.icon}
                </div>
                {index !== tenantSteps.length - 1 && (
                  <div
                    className="col-start-2 row-start-2 ml-[25px] mt-1 w-0.5 self-stretch border-l-2 border-dashed border-[#d5cec7]"
                  />
                )}
                <strong className="col-start-3 row-start-1 self-center pl-1 text-sm font-extrabold text-[#09182a]">
                  {step.title}
                </strong>
                <p className="col-start-3 row-start-2 mt-1 pl-1 text-[13px] leading-[1.6] text-[#5d6876]">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          aria-hidden="true"
          className="mx-10 w-px max-[860px]:mx-0 max-[860px]:h-px max-[860px]:w-full"
          style={{
            background:
              "linear-gradient(to bottom, transparent, #d5cec7 20%, #d5cec7 80%, transparent)",
          }}
        />

        <div className="min-w-0">
          <div className="mb-9 flex items-center gap-2.5 text-[#a97e4b]">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-[11px] font-extrabold uppercase tracking-[1.5px]">
              LANDLORD JOURNEY
            </span>
          </div>

          <div className="flex flex-col">
            {landlordSteps.map((step, index) => (
              <div
                key={step.title}
                className="relative grid grid-cols-[36px_56px_1fr] gap-x-4"
                style={{ paddingBottom: index === landlordSteps.length - 1 ? 0 : 32 }}
              >
                <div className="z-[1] col-start-1 row-start-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#a97e4b] text-[13px] font-extrabold text-white">
                  {index + 1}
                </div>
                <div className="col-start-2 row-start-1 flex h-[52px] w-[52px] shrink-0 items-center justify-center self-start rounded-[14px] bg-white text-[#09182a] shadow-[0_2px_8px_rgba(0,0,0,.07)]">
                  {step.icon}
                </div>
                {index !== landlordSteps.length - 1 && (
                  <div
                    className="col-start-2 row-start-2 ml-[25px] mt-1 w-0.5 self-stretch border-l-2 border-dashed border-[#d5cec7]"
                  />
                )}
                <strong className="col-start-3 row-start-1 self-center pl-1 text-sm font-extrabold text-[#09182a]">
                  {step.title}
                </strong>
                <p className="col-start-3 row-start-2 mt-1 pl-1 text-[13px] leading-[1.6] text-[#5d6876]">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ FEATURES ═══ */}
      <section className="grid grid-cols-4 gap-6 bg-white px-[60px] py-16 max-[1024px]:grid-cols-2 max-[860px]:px-6 max-[860px]:py-10 max-[560px]:grid-cols-1">
        {featureCards.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col gap-3 rounded-[20px] border border-black/5 bg-[#f8f7f5] p-6 transition hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,.08)]"
          >
            <div
              className={`flex h-[52px] w-[52px] items-center justify-center rounded-[14px] ${featureIconClasses[feature.variant]}`}
            >
              {feature.icon}
            </div>
            <strong className="text-base font-extrabold leading-[1.3] text-[#09182a]">
              {feature.title}
            </strong>
            <p className="text-[13px] leading-[1.6] text-[#5d6876]">{feature.copy}</p>
          </div>
        ))}
      </section>

      {/* ═══ COMPARISON TABLE ═══ */}
      <section className="px-[60px] py-[72px] text-center max-[860px]:px-6 max-[860px]:py-12">
        <h2 className="mb-9 font-cormorant text-4xl font-bold tracking-[-0.02em] max-[560px]:text-[26px]">
          Property Warehouse vs Traditional Agents
        </h2>

        <div className="overflow-x-auto rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,.07)]">
          <table className="w-full border-collapse overflow-hidden rounded-[20px] bg-white text-sm">
            <thead>
              <tr className="bg-[#09182a]">
                <th className="px-6 py-[18px] text-left text-[11px] font-extrabold tracking-[1px] text-white/60">
                  FEATURES
                </th>
                <th className="flex items-center gap-3 bg-[#a97e4b] px-6 py-[18px] text-left text-[11px] font-extrabold tracking-[1px] text-white">
                  <span className="inline-block font-cormorant text-[22px] font-bold leading-[0.82] tracking-[-0.09em] text-white/80">
                    P <span className="ml-[-2px] inline-block translate-y-[7px]">W</span>
                  </span>
                  PROPERTY WAREHOUSE
                </th>
                <th className="px-6 py-[18px] text-left text-[11px] font-extrabold tracking-[1px] text-white/60">
                  TRADITIONAL AGENT
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`transition hover:bg-[#faf9f7] ${i !== comparisonRows.length - 1 ? "border-b border-[#f0eeeb]" : ""}`}
                >
                  <td className="px-6 py-4 text-left font-semibold text-[#09182a]">
                    {row.feature}
                  </td>
                  <td className="bg-[#a97e4b0f] px-6 py-4 text-left font-semibold text-[#09182a]">
                    <span className="font-bold text-[#15935f]">{row.pw}</span>
                  </td>
                  <td className="px-6 py-4 text-left font-semibold text-[#09182a]">
                    <span className="font-semibold text-[#c0392b]">{row.agent}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <section className="flex flex-wrap justify-center gap-[60px] bg-white px-[60px] py-12 max-[860px]:px-6 max-[860px]:py-10 max-[560px]:gap-6">
        {trustItems.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-2 text-center">
            <div className="mb-1">{item.icon}</div>
            <strong className="font-cormorant text-[40px] font-bold leading-none text-[#09182a]">
              {item.value}
              {item.denom && (
                <span className="text-[22px] text-[#5d6876]">{item.denom}</span>
              )}
            </strong>
            <span className="text-[13px] font-semibold text-[#5d6876]">{item.label}</span>
          </div>
        ))}
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="mx-auto max-w-[1080px] px-[60px] py-[72px] max-[860px]:px-6 max-[860px]:py-12">
        <h2 className="mb-11 text-center font-cormorant text-4xl font-bold tracking-[-0.02em] max-[560px]:text-[26px]">
          Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-2 gap-x-10 max-[860px]:grid-cols-1">
          <div>
            {faqLeft.map((item, index) => (
              <div key={item.q} className="border-b border-[#e0ddd9]">
                <button
                  type="button"
                  aria-expanded={openFaqLeft === index}
                  onClick={() =>
                    setOpenFaqLeft((current) => (current === index ? null : index))
                  }
                  className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-bold text-[#09182a] transition hover:text-[#a97e4b]"
                >
                  {item.q}
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="shrink-0 text-[#5d6876] transition-transform"
                    style={{
                      transform: openFaqLeft === index ? "rotate(45deg)" : "none",
                      color: openFaqLeft === index ? "#a97e4b" : "#5d6876",
                    }}
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                {openFaqLeft === index && (
                  <div className="pb-5 text-sm leading-[1.7] text-[#5d6876]">{item.a}</div>
                )}
              </div>
            ))}
          </div>

          <div>
            {faqRight.map((item, index) => (
              <div key={item.q} className="border-b border-[#e0ddd9]">
                <button
                  type="button"
                  aria-expanded={openFaqRight === index}
                  onClick={() =>
                    setOpenFaqRight((current) => (current === index ? null : index))
                  }
                  className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-bold text-[#09182a] transition hover:text-[#a97e4b]"
                >
                  {item.q}
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="shrink-0 text-[#5d6876] transition-transform"
                    style={{
                      transform: openFaqRight === index ? "rotate(45deg)" : "none",
                      color: openFaqRight === index ? "#a97e4b" : "#5d6876",
                    }}
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                {openFaqRight === index && (
                  <div className="pb-5 text-sm leading-[1.7] text-[#5d6876]">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative flex min-h-[360px] items-center justify-center overflow-hidden px-[60px] py-20 text-center max-[860px]:px-6 max-[860px]:py-[60px]">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1400&q=80&fit=crop"
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: "center 60%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(9,24,42,0.88) 0%, rgba(9,24,42,0.70) 100%)",
            }}
          />
        </div>

        <div className="relative z-[2]">
          <h2 className="mb-3 font-cormorant text-[clamp(32px,5vw,52px)] font-bold tracking-[-0.02em] text-white">
            Ready to rent smarter?
          </h2>
          <p className="mb-9 text-[15px] text-white/70">
            Join thousands of Lagos residents renting smarter — no agent, no stress.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-xl bg-[#a97e4b] px-7 py-3.5 text-[15px] font-extrabold text-white transition hover:opacity-[.88]"
            >
              Start Searching
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h13m-5-5 5 5-5 5" />
              </svg>
            </Link>
            <Link
              href="/auth#landlord"
              className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-white/30 bg-white/[0.12] px-7 py-3.5 text-[15px] font-bold text-white transition hover:bg-white/20"
            >
              List Your Property
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h13m-5-5 5 5-5 5" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}