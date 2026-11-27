"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, Listing, naira } from "../lib/api";
import { getFavouriteIds, saveFavourite, unsaveFavourite } from "../lib/favourites";
import { getSharedSession } from "../lib/auth";
import { recordInquiry, teamWhatsAppHref } from "../lib/contact";
import { LAGOS_LGAS } from "../lib/lagos";
import { applyBudget, BUDGET_RANGES, budgetByKey } from "../lib/budget";
import SiteHeader from "../components/site-header";
import {
    ArrowIcon,
    BathIcon,
    BedIcon,
    EyeIcon,
    FilterIcon,
    HeartIcon,
    HomeIcon,
    LocationIcon,
    SearchIcon,
    WhatsAppIcon,
} from "../components/icons";

const PER_PAGE = 8;

const AREA_OPTIONS = [
  "Yaba",
  "Lekki Phase 1",
  "Surulere",
  "Ajah",
  "Gbagada",
  "Ikorodu",
  "Ojodu Berger",
  "Ikeja GRA",
  "Victoria Island",
  "Magodo Phase 2",
  "Ketu",
  "Ogba",
];

const TYPE_OPTIONS = [
  "",
  "Self-contain",
  "1 Bedroom",
  "2 Bedroom",
  "3 Bedroom",
  "Duplex",
  "Bungalow",
];

const AMENITY_OPTIONS = ["Water", "Parking", "Security", "Generator", "AC"];


const SORT_OPTIONS = [
  ["newest", "Newest"],
  ["price-asc", "Price Low–High"],
  ["price-desc", "Price High–Low"],
  ["views", "Most Viewed"],
];

type Filters = {
  lga: string;
  areas: string[];
  type: string;
  budget: string;
  amenities: string[];
  verifiedOnly: boolean;
  monthlyOnly: boolean;
  q: string;
};

const EMPTY_FILTERS: Filters = {
  lga: "",
  areas: [],
  type: "",
  budget: "",
  amenities: [],
  verifiedOnly: false,
  monthlyOnly: false,
  q: "",
};

type ListingsResponse = {
  listings: Listing[];
  total: number;
  page: number;
  totalPages: number;
};

/* One in-flight/settled request, tagged with the query key it belongs to. */
type ResponseState = {
  key: string;
  data: ListingsResponse | null;
  error: "network" | "server" | null;
};

/* ── Sort select (shared by mobile bar + desktop bar) ── */
function SortSelect({
  value,
  onChange,
  id,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  id: string;
  className: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`cursor-pointer rounded-[9px] border border-[#e0ddd9] bg-white px-3 py-2 font-manrope text-[13px] font-semibold text-[#09182a] outline-none ${className}`}
    >
      {SORT_OPTIONS.map(([optionValue, label]) => (
        <option key={optionValue} value={optionValue}>
          {label}
        </option>
      ))}
    </select>
  );
}

/* ── Sidebar (was listings.html .ls-sidebar) ── */
function Sidebar({
  filters,
  setFilters,
  open,
  sidebarRef,
  onApply,
  onClear,
}: {
  filters: Filters;
  setFilters: (next: Filters) => void;
  open: boolean;
  sidebarRef: React.RefObject<HTMLElement | null>;
  onApply: () => void;
  onClear: () => void;
}) {
  const toggleIn = (key: "areas" | "amenities", value: string) => {
    const list = filters[key];
    setFilters({
      ...filters,
      [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
    });
  };

  return (
    <aside
      id="lsSidebar"
      ref={sidebarRef}
      className={`row-start-1 row-span-2 sticky top-20 max-h-[calc(100vh-100px)] self-start overflow-y-auto rounded-[18px] border border-[#e8e5de] bg-white p-[22px] max-[900px]:fixed max-[900px]:inset-0 max-[900px]:z-[200] max-[900px]:max-h-screen max-[900px]:rounded-none max-[900px]:top-0 ${
        open ? "max-[900px]:block" : "max-[900px]:hidden"
      }`}
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[15px] font-extrabold text-[#09182a]">Filters</h3>
        <button
          type="button"
          onClick={onClear}
          className="cursor-pointer border-none bg-none p-0 text-[12px] font-bold text-[#c0392b]"
        >
          &#x2715; Clear all
        </button>
      </div>

      <div className="mb-[22px]">
        <p className="mb-2.5 text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#9a9490]">LGA</p>
        <select
          id="lsLga"
          value={filters.lga}
          onChange={(event) => setFilters({ ...filters, lga: event.target.value })}
          className="w-full cursor-pointer rounded-[9px] border border-[#e0ddd9] bg-white px-3 py-[9px] font-manrope text-[13px] font-semibold text-[#09182a] outline-none"
        >
          <option value="">All LGAs</option>
          {LAGOS_LGAS.map((lga) => (
            <option key={lga} value={lga}>
              {lga}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-[22px]">
        <p className="mb-2.5 text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#9a9490]">AREA</p>
        <div className="flex flex-col gap-[7px]">
          {AREA_OPTIONS.map((area) => (
            <label
              key={area}
              className="flex cursor-pointer items-center gap-[9px] text-[13px] font-semibold leading-[1.3] text-[#09182a]"
            >
              <input
                type="checkbox"
                name="area"
                value={area}
                checked={filters.areas.includes(area)}
                onChange={() => toggleIn("areas", area)}
                className="flex-shrink-0 accent-[#09182a]"
              />
              {area}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-[22px]">
        <p className="mb-2.5 text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#9a9490]">PROPERTY TYPE</p>
        <div className="flex flex-col gap-[7px]">
          {TYPE_OPTIONS.map((type) => (
            <label
              key={type || "all"}
              className="flex cursor-pointer items-center gap-[9px] text-[13px] font-semibold leading-[1.3] text-[#09182a]"
            >
              <input
                type="radio"
                name="type"
                value={type}
                checked={filters.type === type}
                onChange={() => setFilters({ ...filters, type })}
                className="flex-shrink-0 accent-[#09182a]"
              />
              {type || "All Types"}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-[22px]">
        <p className="mb-2.5 text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#9a9490]">BUDGET (PER YEAR)</p>
        <select
          id="lsMaxRent"
          value={filters.budget}
          onChange={(event) => setFilters({ ...filters, budget: event.target.value })}
          className="w-full cursor-pointer rounded-[9px] border border-[#e0ddd9] bg-white px-3 py-[9px] font-manrope text-[13px] font-semibold text-[#09182a] outline-none"
        >
          <option value="">Any budget</option>
          {BUDGET_RANGES.map((range) => (
            <option key={range.key} value={range.key}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-[22px]">
        <p className="mb-2.5 text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#9a9490]">AMENITIES</p>
        <div className="flex flex-col gap-[7px]">
          {AMENITY_OPTIONS.map((amenity) => (
            <label
              key={amenity}
              className="flex cursor-pointer items-center gap-[9px] text-[13px] font-semibold leading-[1.3] text-[#09182a]"
            >
              <input
                type="checkbox"
                name="amenity"
                value={amenity}
                checked={filters.amenities.includes(amenity)}
                onChange={() => toggleIn("amenities", amenity)}
                className="flex-shrink-0 accent-[#09182a]"
              />
              {amenity}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-[22px]">
        <div className="flex items-center justify-between text-[13px] font-semibold text-[#09182a]">
          <span>Verified Only</span>
          <label className="relative inline-block h-[22px] w-10">
            <input
              type="checkbox"
              id="lsVerifiedOnly"
              checked={filters.verifiedOnly}
              onChange={(event) => setFilters({ ...filters, verifiedOnly: event.target.checked })}
              className="peer h-0 w-0 opacity-0"
            />
            <span className="absolute inset-0 cursor-pointer rounded-[22px] bg-[#d5cec7] transition-colors duration-200 after:absolute after:left-[3px] after:top-[3px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform after:duration-200 peer-checked:bg-[#15935f] peer-checked:after:translate-x-[18px]" />
          </label>
        </div>
        <div className="mt-3 flex items-center justify-between text-[13px] font-semibold text-[#09182a]">
          <span>Pay Monthly</span>
          <label className="relative inline-block h-[22px] w-10">
            <input
              type="checkbox"
              id="lsMonthlyOnly"
              checked={filters.monthlyOnly}
              onChange={(event) => setFilters({ ...filters, monthlyOnly: event.target.checked })}
              className="peer h-0 w-0 opacity-0"
            />
            <span className="absolute inset-0 cursor-pointer rounded-[22px] bg-[#d5cec7] transition-colors duration-200 after:absolute after:left-[3px] after:top-[3px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform after:duration-200 peer-checked:bg-[#15935f] peer-checked:after:translate-x-[18px]" />
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={onApply}
        className="mt-2 w-full cursor-pointer rounded-[11px] border-none bg-[#09182a] p-3 font-manrope text-[13px] font-extrabold text-white transition-opacity duration-200 hover:opacity-85"
      >
        Apply Filters
      </button>
    </aside>
  );
}

/* ── Listing card (was listings.js render() card markup) ── */
function ListingCardView({
  listing,
  isSaved,
  isFavPending,
  onToggleFavourite,
}: {
  listing: Listing;
  isSaved: boolean;
  isFavPending: boolean;
  onToggleFavourite: (id: string) => void;
}) {
  /* Enquiries go to the Property Warehouse team, not the landlord (MoM 15 Sep 2026). */
  const waHref = teamWhatsAppHref(listing);

  return (
    <div
      onClick={() => {
        window.location.href = "/listing/" + listing.id;
      }}
      className="group cursor-pointer overflow-hidden rounded-[18px] border border-[#e8e5de] bg-white shadow-[0_1px_4px_rgba(13,27,42,0.04)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(13,27,42,0.1)]"
    >
      <div className="relative h-[200px] overflow-hidden">
        <img
          src={listing.images[0]}
          alt={listing.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[400ms] group-hover:scale-[1.04]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {listing.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-[20px] bg-[#a97e4b] px-2.5 py-1 text-[11px] font-extrabold leading-none text-white">
              &#x1F6E1; Verified
            </span>
          )}
          {listing.isMonthly && (
            <span className="inline-flex items-center gap-1 rounded-[20px] bg-[#15935f] px-2.5 py-1 text-[11px] font-extrabold leading-none text-white">
              &#x1F4C5; Monthly
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-[20px] bg-[rgba(9,24,42,0.65)] px-[9px] py-1 text-[11px] font-bold text-[rgba(255,255,255,0.85)] backdrop-blur-[4px]">
          <EyeIcon className="h-3 w-3 stroke-2" />
          {listing.views}
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavourite(listing.id);
          }}
          disabled={isFavPending}
          aria-label={isSaved ? "Remove from saved" : "Save listing"}
          className={`absolute bottom-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-[rgba(255,255,255,0.92)] p-0 text-[#5d6876] transition-[transform,color] duration-150 hover:scale-[1.08] disabled:cursor-not-allowed disabled:opacity-60 ${
            isSaved ? "text-[#e53e3e] [&>svg]:fill-current" : ""
          }`}
        >
          <HeartIcon className="size-4 stroke-2" />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-[5px] text-[15px] font-extrabold leading-[1.3] text-[#09182a]">{listing.title}</div>
        <div className="mb-2.5 flex items-center gap-1 text-[12px] text-[#5d6876]">
          <LocationIcon className="size-3 stroke-2" />
          {listing.area}, Lagos
        </div>
        <div className="mb-3 flex gap-3.5 text-[12px] font-semibold text-[#5d6876]">
          <span className="flex items-center gap-1">
            <BedIcon />
            {listing.beds} bed{listing.beds > 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <BathIcon />
            {listing.baths} bath{listing.baths > 1 ? "s" : ""}
          </span>
          <span>{listing.type}</span>
        </div>

        <div className="flex items-end justify-between border-t border-[#f0eeeb] pt-3">
          <div>
            <div className="font-cormorant text-[22px] font-bold leading-none text-[#09182a]">
              {naira(listing.rentPerYear)}
              <span className="font-manrope text-[13px] font-semibold text-[#5d6876]">/yr</span>
            </div>
            <div className="mt-[3px] text-[11px] text-[#5d6876]">
              Move-in: <strong className="text-[#a97e4b]">{naira(listing.totalMoveIn)}</strong>
            </div>
          </div>
          <Link
            href={`/listing/${listing.id}`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex cursor-pointer items-center gap-[5px] whitespace-nowrap rounded-[9px] border-none bg-[#a97e4b] px-3.5 py-2 font-manrope text-[12px] font-extrabold text-white no-underline transition-opacity duration-200 hover:opacity-85"
          >
            View Details
            <ArrowIcon className="h-[13px] w-[13px] stroke-[2.5]" />
          </Link>
        </div>

        <div
          onClick={(event) => event.stopPropagation()}
          className="mt-3 flex flex-wrap gap-2 max-[480px]:flex-col"
        >
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => {
              event.stopPropagation();
              recordInquiry(listing.id);
            }}
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#25D366] px-[13px] py-2 font-manrope text-[12px] font-bold text-white no-underline transition-opacity duration-200 hover:opacity-85"
          >
            <WhatsAppIcon /> Chat on WhatsApp
          </a>
        </div>
      </div>

    </div>
  );
}

/* ── Page ── */
export default function ListingsPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);

  const [response, setResponse] = useState<ResponseState | null>(null);
  const [resultCount, setResultCount] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [pendingFav, setPendingFav] = useState<Set<string>>(new Set());

  const bodyRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const urlQueryRef = useRef<string | null>(null);
  const hasUserQueryRef = useRef(false);

  /* Everything that identifies one request. Response state is tagged with this key so the
     loading/error/data values are derived from it instead of being reset inside the effect. */
  const queryKey = JSON.stringify({ filters, sort, page, reload });
  const current = response?.key === queryKey ? response : null;
  const data = current?.data ?? null;
  const error = current?.error ?? null;
  const loading = !current;

  /* Heart-button state for every card on the page — fetched once (not per card, not per re-render)
     and kept in sync locally as the tenant saves/unsaves. Empty for logged-out visitors and
     landlords, who simply see every heart unfilled. */
  useEffect(() => {
    let cancelled = false;
    getSharedSession().then(async ({ user: sessionUser }) => {
      if (cancelled) return;
      if (!sessionUser || sessionUser.role !== "tenant") return;
      const ids = await getFavouriteIds();
      if (!cancelled) setFavouriteIds(ids);
    });
    return () => {
      cancelled = true;
    };
  }, [getSharedSession]);

  /* Init: seed the search box from ?q= (was listings.js DOMContentLoaded). The input is
     uncontrolled, exactly as it was a plain DOM field read via .value, so the URL's query
     is written straight into the element and stashed for the first request. */
  useEffect(() => {
    const url = new URLSearchParams(window.location.search);
    /* Filters from the homepage hero search (?lga=&type=&budget=). */
    const area = url.get("area");
    const lga = url.get("lga");
    const type = url.get("type");
    const budget = budgetByKey(url.get("budget")) ? url.get("budget") : null;
    if (area || lga || type || budget) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the URL on mount
      setFilters((current) => ({
        ...current,
        lga: lga ?? current.lga,
        areas: area ? [area] : current.areas,
        type: type ?? current.type,
        budget: budget ?? current.budget,
      }));
    }
    const q = url.get("q");
    if (!q) return;
    if (searchRef.current) searchRef.current.value = q;
    urlQueryRef.current = q;
  }, []);

  /* Fetches the current filter/sort/page state from the backend. Used for the initial load,
     every filter change, and as the "Retry" action on failure. */
  useEffect(() => {
    let cancelled = false;

    /* Builds the same querystring the backend's GET /api/listings expects — area/type/amenities
       are comma-separated lists, matching splitCsv() server-side. Until the visitor searches or
       filters, the query from the page's own ?q= keeps driving the request. */
    const q = hasUserQueryRef.current ? filters.q : (urlQueryRef.current ?? filters.q);
    const params = new URLSearchParams();
    if (filters.areas.length) params.set("area", filters.areas.join(","));
    if (filters.lga) params.set("lga", filters.lga);
    if (filters.type) params.set("type", filters.type);
    applyBudget(params, filters.budget);
    if (filters.amenities.length) params.set("amenities", filters.amenities.join(","));
    if (filters.verifiedOnly) params.set("verifiedOnly", "true");
    if (filters.monthlyOnly) params.set("monthlyOnly", "true");
    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", String(PER_PAGE));

    api<ListingsResponse>("/api/listings?" + params.toString())
      .then((result) => {
        if (cancelled) return;
        setResultCount(`${result.total} propert${result.total === 1 ? "y" : "ies"} found`);
        setResponse({ key: queryKey, data: result, error: null });
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setResponse({
          key: queryKey,
          data: null,
          error: reason instanceof TypeError ? "network" : "server",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [queryKey, filters, sort, page]);

  const applyFilters = useCallback(() => {
    hasUserQueryRef.current = true;
    setPage(1);
    setFilters((current) => ({ ...current, q: searchRef.current?.value.trim() ?? "" }));
  }, []);

  const clearFilters = useCallback(() => {
    hasUserQueryRef.current = true;
    if (searchRef.current) searchRef.current.value = "";
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);

  /* Clicking anywhere outside the open mobile filter drawer closes it (was the document-level
     click listener in listings.js). */
  const sidebarRef = useRef<HTMLElement>(null);
  const filterToggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!sidebarOpen) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (sidebarRef.current?.contains(target) || filterToggleRef.current?.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [sidebarOpen]);

  const applyAndClose = useCallback(() => {
    applyFilters();
    setSidebarOpen(false);
  }, [applyFilters]);

  const goPage = useCallback((next: number) => {
    setPage(next);
    requestAnimationFrame(() => {
      if (bodyRef.current) {
        window.scrollTo({ top: bodyRef.current.offsetTop - 80, behavior: "smooth" });
      }
    });
  }, []);

  const toggleFavourite = useCallback(
    async (id: string) => {
      setPendingFav((current) => new Set(current).add(id));

      const { user: sessionUser } = await getSharedSession();
      if (!sessionUser || sessionUser.role !== "tenant") {
        setPendingFav((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
        alert("Please log in as a tenant to save listings.");
        window.location.href = "/auth";
        return;
      }

      const wasSaved = favouriteIds.has(id);

      try {
        if (wasSaved) await unsaveFavourite(id);
        else await saveFavourite(id);
      } catch (reason: unknown) {
        setPendingFav((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
        alert(
          reason instanceof TypeError
            ? "Couldn't reach the server. Please try again."
            : "Something went wrong. Please try again.",
        );
        return;
      }

      setFavouriteIds((current) => {
        const next = new Set(current);
        if (wasSaved) next.delete(id);
        else next.add(id);
        return next;
      });
      setPendingFav((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    },
    [favouriteIds, getSharedSession],
  );

  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const count = resultCount ?? "Loading properties...";

  return (
    <main className="min-h-screen bg-[#f6f4f1]">
      <SiteHeader />

      {/* ═══ PAGE HERO ═══ */}
      <section className="relative flex min-h-[300px] items-end overflow-hidden pb-9 max-[900px]:min-h-[260px]">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=80&fit=crop"
            alt=""
            className="h-full w-full object-cover object-[center_45%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,24,42,0.72)_0%,rgba(9,24,42,0.85)_100%)]" />
        </div>
        <div className="relative z-[2] w-full px-5 min-[901px]:px-10">
          <p className="mb-2.5 inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.5px] text-[rgba(255,255,255,0.55)]">
            <HomeIcon className="size-[14px] stroke-2" />
            Browse all properties
          </p>
          <h1 className="mb-2 font-cormorant text-[clamp(34px,5vw,54px)] font-bold leading-[1.05] tracking-[-0.02em] text-white max-[480px]:text-[30px]">
            Lagos Listings
          </h1>
          <p className="mb-[22px] text-[14px] text-[rgba(255,255,255,0.65)]">
            Verified homes directly from landlords. No agents. No hidden fees.
          </p>

          <div className="max-w-[640px]">
            <div className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-[rgba(255,255,255,0.22)] bg-[rgba(255,255,255,0.12)] py-1.5 pl-4 pr-1.5">
              <span className="flex-shrink-0 text-[rgba(255,255,255,0.5)]">
                <SearchIcon className="size-[18px] stroke-2" />
              </span>
              <input
                type="text"
                id="lsSearchInput"
                ref={searchRef}
                onKeyDown={(event) => {
                  if (event.key === "Enter") applyFilters();
                }}
                placeholder="Search by area, type, or keyword..."
                className="min-w-0 flex-1 border-none bg-none font-manrope text-[14px] text-white outline-none placeholder:text-[rgba(255,255,255,0.45)]"
              />
              <button
                type="button"
                onClick={applyFilters}
                className="cursor-pointer whitespace-nowrap rounded-[9px] border-none bg-[#a97e4b] px-5 py-2.5 text-[13px] font-extrabold text-white transition-opacity duration-200 hover:opacity-85"
              >
                Search
              </button>
            </div>
            <p id="lsResultCount" className="mt-2.5 text-[12px] text-[rgba(255,255,255,0.45)]">
              {count}
            </p>
          </div>
        </div>
      </section>

      {/* ═══ MAIN BODY ═══ */}
      <div
        ref={bodyRef}
        className="mx-auto grid max-w-[1280px] grid-cols-[280px_1fr] grid-rows-[auto_1fr] gap-x-7 px-5 pb-[60px] pt-7 min-[901px]:px-10 max-[900px]:grid-cols-1 max-[900px]:p-4 max-[900px]:pb-12"
      >
        {/* Mobile filter toggle */}
        <div className="col-span-full mb-3 hidden items-center justify-between max-[900px]:flex">
          <button
            ref={filterToggleRef}
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            className="flex cursor-pointer items-center gap-[7px] rounded-[10px] border border-[#e0ddd9] bg-white px-4 py-[9px] font-manrope text-[13px] font-bold text-[#09182a]"
          >
            <FilterIcon />
            Show Filters
          </button>
          <SortSelect
            id="lsSortSelect"
            value={sort}
            onChange={(value) => {
              setSort(value);
              setPage(1);
            }}
            className=""
          />
        </div>

        <Sidebar
          filters={filters}
          setFilters={setFilters}
          open={sidebarOpen}
          sidebarRef={sidebarRef}
          onApply={applyAndClose}
          onClear={clearFilters}
        />

        <div className="min-w-0">
          <div className="mb-[18px] flex items-center justify-between">
            <p id="lsCountText" className="text-[13px] font-semibold text-[#5d6876]">
              {count}
            </p>
            <SortSelect
              id="lsSortDesk"
              value={sort}
              onChange={(value) => {
                setSort(value);
                setPage(1);
              }}
              className="hidden min-[901px]:block"
            />
          </div>

          <div id="lsGrid" className="grid grid-cols-2 gap-5 max-[900px]:grid-cols-1">
            {loading && (
              <div className="col-span-full py-12 text-center font-bold text-[#5d6876]">Loading listings…</div>
            )}

            {!loading && error && (
              <div className="col-span-full py-12 text-center font-bold text-[#c0392b]">
                {error === "network"
                  ? "Couldn't reach the server. Check your connection and try again."
                  : "Something went wrong loading listings."}
                <button
                  onClick={() => setReload((value) => value + 1)}
                  className="mx-auto mt-3.5 block cursor-pointer rounded-lg border-none bg-[#a97e4b] px-[18px] py-2 font-inherit text-[inherit] font-extrabold text-white"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && data?.listings.map((listing) => (
              <ListingCardView
                key={listing.id}
                listing={listing}
                isSaved={favouriteIds.has(listing.id)}
                isFavPending={pendingFav.has(listing.id)}
                onToggleFavourite={toggleFavourite}
              />
            ))}
          </div>

          {!loading && !error && total === 0 && (
            <div id="lsEmpty" className="flex flex-col items-center gap-3 px-5 py-[60px] text-center">
              <SearchIcon className="size-12 text-[#c8c3bb] stroke-[1.5]" />
              <p className="text-[15px] font-semibold text-[#9a9490]">No properties match your filters.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="cursor-pointer border-none bg-none text-[13px] font-bold text-[#a97e4b] underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          <div id="lsPagination" className="mt-9 flex flex-wrap items-center justify-center gap-1.5">
            {!loading && !error && data && totalPages > 1 && (
              <>
                <button
                  type="button"
                  disabled={data.page === 1}
                  onClick={() => goPage(data.page - 1)}
                  className="min-w-9 cursor-pointer rounded-[9px] border border-[#e0ddd9] bg-white px-2.5 font-manrope text-[13px] font-bold text-[#09182a] transition-[background-color,color,border-color] duration-150 hover:bg-[#f0eeeb] disabled:cursor-default disabled:opacity-40"
                >
                  &#x2190; Prev
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((index) => {
                  const current = data.page;
                  const collapsed =
                    totalPages > 6 && index > 2 && index < totalPages - 1 && Math.abs(index - current) > 1;
                  if (collapsed) {
                    if (index === 3 || index === totalPages - 2) {
                      return (
                        <span key={index} className="px-1 text-[13px] text-[#9a9490]">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => goPage(index)}
                      className={`min-w-9 cursor-pointer rounded-[9px] border px-2.5 font-manrope text-[13px] font-bold transition-[background-color,color,border-color] duration-150 ${
                        index === current
                          ? "border-[#09182a] bg-[#09182a] text-white"
                          : "border-[#e0ddd9] bg-white text-[#09182a] hover:bg-[#f0eeeb]"
                      }`}
                    >
                      {index}
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled={data.page === totalPages}
                  onClick={() => goPage(data.page + 1)}
                  className="min-w-9 cursor-pointer rounded-[9px] border border-[#e0ddd9] bg-white px-2.5 font-manrope text-[13px] font-bold text-[#09182a] transition-[background-color,color,border-color] duration-150 hover:bg-[#f0eeeb] disabled:cursor-default disabled:opacity-40"
                >
                  Next &#x2192;
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
