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
  return (
    <Card>
      <Heading
        eyebrow="Contact info"
        title="How should our team reach you?"
        description="Tenants send enquiries to the Property Warehouse team on WhatsApp. We use these details to contact you about interested tenants and inspections — they are not shown publicly."
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
      </div>

      <Footer>
        <Back onClick={onBack} />
        <Continue onClick={onContinue}>Continue</Continue>
      </Footer>
    </Card>
  );
}
