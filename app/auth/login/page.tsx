"use client";

import { type FormEvent, type ReactNode, useState } from "react";

type UserRole = "tenant" | "landlord";

const roleContent = {
  tenant: {
    eyebrow: "I'M A TENANT",
    title: "Tenant",
    description: "Find verified properties, connect with landlords and rent smarter.",
    cta: {
      login: "Log In as Tenant",
      signup: "Create Tenant Account",
    },
  },
  landlord: {
    eyebrow: "I'M A LANDLORD",
    title: "Landlord",
    description: "List your property, get verified and connect directly with thousands of tenants.",
    cta: {
      login: "Log In as Landlord",
      signup: "Create Landlord Account",
    },
  },
};

function Icon({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {children}
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("landlord");
  const [showPassword, setShowPassword] = useState(false);

  const activeContent = roleContent[selectedRole];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f1eee9] md:px-4 font-manrope text-[#09182a] sm:px-6">
      <section className="relative z-10 w-full min-h-screen md:min-h-auto max-w-118.5 rounded-[18px] border border-white/85 bg-white/95 px-6 py-8 shadow-[0_26px_80px_rgba(9,24,42,0.14)] sm:px-8">
        <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.2em] text-[#9f7948]">
          <Icon className="size-5">
            <path d="M3 11.5 12 4l9 7.5" />
            <path d="M5.5 10.5V20h13v-9.5" />
            <path d="M9.5 20v-5h5v5" />
          </Icon>
          <span>{activeContent.eyebrow}</span>
        </div>

        <h1 className="font-playfair text-[30px] font-bold leading-tight tracking-[-0.04em] text-[#07172a] sm:text-[34px]">
          Login as a <span className="text-[#a97e4b]">{activeContent.title}</span>
        </h1>
        <p className="mt-2 max-w-87.5 text-[13px] font-medium leading-6 text-[#606b78] sm:text-sm">
          {activeContent.description}
        </p>
            <form className="mt-5 grid gap-3.5" onSubmit={handleSubmit}>
           

            <div className="flex gap-3" role="radiogroup" aria-label="Choose account role">
                {(["tenant", "landlord"] as UserRole[]).map((role) => {
                const selected = selectedRole === role;

                return (
                    <button
                    className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-[7px] border text-sm font-extrabold transition ${
                        selected
                        ? "border-[#a97e4b] bg-[#a97e4b] text-white shadow-[0_10px_24px_rgba(169,126,75,0.25)]"
                        : "border-[#09182a1f] bg-white text-[#3e4958] hover:border-[#a97e4b99]"
                    }`}
                    key={role}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSelectedRole(role)}
                    >
                    <Icon className="size-4">
                        {role === "tenant" ? (
                        <>
                            <path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4" />
                            <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                        </>
                        ) : (
                        <>
                            <path d="M4 21h16" />
                            <path d="M6 21V7l8-4v18" />
                            <path d="M14 9h4v12" />
                        </>
                        )}
                    </Icon>
                    {role === "tenant" ? "Tenant" : "Landlord"}
                    </button>
                );
                })}
            </div>

          <label className="sr-only" htmlFor="email">
            Email address or phone number
          </label>
          <input
            className="h-11 rounded-[7px] border border-[#09182a1f] bg-[#fafafa] px-3.5 text-sm font-medium text-[#09182a] outline-none transition placeholder:text-[#9aa4b2] focus:border-[#a97e4b] focus:bg-white focus:shadow-[0_0_0_3px_rgba(169,126,75,0.13)]"
            id="email"
            name="email"
            placeholder="Email address or phone number"
            type="text"
            autoComplete="username"
          />
          <div className="relative">
            <label className="sr-only" htmlFor="password">
              Password
            </label>
            <input
              className="h-11 w-full rounded-[7px] border border-[#09182a1f] bg-[#fafafa] px-3.5 pr-11 text-sm font-medium text-[#09182a] outline-none transition placeholder:text-[#9aa4b2] focus:border-[#a97e4b] focus:bg-white focus:shadow-[0_0_0_3px_rgba(169,126,75,0.13)]"
              id="password"
              name="password"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
            />
            <button
              className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center text-[#68727f] transition hover:text-[#a97e4b]"
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              <Icon className="size-5">
                <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              </Icon>
            </button>
          </div>
            <div className="flex items-center justify-between gap-4 text-[13px] font-semibold">
              <label className="inline-flex items-center gap-2 text-[#111b2a]">
                <input className="size-4 rounded border-[#09182a33] accent-[#a97e4b]" name="remember" type="checkbox" />
                Remember me
              </label>
              <a className="text-[#9a7548] transition hover:text-[#7b5732]" href="#">
                Forgot password?
              </a>
            </div>

          <button
            className="mt-1 h-12 rounded-lg bg-[#a97e4b] text-sm font-extrabold text-white shadow-[0_13px_30px_rgba(169,126,75,0.32)] transition hover:bg-[#966f42] active:scale-[0.99]"
            type="submit"
          >
            {activeContent.cta.login}
          </button>

          <div className="flex items-center gap-3 text-[12px] font-semibold text-[#717b88]">
            <span className="h-px flex-1 bg-[#09182a12]" />
            <span>or continue with</span>
            <span className="h-px flex-1 bg-[#09182a12]" />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-[7px] border border-[#09182a1f] bg-white text-[12px] font-extrabold text-[#182233] transition hover:bg-[#f8f7f5]" type="button">
              <GoogleIcon />
              <span>Google</span>
            </button>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-[7px] border border-[#09182a1f] bg-white text-[12px] font-extrabold text-[#182233] transition hover:bg-[#f8f7f5]" type="button">
              <span className="grid size-4 place-items-center rounded-full border border-[#09182a] text-[10px] font-black leading-none">f</span>
              <span>Facebook</span>
            </button>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-[7px] border border-[#09182a1f] bg-white text-[12px] font-extrabold text-[#182233] transition hover:bg-[#f8f7f5]" type="button">
              <span className="text-base leading-none">Apple</span>
            </button>
          </div>

          <p className="text-center text-[11px] font-medium leading-5 text-[#68727f]">
            By continuing, you agree to our{" "}
            <a className="font-semibold text-[#8d673b] underline underline-offset-2" href="#">
              Terms of Service
            </a>
            <br />
            and{" "}
            <a className="font-semibold text-[#8d673b] underline underline-offset-2" href="#">
              Privacy Policy
            </a>
            .
          </p>
        </form>
      </section>
    </main>
  );
}