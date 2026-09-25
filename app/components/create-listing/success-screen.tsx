type SuccessScreenProps = {
  title: string;
  area: string;
  onViewListings: () => void;
  onAddAnother: () => void;
};

export default function SuccessScreen({
  title,
  area,
  onViewListings,
  onAddAnother,
}: SuccessScreenProps) {
  return (
    <section className="rounded-[20px] border border-[#e0ddd9] bg-white px-5 py-14 text-center sm:px-10 sm:py-20">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#15935f]/10 text-3xl text-[#15935f]">
        ✓
      </div>

      <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.2em] text-[#a97e4b]">
        Listing Published
      </p>
      <h1 className="mt-3 font-['Cormorant_Garamond'] text-4xl font-bold text-[#09182a] sm:text-5xl">
        Your property is live!
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-6 text-[#77736d]">
        <strong className="font-extrabold text-[#09182a]">{title}</strong> in{" "}
        {area} has been submitted successfully.
      </p>

      <div className="mx-auto mt-8 max-w-sm rounded-2xl bg-[#f6f4f1] p-5 text-left">
        <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#a97e4b]">
          Summary
        </p>
        <div className="mt-4 grid gap-3">
          <Row label="Property" value={title} />
          <Row label="Area" value={area} />
          <Row label="Status" value="Published" />
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onViewListings}
          className="rounded-xl bg-[#09182a] px-6 py-3 text-sm font-extrabold text-white"
        >
          View My Listings
        </button>
        <button
          type="button"
          onClick={onAddAnother}
          className="rounded-xl border border-[#e0ddd9] bg-white px-6 py-3 text-sm font-extrabold text-[#09182a]"
        >
          Add Another Property
        </button>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#e0ddd9] pb-3 last:border-0 last:pb-0">
      <span className="text-xs font-bold text-[#8b8781]">{label}</span>
      <span className="text-right text-xs font-extrabold text-[#09182a]">
        {value}
      </span>
    </div>
  );
}
