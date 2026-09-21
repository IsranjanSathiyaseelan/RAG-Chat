"use client";

import PdfUpload from "./PdfUpload";
import { UploadDocumentResponse } from "@/types";

interface EmptyDocumentStateProps {
  onUploaded: (document: UploadDocumentResponse) => void;
}

export default function EmptyDocumentState({
  onUploaded,
}: EmptyDocumentStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 py-12">
      <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
        {/* Title */}
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          What can I help with?
        </h1>

        {/* Subtitle */}
        <p className="mt-1.5 text-sm text-zinc-500">
          Upload a PDF to start chatting with your documents.
        </p>

        {/* Compact Upload Component Container */}
        <div className="mt-6 w-full max-w-sm">
          <PdfUpload onUploaded={onUploaded} />
        </div>
      </div>
    </div>
  );
}