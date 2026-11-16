"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, Listing, naira } from "../../lib/api";
import { getFavouriteIds, saveFavourite, unsaveFavourite } from "../../lib/favourites";
import { getSharedSession, type SessionUser } from "../../lib/auth";
import SiteHeader from "../../components/site-header";
import {
    ArrowLeftIcon,
    BathIcon,
    BedIcon,
    EyeIcon,
    HeartIcon,
    LocationIcon,
    MessageIcon,
    WhatsAppIcon,
} from "../../components/icons";

const AMENITY_ICONS: Record<string, string> = {
  Water: "💧",
  Parking: "🚗",
  Security: "🔒",
  Generator: "⚡",
  AC: "❄️",
  Lift: "🛗",
};

const INCOME_MAP: Record<string, number> = {
  below50: 600000,
  "50to150": 1200000,
  "150to300": 2700000,
  above300: 4500000,
};

type DetailListing = Listing & {
  landlordSince?: string;
  landlordListings?: number;
  landlordVerified?: boolean;
};

/* ── Shared helpers (was listings-data.js) ── */
function getInquiries() {
  return JSON.parse(localStorage.getItem("pw_inquiries") || "[]");
}

function addInquiry(inquiry: Record<string, unknown>) {
  const list = getInquiries();
  list.unshift({ ...inquiry, sentAt: new Date().toISOString() });
  if (list.length > 50) list.length = 50;
  localStorage.setItem("pw_inquiries", JSON.stringify(list));
}

/* ── Inline chatbox (was listing-detail.js pwToggleDetailChat/pwSubmitDetailInquiry) ── */
function DetailChat({
  listing,
  user,
  isOpen,
  onToggle,
}: {
  listing: DetailListing;
  user: SessionUser | null;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  /* Prefill the name/phone from the session every time the panel opens — mirrors the legacy
     pwToggleDetailChat(), which awaited the shared session promise on open. Done during render
     (rather than in an effect) because it is a straight adjustment of state to a prop change. */
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen && user) {
      setName(`${user.firstName || ""} ${user.lastName || ""}`.trim());
      setPhone(user.phone || "");
    }
  }

  const submit = () => {
    if (!name.trim() || !phone.trim() || !message.trim()) {
      alert("Please fill in your name, phone number, and a message.");
      return;
    }

    addInquiry({
      listingId: listing.id,
      listingTitle: listing.title,
      landlordName: listing.landlordName,
      area: listing.area,
      senderName: name.trim(),
      senderPhone: phone.trim(),
      message: message.trim(),
    });

    setSuccess("✅ Message sent! The landlord will contact you shortly.");

    setTimeout(function () {
      onToggle();
      setSuccess("");
      setName("");
      setPhone("");
      setMessage("");
    }, 3000);
  };

  return (
    <div
      className={`mt-2.5 max-h-0 overflow-hidden rounded-[12px] border border-[#ede9e3] border-t-[1px] bg-[#f9f8f6] transition-[max-height,padding] duration-300 ease-in-out ${
        isOpen ? "max-h-[420px] py-4" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-manrope text-[13px] font-extrabold text-[#0a1628]">Message {listing.landlordName}</span>
        <button
          type="button"
          onClick={onToggle}
          aria-label="Close chatbox"
          className="cursor-pointer rounded-[6px] border-none bg-none px-1.5 py-0.5 text-[20px] leading-none text-[#9a9490] transition-colors duration-150 hover:bg-[#edeae5] hover:text-[#0a1628]"
        >
          &times;
        </button>
      </div>
      <div className="mb-2.5 flex flex-col gap-2">
        <input
          id="pwDetName"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          className="w-full box-border rounded-[9px] border-[1.5px] border-[#dedad5] bg-white px-3 py-[9px] font-manrope text-[13px] text-[#0a1628] outline-none transition-colors duration-200 placeholder:text-[#b5b0aa] focus:border-[#c9a84c]"
        />
        <input
          id="pwDetPhone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Your phone number"
          className="w-full box-border rounded-[9px] border-[1.5px] border-[#dedad5] bg-white px-3 py-[9px] font-manrope text-[13px] text-[#0a1628] outline-none transition-colors duration-200 placeholder:text-[#b5b0aa] focus:border-[#c9a84c]"
        />
        <textarea
          id="pwDetMsg"
          rows={3}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Hi, I'm interested in this property..."
          className="w-full box-border resize-y rounded-[9px] border-[1.5px] border-[#dedad5] bg-white px-3 py-[9px] font-manrope text-[13px] text-[#0a1628] outline-none transition-colors duration-200 placeholder:text-[#b5b0aa] focus:border-[#c9a84c]"
        />
      </div>
      <button
        type="button"
        onClick={submit}
        className="mb-1.5 w-full cursor-pointer rounded-[10px] border-none bg-[#0a1628] p-[11px] font-manrope text-[13px] font-extrabold text-white transition-opacity duration-200 hover:opacity-85"
      >
        Send Message
      </button>
      <div id="pwDetSucc" className="min-h-5 text-center font-manrope text-[13px] font-bold text-[#15935f]">
        {success}
      </div>
    </div>
  );
}

/* ── Page ── */
export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [listing, setListing] = useState<DetailListing | null>(null);
  const [similar, setSimilar] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"network" | "server" | null>(null);
  const [retry, setRetry] = useState(0);

  const [user, setUser] = useState<SessionUser | null>(null);
  const [saved, setSaved] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [income, setIncome] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [waSuccess, setWaSuccess] = useState(false);

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  useEffect(() => {
    document.title = "Property Detail — Property Warehouse";
  }, []);

  useEffect(() => {
    if (!id) {
      window.location.href = "/listings";
      return;
    }

    let cancelled = false;

    const run = async () => {
      let listingData: DetailListing;
      try {
        listingData = (await api<{ listing: DetailListing }>(`/api/listings/${encodeURIComponent(id)}`)).listing;
      } catch (reason: unknown) {
        if (cancelled) return;
        setError(reason instanceof TypeError ? "network" : "server");
        setLoading(false);
        return;
      }

      // Best-effort view increment — a failure here shouldn't block viewing the listing
      // (falls back to the count already on `listingData`).
      try {
        const view = await api<{ views: number }>(`/api/listings/${encodeURIComponent(id)}/view`, { method: "POST" });
        if (typeof view.views === "number") listingData.views = view.views;
      } catch {
        /* ignore */
      }

      let similarListings: Listing[] = [];
      try {
        similarListings = (await api<{ listings: Listing[] }>(`/api/listings/${encodeURIComponent(id)}/similar`)).listings;
      } catch {
        /* ignore */
      }

      const { user: sessionUser } = await getSharedSession();
      const favIds =
        sessionUser && sessionUser.role === "tenant"
          ? await getFavouriteIds().catch(() => new Set<string>())
          : new Set<string>();

      if (cancelled) return;
      setListing(listingData);
      setSimilar(similarListings);
      setSaved(favIds.has(listingData.id));
      setUser(sessionUser);
      setLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [id, retry, getSharedSession]);

  const retryLoad = useCallback(() => {
    setLoading(true);
    setError(null);
    setActiveImage(0);
    setRetry((value) => value + 1);
  }, []);

  const toggleSaved = useCallback(async () => {
    if (!listing) return;
    setSavePending(true);

    const { user: sessionUser } = await getSharedSession();
    if (!sessionUser || sessionUser.role !== "tenant") {
      setSavePending(false);
      alert("Please log in as a tenant to save listings.");
      window.location.href = "/auth";
      return;
    }

    try {
      if (saved) await unsaveFavourite(listing.id);
      else await saveFavourite(listing.id);
    } catch (reason: unknown) {
      setSavePending(false);
      alert(
        reason instanceof TypeError
          ? "Couldn't reach the server. Please try again."
          : "Something went wrong. Please try again.",
      );
      return;
    }

    setSaved((current) => !current);
    setSavePending(false);
  }, [listing, saved, getSharedSession]);

  const trackInquiry = useCallback(() => {
    if (!listing) return;
    try {
      addInquiry({
        listingId: listing.id,
        listingTitle: listing.title,
        area: listing.area,
        rentPerYear: listing.rentPerYear,
        landlordName: listing.landlordName,
        landlordWhatsApp: listing.landlordWhatsApp,
        tenantName: contactName.trim(),
        tenantPhone: contactPhone.trim(),
      });
    } catch {
      /* ignore */
    }
  }, [listing, contactName, contactPhone]);

  if (!id) {
    return (
      <main className="min-h-screen bg-[#f6f4f1] font-manrope text-[#09182a]">
        <SiteHeader />
        <div className="mx-auto max-w-[1180px] px-5 pb-[60px] pt-8 min-[961px]:px-10">
          <div className="py-20 text-center px-5 text-[14px] font-semibold text-[#5d6876]">
            Loading property details...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f6f4f1] font-manrope text-[#09182a]">
        <SiteHeader />
        <div className="flex items-center justify-between gap-2.5 border-b border-[#e8e5de] bg-white px-5 py-3.5 min-[961px]:px-10">
          <Link
            href="/listings"
            className="inline-flex items-center gap-[7px] text-[13px] font-bold text-[#09182a] no-underline transition-colors duration-200 hover:text-[#a97e4b]"
          >
            <ArrowLeftIcon />
            Back to Listings
          </Link>
        </div>
        <div className="mx-auto max-w-[1180px] px-5 pb-[60px] pt-8 min-[961px]:px-10">
          <div className="px-5 py-20 text-center text-[14px] font-bold text-[#c0392b]">
            {error === "network"
              ? "Couldn't reach the server. Check your connection and try again."
              : "Something went wrong loading this property."}
            <button
              onClick={retryLoad}
              className="mx-auto mt-3.5 block cursor-pointer rounded-lg border-none bg-[#a97e4b] px-[18px] py-2 font-inherit text-[inherit] font-extrabold text-white"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (loading || !listing) {
    return (
      <main className="min-h-screen bg-[#f6f4f1] font-manrope text-[#09182a]">
        <SiteHeader />
        <div className="flex items-center justify-between gap-2.5 border-b border-[#e8e5de] bg-white px-5 py-3.5 min-[961px]:px-10">
          <Link
            href="/listings"
            className="inline-flex items-center gap-[7px] text-[13px] font-bold text-[#09182a] no-underline transition-colors duration-200 hover:text-[#a97e4b]"
          >
            <ArrowLeftIcon />
            Back to Listings
          </Link>
          <span className="text-[14px] text-[#c8c3bb]">&rang;</span>
          <span className="text-[13px] font-semibold text-[#5d6876]">Loading...</span>
        </div>
        <div id="ldetBody" className="mx-auto max-w-[1180px] px-5 pb-[60px] pt-8 min-[961px]:px-10">
          <div className="py-20 text-center px-5 text-[14px] font-semibold text-[#5d6876]">
            Loading property details...
          </div>
        </div>
      </main>
    );
  }

  const l = listing;
  const monthlyAmt = Math.round(l.rentPerYear / 12);

  const contactWaHref =
    "https://wa.me/" +
    l.landlordWhatsApp +
    "?text=" +
    encodeURIComponent(
      "Hello " + l.landlordName + ", I am interested in " + l.title + " at " + l.address + ".",
    );

  const genericWaHref =
    "https://wa.me/" +
    l.landlordWhatsApp +
    "?text=" +
    encodeURIComponent(
      'Hello, I am interested in your property "' + l.title + '" listed on Property Warehouse.',
    );

  let calcTone: "green" | "yellow" | "red" | null = null;
  let calcHtml = "";
  if (income) {
    const ratio = l.rentPerYear / INCOME_MAP[income];
    if (ratio <= 0.3) {
      calcTone = "green";
      calcHtml = "✅ <strong>Affordable</strong> — This rent is within 30% of your estimated income. A healthy range.";
    } else if (ratio <= 0.5) {
      calcTone = "yellow";
      calcHtml =
        "⚠️ <strong>You'll feel stretched</strong> — This rent takes 30–50% of your income. Manage expenses carefully.";
    } else {
      calcTone = "red";
      calcHtml =
        "🚨 <strong>High Burden</strong> — This rent exceeds 50% of your estimated income. Consider lower-priced options.";
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f4f1] font-manrope text-[#09182a]">
      <SiteHeader />

      {/* ═══ BREADCRUMB ═══ */}
      <div className="flex items-center gap-2.5 border-b border-[#e8e5de] bg-white px-5 py-3.5 min-[961px]:px-10">
        <Link
          href="/listings"
          className="inline-flex items-center gap-[7px] text-[13px] font-bold text-[#09182a] no-underline transition-colors duration-200 hover:text-[#a97e4b]"
        >
          <ArrowLeftIcon />
          Back to Listings
        </Link>
        <span className="text-[14px] text-[#c8c3bb]">&rang;</span>
        <span id="ldetBcTitle" className="text-[13px] font-semibold text-[#5d6876]">
          {l.title}
        </span>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div id="ldetBody" className="mx-auto max-w-[1180px] px-5 pb-[60px] pt-8 min-[961px]:px-10">
        <div className="grid grid-cols-[1fr_380px] items-start gap-7 max-[960px]:grid-cols-1">
          {/* LEFT */}
          <div className="flex flex-col gap-5">
            {/* Gallery */}
            <div>
              <img
                id="ldetMainImg"
                src={l.images[activeImage]}
                alt={l.title}
                className="mb-2.5 block h-[400px] w-full rounded-[18px] object-cover max-[560px]:h-[240px]"
              />
              <div className="flex gap-2">
                {l.images.map((image, index) => (
                  <img
                    key={image}
                    src={image}
                    alt={`Photo ${index + 1}`}
                    onClick={() => setActiveImage(index)}
                    className={`h-[76px] flex-1 cursor-pointer rounded-[10px] border-[3px] object-cover transition-colors duration-200 hover:border-[#a97e4b] ${
                      index === activeImage ? "border-[#a97e4b]" : "border-transparent"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Property Info */}
            <div className="rounded-[18px] border border-[#e8e5de] bg-white p-6 shadow-[0_1px_4px_rgba(13,27,42,0.04)]">
              <div className="mb-3.5 flex flex-wrap gap-2">
                {l.isVerified && (
                  <span className="inline-flex items-center gap-[5px] rounded-[20px] bg-[#a97e4b] px-3 py-[5px] text-[12px] font-extrabold text-white">
                    🛡️ Verified
                  </span>
                )}
                {l.isMonthly && (
                  <span className="inline-flex items-center gap-[5px] rounded-[20px] bg-[#15935f] px-3 py-[5px] text-[12px] font-extrabold text-white">
                    📅 Pay Monthly
                  </span>
                )}
                <span className="inline-flex items-center gap-[5px] rounded-[20px] bg-[#f0eeeb] px-3 py-[5px] text-[12px] font-extrabold text-[#5d6876]">
                  {l.type}
                </span>
              </div>
              <h1 className="mb-2 font-cormorant text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-[#09182a] max-[560px]:text-[22px]">
                {l.title}
              </h1>
              <div className="mb-3.5 flex items-center gap-1.5 text-[13px] text-[#5d6876]">
                <LocationIcon className="size-[14px] stroke-2" />
                {l.address}
              </div>
              <div className="mb-4 flex gap-5 border-y border-[#f0eeeb] py-3">
                <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#09182a]">
                  <span className="text-[#5d6876]">
                    <BedIcon className="size-4 stroke-2" />
                  </span>
                  {l.beds} Bedroom{l.beds > 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#09182a]">
                  <span className="text-[#5d6876]">
                    <BathIcon className="size-4 stroke-2" />
                  </span>
                  {l.baths} Bathroom{l.baths > 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#09182a]">
                  <span className="text-[#5d6876]">
                    <EyeIcon className="size-4 stroke-2" />
                  </span>
                  {l.views} views
                </div>
              </div>
              <p className="text-[14px] leading-[1.75] text-[#5d6876]">{l.description}</p>
            </div>

            {/* Amenities */}
            <div className="rounded-[18px] border border-[#e8e5de] bg-white p-6 shadow-[0_1px_4px_rgba(13,27,42,0.04)]">
              <h3 className="mb-3.5 text-[13px] font-extrabold uppercase tracking-[0.5px] text-[#09182a]">
                Amenities
              </h3>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {l.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-1.5 rounded-[20px] border border-[#e8e5de] bg-[#f6f4f1] px-3.5 py-2 text-[13px] font-bold text-[#09182a]"
                  >
                    {AMENITY_ICONS[amenity] || "✓"} {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="rounded-[18px] border-2 border-[#09182a] bg-white p-[22px]">
              <h3 className="mb-4 text-[12px] font-extrabold uppercase tracking-[1.5px] text-[#5d6876]">
                Price Breakdown
              </h3>
              <div className="flex items-center justify-between border-b border-[#f0eeeb] py-2 text-[14px]">
                <span className="font-semibold text-[#5d6876]">Annual Rent</span>
                <span className="font-extrabold text-[#09182a]">{naira(l.rentPerYear)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#f0eeeb] py-2 text-[14px]">
                <span className="font-semibold text-[#5d6876]">Caution Fee</span>
                <span className="font-extrabold text-[#09182a]">{naira(l.cautionFee)}</span>
              </div>
              <div className="flex items-center justify-between py-2 text-[14px]">
                <span className="font-semibold text-[#5d6876]">Service Charge</span>
                <span className="font-extrabold text-[#09182a]">{naira(l.serviceCharge)}</span>
              </div>
              <hr className="my-2 border-none border-t-2 border-dashed border-[#e0ddd9]" />
              <div className="flex items-center justify-between pt-3">
                <span className="text-[14px] font-extrabold text-[#09182a]">Total Move-in</span>
                <span className="font-cormorant text-[26px] font-bold text-[#a97e4b]">{naira(l.totalMoveIn)}</span>
              </div>
            </div>

            {/* Pay Monthly */}
            {l.isMonthly && (
              <div className="rounded-[18px] border-[1.5px] border-[#15935f] bg-[#e8f8f0] px-[22px] py-[18px]">
                <h4 className="mb-1.5 text-[14px] font-extrabold text-[#0f7a4f]">📅 Pay Monthly Option Available</h4>
                <p className="text-[13px] leading-[1.6] text-[#186645]">
                  Instead of {naira(l.rentPerYear)} upfront, pay{" "}
                  <span className="font-cormorant text-[22px] font-bold text-[#15935f]">{naira(monthlyAmt)}</span>/month
                  agreed directly with the landlord.
                </p>
              </div>
            )}

            {/* Rent Burden Calculator */}
            <div className="rounded-[18px] border border-[#e8e5de] bg-white p-6 shadow-[0_1px_4px_rgba(13,27,42,0.04)]">
              <h4 className="mb-3 text-[14px] font-extrabold text-[#09182a]">🧮 Can you afford this?</h4>
              <select
                id="ldetIncomeSelect"
                value={income}
                onChange={(event) => setIncome(event.target.value)}
                className="mb-3.5 w-full cursor-pointer rounded-[10px] border border-[#e0ddd9] bg-white px-3 py-2.5 font-manrope text-[13px] font-semibold text-[#09182a] outline-none"
              >
                <option value="">Select your monthly income range</option>
                <option value="below50">Below ₦50,000/month</option>
                <option value="50to150">₦50,000 – ₦150,000/month</option>
                <option value="150to300">₦150,000 – ₦300,000/month</option>
                <option value="above300">Above ₦300,000/month</option>
              </select>
              {calcHtml && calcTone && (
                <div
                  className={`rounded-[12px] p-3.5 text-[13px] font-bold leading-[1.5] ${
                    calcTone === "green"
                      ? "border border-[#a3d9bc] bg-[#e8f8f0] text-[#0f7a4f]"
                      : calcTone === "yellow"
                        ? "border border-[#f0d870] bg-[#fef9e7] text-[#8a6a00]"
                        : "border border-[#e8a09a] bg-[#fdecea] text-[#8b1c1c]"
                  }`}
                  dangerouslySetInnerHTML={{ __html: calcHtml }}
                />
              )}
            </div>

            {/* Contact Actions */}
            <div className="flex flex-wrap gap-2.5">
              <a
                href={genericWaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[12px] bg-[#25D366] px-3.5 py-[11px] font-manrope text-[13px] font-bold text-white no-underline transition-opacity duration-200 hover:opacity-85"
              >
                <WhatsAppIcon className="size-[14px]" />
                Chat on WhatsApp
              </a>
              <button
                type="button"
                onClick={() => setChatOpen((open) => !open)}
                className="inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[12px] border-none bg-[#0a1628] px-3.5 py-[11px] font-manrope text-[13px] font-bold text-white transition-opacity duration-200 hover:opacity-85"
              >
                <MessageIcon className="size-[14px] stroke-[2.2]" />
                Send Inquiry
              </button>
            </div>

            <DetailChat listing={l} user={user} isOpen={chatOpen} onToggle={() => setChatOpen((open) => !open)} />
          </div>

          {/* RIGHT */}
          <div className="sticky top-[84px] flex flex-col gap-5 max-[960px]:static">
            {/* Contact Card */}
            <div className="rounded-[18px] border-2 border-[#a97e4b] bg-white p-6">
              <button
                type="button"
                onClick={toggleSaved}
                disabled={savePending}
                className={`mb-3.5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border-[1.5px] bg-white px-4 py-[11px] font-manrope text-[13px] font-extrabold transition-all duration-200 ${
                  saved
                    ? "saved border-[#a97e4b] bg-[#fff8f1] text-[#a97e4b]"
                    : "border-[#e0ddd9] text-[#5d6876] hover:border-[#a97e4b] hover:text-[#a97e4b]"
                }`}
              >
                <span className={saved ? "fill-[#a97e4b] stroke-[#a97e4b]" : ""}>
                  <HeartIcon className="size-4 stroke-2" />
                </span>
                <span id="ldetSaveLbl">{saved ? "Saved" : "Save Property"}</span>
              </button>
              <h3 className="mb-1 text-[15px] font-extrabold text-[#09182a]">Interested in this property?</h3>
              <p className="mb-[18px] text-[13px] leading-[1.5] text-[#5d6876]">Message the landlord directly — no agents.</p>
              <div className="mb-3">
                <label
                  htmlFor="ldetName"
                  className="mb-[5px] block text-[11px] font-extrabold tracking-[0.5px] text-[#5d6876]"
                >
                  YOUR NAME
                </label>
                <input
                  id="ldetName"
                  type="text"
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  placeholder="e.g. Amaka Obi"
                  className="w-full rounded-[10px] border border-[#e0ddd9] px-3 py-2.5 font-manrope text-[13px] text-[#09182a] outline-none transition-colors duration-200 focus:border-[#a97e4b]"
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="ldetPhone"
                  className="mb-[5px] block text-[11px] font-extrabold tracking-[0.5px] text-[#5d6876]"
                >
                  YOUR PHONE
                </label>
                <input
                  id="ldetPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  placeholder="+234 ..."
                  className="w-full rounded-[10px] border border-[#e0ddd9] px-3 py-2.5 font-manrope text-[13px] text-[#09182a] outline-none transition-colors duration-200 focus:border-[#a97e4b]"
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="ldetMsg"
                  className="mb-[5px] block text-[11px] font-extrabold tracking-[0.5px] text-[#5d6876]"
                >
                  MESSAGE
                </label>
                <textarea
                  id="ldetMsg"
                  rows={3}
                  value={contactMessage}
                  onChange={(event) => setContactMessage(event.target.value)}
                  placeholder="Hello, I'm interested in this property..."
                  className="w-full resize-none rounded-[10px] border border-[#e0ddd9] px-3 py-2.5 font-manrope text-[13px] text-[#09182a] outline-none transition-colors duration-200 focus:border-[#a97e4b]"
                />
              </div>
              <a
                id="ldetWaBtn"
                href={contactWaHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackInquiry();
                  setTimeout(() => setWaSuccess(true), 400);
                }}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#25D366] px-3 py-[13px] font-manrope text-[14px] font-extrabold text-white no-underline transition-opacity duration-200 hover:opacity-88"
              >
                <WhatsAppIcon className="size-[18px]" />
                Contact via WhatsApp
              </a>
              <div
                id="ldetWaSuccess"
                className={`rounded-[12px] border border-[#a3d9bc] bg-[#e8f8f0] p-3.5 text-center text-[13px] font-bold text-[#0f7a4f] ${waSuccess ? "block" : "hidden"}`}
              >
                ✅ Opening WhatsApp — your message is ready to send!
              </div>
            </div>

            {/* Landlord Card */}
            <div className="rounded-[18px] border border-[#e8e5de] bg-white p-6 shadow-[0_1px_4px_rgba(13,27,42,0.04)]">
              {/* Listed By */}
              <div className="mb-3 text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#9a9490]">
                Listed By
              </div>
              <div className="mb-1 text-[16px] font-extrabold text-[#09182a]">{l.landlordName}</div>
              <div className="mb-2.5 text-[12px] leading-[1.7] text-[#5d6876]">
                Member since {l.landlordSince}
                <br />
                {l.landlordListings} active listing{l.landlordListings !== 1 ? "s" : ""}
              </div>
              {l.landlordVerified && (
                <span className="inline-flex items-center gap-[5px] rounded-[20px] bg-[#a97e4b] px-3 py-[5px] text-[11px] font-extrabold text-white">
                  🛡️ Verified Landlord
                </span>
              )}
            </div>

            {/* Similar Properties */}
            {similar.length > 0 && (
              <div>
                <div className="mb-3 text-[13px] font-extrabold uppercase tracking-[0.5px] text-[#09182a]">
                  Similar in {l.area}
                </div>
                <div className="flex flex-col gap-2.5">
                  {similar.map((s) => (
                    <Link
                      key={s.id}
                      href={`/listing/${s.id}`}
                      className="flex gap-3 rounded-[14px] border border-[#e8e5de] bg-white p-2.5 text-inherit no-underline transition-shadow duration-200 hover:shadow-[0_6px_20px_rgba(13,27,42,0.09)]"
                    >
                      <img src={s.images[0]} alt={s.title} className="h-[72px] w-[72px] flex-shrink-0 rounded-[10px] object-cover" />
                      <div className="flex flex-col justify-center gap-[3px]">
                        <div className="text-[13px] font-extrabold leading-[1.3] text-[#09182a]">{s.title}</div>
                        <div className="text-[11px] text-[#5d6876]">{s.area}</div>
                        <div className="text-[13px] font-bold text-[#a97e4b]">{naira(s.rentPerYear)}/yr</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
