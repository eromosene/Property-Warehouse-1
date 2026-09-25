import { Back, Card, Continue, Field, Footer, Heading } from "./step-one";
import type { ListingForm, UpdateListingField } from "./types";

type StepFourProps = {
  form: ListingForm;
  updateField: UpdateListingField;
  onBack: () => void;
  onContinue: () => void;
};

export default function StepFour({
  form,
  updateField,
  onBack,
  onContinue,
}: StepFourProps) {
  const whatsapp = form.whatsapp.trim() || "234XXXXXXXXXX";

  return (
    <Card>
      <Heading
        eyebrow="Contact info"
        title="How should tenants reach you?"
        description="Provide the contact details tenants can use when they are interested in your property."
      />

      <div className="mt-7 grid gap-5">
        <Field
          label="Full Name"
          value={form.fullName}
          placeholder="Your full name"
          onChange={(value) => updateField("fullName", value)}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="WhatsApp"
            value={form.whatsapp}
            placeholder="2348012345678"
            onChange={(value) => updateField("whatsapp", value)}
          />
          <Field
            label="Phone"
            value={form.phone}
            placeholder="08012345678"
            onChange={(value) => updateField("phone", value)}
          />
        </div>

        <div className="rounded-[16px] border border-[#e0ddd9] bg-[#faf9f7] p-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#a97e4b]">
            WhatsApp preview
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#15935f] text-sm font-extrabold text-white">
              WA
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#09182a]">
                Contact landlord
              </p>
              <p className="mt-1 text-xs font-medium text-[#8c8882]">
                WhatsApp: {whatsapp}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer>
        <Back onClick={onBack} />
        <Continue onClick={onContinue}>Continue</Continue>
      </Footer>
    </Card>
  );
}
