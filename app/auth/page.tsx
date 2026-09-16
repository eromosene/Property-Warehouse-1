"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import {
  Icon,
  PersonIcon,
  HomeIcon,
  TrustIcon,
  TrustIconKind,
  GoogleIcon,
  FacebookIcon,
  AppleIcon,
} from "../components/icons";

type Role = "tenant" | "landlord";
type Mode = "login" | "signup";

const areas = [
  "Lekki",
  "Ikoyi",
  "Yaba",
  "Ikeja",
  "Surulere",
  "Ajah",
  "Victoria Island",
  "Maryland",
];
const budgets = [
  "Under ₦500,000/yr",
  "₦500,000 – ₦1,000,000/yr",
  "₦1,000,000 – ₦2,000,000/yr",
  "₦2,000,000 – ₦3,500,000/yr",
  "Above ₦3,500,000/yr",
];
const propertyTypes = [
  "Apartment",
  "Duplex",
  "Terrace",
  "Studio",
  "Commercial",
];

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-[#f0ede8]">
      {/* ── MAIN ── */}
      {/* auth-main: padding 100px 24px 60px (base), 88px 12px 48px (<=560px) */}
      <main className="relative flex min-h-screen flex-col items-center overflow-hidden px-3 pb-12 pt-12 font-manrope text-[#09182a] sm:px-6 sm:pb-[60px] sm:pt-16">
        {/* Blurred property photo panels left & right (22% width, hidden <=900px in original grid collapse) */}
        <div className="pointer-events-none fixed inset-y-0 left-0 z-0 hidden w-[22%] bg-[url('/property-assets/04A4A0B0-F13E-44C9-91E6-96DE440E47E9.png')] bg-cover bg-center brightness-[0.78] blur-[1px] min-[901px]:block" />
        <div className="pointer-events-none fixed inset-y-0 right-0 z-0 hidden w-[22%] bg-[url('/property-assets/1D47CC0D-EBBB-4843-B36C-FF1584FBF3C0.png')] bg-cover bg-center brightness-[0.78] blur-[1px] min-[901px]:block" />

        <div className="relative z-10 w-full max-w-[980px]">
          {/* Logo, centered */}
          <Link
            href="/"
            className="mb-8 flex items-center justify-center gap-2.5"
            aria-label="Property Warehouse home"
          >
            <span className="font-cormorant text-4xl font-bold leading-none tracking-[-0.1em] text-[#a97e4b]">
              P<span className="inline-block translate-y-2">W</span>
            </span>
            <span className="grid text-xs font-extrabold leading-none">
              <span>PROPERTY</span>
              <span>WAREHOUSE</span>
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-9 w-full text-center">
            <h1 className="mx-auto mb-2 text-[clamp(34px,5vw,52px)] font-playfair font-bold leading-[1.1] tracking-[-0.04em] text-[#09182a]">
              Welcome <em className="italic text-[#a97e4b]">back!</em>
            </h1>
            <p className="mb-4 text-[15px] font-medium text-[#5d6876]">
              Choose how you want to continue on Property Warehouse
            </p>
            <span className="mx-auto block h-[3px] w-12 rounded-full bg-[#a97e4b]" />
          </div>

          {/* Two panels */}
          <div className="grid grid-cols-1 items-start gap-4 min-[901px]:grid-cols-2 min-[901px]:gap-5">
            <AuthPanel role="tenant" />
            <AuthPanel role="landlord" />
          </div>

          {/* Trust badges */}
          <TrustBadges />

          {/* Trusted / logos */}
          <TrustedLogos />
        </div>
      </main>
    </div>
  );
}

function AuthPanel({ role }: { role: Role }) {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const tenant = role === "tenant";
  const accent = tenant ? "#15935f" : "#a97e4b";
  const accentSoft = tenant ? "rgba(21,147,95,0.10)" : "rgba(169,126,75,0.12)";
  const submitShadow = tenant
    ? "0 8px 24px rgba(21,147,95,0.28)"
    : "0 8px 24px rgba(169,126,75,0.30)";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setBusy(true);
    setMessage(
      mode === "login" ? "Signing you in..." : "Creating your account...",
    );
    try {
      const result = await api<{
        token?: string;
        user: { role: Role; firstName?: string };
      }>(`/api/auth/${mode === "login" ? "login" : "signup"}`, {
        method: "POST",
        body: JSON.stringify(
          mode === "login"
            ? {
              email: values.get("email"),
              password: values.get("password"),
              role,
            }
            : {
              role,
              firstName: values.get("firstName"),
              lastName: values.get("lastName"),
              email: values.get("email"),
              phone: values.get("phone"),
              password: values.get("password"),
              ...(tenant
                ? { area: values.get("area"), budget: values.get("budget") }
                : {
                  propType: values.get("propType"),
                  lga: values.get("lga"),
                }),
            },
        ),
      });
      if (result.token) localStorage.setItem("pw_token", result.token);
      router.push(role === "landlord" ? "/landlord-dashboard" : "/dashboard");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className="rounded-[18px] border border-[#09182a14] bg-white/[0.97] px-9 pb-7 pt-8 shadow-[0_20px_60px_rgba(9,24,42,0.10)] min-[561px]:px-9 max-[560px]:rounded-[14px] max-[560px]:px-[18px] max-[560px]:pb-5 max-[560px]:pt-6"
      style={
        {
          "--auth-accent": accent,
          "--auth-accent-soft": accentSoft,
        } as React.CSSProperties
      }
    >
      <div
        className="mb-[14px] flex items-center gap-2 text-[11px] font-extrabold tracking-[0.12em]"
        style={{ color: accent }}
      >
        {tenant ? (
          <PersonIcon />
        ) : (
          <HomeIcon />
        )}
        <span>I&apos;M A {role.toUpperCase()}</span>
      </div>
      <h2 className="mb-1.5 font-playfair text-[clamp(20px,2.2vw,26px)] font-bold leading-[1.2] tracking-[-0.03em] text-[#09182a]">
        Login or Sign up as a{" "}
        <span style={{ color: accent }}>{tenant ? "Tenant" : "Landlord"}</span>
      </h2>
      <p className="mb-5 text-[13px] font-medium leading-[1.55] text-[#5d6876]">
        {tenant
          ? "Find verified properties, connect with landlords and rent smarter."
          : "List your property, get verified and connect directly with thousands of tenants."}
      </p>
      <div className="mb-5 flex border-b-2 border-[#09182a14]" role="tablist">
        {(["login", "signup"] as Mode[]).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={mode === item}
            onClick={() => {
              setMode(item);
              setMessage("");
            }}
            className="flex-1 border-b-2 py-2.5 text-[13px] font-bold capitalize transition"
            style={{
              color: mode === item ? accent : "#5d6876",
              borderColor: mode === item ? accent : "transparent",
              marginBottom: -2,
            }}
          >
            {item === "login" ? "Log In" : "Sign Up"}
          </button>
        ))}
      </div>
      <form className="flex flex-col gap-3" onSubmit={submit} noValidate>
        {mode === "signup" && (
          <div className="grid grid-cols-2 gap-2.5 max-[560px]:grid-cols-1">
            <Field name="firstName" placeholder="First name" />
            <Field name="lastName" placeholder="Last name" />
          </div>
        )}
        <Field
          name="email"
          placeholder="Email address or phone number"
          type={mode === "signup" ? "email" : "text"}
          autoComplete="username"
        />
        {mode === "signup" && (
          <Field
            name="phone"
            placeholder="Phone number"
            type="tel"
            autoComplete="tel"
            required={false}
          />
        )}
        <div className="relative">
          <Field
            name="password"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-[13px] top-1/2 -translate-y-1/2 text-[#5d6876]"
          >
            <Icon className="h-[18px] w-[18px]">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </Icon>
          </button>
        </div>
        {mode === "signup" &&
          (tenant ? (
            <>
              <SelectField
                name="area"
                label="Preferred area in Lagos"
                options={areas}
              />
              <SelectField
                name="budget"
                label="Monthly budget range"
                options={budgets}
              />
            </>
          ) : (
            <>
              <SelectField
                name="propType"
                label="Type of property to list"
                options={propertyTypes}
              />
              <SelectField name="lga" label="LGA / Area" options={areas} />
            </>
          ))}
        {mode === "login" && (
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-[7px] text-xs font-semibold text-[#09182a]">
              <input
                type="checkbox"
                name="remember"
                className="h-[15px] w-[15px]"
                style={{ accentColor: accent }}
              />
              Remember me
            </label>
            <button
              type="button"
              className="text-xs font-semibold text-[#a97e4b]"
            >
              Forgot password?
            </button>
          </div>
        )}
        <button
          disabled={busy}
          type="submit"
          className="h-[46px] w-full rounded-lg text-sm font-extrabold tracking-[-0.01em] text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          style={{ backgroundColor: accent, boxShadow: submitShadow }}
        >
          {busy
            ? "Please wait..."
            : mode === "login"
              ? `Log In as ${tenant ? "Tenant" : "Landlord"}`
              : `Create ${tenant ? "Tenant" : "Landlord"} Account`}
        </button>
        {message && (
          <p
            className="text-center text-xs font-bold"
            style={{ color: message.includes("...") ? "#5d6876" : "#b23b32" }}
            role="status"
          >
            {message}
          </p>
        )}
        <div className="flex items-center gap-2.5 text-[11px] font-semibold text-[#5d6876]">
          <span className="h-px flex-1 bg-[#09182a1a]" />
          or continue with
          <span className="h-px flex-1 bg-[#09182a1a]" />
        </div>
        <div className="grid grid-cols-3 gap-2 max-[560px]:grid-cols-1">
          <SocialButton label="Google" icon={<GoogleIcon />} />
          <SocialButton label="Facebook" icon={<FacebookIcon />} />
          <SocialButton label="Apple" icon={<AppleIcon />} />
        </div>
        <p className="text-center text-[11px] font-medium leading-[1.6] text-[#5d6876]">
          By continuing, you agree to our{" "}
          <button
            type="button"
            className="font-semibold underline underline-offset-2"
            style={{ color: accent }}
          >
            Terms of Service
          </button>{" "}
          and{" "}
          <button
            type="button"
            className="font-semibold underline underline-offset-2"
            style={{ color: accent }}
          >
            Privacy Policy
          </button>
          .
        </p>
      </form>
    </section>
  );
}

function TrustBadges() {
  const badges: [TrustIconKind, string, string, string, string][] = [
    [
      "shield",
      "No Agent Fees",
      "Deal directly with landlords. Zero hidden charges.",
      "#15935f",
      "rgba(21,147,95,0.12)",
    ],
    [
      "check",
      "Verified Listings",
      "Every property is verified for authenticity.",
      "#15935f",
      "rgba(21,147,95,0.12)",
    ],
    [
      "chat",
      "Direct Communication",
      "Chat with landlords directly on WhatsApp.",
      "#2563eb",
      "rgba(37,99,235,0.10)",
    ],
    [
      "lock",
      "Secure & Safe",
      "Your data and payments are 100% protected.",
      "#a97e4b",
      "rgba(169,126,75,0.12)",
    ],
  ];

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 rounded-[14px] border border-[#09182a12] bg-white/[0.93] px-4 py-4 shadow-[0_8px_30px_rgba(9,24,42,0.07)] min-[561px]:grid-cols-2 min-[901px]:grid-cols-4 min-[901px]:gap-3 min-[901px]:px-7 min-[901px]:py-6">
      {badges.map(([kind, title, text, color, background]) => (
        <div className="flex items-start gap-3" key={title}>
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px]"
            style={{ color, background }}
          >
            <TrustIcon kind={kind} />
          </span>
          <span>
            <b className="mb-[3px] block text-[13px] font-extrabold text-[#09182a]">
              {title}
            </b>
            <small className="block text-[11.5px] font-medium leading-[1.45] text-[#5d6876]">
              {text}
            </small>
          </span>
        </div>
      ))}
    </div>
  );
}

function TrustedLogos() {
  // Note: your auth.css defines .auth-trusted spacing/typography, but the
  // actual partner logo marks (.access, .gtco, .flutter, .interswitch,
  // .paystack) are styled in a different stylesheet (likely style.css),
  // which wasn't included here. These render as plain text for now —
  // share that file and I'll match the real logo styling.
  const logos = ["access", "GTCO", "Flutterwave", "Interswitch", "paystack"];

  return (
    <div className="mt-7 pb-5 text-center">
      <p className="mb-[14px] text-xs font-semibold tracking-[0.04em] text-[#5d6876]">
        Trusted by thousands of Lagos residents
      </p>
      <div
        className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-bold text-[#5d6876]"
        aria-label="Partner logos"
      >
        {logos.map((logo) => (
          <span key={logo}>{logo}</span>
        ))}
      </div>
    </div>
  );
}

function Field({
  name,
  placeholder,
  type = "text",
  autoComplete,
  required = true,
}: {
  name: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <input
      className="h-11 w-full rounded-[7px] border border-[#09182a1f] bg-[#fafafa] pl-[14px] pr-11 text-[13px] font-medium outline-none transition placeholder:text-[#9aa4b2] focus:border-[var(--auth-accent)] focus:bg-white focus:shadow-[0_0_0_3px_var(--auth-accent-soft)]"
      name={name}
      placeholder={placeholder}
      type={type}
      autoComplete={autoComplete}
      required={required}
    />
  );
}

function SelectField({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: string[];
}) {
  return (
    <select
      className="h-11 w-full appearance-none rounded-[7px] border border-[#09182a1f] bg-[#fafafa] pl-[14px] pr-9 text-[13px] font-medium text-[#5c6674] outline-none focus:border-[var(--auth-accent)] focus:shadow-[0_0_0_3px_var(--auth-accent-soft)]"
      style={{
        backgroundImage:
          "linear-gradient(45deg, transparent 50%, #111b29 50%), linear-gradient(135deg, #111b29 50%, transparent 50%)",
        backgroundPosition: "calc(100% - 18px) 51%, calc(100% - 14px) 51%",
        backgroundSize: "4px 4px, 4px 4px",
        backgroundRepeat: "no-repeat",
      }}
      name={name}
      aria-label={label}
      defaultValue=""
      required
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

function SocialButton({
  label,
  icon,
}: {
  label: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      className="flex h-[38px] items-center justify-center gap-1.5 rounded-[7px] border border-[#09182a1f] bg-white text-xs font-bold hover:bg-[#f5f5f5]"
    >
      {icon}
      {label}
    </button>
  );
}