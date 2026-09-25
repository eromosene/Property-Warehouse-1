type ProgressBarProps = {
  currentStep: number;
};

const steps = [
  "Property Details",
  "Pricing",
  "Amenities & Photos",
  "Contact Info",
  "Ownership Docs",
];

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="border-b border-[#e8e5de] bg-white">
      <div className="mx-auto flex max-w-[900px] items-start px-5 py-5 sm:px-8">
        {steps.map((step, index) => {
          const number = index + 1;
          const completed = number < currentStep;
          const active = number === currentStep;

          return (
            <div key={step} className="flex min-w-0 flex-1 items-start">
              <div className="flex min-w-0 flex-col items-center">
                <div
                  className={[
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-extrabold transition",
                    completed
                      ? "border-[#15935f] bg-[#15935f] text-white"
                      : active
                        ? "border-[#a97e4b] bg-[#a97e4b] text-white"
                        : "border-[#d8d4ce] bg-white text-[#8b8883]",
                  ].join(" ")}
                >
                  {completed ? "✓" : number}
                </div>
                <span
                  className={[
                    "mt-2 hidden text-center text-[10px] font-extrabold sm:block",
                    active || completed ? "text-[#09182a]" : "text-[#99958f]",
                  ].join(" ")}
                >
                  {step}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={[
                    "mt-4 h-px flex-1",
                    number < currentStep ? "bg-[#15935f]" : "bg-[#ddd9d3]",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
