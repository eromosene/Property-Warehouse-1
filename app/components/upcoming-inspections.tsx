import { PlusIcon } from "./icons";

export type Inspection = {
    month: string;
    day: string;
    name: string;
    loc: string;
    time: string;
    img: string;
};

type UpcomingInspectionsProps = {
    inspections: Inspection[];
    onAddInspection?: () => void;
};

export function UpcomingInspections({
    inspections,
    onAddInspection = () => alert("Inspection scheduler coming soon!"),
}: UpcomingInspectionsProps) {
    return (
        <section className="rounded-[14px] border border-[rgba(9,24,42,.09)] bg-white px-[18px] pb-[14px] pt-[18px] max-[860px]:rounded-[18px] max-[860px]:px-[14px] max-[860px]:py-4">
            <div className="mb-[14px] flex items-center justify-between gap-2">
                <h3 className="text-[13px] font-extrabold tracking-[-.02em]">
                    Upcoming Inspections
                </h3>

                <span className="text-[12px] font-bold text-[#15935f]">View all</span>
            </div>

            {inspections.map((inspection) => (
                <div
                    key={`${inspection.month}-${inspection.day}`}
                    className="flex items-center gap-[9px] border-b border-[rgba(9,24,42,.06)] py-2 last:border-b-0"
                >
                    <div className="h-[38px] w-[38px] shrink-0 overflow-hidden rounded-full">
                        <img
                            src={inspection.img}
                            alt={inspection.name}
                            className="block h-full w-full object-cover"
                        />
                    </div>

                    <div className="w-8 shrink-0 text-center">
                        <div className="text-[8px] font-extrabold uppercase tracking-[.07em] text-[#15935f]">
                            {inspection.month}
                        </div>

                        <div className="text-[18px] font-extrabold leading-none tracking-[-.04em]">
                            {inspection.day}
                        </div>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="mb-px text-[11px] font-extrabold leading-[1.2]">
                            {inspection.name}
                        </div>

                        <div className="text-[9.5px] font-medium text-[#5d6876]">
                            {inspection.loc}
                        </div>
                    </div>

                    <div className="ml-auto shrink-0 whitespace-nowrap text-[9.5px] font-bold">
                        {inspection.time}
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={onAddInspection}
                className="mt-[10px] flex h-8 w-full items-center justify-center gap-[5px] rounded-lg border-[1.5px] border-dashed border-[rgba(21,147,95,.35)] bg-[rgba(21,147,95,.04)] text-[11px] font-bold text-[#15935f] hover:border-[#15935f] hover:bg-[rgba(21,147,95,.09)]"
            >
                <PlusIcon />
                Add Inspection
            </button>
        </section>
    );
}
