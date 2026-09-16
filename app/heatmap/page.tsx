"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ═══ DATA (verbatim from heatmap.js / heatmap.html) ═══ */

const HEAT_POINTS: [number, number, number][] = [
  [6.4478, 3.4733, 1.0],
  [6.446, 3.47, 0.95],
  [6.45, 3.476, 0.9],
  [6.443, 3.468, 0.85],
  [6.455, 3.43, 0.88],
  [6.453, 3.426, 0.82],
  [6.457, 3.435, 0.8],
  [6.4281, 3.4219, 0.85],
  [6.426, 3.418, 0.8],
  [6.505, 3.375, 0.76],
  [6.503, 3.372, 0.72],
  [6.507, 3.378, 0.7],
  [6.495, 3.354, 0.81],
  [6.492, 3.351, 0.78],
  [6.497, 3.357, 0.74],
  [6.552, 3.387, 0.68],
  [6.549, 3.384, 0.64],
  [6.4688, 3.5699, 0.72],
  [6.466, 3.567, 0.68],
  [6.471, 3.573, 0.65],
  [6.4376, 3.6085, 0.59],
  [6.435, 3.605, 0.55],
  [6.6018, 3.3515, 0.65],
  [6.599, 3.348, 0.6],
  [6.6175, 3.322, 0.51],
  [6.615, 3.319, 0.47],
  [6.4483, 3.3614, 0.55],
  [6.4541, 3.3947, 0.7],
  [6.451, 3.392, 0.65],
  [6.639, 3.364, 0.48],
];

const MAP_AREAS = [
  { name: "Lekki Phase 1", lat: 6.4478, lng: 3.4733, score: 92, tag: "High Demand", rent: "₦2.8M/yr" },
  { name: "Ikoyi", lat: 6.455, lng: 3.43, score: 88, tag: "Premium", rent: "₦3.5M/yr" },
  { name: "Victoria Island", lat: 6.4281, lng: 3.4219, score: 85, tag: "Premium", rent: "₦4.2M/yr" },
  { name: "Surulere", lat: 6.495, lng: 3.354, score: 81, tag: "High Demand", rent: "₦1.45M/yr" },
  { name: "Yaba", lat: 6.505, lng: 3.375, score: 76, tag: "Emerging", rent: "₦1.2M/yr" },
  { name: "Ajah", lat: 6.4688, lng: 3.5699, score: 72, tag: "Emerging", rent: "₦1.1M/yr" },
  { name: "Gbagada", lat: 6.552, lng: 3.387, score: 68, tag: "Affordable", rent: "₦900K/yr" },
  { name: "Ikeja", lat: 6.6018, lng: 3.3515, score: 65, tag: "Affordable", rent: "₦850K/yr" },
  { name: "Sangotedo", lat: 6.4376, lng: 3.6085, score: 59, tag: "Emerging", rent: "₦750K/yr" },
  { name: "Agege", lat: 6.6175, lng: 3.322, score: 51, tag: "Affordable", rent: "₦600K/yr" },
];

function tagColor(tag: string) {
  if (tag === "High Demand") return "#e8472d";
  if (tag === "Premium") return "#7c3aed";
  if (tag === "Emerging") return "#1a9e4a";
  return "#b45309";
}

type AreaCategory = "high-demand" | "premium" | "emerging" | "affordable";

const AREA_CARDS: {
  name: string;
  lga: string;
  category: AreaCategory;
  tagLabel: string;
  score: number;
  rent: string;
  trend: "up" | "stable";
  listings: number;
}[] = [
    { name: "Lekki Phase 1", lga: "Eti-Osa LGA", category: "high-demand", tagLabel: "High Demand", score: 92, rent: "₦2,800,000", trend: "up", listings: 342 },
    { name: "Ikoyi", lga: "Ikoyi LGA", category: "premium", tagLabel: "Premium", score: 88, rent: "₦3,500,000", trend: "stable", listings: 156 },
    { name: "Yaba", lga: "Lagos Mainland", category: "emerging", tagLabel: "Emerging", score: 76, rent: "₦1,200,000", trend: "up", listings: 289 },
    { name: "Gbagada", lga: "Kosofe LGA", category: "affordable", tagLabel: "Affordable", score: 68, rent: "₦900,000", trend: "stable", listings: 412 },
    { name: "Ajah", lga: "Eti-Osa LGA", category: "emerging", tagLabel: "Emerging", score: 72, rent: "₦1,100,000", trend: "up", listings: 378 },
    { name: "Surulere", lga: "Lagos Mainland", category: "high-demand", tagLabel: "High Demand", score: 81, rent: "₦1,450,000", trend: "up", listings: 267 },
    { name: "Victoria Island", lga: "Eti-Osa LGA", category: "premium", tagLabel: "Premium", score: 85, rent: "₦4,200,000", trend: "stable", listings: 198 },
    { name: "Ikeja", lga: "Ikeja LGA", category: "affordable", tagLabel: "Affordable", score: 65, rent: "₦850,000", trend: "up", listings: 503 },
    { name: "Sangotedo", lga: "Eti-Osa LGA", category: "emerging", tagLabel: "Emerging", score: 59, rent: "₦750,000", trend: "up", listings: 221 },
    { name: "Agege", lga: "Agege LGA", category: "affordable", tagLabel: "Affordable", score: 51, rent: "₦600,000", trend: "stable", listings: 187 },
  ];

const tagClasses: Record<AreaCategory, string> = {
  "high-demand": "bg-[#fff1ee] text-[#e8472d]",
  premium: "bg-[#f3eeff] text-[#7c3aed]",
  emerging: "bg-[#edf7f0] text-[#1a9e4a]",
  affordable: "bg-[#fffbeb] text-[#b45309]",
};

const tabFilters: { key: "all" | AreaCategory; label: string }[] = [
  { key: "all", label: "All Areas" },
  { key: "high-demand", label: "High Demand" },
  { key: "premium", label: "Premium" },
  { key: "emerging", label: "Emerging" },
  { key: "affordable", label: "Affordable" },
];

/* ═══ SCRIPT/CSS LOADING HELPERS ═══ */

function loadScriptOnce(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

function loadStylesheetOnce(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

export default function HeatMapPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewBy, setViewBy] = useState<"demand" | "rent" | "listings">("demand");
  const [activeFilter, setActiveFilter] = useState<"all" | AreaCategory>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [dataUpdated, setDataUpdated] = useState("May 24, 2025");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      loadStylesheetOnce("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
      await loadScriptOnce("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
      await loadScriptOnce("https://unpkg.com/leaflet.heat/dist/leaflet-heat.js");

      if (cancelled || !mapContainerRef.current || mapRef.current) return;

      const L = (window as any).L;

      const map = L.map(mapContainerRef.current, {
        center: [6.5244, 3.3792],
        zoom: 11,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      const heatLayer = L.heatLayer(HEAT_POINTS, {
        radius: 40,
        blur: 30,
        maxZoom: 13,
        max: 1.0,
        gradient: {
          0.0: "#4575b4",
          0.25: "#74add1",
          0.5: "#fdae61",
          0.75: "#f46d43",
          1.0: "#d73027",
        },
      }).addTo(map);

      MAP_AREAS.forEach((area) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            background:#fff;
            border:2px solid ${tagColor(area.tag)};
            color:#09182a;
            font-family:Manrope,sans-serif;
            font-size:10px;
            font-weight:800;
            padding:4px 8px;
            border-radius:8px;
            white-space:nowrap;
            box-shadow:0 2px 8px rgba(0,0,0,.15);
            cursor:pointer;
          ">${area.name}</div>`,
          iconAnchor: [0, 0],
        });

        const marker = L.marker([area.lat, area.lng], { icon }).addTo(map);
        marker.bindPopup(
          `
          <div style="font-family:Manrope,sans-serif;min-width:160px;">
            <strong style="font-size:14px;">${area.name}</strong>
            <span style="display:inline-block;margin-left:6px;background:${tagColor(
            area.tag,
          )};color:#fff;font-size:9px;font-weight:700;padding:2px 7px;border-radius:999px;">${area.tag}</span>
            <div style="margin-top:10px;display:flex;flex-direction:column;gap:6px;">
              <div style="display:flex;justify-content:space-between;font-size:12px;">
                <span style="color:#5d6876;">Demand Score</span>
                <strong>${area.score}/100</strong>
              </div>
              <div style="height:5px;background:#f0eeeb;border-radius:999px;overflow:hidden;">
                <div style="height:100%;width:${area.score}%;background:linear-gradient(90deg,#ff4d4d,#ff9900);border-radius:999px;"></div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-top:4px;">
                <span style="color:#5d6876;">Avg Rent</span>
                <strong>${area.rent}</strong>
              </div>
            </div>
            <a href="/#listings" style="display:block;margin-top:12px;text-align:center;background:#09182a;color:#fff;font-size:11px;font-weight:700;padding:7px;border-radius:7px;text-decoration:none;">View Properties</a>
          </div>
        `,
          { maxWidth: 200 },
        );
      });

      mapRef.current = map;
      heatLayerRef.current = heatLayer;
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        heatLayerRef.current = null;
      }
    };
  }, []);

  const handleViewByChange = (val: "demand" | "rent" | "listings") => {
    setViewBy(val);
    if (!heatLayerRef.current) return;

    if (val === "rent") {
      heatLayerRef.current.setOptions({
        gradient: { 0.0: "#f7fbff", 0.4: "#6baed6", 0.7: "#2171b5", 1.0: "#08306b" },
      });
    } else if (val === "listings") {
      heatLayerRef.current.setOptions({
        gradient: { 0.0: "#f7fcf5", 0.4: "#74c476", 0.7: "#238b45", 1.0: "#00441b" },
      });
    } else {
      heatLayerRef.current.setOptions({
        gradient: { 0.0: "#4575b4", 0.25: "#74add1", 0.5: "#fdae61", 0.75: "#f46d43", 1.0: "#d73027" },
      });
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      const now = new Date();
      setDataUpdated(
        now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      );
    }, 1400);
  };

  const handleDownload = () => {
    alert(
      "Report download will be available once you log in. Sign up free to access full market reports.",
    );
  };

  const visibleCards =
    activeFilter === "all"
      ? AREA_CARDS
      : AREA_CARDS.filter((card) => card.category === activeFilter);

  return (
    <div className="min-h-screen bg-[#f0eeeb] font-manrope text-[#09182a]">
      {/* ═══ HEADER ═══ */}
      <header className="sticky top-0 z-[100] flex h-[72px] items-center gap-8 border-b border-black/[0.07] bg-white px-10 max-[768px]:gap-0 max-[768px]:px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-[#09182a]" aria-label="Property Warehouse home">
          <span className="inline-block shrink-0 font-cormorant text-[34px] font-bold leading-[0.82] tracking-[-0.09em] text-[#a97e4b]">
            P <span className="ml-[-3px] inline-block translate-y-[11px]">W</span>
          </span>
          <span className="grid gap-px text-[13px] font-extrabold leading-none tracking-[-0.04em] text-[#09182a]">
            <span>PROPERTY</span>
            <span>WAREHOUSE</span>
          </span>
        </Link>

        <nav className="flex flex-1 justify-center gap-7 max-[768px]:hidden" aria-label="Primary navigation">
          <Link href="/#listings" className="border-b-2 border-transparent pb-1 text-sm font-semibold text-[#09182a] transition hover:text-[#a97e4b]">
            Listings
          </Link>
          <Link href="/heatmap" className="border-b-2 border-[#09182a] pb-1 text-sm font-semibold text-[#09182a] transition hover:text-[#a97e4b]">
            Heat Map
          </Link>
          <Link href="/#landlords" className="border-b-2 border-transparent pb-1 text-sm font-semibold text-[#09182a] transition hover:text-[#a97e4b]">
            Landlords
          </Link>
          <Link href="/how-it-works" className="border-b-2 border-transparent pb-1 text-sm font-semibold text-[#09182a] transition hover:text-[#a97e4b]">
            How It Works
          </Link>
          <Link href="/#about-us" className="border-b-2 border-transparent pb-1 text-sm font-semibold text-[#09182a] transition hover:text-[#a97e4b]">
            About Us
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-4 max-[768px]:hidden">
          <button aria-label="Saved" className="flex items-center rounded-lg p-1.5 text-[#09182a] transition hover:bg-[#f0eeeb]">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <Link href="/auth" className="text-sm font-semibold text-[#09182a]">
            Log in
          </Link>
          <Link href="/auth#landlord" className="whitespace-nowrap rounded-[10px] bg-[#09182a] px-[18px] py-2.5 text-sm font-bold text-white transition hover:opacity-85">
            + List Property
          </Link>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setDrawerOpen((open) => !open)}
          className="ml-auto hidden flex-col gap-[5px] p-1.5 max-[768px]:flex"
        >
          <span className="block h-0.5 w-[22px] rounded-sm bg-[#09182a]" />
          <span className="block h-0.5 w-[22px] rounded-sm bg-[#09182a]" />
          <span className="block h-0.5 w-[22px] rounded-sm bg-[#09182a]" />
        </button>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 top-[72px] z-[99] ${drawerOpen ? "flex" : "hidden"} flex-col border-t border-[#eee] bg-white p-6`}
      >
        <Link href="/#listings" className="block border-b border-[#f0eeeb] py-4 text-base font-semibold text-[#09182a]">
          Listings
        </Link>
        <Link href="/heatmap" className="block border-b border-[#f0eeeb] py-4 text-base font-semibold text-[#a97e4b]">
          Heat Map
        </Link>
        <Link href="/#landlords" className="block border-b border-[#f0eeeb] py-4 text-base font-semibold text-[#09182a]">
          Landlords
        </Link>
        <Link href="/how-it-works" className="block border-b border-[#f0eeeb] py-4 text-base font-semibold text-[#09182a]">
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
      <section className="flex flex-wrap items-start justify-between gap-5 px-10 pb-5 pt-9 max-[768px]:flex-col max-[768px]:px-5 max-[768px]:pb-4 max-[768px]:pt-6">
        <div>
          <h1 className="flex flex-wrap items-center gap-3 font-cormorant text-5xl font-bold leading-[1.1] max-[768px]:text-[34px]">
            Lagos Housing Heat Map
            <span className="text-4xl">🗺️</span>
          </h1>
          <p className="mt-2 max-w-[540px] text-[15px] text-[#5d6876]">
            Where demand is rising, prices are moving, and the best value hides.
          </p>
        </div>
        <div className="mt-1.5 flex shrink-0 items-center gap-2.5 rounded-[10px] border border-[#e0ddd9] bg-white px-3.5 py-2">
          <span className="whitespace-nowrap text-[13px] font-semibold text-[#5d6876]">View by:</span>
          <select
            aria-label="View by metric"
            value={viewBy}
            onChange={(e) => handleViewByChange(e.target.value as "demand" | "rent" | "listings")}
            className="cursor-pointer border-none bg-transparent text-[13px] font-bold text-[#09182a] outline-none"
          >
            <option value="demand">Demand Score</option>
            <option value="rent">Avg Rent</option>
            <option value="listings">Listings</option>
          </select>
        </div>
      </section>

      {/* ═══ MAIN GRID ═══ */}
      <section className="grid grid-cols-[2fr_1fr] gap-5 px-10 max-[960px]:grid-cols-1 max-[768px]:px-5">
        {/* MAP */}
        <div className="relative min-h-[480px] overflow-hidden rounded-[24px] bg-[#e8e4df]">
          <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-xl bg-white/[0.92] p-3.5 px-4 backdrop-blur-[8px]">
            <span className="mb-2 block text-[10px] font-extrabold tracking-[1px] text-[#5d6876]">
              DEMAND LEVEL
            </span>
            <div
              className="h-2.5 w-40 rounded-full"
              style={{
                background: "linear-gradient(90deg, #4575b4, #74add1, #fdae61, #f46d43, #d73027)",
              }}
            />
            <div className="mt-[5px] flex justify-between">
              <span className="text-[9px] font-semibold text-[#5d6876]">Low</span>
              <span className="text-[9px] font-semibold text-[#5d6876]">Medium</span>
              <span className="text-[9px] font-semibold text-[#5d6876]">High</span>
              <span className="text-[9px] font-semibold text-[#5d6876]">Very High</span>
            </div>
          </div>

          <div ref={mapContainerRef} id="lagosMap" className="z-[1] h-[480px] w-full rounded-[24px] max-[768px]:h-[360px]" />

          <div className="pointer-events-none absolute bottom-14 left-4 z-10 flex max-w-[220px] gap-2.5 rounded-xl bg-white/[0.92] p-3.5 px-4 backdrop-blur-[8px] max-[600px]:hidden">
            <div className="mt-0.5 shrink-0 text-[#a97e4b]">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <strong className="mb-1 block text-xs font-bold">How it works</strong>
              <p className="text-[11px] leading-[1.4] text-[#5d6876]">
                Our heat map shows rental demand based on searches, inquiries, and market activity.
              </p>
            </div>
          </div>

          <a
            href="https://www.openstreetmap.org/#map=12/6.5244/3.3792"
            target="_blank"
            rel="noopener"
            className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 rounded-lg bg-white/[0.92] px-3.5 py-2 text-xs font-bold text-[#09182a] backdrop-blur-[8px] transition hover:bg-white"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 10.5c0 5-7 10-7 10s-7-5-7-10a7 7 0 1 1 14 0Z" />
              <circle cx="12" cy="10.5" r="2.5" />
            </svg>
            View Larger Map
          </a>
        </div>

        {/* INSIGHT CARDS */}
        <div className="flex flex-col gap-3.5 max-[960px]:flex-row max-[960px]:flex-wrap max-[600px]:flex-col">
          <div className="flex flex-1 flex-col gap-1 rounded-[20px] bg-white p-5 px-[22px] max-[960px]:min-w-[200px]">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1ee] text-[#e8472d]">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2c0 0-5 5-5 10a5 5 0 0 0 10 0c0-2-1-4-2-5 0 2-1.5 3-2 3-.5 0-1-.5-1-1.5C12 6 12 2 12 2Z" />
              </svg>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#5d6876]">
              Most Searched
            </span>
            <h3 className="mt-0.5 font-cormorant text-[26px] font-bold text-[#09182a]">
              Lekki Phase 1
            </h3>
            <p className="text-[13px] text-[#5d6876]">12.4K searches this month</p>
            <p className="text-xs font-bold text-[#1a9e4a]">↑ 18% vs last month</p>
          </div>

          <div className="flex flex-1 flex-col gap-1 rounded-[20px] bg-white p-5 px-[22px] max-[960px]:min-w-[200px]">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf7f0] text-[#1a9e4a]">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#5d6876]">
              Fastest Rising
            </span>
            <h3 className="mt-0.5 font-cormorant text-[26px] font-bold text-[#09182a]">Ajah</h3>
            <p className="flex w-fit items-center gap-1 rounded-full bg-[#edf7f0] px-2.5 py-[3px] text-[13px] font-bold text-[#1a9e4a]">
              ↑ 32% increase
            </p>
            <p className="text-xs text-[#5d6876]">in demand score</p>
          </div>

          <div className="flex flex-1 flex-col gap-1 rounded-[20px] bg-white p-5 px-[22px] max-[960px]:min-w-[200px]">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4ff] text-[#3b71f5]">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 22 9 18 21 6 21 2 9" />
              </svg>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#5d6876]">
              Best Value
            </span>
            <h3 className="mt-0.5 font-cormorant text-[26px] font-bold text-[#09182a]">
              Gbagada
            </h3>
            <p className="text-[13px] text-[#5d6876]">High demand, lower rent</p>
            <span className="mt-1.5 flex w-fit rounded-full bg-[#edf7f0] px-2.5 py-[3px] text-[11px] font-bold text-[#1a9e4a]">
              Best ROI
            </span>
          </div>
        </div>
      </section>

      {/* ═══ MARKET OVERVIEW ═══ */}
      <section className="mx-10 my-6 rounded-[24px] bg-white p-7 px-8 max-[768px]:mx-5 max-[768px]:my-4 max-[768px]:p-5">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="font-cormorant text-[26px] font-bold">Market Overview</h2>
        </div>

        <p className="mb-7 max-w-[700px] text-sm leading-[1.7] text-[#5d6876]">
          Lekki Phase 1 remains the most in-demand area in Lagos, while Ajah is showing the
          fastest growth. Gbagada offers the best value for money with high demand and
          affordable rents.
        </p>

        <div className="mb-6 grid grid-cols-4 gap-5 max-[960px]:grid-cols-2 max-[600px]:grid-cols-2">
          <div>
            <h3 className="font-cormorant text-4xl font-bold text-[#09182a]">127K+</h3>
            <span className="text-xs font-semibold uppercase tracking-[0.5px] text-[#5d6876]">
              Total Searches
            </span>
          </div>
          <div>
            <h3 className="font-cormorant text-4xl font-bold text-[#09182a]">8,450+</h3>
            <span className="text-xs font-semibold uppercase tracking-[0.5px] text-[#5d6876]">
              Active Inquiries
            </span>
          </div>
          <div>
            <h3 className="font-cormorant text-4xl font-bold text-[#09182a]">2,340+</h3>
            <span className="text-xs font-semibold uppercase tracking-[0.5px] text-[#5d6876]">
              Properties Listed
            </span>
          </div>
          <div>
            <h3 className="font-cormorant text-4xl font-bold text-[#09182a]">12</h3>
            <span className="text-xs font-semibold uppercase tracking-[0.5px] text-[#5d6876]">
              LGAs Covered
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0eeeb] pt-5">
          <span className="flex items-center gap-1.5 text-xs text-[#5d6876]">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Data updated: {dataUpdated}
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-[#e0ddd9] bg-white px-3.5 py-2 text-xs font-bold text-[#09182a] transition hover:bg-[#f0eeeb]"
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={refreshing ? "animate-spin" : ""}
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {refreshing ? "Refreshing…" : "Refresh Data"}
          </button>
        </div>
      </section>

      {/* ═══ AREA BREAKDOWN ═══ */}
      <section className="px-10 pb-10 max-[768px]:px-5 max-[768px]:pb-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-cormorant text-[32px] font-bold">Area Breakdown</h2>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg border border-[#e0ddd9] bg-white px-3.5 py-2 text-xs font-bold text-[#09182a] transition hover:bg-[#f0eeeb]"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Report
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2" role="tablist">
          {tabFilters.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeFilter === tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className="rounded-full px-[18px] py-2.5 text-[13px] font-semibold transition"
              style={{
                background: activeFilter === tab.key ? "#09182a" : "#fff",
                color: activeFilter === tab.key ? "#fff" : "#5d6876",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-4 max-[1200px]:grid-cols-3 max-[960px]:grid-cols-2 max-[600px]:grid-cols-1">
          {visibleCards.map((card) => (
            <div
              key={card.name}
              className="flex flex-col gap-3 rounded-[20px] bg-white p-5 transition hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,0,0,.08)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-[15px] font-extrabold leading-[1.2] text-[#09182a]">
                    {card.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-[#5d6876]">{card.lga}</p>
                </div>
                <span
                  className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${tagClasses[card.category]}`}
                >
                  {card.tagLabel}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#5d6876]">
                  Demand Score
                </span>
                <span className="text-[15px] font-extrabold text-[#09182a]">
                  {card.score}
                  <small className="text-[11px] font-semibold text-[#5d6876]">/100</small>
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-[#f0eeeb]">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${card.score}%`,
                    background: "linear-gradient(90deg, #ff4d4d, #ff9900)",
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-[#f0eeeb] py-3">
                <div className="flex flex-col gap-[3px]">
                  <strong className="text-xs font-extrabold text-[#09182a]">{card.rent}</strong>
                  <span className="text-[9px] font-bold tracking-[0.5px] text-[#5d6876]">
                    AVG RENT/YR
                  </span>
                </div>
                <div className="flex flex-col gap-[3px]">
                  <strong
                    className="text-xs font-extrabold"
                    style={{ color: card.trend === "up" ? "#1a9e4a" : "#5d6876" }}
                  >
                    {card.trend === "up" ? "↑ Rising" : "→ Stable"}
                  </strong>
                  <span className="text-[9px] font-bold tracking-[0.5px] text-[#5d6876]">
                    TREND
                  </span>
                </div>
                <div className="flex flex-col gap-[3px]">
                  <strong className="text-xs font-extrabold text-[#09182a]">{card.listings}</strong>
                  <span className="text-[9px] font-bold tracking-[0.5px] text-[#5d6876]">
                    LISTINGS
                  </span>
                </div>
              </div>

              <Link
                href="/#listings"
                className="pt-1 text-xs font-bold text-[#09182a] transition hover:text-[#a97e4b]"
              >
                View Properties →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="mx-10 mb-12 flex flex-wrap items-center gap-5 rounded-[24px] bg-[#09182a] p-7 px-9 max-[768px]:mx-5 max-[768px]:mb-8 max-[768px]:p-6 max-[600px]:flex-col max-[600px]:items-start">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#a97e4b]/20 text-[#a97e4b]">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <div className="min-w-[200px] flex-1">
          <h2 className="mb-1 font-cormorant text-2xl font-bold text-white">
            Want personalized insights?
          </h2>
          <p className="text-[13px] text-white/60">
            Create an account to save your favorite areas and get custom alerts.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3.5">
          <Link
            href="/auth"
            className="rounded-[10px] bg-white px-[22px] py-3 text-sm font-extrabold text-[#09182a] transition hover:opacity-90"
          >
            Sign Up Free
          </Link>
          <Link
            href="/auth"
            className="flex items-center gap-1.5 text-sm font-bold text-white/80 transition hover:text-white"
          >
            Log in
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h13m-5-5 5 5-5 5" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}