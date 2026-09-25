import { Back, Card, Continue, Field, Footer, Heading } from "./step-one";
import type { ListingForm, UpdateListingField } from "./types";

type StepTwoProps = {
  form: ListingForm;
  updateField: UpdateListingField;
  rent: number;
  caution: number;
  serviceCharge: number;
  monthlyRent: number;
  totalMoveIn: number;
  onBack: () => void;
  onContinue: () => void;
};

const naira = (value: number) => `₦${value.toLocaleString("en-NG")}`;

export default function StepTwo({
  form,
  updateField,
  rent,
  caution,
  serviceCharge,
  monthlyRent,
  totalMoveIn,
  onBack,
  onContinue,
}: StepTwoProps) {
  return (
    <Card>
      <Heading
        eyebrow="Pricing"
        title="Set your pricing"
        description="Give tenants a clear picture of the cost of moving into this property."
      />

      <div className="mt-7 grid gap-5">
        <Field
          label="Annual Rent"
          type="number"
          value={form.rentPerYear}
          placeholder="800000"
          onChange={(value) => updateField("rentPerYear", value)}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Caution Fee"
            type="number"
            value={form.cautionFee}
            placeholder="400000"
            onChange={(value) => updateField("cautionFee", value)}
          />
          <Field
            label="Service Charge"
            type="number"
            value={form.serviceCharge}
            placeholder="100000"
            onChange={(value) => updateField("serviceCharge", value)}
          />
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#e0ddd9] px-4 py-4">
          <div>
            <p className="text-sm font-extrabold text-[#09182a]">
              Show monthly rent
            </p>
            <p className="mt-1 text-xs font-medium text-[#88847f]">
              Display the equivalent monthly amount to tenants.
            </p>
          </div>
          <input
            type="checkbox"
            checked={form.isMonthly}
            onChange={(event) => updateField("isMonthly", event.target.checked)}
            className="h-5 w-5 accent-[#a97e4b]"
          />
        </label>

        <div className="overflow-hidden rounded-[18px] bg-gradient-to-br from-[#09182a] to-[#142d49] p-6 text-white">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/60">
            Move-in estimate
          </p>
          <div className="mt-3 font-['Cormorant_Garamond'] text-4xl font-bold">
            {naira(totalMoveIn)}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 sm:grid-cols-3">
            <Price label="Annual rent" value={rent} />
            <Price label="Caution" value={caution} />
            <Price label="Service charge" value={serviceCharge} />
          </div>

          {form.isMonthly && monthlyRent > 0 && (
            <div className="mt-5 rounded-xl bg-white/10 px-4 py-3">
              <p className="text-xs font-bold text-white/60">
                Monthly rent equivalent
              </p>
              <p className="mt-1 text-lg font-extrabold">
                {naira(monthlyRent)}
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer>
        <Back onClick={onBack} />
        <Continue onClick={onContinue}>Continue</Continue>
      </Footer>
    </Card>
  );
}

function Price({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-white/50">{label}</p>
      <p className="mt-1 text-sm font-extrabold">{naira(value)}</p>
    </div>
  );
}
