import type { ChangeEvent, DragEvent, RefObject } from "react";
import { Back, Card, Footer, Heading } from "./step-one";
import type { UploadedDocument } from "./types";

type StepFiveProps = {
  documentTypes: string[];
  toggleDocumentType: (value: string) => void;
  uploadedDocs: UploadedDocument[];
  documentInputRef: RefObject<HTMLInputElement | null>;
  onDocumentInput: (event: ChangeEvent<HTMLInputElement>) => void;
  onDocumentDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDeleteDocument: (document: UploadedDocument) => void;
  onBack: () => void;
  onPublish: () => void;
  isPublishing: boolean;
};

const documentTypeOptions = [
  "C of O",
  "Deed",
  "Survey",
  "Governor's Consent",
  "Power of Attorney",
  "Registered Lease",
];

export default function StepFive({
  documentTypes,
  toggleDocumentType,
  uploadedDocs,
  documentInputRef,
  onDocumentInput,
  onDocumentDrop,
  onDeleteDocument,
  onBack,
  onPublish,
  isPublishing,
}: StepFiveProps) {
  return (
    <Card>
      <Heading
        eyebrow="Ownership documents"
        title="Add your ownership documents"
        description="Upload the documents that help verify ownership of this property."
      />

      <div className="mt-7">
        <h3 className="text-sm font-extrabold text-[#09182a]">
          Document types
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {documentTypeOptions.map((type) => {
            const checked = documentTypes.includes(type);

            return (
              <label
                key={type}
                className={[
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm font-bold transition",
                  checked
                    ? "border-[#a97e4b] bg-[#a97e4b]/5 text-[#09182a]"
                    : "border-[#e0ddd9] text-[#55514b]",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleDocumentType(type)}
                  className="h-4 w-4 accent-[#a97e4b]"
                />
                {type}
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#09182a]">Documents</h3>
          <span className="text-xs font-extrabold text-[#8d8983]">
            {uploadedDocs.length}/5
          </span>
        </div>

        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDocumentDrop}
          onClick={() => documentInputRef.current?.click()}
          className={[
            "mt-3 flex min-h-[180px] cursor-pointer flex-col items-center",
            "justify-center rounded-[16px] border-2 border-dashed",
            "border-[#dcd8d2] bg-[#faf9f7] px-5 text-center transition",
            "hover:border-[#a97e4b]",
          ].join(" ")}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#a97e4b]/10 text-xl text-[#a97e4b]">
            ↑
          </div>
          <p className="mt-4 text-sm font-extrabold text-[#09182a]">
            Drag & drop documents here
          </p>
          <p className="mt-1 text-xs font-medium text-[#8c8882]">
            or click to browse · PDF, JPG or PNG · max 10MB each
          </p>
          <input
            ref={documentInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            hidden
            onChange={onDocumentInput}
          />
        </div>

        {uploadedDocs.length > 0 && (
          <div className="mt-4 grid gap-2">
            {uploadedDocs.map((document) => (
              <div
                key={document.key}
                className="flex items-center justify-between rounded-xl border border-[#e0ddd9] bg-white px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f6f4f1] text-xs font-extrabold text-[#a97e4b]">
                    DOC
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-[#09182a]">
                      {document.name}
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#8d8983]">
                      {document.status === "uploading"
                        ? "Uploading..."
                        : document.status === "error"
                          ? "Upload failed"
                          : "Uploaded"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteDocument(document)}
                  className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-[#55514b] hover:bg-[#f6f4f1]"
                  aria-label={`Remove ${document.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl bg-[#f6f4f1] px-4 py-3 text-xs font-medium leading-5 text-[#77736d]">
        Your ownership documents are used only for property verification and are
        handled securely.
      </div>

      <Footer>
        <Back onClick={onBack} />
        <button
          type="button"
          onClick={onPublish}
          disabled={isPublishing}
          className={[
            "rounded-xl bg-[#15935f] px-6 py-3 text-sm font-extrabold",
            "text-white transition hover:bg-[#117d51]",
            "disabled:cursor-not-allowed disabled:opacity-60",
          ].join(" ")}
        >
          {isPublishing ? "Publishing..." : "Publish Listing"}
        </button>
      </Footer>
    </Card>
  );
}
