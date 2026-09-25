const PAYMENTS = [
    {
        name: "Luxury 3 Bed Duplex – Lekki",
        type: "Annual Rent Payment",
        amount: "₦2,400,000",
        status: "Paid",
    },
    {
        name: "2 Bed Apartment – Yaba",
        type: "Annual Rent Payment",
        amount: "₦1,200,000",
        status: "Paid",
    },
    {
        name: "4 Bed Terrace – Ajah",
        type: "Annual Rent Payment",
        amount: "₦2,000,000",
        status: "Paid",
    },
];

export default function PaymentsPage() {
    return (
        <div className="mx-auto max-w-7xl p-3.5 pb-19.5 lg:p-6 lg:pb-10">
            <div className="mb-5">
                <p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#a97e4b]">
                    Finance
                </p>

                <h1 className="mt-1 text-[24px] font-extrabold tracking-[-.04em]">
                    Payments
                </h1>
            </div>

            <section className="max-w-7xl rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white p-[18px]">
                <h2 className="mb-[14px] text-[14.5px] font-extrabold">
                    Recent Payments
                </h2>

                {PAYMENTS.map((payment) => (
                    <div
                        key={payment.name}
                        className="flex items-center gap-[10px] border-b border-[rgba(9,24,42,.06)] py-3 last:border-b-0"
                    >
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[rgba(21,147,95,.1)] text-[#15935f]">
                            <svg
                                viewBox="0 0 24 24"
                                className="h-[15px] w-[15px] fill-none stroke-current stroke-2"
                            >
                                <rect x="1" y="4" width="22" height="16" rx="2" />
                                <line x1="1" y1="10" x2="23" y2="10" />
                            </svg>
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="text-[12px] font-extrabold">
                                {payment.name}
                            </div>

                            <div className="text-[10px] text-[#5d6876]">
                                {payment.type}
                            </div>
                        </div>

                        <div className="text-right">
                            <strong className="block text-[12px] font-extrabold">
                                {payment.amount}
                            </strong>

                            <span className="text-[10px] font-bold text-[#15935f]">
                                {payment.status}
                            </span>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}