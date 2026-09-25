"use client";

import {
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import ProgressBar from "./progress-bar";
import StepFive from "./step-five";
import StepFour from "./step-four";
import StepOne from "./step-one";
import StepThree from "./step-three";
import StepTwo from "./step-two";
import SuccessScreen from "./success-screen";
import type { ListingForm, UploadedDocument, UploadedImage } from "./types";

const TEMP_LANDLORD_NAME = "Landlord";

const INITIAL_FORM: ListingForm = {
  title: "",
  area: "",
  lga: "",
  address: "",
  type: "",
  availableFrom: "",
  beds: "",
  baths: "",
  description: "",
  rentPerYear: "",
  cautionFee: "",
  serviceCharge: "",
  isMonthly: false,
  fullName: "",
  whatsapp: "",
  phone: "",
};

export default function CreateListingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<ListingForm>(INITIAL_FORM);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const updateField = <K extends keyof ListingForm>(
    field: K,
    value: ListingForm[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const rent = Number(form.rentPerYear) || 0;
  const caution = Number(form.cautionFee) || 0;
  const serviceCharge = Number(form.serviceCharge) || 0;

  const totalMoveIn = useMemo(
    () => rent + caution + serviceCharge,
    [rent, caution, serviceCharge],
  );

  const monthlyRent = useMemo(() => (rent ? rent / 12 : 0), [rent]);

  const hasPendingFiles = [...uploadedImages, ...uploadedDocs].some(
    (file) => file.status !== "uploaded",
  );

  const scrollTop = () => {
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setForm(INITIAL_FORM);
    setAmenities([]);
    setDocumentTypes([]);
    setUploadedImages([]);
    setUploadedDocs([]);
    setImageTab("upload");
    setImageUrl("");
    setIsPublishing(false);
    setShowSuccess(false);
    setStatusMessage("");
  };

  const goToListings = () => {
    if (isPublishing) {
      return;
    }

    resetForm();
    router.push("/dashboard/listings");
  };

  const toggle = (
    setter: Dispatch<SetStateAction<string[]>>,
    value: string,
  ) => {
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const validateStep = (step: number) => {
    const fail = (condition: boolean, message: string) => {
      if (!condition) {
        return false;
      }

      setStatusMessage(message);
      return true;
    };

    if (
      step === 1 &&
      (fail(!form.title.trim(), "Please enter a listing title.") ||
        fail(!form.area.trim(), "Please enter the specific area.") ||
        fail(!form.lga.trim(), "Please select an LGA.") ||
        fail(!form.address.trim(), "Please enter the full address.") ||
        fail(!form.type.trim(), "Please select a property type.") ||
        fail(
          !form.beds || Number(form.beds) < 0,
          "Please enter the number of bedrooms.",
        ) ||
        fail(
          !form.baths || Number(form.baths) < 0,
          "Please enter the number of bathrooms.",
        ) ||
        fail(!form.description.trim(), "Please describe the property."))
    ) {
      return false;
    }

    if (
      step === 2 &&
      fail(
        !form.rentPerYear || Number(form.rentPerYear) <= 0,
        "Please enter a valid annual rent.",
      )
    ) {
      return false;
    }

    if (
      step === 4 &&
      (fail(!form.fullName.trim(), "Please enter your full name.") ||
        fail(!form.whatsapp.trim(), "Please enter your WhatsApp number."))
    ) {
      return false;
    }

    setStatusMessage("");
    return true;
  };

  const goNext = () => {
    if (!validateStep(currentStep) || currentStep >= 5) {
      return;
    }

    setCurrentStep((step) => step + 1);
    scrollTop();
  };

  const goBack = () => {
    if (currentStep <= 1) {
      return;
    }

    setCurrentStep((step) => step - 1);
    setStatusMessage("");
    scrollTop();
  };

  const compressImage = (file: File) =>
    new Promise<File>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const image = new Image();

        image.onload = () => {
          let width = image.width;
          let height = image.height;

          if (width > 900 || height > 900) {
            if (width > height) {
              height = Math.round((height * 900) / width);
              width = 900;
            } else {
              width = Math.round((width * 900) / height);
              height = 900;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Could not process image."));
            return;
          }

          context.drawImage(image, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Could not compress image."));
                return;
              }

              resolve(
                new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                  type: "image/jpeg",
                }),
              );
            },
            "image/jpeg",
            0.82,
          );
        };

        image.onerror = () => reject(new Error("Invalid image."));
        image.src = String(reader.result);
      };

      reader.onerror = () => reject(new Error("Could not read image."));
      reader.readAsDataURL(file);
    });

  const uploadImage = async (file: File) => {
    if (uploadedImages.length >= 6) {
      setStatusMessage("You can upload a maximum of 6 photos.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setStatusMessage(`${file.name} is not an image.`);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage(`${file.name} is larger than 5MB.`);
      return;
    }

    const key = `${Date.now()}-${Math.random()}`;
    const previewUrl = URL.createObjectURL(file);

    setUploadedImages((current) => [
      ...current,
      { key, url: previewUrl, name: file.name, status: "uploading" },
    ]);

    try {
      const data = new FormData();
      data.append("file", await compressImage(file));

      const response = await fetch("/api/uploads/images", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error("Image upload failed.");
      }

      const result = await response.json();

      setUploadedImages((current) =>
        current.map((image) =>
          image.key === key
            ? {
              ...image,
              key: result.key ?? key,
              url: result.url ?? image.url,
              status: "uploaded",
            }
            : image,
        ),
      );
      setStatusMessage("");
    } catch (error) {
      setUploadedImages((current) =>
        current.map((image) =>
          image.key === key ? { ...image, status: "error" } : image,
        ),
      );
      setStatusMessage(
        error instanceof Error ? error.message : "Image upload failed.",
      );
    }
  };

  const handleImageFiles = async (files: FileList | File[]) => {
    const availableSlots = Math.max(0, 6 - uploadedImages.length);

    if (!availableSlots) {
      setStatusMessage("You can upload a maximum of 6 photos.");
      return;
    }

    for (const file of Array.from(files).slice(0, availableSlots)) {
      await uploadImage(file);
    }
  };

  const deleteImage = async (image: UploadedImage) => {
    setUploadedImages((current) =>
      current.filter((item) => item.key !== image.key),
    );

    if (!image.key || image.key.includes("-")) {
      return;
    }

    try {
      await fetch(`/api/uploads/images/${encodeURIComponent(image.key)}`, {
        method: "DELETE",
      });
    } catch {
      // The optimistic remove already updated the UI.
    }
  };

  const addImageUrl = () => {
    const url = imageUrl.trim();

    if (!url) {
      return;
    }

    if (uploadedImages.length >= 6) {
      setStatusMessage("You can add a maximum of 6 photos.");
      return;
    }

    setUploadedImages((current) => [
      ...current,
      {
        key: `url-${Date.now()}`,
        url,
        name: url,
        status: "uploaded",
      },
    ]);
    setImageUrl("");
    setStatusMessage("");
  };

  const uploadDocument = async (file: File) => {
    if (uploadedDocs.length >= 5) {
      setStatusMessage("You can upload a maximum of 5 documents.");
      return;
    }

    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      setStatusMessage(`${file.name} is not supported. Use PDF, JPG or PNG.`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage(`${file.name} is larger than 10MB.`);
      return;
    }

    const key = `${Date.now()}-${Math.random()}`;

    setUploadedDocs((current) => [
      ...current,
      { key, name: file.name, status: "uploading" },
    ]);

    try {
      const data = new FormData();
      data.append("file", file);

      const response = await fetch("/api/uploads/documents", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error("Document upload failed.");
      }

      const result = await response.json();

      setUploadedDocs((current) =>
        current.map((document) =>
          document.key === key
            ? {
              ...document,
              key: result.key ?? key,
              url: result.url,
              status: "uploaded",
            }
            : document,
        ),
      );
      setStatusMessage("");
    } catch (error) {
      setUploadedDocs((current) =>
        current.map((document) =>
          document.key === key ? { ...document, status: "error" } : document,
        ),
      );
      setStatusMessage(
        error instanceof Error ? error.message : "Document upload failed.",
      );
    }
  };

  const handleDocumentFiles = async (files: FileList | File[]) => {
    const availableSlots = Math.max(0, 5 - uploadedDocs.length);

    if (!availableSlots) {
      setStatusMessage("You can upload a maximum of 5 documents.");
      return;
    }

    for (const file of Array.from(files).slice(0, availableSlots)) {
      await uploadDocument(file);
    }
  };

  const deleteDocument = async (document: UploadedDocument) => {
    setUploadedDocs((current) =>
      current.filter((item) => item.key !== document.key),
    );

    if (!document.key || document.key.includes("-")) {
      return;
    }

    try {
      await fetch(`/api/uploads/documents/${encodeURIComponent(document.key)}`, {
        method: "DELETE",
      });
    } catch {
      // The optimistic remove already updated the UI.
    }
  };

  const publishListing = async () => {
    if (!validateStep(4)) {
      setCurrentStep(4);
      return;
    }

    if (hasPendingFiles) {
      setStatusMessage("Please wait for all uploads to finish before publishing.");
      return;
    }

    setIsPublishing(true);
    setStatusMessage("Publishing listing...");

    try {
      await api("/api/listings", {
        method: "POST",
        body: JSON.stringify({
          landlordName: form.fullName.trim() || TEMP_LANDLORD_NAME,
          landlordPhone: form.phone,
          landlordWhatsApp: form.whatsapp,
          title: form.title,
          area: form.area,
          lga: form.lga,
          address: form.address,
          type: form.type,
          rentPerYear: Number(form.rentPerYear),
          cautionFee: Number(form.cautionFee) || 0,
          serviceCharge: Number(form.serviceCharge) || 0,
          isMonthly: form.isMonthly,
          beds: Number(form.beds),
          baths: Number(form.baths),
          amenities,
          description: form.description,
          images: uploadedImages
            .filter((image) => image.status === "uploaded")
            .map((image) => image.url),
          documents: uploadedDocs
            .filter((document) => document.status === "uploaded")
            .map((document) => document.key),
          ownershipDocTypes: documentTypes,
        }),
      });

      setStatusMessage("");
      setShowSuccess(true);
      setCurrentStep(5);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to publish listing.",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f6f4f1]">
      <div className="flex items-center justify-between border-b border-[#e8e5de] bg-white px-5 py-4 sm:px-8 lg:px-10">
        <button
          type="button"
          onClick={goToListings}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-[rgba(9,24,42,.12)] bg-white px-4 text-[12px] font-extrabold text-[#09182a] transition-colors hover:bg-[#f6f6f4]"
        >
          <span aria-hidden="true">←</span>
          Back to My Listings
        </button>
      </div>

      <ProgressBar currentStep={currentStep} />

      <main className="mx-auto w-full max-w-[700px] px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
        {showSuccess ? (
          <SuccessScreen
            title={form.title}
            area={form.area}
            onViewListings={() => {
              resetForm();
              router.push("/dashboard/listings");
            }}
            onAddAnother={resetForm}
          />
        ) : (
          <>
            {currentStep === 1 && (
              <StepOne
                form={form}
                updateField={updateField}
                onContinue={goNext}
              />
            )}

            {currentStep === 2 && (
              <StepTwo
                form={form}
                updateField={updateField}
                rent={rent}
                caution={caution}
                serviceCharge={serviceCharge}
                monthlyRent={monthlyRent}
                totalMoveIn={totalMoveIn}
                onBack={goBack}
                onContinue={goNext}
              />
            )}

            {currentStep === 3 && (
              <StepThree
                amenities={amenities}
                toggleAmenity={(value) => toggle(setAmenities, value)}
                uploadedImages={uploadedImages}
                imageTab={imageTab}
                setImageTab={setImageTab}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                imageInputRef={imageInputRef}
                onImageInput={(event) => {
                  if (event.target.files) {
                    void handleImageFiles(event.target.files);
                  }

                  event.target.value = "";
                }}
                onImageDrop={(event) => {
                  event.preventDefault();

                  if (event.dataTransfer.files.length) {
                    void handleImageFiles(event.dataTransfer.files);
                  }
                }}
                onDeleteImage={(image) => void deleteImage(image)}
                onAddImageUrl={addImageUrl}
                onBack={goBack}
                onContinue={goNext}
              />
            )}

            {currentStep === 4 && (
              <StepFour
                form={form}
                updateField={updateField}
                onBack={goBack}
                onContinue={goNext}
              />
            )}

            {currentStep === 5 && (
              <StepFive
                documentTypes={documentTypes}
                toggleDocumentType={(value) =>
                  toggle(setDocumentTypes, value)
                }
                uploadedDocs={uploadedDocs}
                documentInputRef={documentInputRef}
                onDocumentInput={(event) => {
                  if (event.target.files) {
                    void handleDocumentFiles(event.target.files);
                  }

                  event.target.value = "";
                }}
                onDocumentDrop={(event) => {
                  event.preventDefault();

                  if (event.dataTransfer.files.length) {
                    void handleDocumentFiles(event.dataTransfer.files);
                  }
                }}
                onDeleteDocument={(document) =>
                  void deleteDocument(document)
                }
                onBack={goBack}
                onPublish={() => void publishListing()}
                isPublishing={isPublishing}
              />
            )}

            {statusMessage && (
              <div
                role="status"
                className="mt-4 rounded-xl border border-[#a97e4b]/20 bg-[#a97e4b]/10 px-4 py-3 text-sm font-bold text-[#8a6235]"
              >
                {statusMessage}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}