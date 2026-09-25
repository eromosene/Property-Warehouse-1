import type { ReactNode } from "react";
import type { ListingForm, UpdateListingField } from "./types";

type StepOneProps = {
  form: ListingForm;
  updateField: UpdateListingField;
  onContinue: () => void;
};

type FieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  min?: string;
  onChange: (value: string) => void;
};

type SelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

const lgaOptions = [
  "Lagos Mainland",
  "Lagos Island",
  "Surulere",
  "Yaba",
  "Ikeja",
  "Eti-Osa",
  "Alimosho",
  "Kosofe",
  "Amuwo-Odofin",
  "Agege",
  "Mushin",
  "Apapa",
  "Other",
];

const propertyTypeOptions = [
  "1 Bedroom",
  "2 Bedroom",
  "3 Bedroom",
  "4 Bedroom",
  "5 Bedroom",
  "Self Contain",
  "Mini Flat",
  "Duplex",
  "Terrace",
  "Detached House",
  "Office",
  "Shop",
];

export default function StepOne({
  form,
  updateField,
  onContinue,
}: StepOneProps) {
  return (
    <Card>
      <Heading
        eyebrow="Property details"
        title="Tell us about your property"
        description="Add the basic details tenants need to understand your listing."
      />

      <div className="mt-7 grid gap-5">
        <Field
          label="Listing Title"
          value={form.title}
          placeholder="Modern 2-bedroom apartment"
          onChange={(value) => updateField("title", value)}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Specific Area"
            value={form.area}
            placeholder="Yaba"
            onChange={(value) => updateField("area", value)}
          />
          <Select
            label="LGA"
            value={form.lga}
            onChange={(value) => updateField("lga", value)}
            options={lgaOptions}
          />
        </div>

        <Field
          label="Full Address"
          value={form.address}
          placeholder="14 Herbert Macaulay Way"
          onChange={(value) => updateField("address", value)}
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <Select
            label="Property Type"
            value={form.type}
            onChange={(value) => updateField("type", value)}
            options={propertyTypeOptions}
          />
          <Field
            label="Bedrooms"
            type="number"
            min="0"
            value={form.beds}
            placeholder="2"
            onChange={(value) => updateField("beds", value)}
          />
          <Field
            label="Bathrooms"
            type="number"
            min="0"
            value={form.baths}
            placeholder="2"
            onChange={(value) => updateField("baths", value)}
          />
        </div>

        <Field
          label="Available From"
          type="date"
          value={form.availableFrom}
          onChange={(value) => updateField("availableFrom", value)}
        />

        <div className="grid gap-2">
          <label className="text-sm font-extrabold text-[#09182a]">
            Description
          </label>
          <textarea
            value={form.description}
            maxLength={500}
            rows={6}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Describe the property, its surroundings, facilities and anything else a tenant should know..."
            className={[
              "resize-none rounded-xl border border-[#e0ddd9] bg-white p-3",
              "text-sm font-medium text-[#09182a] outline-none transition",
              "placeholder:text-[#a6a19a] focus:border-[#a97e4b]",
            ].join(" ")}
          />
          <div className="text-right text-xs font-bold text-[#99958f]">
            {form.description.length}/500
          </div>
        </div>
      </div>

      <Footer>
        <Continue onClick={onContinue}>Continue</Continue>
      </Footer>
    </Card>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-[20px] border border-[#e0ddd9] bg-white p-5 sm:p-8">
      {children}
    </section>
  );
}

export function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#a97e4b]">
        {eyebrow}
      </p>
      <h1 className="mt-2 font-['Cormorant_Garamond'] text-4xl font-bold leading-tight text-[#09182a]">
        {title}
      </h1>
      <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-[#77736d]">
        {description}
      </p>
    </div>
  );
}

export function Field({
  label,
  value,
  placeholder,
  type = "text",
  min,
  onChange,
}: FieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-[#09182a]">{label}</span>
      <input
        type={type}
        min={min}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={[
          "h-11 rounded-xl border border-[#e0ddd9] bg-white px-3",
          "text-sm font-medium text-[#09182a] outline-none transition",
          "placeholder:text-[#a6a19a] focus:border-[#a97e4b]",
        ].join(" ")}
      />
    </label>
  );
}

export function Select({ label, value, options, onChange }: SelectProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-[#09182a]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border border-[#e0ddd9] bg-white px-3 text-sm font-medium text-[#09182a] outline-none transition focus:border-[#a97e4b]"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Footer({ children }: { children: ReactNode }) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-[#e8e5de] pt-5">
      {children}
    </div>
  );
}

export function Back({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl px-4 py-3 text-sm font-extrabold text-[#77736d] transition hover:bg-[#f6f4f1]"
    >
      Back
    </button>
  );
}

export function Continue({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl bg-[#09182a] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#132c47]"
    >
      {children}
    </button>
  );
}
