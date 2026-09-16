"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { api, Listing, naira } from "../lib/api";
import { UpcomingInspections } from "../components/upcoming-inspections";
import {
  ArrowIcon,
  ChevronRightIcon,
  ClockIcon,
  DashboardHomeIcon,
  EyeIcon,
  LocationIcon,
  MessageIcon,
  MoneyIcon,
  PaymentIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  TrendIcon,
} from "../components/icons";

const PEOPLE = [
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
];

const MESSAGES = [
  {
    name: "Amaka Nwosu",
    text: "Hi, is this Lekki apartment still available? I'm interested in scheduling an inspection.",
    time: "2m ago",
    unread: true,
    img: PEOPLE[0],
  },
  {
    name: "Tunde Adebayo",
    text: "I'd like to know more about the 4 bed duplex in Ajah, is it still available?",
    time: "15m ago",
    unread: true,
    img: PEOPLE[1],
  },
  {
    name: "Kemi Balogun",
    text: "Thanks for the info. I'm ready to proceed with the payment.",
    time: "1h ago",
    unread: false,
    img: PEOPLE[2],
  },
  {
    name: "David Okonkwo",
    text: "Can I see more pictures of the property in Gbagada?",
    time: "2h ago",
    unread: false,
    img: PEOPLE[3],
  },
];

const INSPECTIONS = [
  {
    month: "MAY",
    day: "24",
    name: "Lekki 3 Bed Apartment",
    loc: "Lekki Phase 1",
    time: "10:00 AM",
    img: PEOPLE[4],
  },
  {
    month: "MAY",
    day: "25",
    name: "2 Bedroom Flat",
    loc: "Yaba, Mainland",
    time: "1:00 PM",
    img: PEOPLE[0],
  },
  {
    month: "MAY",
    day: "26",
    name: "4 Bed Duplex",
    loc: "Ajah, Lagos",
    time: "11:00 AM",
    img: PEOPLE[1],
  },
];

const PAYMENTS = [
  {
    name: "Luxury 3 Bed Duplex – Lekki",
    type: "Annual Rent Payment",
    amount: "₦2,400,000",
    status: "paid",
  },
  {
    name: "2 Bed Apartment – Yaba",
    type: "Annual Rent Payment",
    amount: "₦1,200,000",
    status: "paid",
  },
  {
    name: "4 Bed Terrace – Ajah",
    type: "Annual Rent Payment",
    amount: "₦2,000,000",
    status: "paid",
  },
];

export default function LandlordDashboardPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [message, setMessage] = useState("Loading your listings...");

  const load = () => {
    api<{ listings: Listing[] }>("/api/landlord/listings")
      .then((data) => {
        setListings(data.listings);
        setMessage("");
      })
      .catch((reason: Error) => setMessage(reason.message));
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="flex flex-row items-start gap-[18px] px-6 pb-10 pt-[22px] max-[860px]:flex-col max-[860px]:gap-3 max-[860px]:px-[14px] max-[600px]:gap-[14px] max-[600px]:px-[14px]">
      {/* MOBILE INTRO */}
      <div className="hidden w-full max-[860px]:block">
        <div className="mb-3">
          <h2 className="text-[18px] font-extrabold tracking-[-.03em] max-[600px]:text-[22px]">
            Welcome back <span>👋</span>
          </h2>

          <p className="mt-[2px] text-[12px] font-medium text-[#5d6876] max-[600px]:mt-1 max-[600px]:text-[14px]">
            Here's what's happening with your properties today.
          </p>
        </div>

        <div className="flex h-[42px] items-center gap-[9px] rounded-[10px] border border-[rgba(9,24,42,.09)] bg-white px-[14px] shadow-[0_2px_10px_rgba(9,24,42,.05)] max-[600px]:h-[52px] max-[600px]:rounded-[16px] max-[600px]:px-4">
          <SearchIcon />

          <input
            type="search"
            placeholder="Search anything…"
            aria-label="Search"
            className="w-full border-none bg-transparent text-[13px] outline-none placeholder:text-[#9aa4b2] max-[600px]:text-[14px]"
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                event.currentTarget.value.trim()
              ) {
                alert(`Searching for "${event.currentTarget.value.trim()}"…`);
              }
            }}
          />
        </div>
      </div>

      {/* LEFT */}
      <div className="flex min-w-0 flex-1 flex-col gap-4 max-[860px]:contents">
        {/* STATS */}
        <div className="w-full flex flex-col gap-4">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 lg:w-[80%]">
            <StatCard
              icon={<DashboardHomeIcon />}
              iconClass="bg-[rgba(37,99,235,.1)] text-[#2563eb]"
              label="Active Listings"
              value="12"
              change="20% from last month"
            />

            <StatCard
              icon={<MessageIcon />}
              iconClass="bg-[rgba(21,147,95,.1)] text-[#15935f]"
              label="Monthly Inquiries"
              value="248"
              change="34% from last month"
            />

            <StatCard
              icon={<ClockIcon />}
              iconClass="bg-[rgba(169,126,75,.12)] text-[#a97e4b]"
              label="Occupancy Rate"
              value="91%"
              change="8% from last month"
            />

            <StatCard
              icon={<MoneyIcon />}
              iconClass="bg-[rgba(124,58,237,.1)] text-[#7c3aed]"
              label="Revenue Earned"
              value="₦14,800,000"
              valueSmall
              change="18% from last month"
            />

          </div>

          <div className="flex flex-col gap-[10px] rounded-[14px] bg-[#0d1f35] p-4 text-white max-[1160px]:col-span-2 max-[860px]:col-span-2 max-[600px]:col-span-2">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[rgba(21,147,95,.18)]">
              <ShieldIcon />
            </div>

            <div>
              <strong className="mb-[5px] block text-[13px] font-extrabold">
                Verified Landlord
              </strong>

              <p className="mb-[10px] text-[10.5px] font-medium leading-[1.5] text-white/[.55]">
                Your profile is verified. You're trusted by thousands of
                tenants.
              </p>

              <Link
                href="/landlord-dashboard/settings"
                className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#4ade97]"
              >
                View Profile
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>

        {/* RENTAL PERFORMANCE */}
        <section className="w-full rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white px-[18px] pb-[14px] pt-[18px] max-[860px]:rounded-[18px] max-[860px]:px-[14px] max-[860px]:py-4">
          <div className="mb-[14px] flex flex-wrap items-center gap-2">
            <h2 className="shrink-0 text-[14.5px] font-extrabold tracking-[-.03em]">
              Rental Performance
            </h2>

            <div className="ml-auto flex shrink-0 items-center gap-[14px]">
              <Legend label="Inquiries" className="bg-[#09182a]" />
              <Legend label="Occupancy" className="bg-[#a97e4b]" />
              <Legend label="Revenue" className="bg-[#15935f]" />
            </div>

            <select className="h-7 shrink-0 rounded-[7px] border border-[rgba(9,24,42,.09)] bg-[#f6f7f9] px-2 text-[11px] font-bold text-[#09182a] outline-none">
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Yearly</option>
            </select>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              className="block h-[200px] min-w-[320px] w-full overflow-visible"
              viewBox="0 0 580 200"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {[10, 50, 90, 130, 170].map((y) => (
                <line
                  key={y}
                  x1="50"
                  y1={y}
                  x2="565"
                  y2={y}
                  stroke="#eef0f3"
                  strokeWidth="1"
                />
              ))}

              {[
                ["400", 13],
                ["300", 53],
                ["200", 93],
                ["100", 133],
                ["0", 173],
              ].map(([label, y]) => (
                <text
                  key={String(label)}
                  x="42"
                  y={Number(y)}
                  textAnchor="end"
                  fontFamily="Manrope"
                  fontSize="9"
                  fontWeight="600"
                  fill="#9aa4b2"
                >
                  {label}
                </text>
              ))}

              {[
                ["Dec", 50],
                ["Jan", 153],
                ["Feb", 256],
                ["Mar", 359],
                ["Apr", 462],
                ["May", 565],
              ].map(([label, x]) => (
                <text
                  key={String(label)}
                  x={Number(x)}
                  y="188"
                  textAnchor="middle"
                  fontFamily="Manrope"
                  fontSize="9"
                  fontWeight="600"
                  fill="#9aa4b2"
                >
                  {label}
                </text>
              ))}

              <polyline
                points="50,98 153,86 256,74 359,58 462,46 565,71"
                fill="none"
                stroke="#09182a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <polyline
                points="50,110 153,106 256,103 359,90 462,83 565,78"
                fill="none"
                stroke="#a97e4b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <polyline
                points="50,130 153,122 256,118 359,110 462,106 565,90"
                fill="none"
                stroke="#15935f"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {[
                [50, 98, "#09182a"],
                [153, 86, "#09182a"],
                [256, 74, "#09182a"],
                [359, 58, "#09182a"],
                [462, 46, "#09182a"],
                [565, 71, "#09182a"],
                [50, 110, "#a97e4b"],
                [153, 106, "#a97e4b"],
                [256, 103, "#a97e4b"],
                [359, 90, "#a97e4b"],
                [462, 83, "#a97e4b"],
                [565, 78, "#a97e4b"],
                [50, 130, "#15935f"],
                [153, 122, "#15935f"],
                [256, 118, "#15935f"],
                [359, 110, "#15935f"],
                [462, 106, "#15935f"],
                [565, 90, "#15935f"],
              ].map(([cx, cy, stroke], index) => (
                <circle
                  key={index}
                  cx={Number(cx)}
                  cy={Number(cy)}
                  r="4"
                  fill="#fff"
                  stroke={String(stroke)}
                  strokeWidth="2"
                />
              ))}
            </svg>
          </div>
        </section>

        {/* TENANT INQUIRIES */}
        <section className="w-full rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white px-[18px] pb-[14px] pt-[18px] max-[860px]:rounded-[18px] max-[860px]:px-[14px] max-[860px]:py-4">
          <SectionTitle title="Tenant Inquiries" />
          <InquiriesPreview />
        </section>

        {/* MY LISTINGS SUMMARY */}
        <section className="w-full min-w-0 max-w-full overflow-hidden rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white px-[18px] pb-[14px] pt-[18px] max-[860px]:rounded-[18px] max-[860px]:px-[14px] max-[860px]:py-4">
          <div className="mb-[14px] flex items-center justify-between gap-2">
            <h2 className="shrink-0 text-[14.5px] font-extrabold tracking-[-.03em]">
              My Listings
            </h2>

            <Link
              href="/create-listing"
              className="ml-auto flex h-[34px] shrink-0 items-center gap-[6px] rounded-lg bg-[#09182a] px-[14px] text-[12px] font-bold text-white transition-opacity hover:opacity-[.86]"
            >
              <PlusIcon />
              Add New Property
            </Link>
          </div>

          <DraggableTable>
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="border-b border-[rgba(9,24,42,.09)]">
                  {[
                    "PROPERTY",
                    "AREA",
                    "STATUS",
                    "MONTHLY INQUIRIES",
                    "ANNUAL RENT",
                    "OCCUPANCY",
                    "PERFORMANCE",
                    "",
                  ].map((heading, index) => (
                    <th
                      key={index}
                      className={[
                        "px-3 pb-[10px] text-left text-[9.5px] font-extrabold tracking-[.04em] text-[#5d6876]",
                        index === 3 || index === 4 || index === 5
                          ? "text-right"
                          : "",
                      ].join(" ")}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {listings.map((listing) => (
                  <ListingRow key={listing.id} listing={listing} />
                ))}
              </tbody>
            </table>
          </DraggableTable>

          <Link
            href="/landlord-dashboard/listings"
            className="mt-[10px] inline-flex items-center gap-1 text-[12px] font-bold text-[#15935f]"
          >
            View all listings
            <ChevronRightIcon />
          </Link>
        </section>
      </div>

      {/* RIGHT PANEL */}
      <aside className="sticky top-[90px] flex w-[284px] shrink-0 flex-col gap-[14px] max-[1160px]:hidden">
        {/* MOST VIEWED */}
        <section className="rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white px-[18px] pb-[14px] pt-[18px] max-[860px]:rounded-[18px] max-[860px]:px-[14px] max-[860px]:py-4">
          <SectionTitle title="Most Viewed Property" small />

          <div className="flex items-center gap-[10px]">
            <img
              src="/dashboard homes sample images assets/04A4A0B0-F13E-44C9-91E6-96DE440E47E9.png"
              alt="Most viewed property"
              className="h-[52px] w-[60px] shrink-0 rounded-[9px] object-cover"
            />

            <div>
              <div className="mb-[2px] text-[12px] font-extrabold text-[#09182a]">
                Luxury 3 Bedroom Duplex
              </div>

              <div className="mb-1 text-[10.5px] font-semibold text-[#5d6876]">
                Lekki Phase 1
              </div>

              <div className="flex items-center gap-1 text-[10.5px] font-bold text-[#5d6876]">
                <EyeIcon />
                1,245 views
              </div>
            </div>
          </div>

          <div className="mt-[14px]">
            <SectionTitle title="Highest Inquiry Area" small />

            <div className="flex items-center gap-[10px] rounded-[9px] bg-[rgba(21,147,95,.05)] px-[10px] py-2">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[rgba(21,147,95,.12)] text-[#15935f]">
                <LocationIcon />
              </div>

              <div>
                <div className="mb-px text-[12px] font-extrabold">
                  Lekki Phase 1
                </div>

                <div className="text-[10px] font-semibold text-[#5d6876]">
                  56 inquiries
                </div>
              </div>
            </div>
          </div>

          <div className="mt-[14px]">
            <SectionTitle title="Best Performing Listing" small />

            <div className="flex items-start gap-[10px]">
              <img
                src="/dashboard homes sample images assets/2BBB6637-9807-47DA-998C-93EDCE888A96.png"
                alt="Best performing listing"
                className="h-12 w-14 shrink-0 rounded-lg object-cover"
              />

              <div>
                <div className="mb-[2px] text-[11.5px] font-extrabold">
                  4 Bedroom Terrace Duplex
                </div>

                <div className="mb-1 text-[10px] font-semibold text-[#5d6876]">
                  Chevron, Lekki
                </div>

                <div className="flex items-center gap-1 text-[10.5px] font-bold text-[#15935f]">
                  <ShieldIcon small />
                  95% occupancy rate
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MESSAGES */}
        <section className="rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white px-[18px] pb-[14px] pt-[18px] max-[860px]:rounded-[18px] max-[860px]:px-[14px] max-[860px]:py-4">
          <div className="mb-[14px] flex items-center justify-between gap-2">
            <h3 className="shrink-0 text-[13px] font-extrabold tracking-[-.02em]">
              Recent Messages
            </h3>

            <Link
              href="/landlord-dashboard/messages"
              className="ml-auto flex items-center gap-[3px] whitespace-nowrap text-[12px] font-bold text-[#15935f]"
            >
              View all
              <ChevronRightIcon />
            </Link>
          </div>

          <div>
            {MESSAGES.map((message) => (
              <Link
                key={message.name}
                href="/landlord-dashboard/messages"
                className="flex cursor-pointer items-start gap-[9px] rounded-lg px-[6px] py-2 hover:bg-[#f8f9fb]"
              >
                <div className="h-[34px] w-[34px] shrink-0 overflow-hidden rounded-full bg-[linear-gradient(135deg,#1a3a5e,#0d2540)]">
                  <img
                    src={message.img}
                    alt={message.name}
                    className="block h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-[2px] flex flex-wrap items-center gap-[5px]">
                    <span className="text-[11.5px] font-extrabold">
                      {message.name}
                    </span>

                    <span className="ml-auto whitespace-nowrap text-[9.5px] font-medium text-[#5d6876]">
                      {message.time}
                    </span>
                  </div>

                  <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-medium leading-[1.4] text-[#5d6876]">
                    {message.text}
                  </div>
                </div>

                {message.unread && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#15935f]" />
                )}
              </Link>
            ))}
          </div>

          <Link
            href="/landlord-dashboard/messages"
            className="mt-[10px] inline-flex items-center gap-1 text-[12px] font-bold text-[#15935f]"
          >
            Go to Messages
            <ChevronRightIcon />
          </Link>
        </section>

        <UpcomingInspections inspections={INSPECTIONS} />

        {/* PAYMENTS */}
        <section className="rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white px-[18px] pb-[14px] pt-[18px] max-[860px]:rounded-[18px] max-[860px]:px-[14px] max-[860px]:py-4">
          <div className="mb-[14px] flex items-center justify-between gap-2">
            <h3 className="text-[13px] font-extrabold tracking-[-.02em]">
              Recent Payments
            </h3>

            <Link
              href="/landlord-dashboard/payments"
              className="flex items-center gap-[3px] text-[12px] font-bold text-[#15935f]"
            >
              View all
              <ChevronRightIcon />
            </Link>
          </div>

          {PAYMENTS.map((payment) => (
            <div
              key={payment.name}
              className="flex items-center gap-[10px] border-b border-[rgba(9,24,42,.06)] py-2 last:border-b-0"
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[rgba(21,147,95,.1)] text-[#15935f]">
                <PaymentIcon />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-px overflow-hidden text-ellipsis whitespace-nowrap text-[11.5px] font-extrabold">
                  {payment.name}
                </div>

                <div className="text-[9.5px] font-medium text-[#5d6876]">
                  {payment.type}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span className="block text-[12px] font-extrabold">
                  {payment.amount}
                </span>

                <span className="rounded bg-[rgba(21,147,95,.1)] px-[6px] py-px text-[9.5px] font-bold text-[#15935f]">
                  Paid
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* SATISFACTION */}
        <section className="rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white px-[18px] pb-[14px] pt-[18px] max-[860px]:rounded-[18px] max-[860px]:px-[14px] max-[860px]:py-4">
          <div className="mb-[14px] flex items-center justify-between gap-2">
            <h3 className="text-[13px] font-extrabold tracking-[-.02em]">
              Tenant Satisfaction
            </h3>

            <select className="h-7 rounded-[7px] border border-[rgba(9,24,42,.09)] bg-[#f6f7f9] px-2 text-[11px] font-bold outline-none">
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-[10px]">
            <div>
              <span className="text-[38px] font-extrabold tracking-[-.06em]">
                4.8
              </span>

              <span className="ml-[2px] text-[16px] font-semibold text-[#5d6876]">
                / 5
              </span>

              <div className="my-1 text-[14px] text-[#f59e0b]">★★★★★</div>

              <div className="mb-px text-[12px] font-extrabold text-[#15935f]">
                Excellent
              </div>

              <div className="text-[10px] font-medium text-[#5d6876]">
                Based on 32 reviews
              </div>
            </div>

            <div className="text-[52px]">😊</div>
          </div>
        </section>
      </aside>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────── */

function StatCard({
  icon,
  iconClass,
  label,
  value,
  change,
  valueSmall,
}: {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: string;
  change: string;
  valueSmall?: boolean;
}) {
  return (
    <div className="w-full flex flex-col gap-2.5 rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white p-4 max-[600px]:rounded-[18px]">
      <div
        className={`grid h-[38px] w-[38px] place-items-center rounded-[10px] ${iconClass}`}
      >
        {icon}
      </div>

      <div>
        <span className="text-[11px] font-semibold text-[#5d6876]">
          {label}
        </span>

        <div
          className={[
            "leading-none font-extrabold tracking-[-.05em] text-[#09182a]",
            valueSmall ? "text-[20px]" : "text-[28px]",
            "max-[600px]:text-[22px]",
          ].join(" ")}
        >
          {value}
        </div>

        <div className="mt-[5px] flex items-center gap-[3px] text-[10.5px] font-bold text-[#15935f]">
          <TrendIcon />
          {change}
        </div>
      </div>
    </div>
  );
}

function DraggableTable({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startScrollLeft: 0,
  });

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;

    if (!container || container.scrollWidth <= container.clientWidth) {
      return;
    }

    dragState.current = {
      isDragging: true,
      startX: event.clientX,
      startScrollLeft: container.scrollLeft,
    };
    container.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;

    if (!container || !dragState.current.isDragging) {
      return;
    }

    event.preventDefault();
    container.scrollLeft =
      dragState.current.startScrollLeft -
      (event.clientX - dragState.current.startX);
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    dragState.current.isDragging = false;

    if (containerRef.current?.hasPointerCapture(event.pointerId)) {
      containerRef.current.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      ref={containerRef}
      className="block w-full max-w-full min-w-0 cursor-grab overflow-x-auto overflow-y-hidden rounded-[10px] select-none touch-pan-x active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onPointerLeave={stopDragging}
    >
      {children}
    </div>
  );
}

function Legend({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span className="flex items-center gap-[5px] text-[11px] font-semibold text-[#5d6876]">
      <i className={`block h-[3px] w-[22px] rounded-full ${className}`} />
      {label}
    </span>
  );
}

function SectionTitle({
  title,
  small = false,
}: {
  title: string;
  small?: boolean;
}) {
  return (
    <div className="mb-[14px] flex items-center justify-between gap-2">
      {small ? (
        <h3 className="shrink-0 text-[13px] font-extrabold tracking-[-.02em]">
          {title}
        </h3>
      ) : (
        <h2 className="shrink-0 text-[14.5px] font-extrabold tracking-[-.03em]">
          {title}
        </h2>
      )}
    </div>
  );
}

function ListingRow({ listing }: { listing: Listing }) {
  const image =
    listing.images?.[0] ||
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=80&q=60";

  return (
    <tr className="border-b border-[rgba(9,24,42,.05)] transition-colors hover:bg-[#f8f9fb] last:border-b-0">
      <td className="px-3 py-[10px] align-middle">
        <div className="flex items-center gap-[10px]">
          <div className="h-9 w-10 shrink-0 overflow-hidden rounded-[7px]">
            <img
              src={image}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          </div>

          <Link
            href={`/listing?id=${listing.id}`}
            className="whitespace-nowrap text-[11.5px] font-extrabold hover:text-[#a97e4b]"
          >
            {listing.title || "Untitled"}
          </Link>
        </div>
      </td>

      <td className="whitespace-nowrap px-3 py-[10px] text-[11px] font-semibold text-[#5d6876]">
        {listing.area || "—"}
      </td>

      <td className="px-3 py-[10px]">
        <span className="inline-flex items-center gap-1 rounded-[5px] bg-[rgba(21,147,95,.1)] px-2 py-[3px] text-[10px] font-extrabold text-[#15935f]">
          <span className="h-[6px] w-[6px] rounded-full bg-current" />
          {listing.isVerified ? "Verified" : "Pending review"}
        </span>
      </td>

      <td className="px-3 py-[10px] text-right text-[11.5px] font-bold">
        {listing.views || 0}
      </td>

      <td className="px-3 py-[10px] text-right text-[11.5px] font-bold">
        {naira(listing.rentPerYear || 0)}
      </td>

      <td className="px-3 py-[10px] text-right text-[10.5px] font-bold">
        —
      </td>

      <td className="px-3 py-[10px] text-[11px] font-extrabold text-[#2563eb]">
        Active
      </td>

      <td />
    </tr>
  );
}

function InquiriesPreview() {
  const [inquiries, setInquiries] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("pw_inquiries") || "[]",
      );

      setInquiries(stored.slice(0, 3));
    } catch {
      setInquiries([]);
    }
  }, []);

  if (!inquiries.length) {
    return (
      <div className="py-8 text-center">
        {/* <InquiryIcon /> */}
        <p className="mt-3 text-[13px] font-medium text-[#5d6876]">
          No inquiries yet. Share your listings to get messages!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {inquiries.map((inquiry, index) => (
        <div
          key={index}
          className="rounded-[10px] border border-[rgba(9,24,42,.06)] p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <strong className="text-[12px] font-extrabold">
              {inquiry.senderName || "Unknown"}
            </strong>

            <span className="text-[10px] text-[#5d6876]">
              {inquiry.senderPhone || ""}
            </span>
          </div>

          <div className="mt-1 text-[11px] font-semibold text-[#5d6876]">
            {inquiry.listingTitle || inquiry.listingId || "—"}
          </div>

          <p className="mt-2 text-[11px] leading-[1.4] text-[#5d6876]">
            {inquiry.message || ""}
          </p>
        </div>
      ))}
    </div>
  );
}

