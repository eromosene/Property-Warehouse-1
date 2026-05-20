"use client";

import Image from "next/image";
import { FormEvent, useRef, useState } from "react";

const navLinks = ["Listings", "Heat Map", "Landlords", "How It Works", "About Us"];

const selectGroups = [
  { label: "AREA", name: "area", options: ["Select Area", "Lekki", "Ikoyi", "Yaba", "Ikeja"] },
  { label: "PROPERTY TYPE", name: "property-type", options: ["Select Type", "Apartment", "Duplex", "Studio", "Terrace"] },
  { label: "MAX BUDGET", name: "max-budget", options: ["Max Budget", "\u20A61,000,000", "\u20A62,500,000", "\u20A65,000,000"] },
];

const stats = [
  {
    value: "500+",
    label: "Active Listings",
    icon: (
      <>
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10.5V20h13v-9.5" />
        <path d="M9.5 20v-5h5v5" />
      </>
    ),
  },
  {
    value: "\u20A60",
    label: "Agent Fees",
    icon: (
      <>
        <path d="M12 3 5 6v5.5c0 4.1 2.8 7.9 7 9.5 4.2-1.6 7-5.4 7-9.5V6l-7-3Z" />
        <path d="m9.5 12 1.7 1.7 3.6-4" />
      </>
    ),
  },
  {
    value: "200+",
    label: "Verified Landlords",
    icon: (
      <>
        <path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4" />
        <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M20 18c0-1.8-1.2-3.2-3-3.7" />
        <path d="M17 11.5a2.5 2.5 0 0 0 0-5" />
        <path d="M4 18c0-1.8 1.2-3.2 3-3.7" />
        <path d="M7 11.5a2.5 2.5 0 0 1 0-5" />
      </>
    ),
  },
  {
    value: "12",
    label: "LGAs Covered",
    icon: (
      <>
        <path d="M19 10.5c0 5-7 10-7 10s-7-5-7-10a7 7 0 1 1 14 0Z" />
        <path d="M12 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      </>
    ),
  },
];

function Icon({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      {children}
    </svg>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setMenuOpen(false);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const scrollCards = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    const firstCard = track.querySelector<HTMLElement>("[data-workflow-card]");
    const distance = firstCard ? firstCard.getBoundingClientRect().width + 16 : 260;
    track.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  return (
    <main className={`min-h-screen bg-[#f6f4f1] font-manrope text-[#09182a] ${menuOpen ? "overflow-hidden" : "overflow-auto"}`}>
      <header className="absolute inset-x-3 top-3.25 z-30 flex h-15.5 items-center gap-6 rounded-[10px] border border-white/85 bg-white/95 px-5 shadow-[0_18px_55px_rgba(9,24,42,0.08)] md:inset-x-9 lg:inset-x-18 lg:top-2 lg:h-15.75 lg:rounded-[14px] lg:px-6.25 2xl:inset-x-[calc((100vw-1440px)/2+72px)]">
        <a className="flex min-w-0 items-center gap-3 lg:min-w-53.5 lg:gap-2.5" href="#" aria-label="Property Warehouse home" onClick={closeMenu}>
          <span className="inline-block font-cormorant text-[32px] font-bold leading-[0.82] tracking-[-0.09em] text-[#a97e4b] xl:text-[34px]">
            R<span className="-ml-0.75 inline-block translate-y-2.75">W</span>
          </span>
          <span className="grid gap-px text-[12px] font-extrabold leading-none tracking-[-0.04em] xl:text-[13px]">
            <span>PROPERTY</span>
            <span>WAREHOUSE</span>
          </span>
        </a>

        <nav
          aria-label="Primary navigation"
          className={`${menuOpen ? "flex" : "hidden"} fixed inset-x-6 top-22 z-40 flex-col rounded-xl bg-white p-2.5 shadow-[0_20px_54px_rgba(9,24,42,0.13)] lg:static lg:flex lg:gap-8 lg:flex-1 lg:flex-row lg:items-center lg:justify-center lg:bg-transparent lg:p-0 lg:shadow-none`}
        >
          {navLinks.map((link) => (
            <a
              key={link}
              className="w-full px-3.5 py-3.25 text-sm font-bold text-[#101b2a] lg:w-auto lg:p-0 lg:text-[13px]"
              href={`#${link.toLowerCase().replaceAll(" ", "-")}`}
              onClick={closeMenu}
            >
              {link}
            </a>
          ))}
          <div
            className={`flex lg:hidden flex-col gap-2.5 rounded-xl p-2.5 shadow-[0_20px_54px_rgba(9,24,42,0.13)] lg:shadow-none`}
          >
            <a className="inline-flex min-h-10.5 items-center justify-center rounded-lg border border-[#09182a1c] text-[13px] font-bold lg:min-h-0 lg:border-0" href="#login" onClick={closeMenu}>
              Log in
            </a>
            <a className="inline-flex min-h-10.5 items-center justify-center rounded-[7px] bg-[#09182a] px-4.25 text-xs font-bold text-white shadow-[0_14px_30px_rgba(9,24,42,0.16)] lg:min-h-9.25" href="#list-property" onClick={closeMenu}>
              + List Property
            </a>
          </div>
        </nav>

        <div
          className={`hidden flex-col gap-2.5 rounded-xl p-2.5 shadow-[0_20px_54px_rgba(9,24,42,0.13)] xl:static lg:flex lg:flex-row lg:items-center lg:gap-5.5 lg:bg-transparent lg:p-0 lg:shadow-none`}
        >
          <a className="inline-flex min-h-10.5 items-center justify-center rounded-lg border border-[#09182a1c] text-[13px] font-bold lg:min-h-0 lg:border-0" href="#login" onClick={closeMenu}>
            Log in
          </a>
          <a className="inline-flex min-h-10.5 items-center justify-center rounded-[7px] bg-[#09182a] px-4.25 text-xs font-bold text-white shadow-[0_14px_30px_rgba(9,24,42,0.16)] lg:min-h-9.25" href="#list-property" onClick={closeMenu}>
            + List Property
          </a>
        </div>

        <button className="ml-auto block h-8.5 w-10.25 lg:hidden" type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          <span className={`mx-auto my-1.75 block h-0.5 w-7.25 rounded-full bg-[#09182a] transition ${menuOpen ? "translate-y-2.25 rotate-45" : ""}`} />
          <span className={`mx-auto my-1.75 block h-0.5 w-7.25 rounded-full bg-[#09182a] transition ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`mx-auto my-1.75 block h-0.5 w-7.25 rounded-full bg-[#09182a] transition ${menuOpen ? "-translate-y-2.25 -rotate-45" : ""}`} />
        </button>
      </header>

      <section className="relative min-h-176.25 overflow-visible bg-[#f6f6f4] lg:min-h-149.5 lg:bg-[#f4f3ef] 2xl:bg-[#f8f8f6]" aria-labelledby="hero-title">
        <div className="absolute inset-x-3 top-68.75 h-107.5 lg:inset-y-0 lg:left-auto lg:right-0 lg:h-149.5 lg:w-[73%] 2xl:w-[calc(100vw-(calc((100vw-1440px)/2)+389px))]">
          <Image src="/IMG-20260512-WA0088.jpg" alt="" fill priority sizes="(max-width: 1279px) 100vw, 73vw" className="object-cover object-[55%_50%] lg:object-right" />
        </div>
        <div className="absolute inset-0 h-176.25 bg-linear-to-b from-[#f8f8f6] from-31% via-[#f8f8f6e6] via-39% to-[#f8f8f61f] lg:h-149.5 lg:bg-linear-to-r lg:from-[#f8f8f6] lg:from-23% lg:via-[#f8f8f6a8] lg:via-42% lg:to-[#f8f8f60d] lg:to-65%" />
        <div className="absolute inset-0 h-176.25 bg-linear-to-r from-[#f8f8f6ad] via-[#f8f8f61a] to-transparent lg:h-149.5 lg:bg-linear-to-b lg:from-[#f6f6f424] lg:via-[#f6f6f408] lg:to-[#f6f6f4fa]" />

        <div className="relative z-10 w-auto px-5.5 pt-24.25 sm:px-6.5 md:px-9 lg:w-130 lg:px-0 lg:pl-24.5 lg:pt-26.75 2xl:w-full 2xl:pl-[calc((100vw-1440px)/2+98px)]">
          <div className="inline-flex min-h-8.25 max-w-full items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-[#a97e4b] bg-white/45 px-3 text-[8px] font-extrabold tracking-widest text-[#172233] sm:text-[9px] sm:tracking-[0.12em] md:gap-3 md:px-4 md:text-[11px] md:tracking-[0.17em] lg:px-4.5 lg:text-xs lg:tracking-[0.15em]">
            <span className="grid h-3.5 w-5 overflow-hidden rounded-lg shadow-[0_0_0_1px_rgba(9,24,42,0.04)] grid-cols-3 md:h-4 md:w-5.5" aria-hidden="true">
              <span className="bg-[#15935f]" />
              <span className="bg-white" />
              <span className="bg-[#15935f]" />
            </span>
            <span>LAGOS&apos;S #1 DIRECT RENTAL PLATFORM</span>
          </div>

          <h1 id="hero-title" className="mt-4.5 mb-5.25 max-w-122.5 font-playfair text-[clamp(39px,11vw,43px)] font-bold leading-[0.97] tracking-[-0.045em] text-[#09182a] sm:text-[clamp(43px,11.7vw,54px)] md:text-[clamp(50px,8.9vw,64px)] lg:mt-4.25 lg:mb-4.5 lg:max-w-132.5 lg:text-[61px] lg:leading-[0.99] 2xl:max-w-155">
            Find Your Space.<span className="block font-semibold italic text-[#a97e4b]">Pay Fair.</span>
          </h1>

          <p className="m-0 max-w-96.25 text-sm font-medium leading-[1.48] tracking-[-0.03em] text-[#162033] sm:text-[15px] md:text-[17px] xl:max-w-99.5">
            No agents. No hidden fees.<br />
            Connect directly with verified Lagos landlords and rent smarter.
          </p>

          <div className="mt-5 flex flex-col items-stretch gap-3 md:flex-row md:items-center lg:gap-4">
            <a className="inline-flex min-w-40 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-[7px] bg-[#09182a] p-3 text-[11px] font-extrabold text-white shadow-[0_18px_34px_rgba(9,24,42,0.18)] md:gap-3 md:text-xs lg:flex-none lg:px-5" href="#listings">
              <span>Browse Listings</span>
              <Icon className="size-4 text-[#a97e4b]"><path d="M5 12h13m-5-5 5 5-5 5" /></Icon>
            </a>
            <a className="inline-flex min-w-36 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-[7px] border border-zinc-200/70 bg-white/80 p-3 text-[11px] font-extrabold text-[#09182a] shadow-[0_12px_28px_rgba(9,24,42,0.06)] md:gap-3 md:text-xs lg:flex-none" href="#how-it-works">
              <span className="flex size-5 rounded-full border-[1.5px] border-current">
                <Icon className="h-2.75 w-2.75 translate-x-px"><path d="m10 8 6 4-6 4V8Z" /></Icon>
              </span>
              <span>How It Works</span>
            </a>
          </div>
        </div>

        <aside className="absolute right-5 bottom-12 z-20 min-h-42.25 w-[min(260px,calc(100%-40px))] rounded-[17px] bg-white/95 px-6.25 py-4.75 shadow-[0_18px_48px_rgba(9,24,42,0.12)] sm:right-7.5 sm:w-[min(269px,calc(100%-60px))] md:right-10.25 lg:right-23.5 lg:bottom-18 lg:min-h-37.25 lg:w-56 lg:rounded-[11px] lg:px-7 lg:py-3.75 2xl:right-[calc((100vw-1440px)/2+94px)]" aria-label="Customer testimonial">
          <span className="block h-4.75 font-playfair text-[33px] font-bold leading-[0.65] text-[#d7b17e] lg:text-[28px]">&ldquo;</span>
          <p className="mt-1.5 mb-4.5 text-[13px] font-bold leading-[1.42] text-[#09182a] lg:mt-1 lg:mb-3.25 lg:text-[11px] lg:leading-[1.43]">&ldquo;We found our dream home in Lekki and saved over <strong>&#8358;350,000</strong> in agent fees!&rdquo;</p>
          <div className="flex items-center gap-2.5">
            <Image src="/IMG-20260512-WA0087.jpg" alt="Ibukun and Tayo" width={86} height={86} className="h-10.75 w-10.75 rounded-full object-cover object-[46%_42%] lg:h-9.75 lg:w-9.75" />
            <div className="grid gap-px">
              <strong className="text-[13px] leading-none lg:text-[11px]">Ibukun &amp; Tayo</strong>
              <span className="text-[11px] font-semibold text-[#485363] lg:text-[9px]">Lekki, Lagos</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="relative z-10 bg-white pt-0 pb-4.25 lg:pt-18" aria-label="Platform numbers and partners">
        <form className="relative z-20 mx-auto -mt-8.75 grid min-h-65.5 w-[calc(100%-24px)] translate-y-13.25 grid-cols-1 gap-2.25 rounded-[10px] border border-[#09182a0f] bg-white/95 px-4.5 py-3.5 shadow-[0_14px_34px_rgba(9,24,42,0.1)] sm:w-[calc(100%-30px)] md:w-[calc(100%-62px)] lg:absolute lg:left-1/2 lg:-top-13 lg:m-0 lg:min-h-25.5 lg:w-[min(930px,calc(100%-352px))] lg:-translate-x-1/2 lg:translate-y-0 lg:grid-cols-[1fr_1fr_1fr_157px] lg:items-end lg:gap-6.25 lg:rounded-xl lg:px-10 lg:py-4.75" id="listings" onSubmit={handleSearch}>
          {selectGroups.map((group) => (
            <label className="grid gap-1.75 lg:gap-2" key={group.name}>
              <span className="text-xs font-extrabold tracking-[0.08em] text-[#1b2536] lg:text-[11px]">{group.label}</span>
              <select className="h-8 w-full appearance-none rounded border border-[#09182a14] bg-white bg-[linear-gradient(45deg,transparent_50%,#111b29_50%),linear-gradient(135deg,#111b29_50%,transparent_50%)] bg-no-repeat pl-3 pr-9 text-[10px] font-medium text-[#5c6674] bg-position-[calc(100%-19px)_51%,calc(100%-15px)_51%] bg-size-[5px_5px,5px_5px] lg:h-9.75 lg:rounded-[5px] lg:pl-3.25 lg:text-[11px]" aria-label={`Select ${group.label.toLowerCase()}`}>
                {group.options.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          ))}
          <button className="mt-1 inline-flex h-9.25 items-center justify-center gap-3.25 rounded-[5px] bg-[#09182a] text-xs font-extrabold text-white lg:mt-0 lg:h-9.75 lg:rounded-md lg:text-[11px]" type="submit">
            <span>Search</span>
            <Icon className="h-4 w-4"><path d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" /></Icon>
          </button>
        </form>

        <div className="mx-auto mt-18 grid w-[calc(100%-62px)] grid-cols-4 lg:mt-0 lg:w-[min(760px,calc(100%-190px))]">
          {stats.map((stat, index) => (
            <article className={`flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-center lg:flex-row lg:gap-3.75 lg:px-7 lg:text-left ${index !== stats.length - 1 ? "border-r border-[#09182a1f]" : ""}`} key={stat.label}>
              <span className="grid h-9.75 w-9.75 shrink-0 place-items-center rounded-full border border-[#a97e4b47] text-[#a97e4b] lg:h-10.75 lg:w-10.75">
                <Icon className="h-5 w-5 stroke-[1.5] lg:h-5.5 lg:w-5.5">{stat.icon}</Icon>
              </span>
              <span className="grid min-w-0 lg:min-w-19.5">
                <strong className="text-xl font-extrabold leading-none tracking-[-0.04em] text-[#08172a] xl:text-[22px]">{stat.value}</strong>
                <small className="mt-1 text-[10px] font-medium text-[#4f5b69] lg:whitespace-nowrap lg:text-[11px]">{stat.label}</small>
              </span>
            </article>
          ))}
        </div>

        <div className="mt-4.5 text-center lg:mt-6.25">
          <p className="mb-3.25 text-[8px] font-black tracking-[0.24em] text-[#73717a] lg:mb-2.75">TRUSTED BY THOUSANDS OF LAGOSIANS</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 px-6 text-[13px] font-extrabold text-[#0a2a4a] lg:gap-10 lg:px-0 lg:text-sm" aria-label="Partner logos">
            <span className="inline-flex items-center gap-1 whitespace-nowrap"><i className="h-3.25 w-3.25 rotate-45 border-2 border-[#f08a24]" />access</span>
            <span className="inline-flex h-5.75 w-5.75 items-center justify-center bg-[#ef6123] text-[7px] font-black text-white">GTCO</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap"><i className="h-4.25 w-4.25 rounded-full border-[1.5px] border-[#ec6f49] bg-[linear-gradient(45deg,transparent_45%,#6bbf59_46%_55%,transparent_56%),linear-gradient(-45deg,transparent_45%,#1aa8e8_46%_55%,transparent_56%)]" />Flutterwave</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">Interswitch<i className="ml-px h-5 w-3.5 -skew-x-12 border-r-[3px] border-t-[3px] border-[#e6332a]" /></span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap"><i className="h-3.5 w-4 bg-[repeating-linear-gradient(to_bottom,#092746_0_2px,transparent_2px_4px)]" />paystack</span>
          </div>
        </div>
      </section>

      <section className="relative min-h-51.25 overflow-hidden bg-linear-to-b from-[#f7f0ea] to-[#fbf8f5] pt-4 lg:min-h-58 lg:pt-3.75" id="how-it-works">
        <div className="text-center">
          <span className="mb-0.75 block text-[9px] font-black tracking-[0.2em] text-[#786d66] lg:mb-1">HOW IT WORKS</span>
          <h2 className="m-0 font-playfair text-[23px] font-bold leading-[1.15] tracking-[-0.035em] text-[#111b2b] lg:text-[25px]">Simple. Transparent. Direct.</h2>
        </div>

        <div className="relative mx-auto mt-3.25 w-[calc(100%-58px)] overflow-visible md:w-[calc(100%-106px)] lg:mt-3.5 lg:w-[min(870px,calc(100%-210px))]">
          <button className="absolute -left-5 top-14.25 z-10 grid h-9 w-9 place-items-center rounded-full bg-white text-[#111b2a] shadow-[0_10px_30px_rgba(9,24,42,0.13)] lg:-left-4.5 lg:top-10.75" type="button" aria-label="Previous" onClick={() => scrollCards(-1)}>
            <Icon className="h-4.5 w-4.5 stroke-[2.5]"><path d="m15 18-6-6 6-6" /></Icon>
          </button>

          <div className="flex gap-3.5 overflow-x-auto scroll-smooth scrollbar-none [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:gap-4 lg:gap-72" ref={trackRef}>
            <article data-workflow-card className="relative h-44.5 min-w-60.5 overflow-hidden rounded-xl border border-[#09182a1a] bg-white/70 px-7 py-5.75 md:min-w-0 lg:h-40.5 lg:rounded-lg lg:px-15.5 lg:py-7.75">
              <div className="absolute left-4.25 top-4.5 grid h-10.5 w-10.5 place-items-center rounded-full bg-[#d9f2e4] text-[#006d56] lg:left-15.5 lg:top-7 lg:h-9.75 lg:w-9.75">
                <Icon className="h-5.5
                 w-5.5 stroke-[1.7]"><path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4" /><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path d="M20 18c0-1.8-1.2-3.2-3-3.7" /><path d="M17 11.5a2.5 2.5 0 0 0 0-5" /></Icon>
              </div>
              <h3 className="ml-10.75 mt-0 mb-1.25 text-[17px] font-extrabold tracking-[-0.04em] lg:ml-15 lg:text-base">For Tenants</h3>
              <p className="ml-10.75 mt-0 text-[11px] font-semibold text-[#101b2b] lg:ml-15">Find. Connect. Move in.</p>
              <Image className="absolute left-1/2 -bottom-11 h-27.5 w-49.5 -translate-x-1/2 object-cover object-center lg:-bottom-14.5 lg:h-29 lg:w-52.5" src="/IMG-20260512-WA0089.jpg" alt="Family looking for a rental home" width={420} height={232} />
            </article>

            <article data-workflow-card className="relative h-44.5 min-w-60.5 overflow-hidden rounded-xl border border-[#09182a1a] bg-white/70 px-7 py-5.75 md:min-w-0 lg:h-40.5 lg:rounded-lg lg:px-15.5 lg:py-7.75">
              <div className="absolute left-4.25 top-4.5 grid h-10.5 w-10.5 place-items-center rounded-full bg-[#fbecd9] text-[#6e4b28] lg:left-15.5 lg:top-7 lg:h-9.75 lg:w-9.75">
                <Icon className="h-5.5 w-5.5 stroke-[1.7]"><path d="M4 21h16" /><path d="M6 21V7l8-4v18" /><path d="M14 9h4v12" /><path d="M9 10h2" /><path d="M9 14h2" /><path d="M17 13h1" /></Icon>
              </div>
              <h3 className="ml-10.75 mt-0 mb-1.25 text-[17px] font-extrabold tracking-[-0.04em] lg:ml-15 lg:text-base">For Landlords</h3>
              <p className="ml-10.75 mt-0 text-[11px] font-semibold text-[#101b2b] lg:ml-15">List. Connect. Earn.</p>
              <Image className="absolute left-1/2 -bottom-6.25 h-27.5 w-49.5 -translate-x-1/2 object-cover object-[center_58%] lg:-bottom-9 lg:h-29 lg:w-52.5" src="/IMG-20260512-WA0088.jpg" alt="Modern Lagos property" width={420} height={232} />
            </article>
          </div>

          <button className="absolute -right-5 top-14.25 z-10 grid h-9 w-9 place-items-center rounded-full bg-white text-[#111b2a] shadow-[0_10px_30px_rgba(9,24,42,0.13)] lg:-right-4.5 lg:top-10.75" type="button" aria-label="Next" onClick={() => scrollCards(1)}>
            <Icon className="h-4.5 w-4.5 stroke-[2.5]"><path d="m9 18 6-6-6-6" /></Icon>
          </button>
        </div>
      </section>
    </main>
  );
}
