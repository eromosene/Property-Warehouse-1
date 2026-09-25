import type { ChangeEvent, DragEvent, ReactNode, RefObject } from "react";
import { Back, Card, Continue, Footer, Heading } from "./step-one";
import type { UploadedImage } from "./types";

type StepThreeProps = {
  amenities: string[];
  toggleAmenity: (amenity: string) => void;
  uploadedImages: UploadedImage[];
  imageTab: "upload" | "url";
  setImageTab: (tab: "upload" | "url") => void;
  imageUrl: string;
  setImageUrl: (value: string) => void;
  imageInputRef: RefObject<HTMLInputElement | null>;
  onImageInput: (event: ChangeEvent<HTMLInputElement>) => void;
  onImageDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDeleteImage: (image: UploadedImage) => void;
  onAddImageUrl: () => void;
  onBack: () => void;
  onContinue: () => void;
};

const amenityOptions = [
  { id: "water", label: "Water" },
  { id: "parking", label: "Parking" },
  { id: "security", label: "Security" },
  { id: "generator", label: "Generator" },
  { id: "ac", label: "Air Conditioning" },
  { id: "lift", label: "Lift" },
];

export default function StepThree({
  amenities,
  toggleAmenity,
  uploadedImages,
  imageTab,
  setImageTab,
  imageUrl,
  setImageUrl,
  imageInputRef,
  onImageInput,
  onImageDrop,
  onDeleteImage,
  onAddImageUrl,
  onBack,
  onContinue,
}: StepThreeProps) {
  return (
    <Card>
      <Heading
        eyebrow="Amenities & photos"
        title="Show tenants what makes it special"
        description="Add the facilities available and up to six photos of your property."
      />

      <div className="mt-7">
        <h3 className="text-sm font-extrabold text-[#09182a]">Amenities</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {amenityOptions.map((amenity) => {
            const checked = amenities.includes(amenity.id);

            return (
              <label
                key={amenity.id}
                className={[
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm font-bold transition",
                  checked
                    ? "border-[#a97e4b] bg-[#a97e4b]/5 text-[#09182a]"
                    : "border-[#e0ddd9] bg-white text-[#55514b] hover:border-[#c7c1b8]",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAmenity(amenity.id)}
                  className="h-4 w-4 accent-[#a97e4b]"
                />
                {amenity.label}
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#09182a]">Photos</h3>
          <span className="text-xs font-extrabold text-[#8d8983]">
            {uploadedImages.length}/6
          </span>
        </div>

        <div className="mt-3 flex rounded-xl bg-[#f6f4f1] p-1">
          <Tab active={imageTab === "upload"} onClick={() => setImageTab("upload")}>
            Upload Photos
          </Tab>
          <Tab active={imageTab === "url"} onClick={() => setImageTab("url")}>
            Paste URL
          </Tab>
        </div>

        {imageTab === "upload" ? (
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={onImageDrop}
            onClick={() => imageInputRef.current?.click()}
            className={[
              "mt-4 flex min-h-[190px] cursor-pointer flex-col items-center",
              "justify-center rounded-[16px] border-2 border-dashed",
              "border-[#dcd8d2] bg-[#faf9f7] px-5 text-center transition",
              "hover:border-[#a97e4b]",
            ].join(" ")}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#a97e4b]/10 text-xl text-[#a97e4b]">
              ↑
            </div>
            <p className="mt-4 text-sm font-extrabold text-[#09182a]">
              Drag & drop your photos here
            </p>
            <p className="mt-1 text-xs font-medium text-[#8c8882]">
              or click to browse · JPG or PNG · max 5MB each
            </p>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              onChange={onImageInput}
            />
          </div>
        ) : (
          <div className="mt-4 rounded-[16px] border border-[#e0ddd9] bg-[#faf9f7] p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://example.com/property.jpg"
                className="h-11 flex-1 rounded-lg border border-[#e0ddd9] bg-white px-3 text-sm font-medium outline-none focus:border-[#a97e4b]"
              />
              <button
                type="button"
                onClick={onAddImageUrl}
                className="rounded-lg bg-[#09182a] px-5 py-3 text-xs font-extrabold text-white"
              >
                Add Photo
              </button>
            </div>
          </div>
        )}

        {uploadedImages.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {uploadedImages.map((image) => (
              <div
                key={image.key}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[#e0ddd9] bg-[#f1efeb]"
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="h-full w-full object-cover"
                />

                {image.status === "uploading" && (
                  <Overlay>Uploading...</Overlay>
                )}
                {image.status === "error" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-900/70 text-xs font-extrabold text-white">
                    Upload failed
                  </div>
                )}

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteImage(image);
                  }}
                  className={[
                    "absolute right-2 top-2 flex h-7 w-7 items-center",
                    "justify-center rounded-full bg-white/95 text-sm font-bold",
                    "text-[#09182a] opacity-100 shadow-sm transition",
                    "sm:opacity-0 sm:group-hover:opacity-100",
                  ].join(" ")}
                  aria-label={`Remove ${image.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer>
        <Back onClick={onBack} />
        <Continue onClick={onContinue}>Continue</Continue>
      </Footer>
    </Card>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex-1 rounded-lg px-4 py-2.5 text-xs font-extrabold transition",
        active ? "bg-white text-[#09182a] shadow-sm" : "text-[#8b8781]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Overlay({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#09182a]/60 text-xs font-extrabold text-white">
      {children}
    </div>
  );
}
