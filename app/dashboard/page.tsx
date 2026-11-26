"use client";

/* Dashboard home for landlords and tenants.

   Every number and record on this page comes from the backend. The previous version shipped
   invented figures (revenue, occupancy, inquiry counts, named tenants, payments, inspections)
   that every real user saw as their own data — flagged as a launch blocker in the 31 Jul 2026
   meeting (issue #2) and removed the same way on main in commit 8e903da. Features with no
   backend yet (inspections, payments, applications) show an honest "coming soon" state. */

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, Listing, naira } from "../lib/api";
import { getCachedUser, getSharedSession, type SessionUser } from "../lib/auth";
import { teamWhatsAppHref } from "../lib/contact";
import {
  ArrowIcon,
  ClockIcon,
  DashboardHomeIcon,
  EyeIcon,
  MessageIcon,
  PlusIcon,
  ShieldIcon,
} from "../components/icons";

const FALLBACK_IMAGE = "/property-assets/IMG-20260512-WA0088.jpg";

export default function DashboardPage() {
  const [user, setUser] = useState<SessionUser | null>(() => getCachedUser());

  useEffect(() => {
    if (user) return;
    let active = true;
    getSharedSession().then(({ user: sessionUser }) => {
      if (active) setUser(sessionUser);
    });
    return () => {
      active = false;
    };
  }, [user]);

  if (!user) {
    return <p className="p-6 text-[13px] font-semibold text-[#5d6876]">Loading…</p>;
  }

  return user.role === "tenant" ? <TenantDashboard user={user} /> : <LandlordDashboard user={user} />;
}

/* ───────────────────────── LANDLORD ───────────────────────── */

function LandlordDashboard({ user }: { user: SessionUser }) {
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ listings: Listing[] }>("/api/landlord/listings")
      .then((data) => setListings(data.listings))
      .catch((reason: Error) => {
        setError(reason.message);
        setListings([]);
      });
  }, []);

  const all = listings ?? [];
  const active = all.filter((listing) => listing.status === "active").length;
  const pending = all.filter((listing) => listing.status === "pending").length;
  const totalViews = all.reduce((sum, listing) => sum + (listing.views || 0), 0);
  const mostViewed = all.reduce<Listing | null>(
    (best, listing) => (!best || (listing.views || 0) > (best.views || 0) ? listing : best),
    null,
  );
  const loading = listings === null;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 pb-10 pt-[22px] max-[860px]:px-[14px]">
      <Welcome
        name={user.firstName}
        subtitle="Here's what's happening with your properties."
        action={{ href: "/dashboard/listings/create", label: "Add listing" }}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<DashboardHomeIcon />} tone="blue" label="Active listings" value={loading ? "—" : active} />
        <StatCard icon={<ClockIcon />} tone="gold" label="Pending review" value={loading ? "—" : pending} />
        <StatCard icon={<EyeIcon />} tone="green" label="Total views" value={loading ? "—" : totalViews.toLocaleString()} />
        <StatCard icon={<DashboardHomeIcon />} tone="purple" label="All listings" value={loading ? "—" : all.length} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card title="My listings" link={{ href: "/dashboard/listings", label: "Manage" }}>
          {loading ? (
            <Muted>Loading your listings…</Muted>
          ) : error ? (
            <Muted>{error}</Muted>
          ) : !all.length ? (
            <Empty
              text="You haven't listed a property yet."
              action={{ href: "/dashboard/listings/create", label: "Create your first listing" }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="text-[10px] font-extrabold uppercase tracking-[.08em] text-[#5d6876]">
                    <th className="px-3 pb-2">Property</th>
                    <th className="px-3 pb-2">Area</th>
                    <th className="px-3 pb-2">Status</th>
                    <th className="px-3 pb-2 text-right">Views</th>
                    <th className="px-3 pb-2 text-right">Rent / yr</th>
                  </tr>
                </thead>
                <tbody>
                  {all.map((listing) => (
                    <ListingRow key={listing.id} listing={listing} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          <VerificationCard verified={user.isVerified} />

          <Card title="Most viewed property">
            {mostViewed && (mostViewed.views || 0) > 0 ? (
              <Link href={`/listing/${mostViewed.id}`} className="group block">
                <ListingThumb listing={mostViewed} className="h-[120px] w-full" />
                <div className="mt-2 text-[13px] font-extrabold group-hover:text-[#a97e4b]">{mostViewed.title}</div>
                <div className="text-[11px] font-semibold text-[#5d6876]">
                  {mostViewed.area} · {(mostViewed.views || 0).toLocaleString()} views
                </div>
              </Link>
            ) : (
              <Muted>Views will appear here once tenants start viewing your listings.</Muted>
            )}
          </Card>

          <Card title="Tenant enquiries">
            <p className="text-[12px] leading-[1.55] text-[#5d6876]">
              Tenants contact the Property Warehouse team on WhatsApp. We answer their questions and connect
              serious tenants with you.
            </p>
            <Link href="/dashboard/inquiries" className="mt-3 inline-flex items-center gap-1 text-[12px] font-extrabold text-[#15935f]">
              How enquiries work <ArrowIcon />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

function VerificationCard({ verified }: { verified: boolean }) {
  return (
    <div className="flex flex-col gap-[10px] rounded-[14px] bg-[#0d1f35] p-4 text-white">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-[rgba(21,147,95,.18)]">
        <ShieldIcon />
      </div>
      <strong className="text-[13px] font-extrabold">{verified ? "Verified Landlord" : "Verification pending"}</strong>
      <p className="text-[11px] font-medium leading-[1.5] text-white/[.6]">
        {verified
          ? "Your account is verified. Tenants see a verified badge on your listings."
          : "Our team reviews the ownership documents you upload with your listings. Once approved, your listings show a verified badge."}
      </p>
      <Link href="/dashboard/profile" className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#4ade97]">
        View profile <ArrowIcon />
      </Link>
    </div>
  );
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-[rgba(21,147,95,.1)] text-[#15935f]" },
  pending: { label: "Pending review", className: "bg-[rgba(169,126,75,.14)] text-[#8a6430]" },
  flagged: { label: "Flagged", className: "bg-[rgba(217,68,59,.1)] text-[#d9443b]" },
  rejected: { label: "Rejected", className: "bg-[rgba(217,68,59,.1)] text-[#d9443b]" },
};

function ListingRow({ listing }: { listing: Listing }) {
  const status = STATUS_STYLES[listing.status] ?? { label: listing.status, className: "bg-[#eef0f3] text-[#5d6876]" };
  return (
    <tr className="border-t border-[rgba(9,24,42,.06)] hover:bg-[#f8f9fb]">
      <td className="px-3 py-[10px]">
        <div className="flex items-center gap-[10px]">
          <ListingThumb listing={listing} className="h-9 w-10 shrink-0" />
          <Link href={`/listing/${listing.id}`} className="text-[12px] font-extrabold hover:text-[#a97e4b]">
            {listing.title || "Untitled"}
          </Link>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-[10px] text-[11px] font-semibold text-[#5d6876]">{listing.area || "—"}</td>
      <td className="px-3 py-[10px]">
        <span className={`inline-flex rounded-[5px] px-2 py-[3px] text-[10px] font-extrabold ${status.className}`}>{status.label}</span>
      </td>
      <td className="px-3 py-[10px] text-right text-[12px] font-bold">{(listing.views || 0).toLocaleString()}</td>
      <td className="whitespace-nowrap px-3 py-[10px] text-right text-[12px] font-bold">{naira(listing.rentPerYear || 0)}</td>
    </tr>
  );
}

/* ───────────────────────── TENANT ───────────────────────── */

function TenantDashboard({ user }: { user: SessionUser }) {
  const [saved, setSaved] = useState<Listing[] | null>(null);
  const [recommended, setRecommended] = useState<Listing[] | null>(null);

  useEffect(() => {
    api<{ listings: Listing[] }>("/api/favourites")
      .then((data) => setSaved(data.listings))
      .catch(() => setSaved([]));
  }, []);

  /* Newest listings, preferring the tenant's chosen area when it has any. */
  useEffect(() => {
    const newest = () => api<{ listings: Listing[] }>("/api/listings?sort=newest&limit=4");
    const inArea = user.area
      ? api<{ listings: Listing[] }>(`/api/listings?sort=newest&limit=4&area=${encodeURIComponent(user.area)}`)
      : Promise.resolve({ listings: [] as Listing[] });
    inArea
      .then((data) => (data.listings.length ? data : newest()))
      .then((data) => setRecommended(data.listings))
      .catch(() => setRecommended([]));
  }, [user.area]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 pb-10 pt-[22px] max-[860px]:px-[14px]">
      <Welcome
        name={user.firstName}
        subtitle="Find, save and enquire about homes across Lagos."
        action={{ href: "/listings", label: "Browse listings" }}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <Card title="Saved homes" link={{ href: "/dashboard/saved", label: "View all" }}>
            {saved === null ? (
              <Muted>Loading…</Muted>
            ) : !saved.length ? (
              <Empty text="No saved homes yet. Tap the heart on any listing to save it." action={{ href: "/listings", label: "Browse listings" }} />
            ) : (
              <ListingGrid listings={saved.slice(0, 3)} />
            )}
          </Card>

          <Card title={user.area ? `New listings for you` : "New listings"} link={{ href: "/listings", label: "View all" }}>
            {recommended === null ? (
              <Muted>Loading…</Muted>
            ) : !recommended.length ? (
              <Muted>No listings available right now — check back soon.</Muted>
            ) : (
              <ListingGrid listings={recommended} />
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card title="Need help?">
            <p className="text-[12px] leading-[1.55] text-[#5d6876]">
              Questions about a property, inspections or payment? Our team is on WhatsApp.
            </p>
            <a
              href={teamWhatsAppHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3.5 py-2 text-[12px] font-extrabold text-white"
            >
              <MessageIcon /> Chat with the team
            </a>
          </Card>

          <Card title="Inspections">
            <Muted>Inspection scheduling is coming soon. For now, our team arranges viewings on WhatsApp.</Muted>
          </Card>

          <Card title="Payments">
            <Muted>Rent payment tracking and reminders are coming soon.</Muted>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ListingGrid({ listings }: { listings: Listing[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {listings.map((listing) => (
        <Link key={listing.id} href={`/listing/${listing.id}`} className="group overflow-hidden rounded-[12px] border border-[rgba(9,24,42,.08)]">
          <ListingThumb listing={listing} className="h-[110px] w-full" />
          <div className="p-3">
            <div className="truncate text-[12.5px] font-extrabold group-hover:text-[#a97e4b]">{listing.title}</div>
            <div className="mt-0.5 flex items-center justify-between gap-2 text-[11px] font-semibold text-[#5d6876]">
              <span className="truncate">{listing.area}</span>
              <span className="whitespace-nowrap font-extrabold text-[#09182a]">{naira(listing.rentPerYear)}/yr</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ───────────────────────── SHARED ───────────────────────── */

function Welcome({
  name,
  subtitle,
  action,
}: {
  name?: string;
  subtitle: string;
  action: { href: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[22px] font-extrabold tracking-[-.03em]">Welcome back{name ? `, ${name}` : ""} 👋</h1>
        <p className="mt-1 text-[13px] font-medium text-[#5d6876]">{subtitle}</p>
      </div>
      <Link
        href={action.href}
        className="inline-flex h-[36px] items-center gap-1.5 rounded-lg bg-[#09182a] px-4 text-[12px] font-extrabold text-white transition-opacity hover:opacity-85"
      >
        <PlusIcon /> {action.label}
      </Link>
    </div>
  );
}

const TONES = {
  blue: "bg-[rgba(37,99,235,.1)] text-[#2563eb]",
  gold: "bg-[rgba(169,126,75,.12)] text-[#a97e4b]",
  green: "bg-[rgba(21,147,95,.1)] text-[#15935f]",
  purple: "bg-[rgba(124,58,237,.1)] text-[#7c3aed]",
} as const;

function StatCard({
  icon,
  tone,
  label,
  value,
}: {
  icon: React.ReactNode;
  tone: keyof typeof TONES;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white p-4">
      <div className={`grid h-[38px] w-[38px] place-items-center rounded-[10px] ${TONES[tone]}`}>{icon}</div>
      <span className="text-[11px] font-semibold text-[#5d6876]">{label}</span>
      <div className="text-[26px] font-extrabold leading-none tracking-[-.05em]">{value}</div>
    </div>
  );
}

function Card({
  title,
  link,
  children,
}: {
  title: string;
  link?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white p-[18px]">
      <div className="mb-[14px] flex items-center justify-between gap-2">
        <h2 className="text-[14.5px] font-extrabold tracking-[-.03em]">{title}</h2>
        {link && (
          <Link href={link.href} className="text-[12px] font-bold text-[#15935f]">
            {link.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function ListingThumb({ listing, className }: { listing: Listing; className: string }) {
  return (
    <div className={`overflow-hidden rounded-[8px] bg-[#eef0f3] ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- listing photos live on Supabase Storage */}
      <img src={listing.images?.[0] || FALLBACK_IMAGE} alt={listing.title} className="h-full w-full object-cover" loading="lazy" />
    </div>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <p className="text-[12.5px] font-medium leading-[1.55] text-[#5d6876]">{children}</p>;
}

function Empty({ text, action }: { text: string; action: { href: string; label: string } }) {
  return (
    <div className="py-6 text-center">
      <p className="text-[13px] font-medium text-[#5d6876]">{text}</p>
      <Link href={action.href} className="mt-2 inline-flex items-center gap-1 text-[12px] font-extrabold text-[#15935f]">
        {action.label} <ArrowIcon />
      </Link>
    </div>
  );
}
