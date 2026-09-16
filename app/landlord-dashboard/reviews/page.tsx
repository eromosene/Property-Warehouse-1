export default function ReviewsPage() {
    return (
        <div className="p-6 pb-10 max-[860px]:p-[14px] max-[860px]:pb-[78px]">
            <p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#a97e4b]">
                Landlord dashboard
            </p>

            <h1 className="mt-1 text-[24px] font-extrabold tracking-[-.04em]">
                Reviews
            </h1>

            <div className="mt-5 max-w-[500px] rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white p-6">
                <div className="text-[38px] font-extrabold tracking-[-.06em]">
                    4.8 <span className="text-[16px] font-semibold text-[#5d6876]">/ 5</span>
                </div>

                <div className="my-1 text-[14px] text-[#f59e0b]">★★★★★</div>

                <p className="text-[12px] font-extrabold text-[#15935f]">
                    Excellent
                </p>

                <p className="mt-1 text-[10px] text-[#5d6876]">
                    Based on 32 reviews
                </p>
            </div>
        </div>
    );
}