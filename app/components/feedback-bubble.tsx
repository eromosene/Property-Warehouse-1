"use client";

import { FormEvent, useState } from "react";
import { usePathname } from "next/navigation";
import { api } from "../lib/api";
import { teamWhatsAppHref } from "../lib/contact";

const TYPES = [
    { value: "feedback", label: "Feedback" },
    { value: "complaint", label: "Complaint" },
    { value: "suggestion", label: "Suggestion" },
] as const;

/* Site-wide "Talk to us" bubble (MoM 31 Jul 2026, item 14): submissions are saved through
   POST /api/feedback and reviewed by admins in the admin portal's Feedback tab. */
export default function FeedbackBubble() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<(typeof TYPES)[number]["value"]>("feedback");
    const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [error, setError] = useState("");

    if (pathname?.startsWith("/admin")) return null;

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        setState("sending");
        try {
            await api("/api/feedback", {
                method: "POST",
                body: JSON.stringify({
                    category: type,
                    name: String(data.get("name") || ""),
                    email: String(data.get("email") || ""),
                    message: String(data.get("message") || ""),
                    page: pathname,
                }),
            });
            form.reset();
            setState("sent");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Something went wrong");
            setState("error");
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-[500] font-manrope">
            {open && (
                <div
                    role="dialog"
                    aria-label="Feedback"
                    className="absolute bottom-[64px] right-0 w-[min(340px,calc(100vw-40px))] overflow-hidden rounded-[16px] border border-[rgba(9,24,42,.1)] bg-white shadow-[0_20px_50px_rgba(9,24,42,.18)]"
                >
                    <div className="flex items-center justify-between bg-[#09182a] px-4 py-3 text-white">
                        <h3 className="text-[14px] font-extrabold">Talk to us</h3>
                        <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="text-[20px] leading-none opacity-70 hover:opacity-100">
                            &times;
                        </button>
                    </div>
                    {state === "sent" ? (
                        <div className="p-5 text-center text-[13px] text-[#5d6876]">
                            <p className="text-[15px] font-extrabold text-[#15935f]">Thank you!</p>
                            <p className="mt-1">Your message has reached the Property Warehouse team.</p>
                            <button type="button" onClick={() => setState("idle")} className="mt-3 text-[12px] font-extrabold text-[#a97e4b]">
                                Send another
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="grid gap-2.5 p-4">
                            <div className="flex gap-1.5">
                                {TYPES.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setType(option.value)}
                                        className={`rounded-full px-3 py-1 text-[11px] font-extrabold transition ${
                                            type === option.value ? "bg-[#a97e4b] text-white" : "bg-[#f3f1ee] text-[#5d6876]"
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            <input name="name" placeholder="Your name (optional)" autoComplete="name" className="h-9 rounded-lg border border-[#e0ddd9] px-3 text-[13px] outline-none focus:border-[#a97e4b]" />
                            <input name="email" type="email" placeholder="Your email (optional)" autoComplete="email" className="h-9 rounded-lg border border-[#e0ddd9] px-3 text-[13px] outline-none focus:border-[#a97e4b]" />
                            <textarea name="message" required rows={4} maxLength={2000} placeholder="Tell us what's on your mind…" className="resize-none rounded-lg border border-[#e0ddd9] px-3 py-2 text-[13px] outline-none focus:border-[#a97e4b]" />
                            {state === "error" && <p className="text-[12px] font-bold text-[#c0392b]">{error}</p>}
                            <button type="submit" disabled={state === "sending"} className="h-10 rounded-lg bg-[#09182a] text-[13px] font-extrabold text-white disabled:opacity-60">
                                {state === "sending" ? "Sending…" : "Send"}
                            </button>
                            <a href={teamWhatsAppHref()} target="_blank" rel="noopener noreferrer" className="text-center text-[11.5px] font-bold text-[#15935f]">
                                Need a quick answer? Chat with us on WhatsApp
                            </a>
                        </form>
                    )}
                </div>
            )}
            <button
                type="button"
                aria-label={open ? "Close feedback" : "Feedback and support"}
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                className="grid h-[52px] w-[52px] place-items-center rounded-full bg-[#a97e4b] text-white shadow-[0_10px_28px_rgba(169,126,75,.45)] transition hover:scale-105"
            >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            </button>
        </div>
    );
}
