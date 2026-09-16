"use client";

import Link from "next/link";

const PEOPLE = [
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
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

export default function MessagesPage() {
    return (
        <div className="p-6 pb-10 max-[860px]:p-[14px] max-[860px]:pb-[78px]">
            <div className="mb-5">
                <p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#a97e4b]">
                    Communication
                </p>

                <h1 className="mt-1 text-[24px] font-extrabold tracking-[-.04em]">
                    Messages
                </h1>
            </div>

            <section className="max-w-[760px] rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white p-[18px]">
                <div className="mb-[14px] border-b border-[rgba(9,24,42,.09)] pb-3">
                    <h2 className="text-[14.5px] font-extrabold">Recent Messages</h2>
                </div>

                <div>
                    {MESSAGES.map((message) => (
                        <button
                            key={message.name}
                            type="button"
                            onClick={() => alert(`Opening message from ${message.name}…`)}
                            className="flex w-full items-start gap-[10px] border-b border-[rgba(9,24,42,.06)] px-1 py-4 text-left last:border-b-0 hover:bg-[#f8f9fb]"
                        >
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                                <img
                                    src={message.img}
                                    alt={message.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <strong className="text-[12px] font-extrabold">
                                        {message.name}
                                    </strong>

                                    <span className="ml-auto text-[10px] text-[#5d6876]">
                                        {message.time}
                                    </span>
                                </div>

                                <p className="mt-1 text-[11px] leading-[1.5] text-[#5d6876]">
                                    {message.text}
                                </p>
                            </div>

                            {message.unread && (
                                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#15935f]" />
                            )}
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
}