export type ListingForm = {
  title: string;
  area: string;
  lga: string;
  address: string;
  type: string;
  availableFrom: string;
  beds: string;
  baths: string;
  description: string;
  rentPerYear: string;
  cautionFee: string;
  serviceCharge: string;
  isMonthly: boolean;
  fullName: string;
  whatsapp: string;
  phone: string;
};

export type UploadedImage = {
  key: string;
  url: string;
  name: string;
  status: "uploading" | "uploaded" | "error";
};

export type UploadedDocument = {
  key: string;
  url?: string;
  name: string;
  status: "uploading" | "uploaded" | "error";
};

export type UpdateListingField = <K extends keyof ListingForm>(
  field: K,
  value: ListingForm[K],
) => void;
