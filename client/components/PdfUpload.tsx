"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";

import { uploadDocument } from "@/lib/api";

import { UploadDocumentResponse } from "@/types";

import { useToast } from "@/components/Toast";

interface PdfUploadProps {
  onUploaded: (document: UploadDocumentResponse) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error";

export default function PdfUpload({ onUploaded }: PdfUploadProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState("");

  const validateFile = (file: File): boolean => {
    setError("");

    if (file.type !== "application/pdf") {
      const msg = "Only PDF files are allowed.";
      setError(msg);
      toast.error(msg);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      const msg = "PDF file must be smaller than 10 MB.";
      setError(msg);
      toast.error(msg);
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (!validateFile(file)) {
      return;
    }
    setSelectedFile(file);
    setStatus("idle");
    setError("");
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (status === "uploading" || status === "processing") return;
    setDragActive(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    if (status === "uploading" || status === "processing") return;

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || status === "uploading" || status === "processing") {
      return;
    }

    let uploadStage: "uploading" | "processing" = "uploading";
    setStatus("uploading");
    setError("");
    toast.info("Uploading PDF...");

    try {
      const result = await uploadDocument(selectedFile, (percent) => {
        if (percent >= 100) {
          uploadStage = "processing";
          // File bytes sent; server is now processing chunks and embeddings
          setStatus("processing");
        }
      });

      setStatus("success");
      toast.success("PDF uploaded and processed successfully.");
      onUploaded(result);
      setSelectedFile(null);
      setStatus("idle");

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (err: unknown) {
      let message = "Unable to process the PDF. Please try again.";

      if (typeof err === "object" && err !== null && "response" in err) {
        const errorData = (err as { response?: { data?: { detail?: string } } })
          .response?.data;
        if (typeof errorData?.detail === "string") {
          message = errorData.detail;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      if (uploadStage === "uploading") {
        toast.error(`PDF upload failure: ${message}`);
      } else {
        toast.error(`PDF processing failure: ${message}`);
      }
      setStatus("error");
    }
  };

  const removeFile = () => {
    if (status === "uploading" || status === "processing") return;
    setSelectedFile(null);
    setStatus("idle");
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const isBusy = status === "uploading" || status === "processing";

  return (
    <div className="w-full max-w-2xl">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!isBusy) {
            inputRef.current?.click();
          }
        }}
        className={`
          relative cursor-pointer
          rounded-3xl border-2 border-dashed
          p-8 sm:p-10 text-center
          transition-all duration-200
          ${
            isBusy
              ? "opacity-60 cursor-not-allowed border-zinc-200 bg-zinc-50"
              : dragActive
                ? "border-violet-500 bg-violet-50/70"
                : "border-zinc-200 bg-white hover:border-violet-300 hover:bg-violet-50/40"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          disabled={isBusy}
          onChange={handleInputChange}
          className="hidden"
          aria-label="Upload PDF file"
        />

        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 transition-transform duration-200 hover:scale-105">
          <UploadCloud size={30} className="text-violet-600" />
        </div>

        <h3 className="text-lg font-semibold text-zinc-900">Upload your PDF</h3>

        <p className="mt-2 text-sm text-zinc-500">
          Drag and drop your document here, or click to browse
        </p>

        <p className="mt-3 text-xs text-zinc-400">PDF only · Maximum 10 MB</p>
      </div>

      {/* Selected file card & Status UI */}
      {selectedFile && (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
              <FileText size={21} className="text-red-500" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900">
                {selectedFile.name}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            {!isBusy && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  removeFile();
                }}
                aria-label="Remove selected file"
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Animated States */}
          {status === "uploading" && (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <Upload size={18} className="animate-bounce text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-blue-900">
                      Uploading PDF...
                    </p>
                    <span className="text-[11px] font-medium text-blue-700">
                      Sending file
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-blue-200">
                    <div className="h-full w-full animate-pulse rounded-full bg-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === "processing" && (
            <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/60 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                  <Sparkles
                    size={18}
                    className="animate-spin text-violet-600"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-violet-900">
                      Processing document...
                    </p>
                    <span className="text-[11px] font-medium text-violet-700">
                      Extracting & Embedding
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-violet-200">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-violet-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload & Process button */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleUpload();
            }}
            disabled={isBusy}
            className="
              mt-4 flex w-full items-center
              justify-center gap-2 rounded-xl
              bg-violet-600 px-4 py-3
              text-sm font-semibold text-white
              transition hover:bg-violet-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {status === "uploading" ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading PDF...
              </>
            ) : status === "processing" ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing PDF...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Upload & Process
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={17} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
